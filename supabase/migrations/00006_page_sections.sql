-- Add page column to homepage_sections (default 'home' for existing rows)
ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS page TEXT DEFAULT 'home';

-- Update CHECK constraint to include new section types
ALTER TABLE homepage_sections DROP CONSTRAINT IF EXISTS homepage_sections_section_type_check;
ALTER TABLE homepage_sections ADD CONSTRAINT homepage_sections_section_type_check
  CHECK (section_type IN ('hero_slide', 'editorial', 'category_spotlight', 'newsletter', 'hero', 'content', 'feature'));

-- Seed sections for /new-arrivals
INSERT INTO homepage_sections (page, section_type, title, subtitle, description, image_url, link_url, link_text, sort_order, settings) VALUES
('new-arrivals', 'hero', 'New Horizons', 'Embrace the season with structured silhouettes and lighter fabrics. Designed for the transition.', '', 'https://images.unsplash.com/photo-1570653321427-0e4d0c40bb84?auto=format&fit=crop&w=2000&q=80', '/shop', 'Shop Now', 1, '{}'),
('new-arrivals', 'content', 'The Concept', 'This season, we explore the duality of soft and hard. Taking inspiration from brutalist architecture and natural landscapes, the new collection features sharp tailoring softened by fluid drapes. A monochrome palette serves as the canvas for texture and form.', '', '', '/shop', 'View Lookbook', 2, '{"badge": "Collection 01"}')
ON CONFLICT DO NOTHING;

-- Seed sections for /essentials
INSERT INTO homepage_sections (page, section_type, title, subtitle, description, image_url, link_url, link_text, sort_order, settings) VALUES
('essentials', 'content', 'Wardrobe Foundation.', 'Trends fade, but essentials remain. Discover the pieces you''ll reach for every single day. Impeccable tailoring, premium fabrics, and neutral tones designed to be mixed and matched.', '', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80', '/shop', 'Shop All Categories', 1, '{"badge": "The Core Collection"}')
ON CONFLICT DO NOTHING;

-- Seed sections for /trending
INSERT INTO homepage_sections (page, section_type, title, subtitle, description, image_url, link_url, link_text, sort_order, settings) VALUES
('trending', 'hero', 'Most Wanted', 'The pieces everyone is talking about. Shop the best-sellers before they are gone.', 'The Hot List', '', '', '', 1, '{}')
ON CONFLICT DO NOTHING;

-- Seed sections for /collections
INSERT INTO homepage_sections (page, section_type, title, subtitle, description, image_url, link_url, link_text, sort_order, settings) VALUES
('collections', 'hero', 'Collections', '', '', '', '', '', 1, '{}')
ON CONFLICT DO NOTHING;
