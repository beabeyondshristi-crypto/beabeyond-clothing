-- Homepage sections for admin customization
CREATE TABLE IF NOT EXISTS homepage_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_type TEXT NOT NULL CHECK (section_type IN ('hero_slide', 'editorial', 'category_spotlight', 'newsletter')),
  title TEXT DEFAULT '',
  subtitle TEXT DEFAULT '',
  description TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  image_url_2 TEXT DEFAULT '',
  link_url TEXT DEFAULT '',
  link_text TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read homepage_sections"
  ON homepage_sections FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert homepage_sections"
  ON homepage_sections FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update homepage_sections"
  ON homepage_sections FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete homepage_sections"
  ON homepage_sections FOR DELETE
  TO authenticated
  USING (true);

CREATE TRIGGER homepage_sections_updated_at
  BEFORE UPDATE ON homepage_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Seed default sections matching the current hardcoded homepage
INSERT INTO homepage_sections (section_type, title, subtitle, description, image_url, link_url, link_text, sort_order, settings) VALUES
  ('hero_slide', 'Spring 2026', 'Defined by sharp silhouettes and uncompromising monochrome.', '', 'https://images.unsplash.com/photo-1760512901586-f70030a53cd1?auto=format&fit=crop&w=1600&q=80', '/shop', 'Shop Collection', 1, '{"layout": "split", "theme": "light"}'),
  ('hero_slide', 'Night Mode', 'Evening essentials for the modern minimalist.', '', 'https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?auto=format&fit=crop&w=2000&q=80', '/shop', 'View Evening', 2, '{"layout": "fullscreen-center", "theme": "dark"}'),
  ('hero_slide', 'Urban Utility', 'Functional layers for the city streets.', '', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=2000&q=80', '/shop', 'Shop Outerwear', 3, '{"layout": "fullscreen-left", "theme": "dark"}'),
  ('editorial', 'The Office Edit.', 'Redefining 9-to-5 with structured blazers and effortless accessories.', '', 'https://plus.unsplash.com/premium_photo-1755534537502-1529cf891cdf?auto=format&fit=crop&w=1600&q=80', '/shop', 'Read The Story', 4, '{"badge": "Editorial"}'),
  ('category_spotlight', 'Outerwear', '', '', 'https://images.unsplash.com/photo-1570653321586-3bb42aaee967?auto=format&fit=crop&w=1000&q=80', '/shop', 'Shop Coats & Blazers', 5, '{}'),
  ('category_spotlight', 'Accessories', '', '', 'https://plus.unsplash.com/premium_photo-1670573801174-1ab41ec2afa0?auto=format&fit=crop&w=1000&q=80', '/shop', 'Shop Bags & Shoes', 6, '{}'),
  ('newsletter', 'Join The Club', 'Sign up for exclusive access to new drops and member-only sales.', '', '', '', '', 7, '{}')
ON CONFLICT DO NOTHING;
