-- Rename "Essentials" collection to "Bealuxe"
UPDATE collections SET name = 'Bealuxe', slug = 'bealuxe' WHERE slug = 'essentials';

-- Move homepage sections from /essentials page to /bealuxe
UPDATE homepage_sections SET page = 'bealuxe' WHERE page = 'essentials';
