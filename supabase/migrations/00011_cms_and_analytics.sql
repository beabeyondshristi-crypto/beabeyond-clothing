-- CMS site settings + storefront analytics events

-- ─── Site settings (one JSON value per key) ─────────────
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read site_settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Authenticated write site_settings" ON site_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ─── Product events (view / like / add_to_cart) ─────────
CREATE TABLE IF NOT EXISTS product_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'like', 'add_to_cart')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS product_events_created_idx ON product_events (created_at);
CREATE INDEX IF NOT EXISTS product_events_product_idx ON product_events (product_id, event_type);

ALTER TABLE product_events ENABLE ROW LEVEL SECURITY;

-- Anyone may record an event; only signed-in users (admins) can read them
CREATE POLICY "Anyone insert product_events" ON product_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated read product_events" ON product_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated delete product_events" ON product_events FOR DELETE TO authenticated USING (true);

-- Aggregations so analytics never pulls raw event rows (PostgREST caps responses at 1000 rows)
CREATE OR REPLACE FUNCTION product_event_stats(since TIMESTAMPTZ)
RETURNS TABLE (product_id UUID, event_type TEXT, count BIGINT)
LANGUAGE sql STABLE AS $$
  SELECT product_id, event_type, COUNT(*) FROM product_events
  WHERE created_at >= since GROUP BY product_id, event_type;
$$;

CREATE OR REPLACE FUNCTION product_event_daily(since TIMESTAMPTZ)
RETURNS TABLE (day TEXT, event_type TEXT, count BIGINT)
LANGUAGE sql STABLE AS $$
  SELECT to_char(created_at, 'YYYY-MM-DD'), event_type, COUNT(*) FROM product_events
  WHERE created_at >= since GROUP BY 1, 2;
$$;

-- Unlike removes the most recent like for a product (called from the public track API)
CREATE OR REPLACE FUNCTION remove_product_like(p_product_id UUID)
RETURNS VOID
LANGUAGE sql SECURITY DEFINER AS $$
  DELETE FROM product_events WHERE id = (
    SELECT id FROM product_events WHERE product_id = p_product_id AND event_type = 'like'
    ORDER BY created_at DESC LIMIT 1
  );
$$;

-- ─── About page content, editable from Admin → Content ──
INSERT INTO homepage_sections (page, section_type, title, subtitle, description, image_url, link_url, link_text, sort_order, settings) VALUES
('about', 'hero', 'About Beabeyond', 'A conceptual retail house dedicated to the art of subtraction.', 'Est. 2026', '', '', '', 1, '{}'),
('about', 'content', 'Style is defined not by what you add, but by what you take away.', 'Founded in 2026, Beabeyond is a study in monochrome, structure and timeless form. We design fewer pieces, make them better, and build a wardrobe meant to be worn for years — not weeks.', '', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=80', '/shop', 'Shop The Collection', 2, '{"badge": "Our Philosophy"}')
ON CONFLICT DO NOTHING;
