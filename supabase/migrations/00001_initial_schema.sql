-- Arlina / Beabeyond E-Commerce Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  description TEXT DEFAULT '',
  fabric TEXT DEFAULT '',
  images TEXT[] DEFAULT '{}',
  colors TEXT[] DEFAULT '{}',
  sizes TEXT[] DEFAULT '{}',
  is_new_arrival BOOLEAN DEFAULT false,
  is_trending BOOLEAN DEFAULT false,
  is_essential BOOLEAN DEFAULT false,
  stock INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Collections table
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  image TEXT DEFAULT '',
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Collection-Product mapping
CREATE TABLE IF NOT EXISTS collection_products (
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  PRIMARY KEY (collection_id, product_id)
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL DEFAULT '',
  customer_email TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','shipped','delivered','cancelled')),
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  shipping_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax DECIMAL(10,2) NOT NULL DEFAULT 0,
  shipping_address JSONB DEFAULT '{}',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL DEFAULT '',
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  size TEXT DEFAULT '',
  color TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory log for tracking stock changes
CREATE TABLE IF NOT EXISTS inventory_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  change INTEGER NOT NULL,
  reason TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin users (separate from Supabase Auth for simplicity)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin','superadmin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial admin user (you should change this)
INSERT INTO admin_users (email, name, role)
VALUES ('admin@beabeyond.com', 'Admin', 'superadmin')
ON CONFLICT (email) DO NOTHING;

-- Seed sample products from the existing data
INSERT INTO products (name, price, category, description, images, colors, sizes, stock, is_new_arrival) VALUES
('Structured Cotton Shirt', 120, 'Tops', 'A crisp, structured cotton shirt with a boxy fit. Sharp lines and minimal detailing.', ARRAY['https://images.unsplash.com/photo-1618333453613-2ccb4967e610?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80'], ARRAY['Black', 'White'], ARRAY['XS', 'S', 'M', 'L', 'XL'], 50, true),
('Pleated Wide Trousers', 180, 'Bottoms', 'High-waisted trousers with deep pleats and a wide leg silhouette.', ARRAY['https://images.unsplash.com/photo-1632497775901-50ba4637399f?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80'], ARRAY['Black', 'Navy'], ARRAY['XS', 'S', 'M', 'L', 'XL'], 35, true),
('Oversized Wool Blazer', 350, 'Outerwear', 'An oversized blazer crafted from premium wool blend.', ARRAY['https://images.unsplash.com/photo-1570653321586-3bb42aaee967?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=800&q=80'], ARRAY['Black', 'Charcoal'], ARRAY['S', 'M', 'L', 'XL'], 20, false),
('Asymmetric Midi Skirt', 150, 'Bottoms', 'Midi skirt with an asymmetric hemline and architectural draping.', ARRAY['https://images.unsplash.com/photo-1570653321623-dc0d7941d9c5?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=800&q=80'], ARRAY['Black', 'Ivory'], ARRAY['XS', 'S', 'M', 'L'], 25, true),
('Minimalist Leather Boots', 280, 'Footwear', 'Sleek leather boots with a square toe and block heel.', ARRAY['https://images.unsplash.com/photo-1633636403566-bfe3862369fc?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80'], ARRAY['Black', 'Tan'], ARRAY['36', '37', '38', '39', '40', '41'], 40, true),
('Canvas Tote Bag', 85, 'Accessories', 'Durable canvas tote with reinforced handles and interior pocket.', ARRAY['https://plus.unsplash.com/premium_photo-1670573801174-1ab41ec2afa0?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1590874102752-ede7f3eb6885?auto=format&fit=crop&w=800&q=80'], ARRAY['Black', 'Natural'], ARRAY['One Size'], 100, false),
('Cropped Knit Sweater', 110, 'Tops', 'Heavy knit sweater with a cropped length and dropped shoulders.', ARRAY['https://plus.unsplash.com/premium_photo-1688497830977-f9ab9f958ca7?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80'], ARRAY['Black', 'Cream', 'Grey'], ARRAY['XS', 'S', 'M', 'L'], 30, false),
('Tailored Vest', 130, 'Tops', 'Fitted vest with a deep V-neck and adjustable back strap.', ARRAY['https://images.unsplash.com/photo-1765306552441-cd32bb216b0c?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80'], ARRAY['Black', 'White'], ARRAY['XS', 'S', 'M', 'L', 'XL'], 45, true),
('Silk Slip Dress', 220, 'Dresses', 'Bias-cut silk slip dress in jet black. Minimalist evening wear.', ARRAY['https://images.unsplash.com/photo-1570653321427-0e4d0c40bb84?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80'], ARRAY['Black', 'Slate'], ARRAY['XS', 'S', 'M', 'L'], 15, false),
('Leather Crossbody', 195, 'Accessories', 'Compact leather bag with sharp geometric lines and silver hardware.', ARRAY['https://plus.unsplash.com/premium_photo-1670573800532-a861ffeca229?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80'], ARRAY['Black'], ARRAY['One Size'], 60, false);

-- Seed collections
INSERT INTO collections (name, slug, image, description) VALUES
('New Arrivals', 'new-arrivals', 'https://images.unsplash.com/photo-1760512901586-f70030a53cd1?auto=format&fit=crop&w=800&q=80', 'The latest additions to our collection'),
('Essentials', 'essentials', 'https://images.unsplash.com/photo-1632497775897-815042a13216?auto=format&fit=crop&w=800&q=80', 'Timeless wardrobe staples'),
('Accessories', 'accessories', 'https://images.unsplash.com/photo-1618333453613-2ccb4967e610?auto=format&fit=crop&w=800&q=80', 'Curated accessories collection')
ON CONFLICT (slug) DO NOTHING;

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER collections_updated_at
  BEFORE UPDATE ON collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_log ENABLE ROW LEVEL SECURITY;

-- Allow public read access to products and collections
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read collections" ON collections FOR SELECT USING (true);

-- Restrict all write operations to service_role only
-- (Handled via API routes with service role key)
