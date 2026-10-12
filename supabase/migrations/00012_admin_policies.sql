-- Admin-only writes and admin-wide reads.
-- Earlier migrations let ANY signed-in user edit products, collections, page content and order
-- statuses, while admins could only read their own orders/customer row. This replaces those
-- policies with checks against admin_users.

-- ─── Helper ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users WHERE lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- ─── Products ───────────────────────────────────────────
DROP POLICY IF EXISTS "Authenticated users can insert products" ON products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON products;
CREATE POLICY "Admins manage products" ON products FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- ─── Collections + membership ───────────────────────────
DROP POLICY IF EXISTS "Authenticated users can insert collections" ON collections;
DROP POLICY IF EXISTS "Authenticated users can update collections" ON collections;
DROP POLICY IF EXISTS "Authenticated users can delete collections" ON collections;
CREATE POLICY "Admins manage collections" ON collections FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

ALTER TABLE collection_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read collection_products" ON collection_products FOR SELECT USING (true);
CREATE POLICY "Admins manage collection_products" ON collection_products FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- ─── Page content & site settings ───────────────────────
DROP POLICY IF EXISTS "Authenticated users can insert homepage_sections" ON homepage_sections;
DROP POLICY IF EXISTS "Authenticated users can update homepage_sections" ON homepage_sections;
DROP POLICY IF EXISTS "Authenticated users can delete homepage_sections" ON homepage_sections;
CREATE POLICY "Admins manage homepage_sections" ON homepage_sections FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Authenticated write site_settings" ON site_settings;
CREATE POLICY "Admins manage site_settings" ON site_settings FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- ─── Orders ─────────────────────────────────────────────
DROP POLICY IF EXISTS "Authenticated users can update orders" ON orders;
CREATE POLICY "Admins read all orders" ON orders FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "Admins update orders" ON orders FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins read all order items" ON order_items FOR SELECT TO authenticated USING (is_admin());

-- ─── Customers & addresses ──────────────────────────────
CREATE POLICY "Admins read all customers" ON customers FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "Admins read all addresses" ON addresses FOR SELECT TO authenticated USING (is_admin());

-- ─── Inventory ──────────────────────────────────────────
DROP POLICY IF EXISTS "Authenticated users can insert inventory_log" ON inventory_log;
CREATE POLICY "Admins manage inventory_log" ON inventory_log FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Stock changes go through this function. Admins can set any delta; shoppers (checkout) can
-- only decrement, never below zero. Every change is written to inventory_log.
CREATE OR REPLACE FUNCTION update_product_stock(p_product_id UUID, p_change INTEGER, p_reason TEXT DEFAULT '')
RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  new_stock INTEGER;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not signed in';
  END IF;
  IF p_change > 0 AND NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can add stock';
  END IF;

  UPDATE products SET stock = GREATEST(0, stock + p_change), updated_at = NOW()
  WHERE id = p_product_id
  RETURNING stock INTO new_stock;

  IF new_stock IS NULL THEN
    RAISE EXCEPTION 'Product not found';
  END IF;

  INSERT INTO inventory_log (product_id, change, reason) VALUES (p_product_id, p_change, coalesce(p_reason, ''));
  RETURN new_stock;
END;
$$;

-- ─── Analytics events & storage ─────────────────────────
DROP POLICY IF EXISTS "Authenticated read product_events" ON product_events;
DROP POLICY IF EXISTS "Authenticated delete product_events" ON product_events;
CREATE POLICY "Admins read product_events" ON product_events FOR SELECT TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "Authenticated upload product-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update product-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete product-images" ON storage.objects;
CREATE POLICY "Admins upload product-images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images' AND is_admin());
CREATE POLICY "Admins update product-images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'product-images' AND is_admin()) WITH CHECK (bucket_id = 'product-images' AND is_admin());
CREATE POLICY "Admins delete product-images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'product-images' AND is_admin());

NOTIFY pgrst, 'reload schema';
