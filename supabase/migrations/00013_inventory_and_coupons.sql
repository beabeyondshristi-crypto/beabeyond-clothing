-- Store-controlled sell-out threshold + discount coupons

-- ─── Inventory ──────────────────────────────────────────
-- A product counts as sold out once stock <= out_of_stock_threshold (0 = sell every unit)
ALTER TABLE products ADD COLUMN IF NOT EXISTS out_of_stock_threshold INTEGER NOT NULL DEFAULT 0;

-- ─── Orders record the discount they received ───────────
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
CREATE INDEX IF NOT EXISTS orders_coupon_idx ON orders (coupon_code);

-- ─── Coupons ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL CHECK (code = upper(code)),
  description TEXT NOT NULL DEFAULT '',
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL CHECK (discount_value > 0),
  min_order DECIMAL(10,2) NOT NULL DEFAULT 0,
  max_discount DECIMAL(10,2),
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  usage_limit INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  once_per_customer BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER coupons_updated_at BEFORE UPDATE ON coupons FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
-- Codes stay private: shoppers only reach them through the functions below
CREATE POLICY "Admins manage coupons" ON coupons FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Shared rule check (mirrors lib/coupons.ts). Returns valid/discount/message as JSON.
CREATE OR REPLACE FUNCTION evaluate_coupon(c coupons, p_subtotal NUMERIC, p_customer UUID)
RETURNS JSONB
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_discount NUMERIC;
BEGIN
  IF c.id IS NULL OR NOT c.is_active THEN
    RETURN jsonb_build_object('valid', false, 'discount', 0, 'message', 'This code isn’t valid');
  END IF;
  IF c.starts_at IS NOT NULL AND c.starts_at > NOW() THEN
    RETURN jsonb_build_object('valid', false, 'discount', 0, 'message', 'This code isn’t active yet');
  END IF;
  IF c.ends_at IS NOT NULL AND c.ends_at < NOW() THEN
    RETURN jsonb_build_object('valid', false, 'discount', 0, 'message', 'This code has expired');
  END IF;
  IF c.usage_limit IS NOT NULL AND c.used_count >= c.usage_limit THEN
    RETURN jsonb_build_object('valid', false, 'discount', 0, 'message', 'This code has reached its usage limit');
  END IF;
  IF c.once_per_customer AND p_customer IS NOT NULL AND EXISTS (
    SELECT 1 FROM orders WHERE customer_id = p_customer AND coupon_code = c.code AND status <> 'cancelled'
  ) THEN
    RETURN jsonb_build_object('valid', false, 'discount', 0, 'message', 'You’ve already used this code');
  END IF;
  IF p_subtotal < c.min_order THEN
    RETURN jsonb_build_object('valid', false, 'discount', 0, 'message', 'Add ₹' || CEIL(c.min_order - p_subtotal) || ' more to use this code');
  END IF;

  v_discount := CASE WHEN c.discount_type = 'percent' THEN p_subtotal * c.discount_value / 100 ELSE c.discount_value END;
  IF c.max_discount IS NOT NULL THEN v_discount := LEAST(v_discount, c.max_discount); END IF;
  v_discount := ROUND(LEAST(v_discount, p_subtotal), 2);

  RETURN jsonb_build_object('valid', true, 'discount', v_discount, 'code', c.code,
    'message', CASE WHEN c.discount_type = 'percent' THEN c.discount_value::INT || '% off applied' ELSE '₹' || c.discount_value::INT || ' off applied' END);
END;
$$;

-- Preview at checkout (anyone may call; reveals nothing beyond the result)
CREATE OR REPLACE FUNCTION validate_coupon(p_code TEXT, p_subtotal NUMERIC)
RETURNS JSONB
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  c coupons;
BEGIN
  SELECT * INTO c FROM coupons WHERE code = upper(trim(p_code));
  RETURN evaluate_coupon(c, p_subtotal, auth.uid());
END;
$$;

-- Redeem while placing an order: re-checks the rules and counts the use atomically
CREATE OR REPLACE FUNCTION redeem_coupon(p_code TEXT, p_subtotal NUMERIC)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  c coupons;
  result JSONB;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('valid', false, 'discount', 0, 'message', 'Sign in to use a code');
  END IF;
  SELECT * INTO c FROM coupons WHERE code = upper(trim(p_code)) FOR UPDATE;
  result := evaluate_coupon(c, p_subtotal, auth.uid());
  IF (result ->> 'valid')::BOOLEAN THEN
    UPDATE coupons SET used_count = used_count + 1 WHERE id = c.id;
  END IF;
  RETURN result;
END;
$$;

-- Undo a redemption when an order is cancelled (admins only)
CREATE OR REPLACE FUNCTION release_coupon(p_code TEXT)
RETURNS VOID
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE coupons SET used_count = GREATEST(0, used_count - 1) WHERE code = upper(trim(p_code)) AND is_admin();
$$;

REVOKE EXECUTE ON FUNCTION evaluate_coupon(coupons, NUMERIC, UUID) FROM PUBLIC, anon, authenticated;

-- Starter codes
INSERT INTO coupons (code, description, discount_type, discount_value, min_order, max_discount, usage_limit, once_per_customer) VALUES
('WELCOME10', 'Welcome offer for first orders', 'percent', 10, 0, 100, NULL, true),
('FLAT50', '₹50 off orders over ₹300', 'fixed', 50, 300, NULL, 500, false)
ON CONFLICT (code) DO NOTHING;

NOTIFY pgrst, 'reload schema';
