-- Clear existing data (run this first if you want to reset)
DELETE FROM collection_products;
DELETE FROM order_items;
DELETE FROM inventory_log;
DELETE FROM orders;
DELETE FROM products;
DELETE FROM collections;

-- ─── 10 Products ─────────────────────────────────────────
-- Replace 'YOUR_IMAGE_URL_*' with your actual image URLs

INSERT INTO products (name, price, category, description, fabric, highlights, care, images, colors, sizes, stock, low_stock_threshold, is_new_arrival, is_trending, is_essential) VALUES
('Structured Cotton Shirt', 120, 'Tops', 'A crisp, structured cotton shirt with a boxy fit. Sharp lines and minimal detailing.', 'Cotton', ARRAY['Breezy 100% cotton poplin', 'Boxy, oversized silhouette', 'Mother-of-pearl buttons'], ARRAY['Machine wash cold', 'Tumble dry low', 'Warm iron if needed'], ARRAY['YOUR_IMAGE_URL_1A', 'YOUR_IMAGE_URL_1B'], ARRAY['Black', 'White'], ARRAY['XS', 'S', 'M', 'L', 'XL'], 50, 5, true, false, false),
('Pleated Wide Trousers', 180, 'Bottoms', 'High-waisted trousers with deep pleats and a wide leg silhouette.', 'Cotton Blend', ARRAY['Deep front pleats', 'High-rise waistband', 'Wide leg, cropped hem'], ARRAY['Dry clean only', 'Iron on low heat'], ARRAY['YOUR_IMAGE_URL_2A', 'YOUR_IMAGE_URL_2B'], ARRAY['Black', 'Navy'], ARRAY['XS', 'S', 'M', 'L', 'XL'], 35, 5, true, true, false),
('Oversized Wool Blazer', 350, 'Outerwear', 'An oversized blazer crafted from premium wool blend. Perfect for layering.', 'Wool Blend', ARRAY['Premium wool blend', 'Relaxed, oversized fit', 'Satin-lined interior'], ARRAY['Dry clean only', 'Steam to remove creases', 'Store on padded hanger'], ARRAY['YOUR_IMAGE_URL_3A', 'YOUR_IMAGE_URL_3B'], ARRAY['Black', 'Charcoal'], ARRAY['S', 'M', 'L', 'XL'], 20, 3, false, true, false),
('Asymmetric Midi Skirt', 150, 'Bottoms', 'Midi skirt with an asymmetric hemline and architectural draping.', 'Viscose', ARRAY['Asymmetric hem', 'Fluid, bias-cut drape', 'Side zip closure'], ARRAY['Machine wash cold', 'Hang to dry'], ARRAY['YOUR_IMAGE_URL_4A', 'YOUR_IMAGE_URL_4B'], ARRAY['Black', 'Ivory'], ARRAY['XS', 'S', 'M', 'L'], 25, 5, true, false, false),
('Minimalist Leather Boots', 280, 'Footwear', 'Sleek leather boots with a square toe and block heel. Full-grain leather.', 'Leather', ARRAY['Full-grain leather', 'Square toe, block heel', 'Leather-lined footbed'], ARRAY['Wipe with damp cloth', 'Use leather conditioner', 'Avoid prolonged water exposure'], ARRAY['YOUR_IMAGE_URL_5A', 'YOUR_IMAGE_URL_5B'], ARRAY['Black', 'Tan'], ARRAY['36', '37', '38', '39', '40', '41'], 40, 5, true, true, false),
('Canvas Tote Bag', 85, 'Accessories', 'Durable canvas tote with reinforced handles and interior pocket.', 'Canvas', ARRAY['Sturdy 16oz canvas', 'Reinforced handles', 'Interior zip pocket'], ARRAY['Spot clean with damp cloth', 'Line dry'], ARRAY['YOUR_IMAGE_URL_6A', 'YOUR_IMAGE_URL_6B'], ARRAY['Black', 'Natural'], ARRAY['One Size'], 100, 10, false, false, true),
('Cropped Knit Sweater', 110, 'Tops', 'Heavy knit sweater with a cropped length and dropped shoulders.', 'Cotton', ARRAY['Heavyweight knit', 'Dropped shoulders', 'Cropped boxy fit'], ARRAY['Machine wash cold, gentle', 'Lay flat to dry'], ARRAY['YOUR_IMAGE_URL_7A', 'YOUR_IMAGE_URL_7B'], ARRAY['Black', 'Cream', 'Grey'], ARRAY['XS', 'S', 'M', 'L'], 30, 5, false, true, false),
('Tailored Vest', 130, 'Tops', 'Fitted vest with a deep V-neck and adjustable back strap. Layer over shirts or bare.', 'Cotton Blend', ARRAY['Deep V-neck', 'Adjustable back strap', 'Structured, fitted bodice'], ARRAY['Dry clean only', 'Low heat iron'], ARRAY['YOUR_IMAGE_URL_8A', 'YOUR_IMAGE_URL_8B'], ARRAY['Black', 'White'], ARRAY['XS', 'S', 'M', 'L', 'XL'], 45, 5, true, false, false),
('Silk Slip Dress', 220, 'Dresses', 'Bias-cut silk slip dress in jet black. Minimalist evening wear with a fluid drape.', 'Silk', ARRAY['Pure mulberry silk', 'Bias-cut, fluid drape', 'Adjustable straps'], ARRAY['Dry clean only', 'Do not twist or wring'], ARRAY['YOUR_IMAGE_URL_9A', 'YOUR_IMAGE_URL_9B'], ARRAY['Black', 'Slate'], ARRAY['XS', 'S', 'M', 'L'], 15, 3, false, true, false),
('Leather Crossbody Bag', 195, 'Accessories', 'Compact leather bag with sharp geometric lines and silver hardware.', 'Leather', ARRAY['Soft pebbled leather', 'Adjustable crossbody strap', 'Silver-tone hardware'], ARRAY['Wipe with soft dry cloth', 'Use leather conditioner', 'Store in dust bag'], ARRAY['YOUR_IMAGE_URL_10A', 'YOUR_IMAGE_URL_10B'], ARRAY['Black'], ARRAY['One Size'], 60, 5, false, false, true)
ON CONFLICT DO NOTHING;

-- ─── 10 Collections ─────────────────────────────────────
-- Replace 'YOUR_IMAGE_URL_*' with your actual image URLs

INSERT INTO collections (name, slug, image, description) VALUES
('New Arrivals', 'new-arrivals', 'YOUR_IMAGE_URL_11', 'The latest additions to our collection — fresh drops every week.'),
('Bealuxe', 'bealuxe', 'YOUR_IMAGE_URL_12', 'Timeless wardrobe staples that every closet needs.'),
('The Office Edit', 'office-edit', 'YOUR_IMAGE_URL_13', 'Polished pieces for the modern workplace.'),
('Evening Wear', 'evening-wear', 'YOUR_IMAGE_URL_14', 'Dramatic silhouettes for night events and special occasions.'),
('Urban Utility', 'urban-utility', 'YOUR_IMAGE_URL_15', 'Functional fashion for city living.'),
('Minimalist', 'minimalist', 'YOUR_IMAGE_URL_16', 'Clean lines, neutral tones, understated elegance.'),
('Summer Drop', 'summer-drop', 'YOUR_IMAGE_URL_17', 'Light fabrics and breezy silhouettes for warmer days.'),
('Outerwear Edit', 'outerwear-edit', 'YOUR_IMAGE_URL_18', 'Coats, jackets, and blazers for every season.'),
('Accessories', 'accessories', 'YOUR_IMAGE_URL_19', 'Bags, belts, and beyond to complete your look.'),
('Footwear', 'footwear', 'YOUR_IMAGE_URL_20', 'Boots, heels, and loafers crafted for comfort.')
ON CONFLICT (slug) DO NOTHING;
