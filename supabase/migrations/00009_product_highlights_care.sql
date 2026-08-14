-- Add description highlights and care instructions to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS highlights TEXT[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS care TEXT[] DEFAULT '{}';
