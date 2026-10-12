// Seed data for the in-memory mock database (used when NEXT_PUBLIC_USE_MOCK_DATA=true).
// Mirrors supabase/migrations seed data so the site looks the same offline.

import { DEFAULT_SITE_SETTINGS } from '../site-settings';

type Row = Record<string, any>;

const pid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const cid = (n: number) => `00000000-0000-4000-9000-${String(n).padStart(12, '0')}`;
const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString();
const img = (path: string, w = 800) => `https://${path}?auto=format&fit=crop&w=${w}&q=80`;

// Stable id derived from an email, so the browser and server agree on a user's id
export function mockUserId(email: string): string {
  let h1 = 0x811c9dc5, h2 = 0x01000193;
  for (const ch of email.toLowerCase()) {
    h1 = Math.imul(h1 ^ ch.charCodeAt(0), 16777619) >>> 0;
    h2 = Math.imul(h2 ^ ch.charCodeAt(0), 2246822519) >>> 0;
  }
  const hex = (h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0')).repeat(2);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

export const DEMO_EMAIL = 'demo@beabeyond.com';

// Demo admin login for local development (one-click "Fill In" on the admin sign-in page).
// Real values live in .env (gitignored) so the password never lands in this public repo.
export const MOCK_ADMIN = {
  email: process.env.NEXT_PUBLIC_DEMO_ADMIN_EMAIL || 'admin@beabeyond.com',
  password: process.env.NEXT_PUBLIC_DEMO_ADMIN_PASSWORD || '',
};
const demoId = mockUserId(DEMO_EMAIL);

const products: Row[] = [
  ['Structured Cotton Shirt', 120, 'Tops', 'A crisp, structured cotton shirt with a boxy fit. Sharp lines and minimal detailing.', 'Cotton',
    ['Breezy 100% cotton poplin', 'Boxy, oversized silhouette', 'Mother-of-pearl buttons'], ['Machine wash cold', 'Tumble dry low', 'Warm iron if needed'],
    ['images.unsplash.com/photo-1618333453613-2ccb4967e610', 'images.unsplash.com/photo-1596755094514-f87e34085b2c'], ['Black', 'White'], ['XS', 'S', 'M', 'L', 'XL'], 50, 5, true, false, false],
  ['Pleated Wide Trousers', 180, 'Bottoms', 'High-waisted trousers with deep pleats and a wide leg silhouette.', 'Cotton Blend',
    ['Deep front pleats', 'High-rise waistband', 'Wide leg, cropped hem'], ['Dry clean only', 'Iron on low heat'],
    ['images.unsplash.com/photo-1632497775901-50ba4637399f', 'images.unsplash.com/photo-1594633312681-425c7b97ccd1'], ['Black', 'Navy'], ['XS', 'S', 'M', 'L', 'XL'], 35, 5, true, true, false],
  ['Oversized Wool Blazer', 350, 'Outerwear', 'An oversized blazer crafted from premium wool blend. Perfect for layering.', 'Wool Blend',
    ['Premium wool blend', 'Relaxed, oversized fit', 'Satin-lined interior'], ['Dry clean only', 'Steam to remove creases', 'Store on padded hanger'],
    ['images.unsplash.com/photo-1570653321586-3bb42aaee967', 'images.unsplash.com/photo-1552374196-1ab2a1c593e8'], ['Black', 'Charcoal'], ['S', 'M', 'L', 'XL'], 20, 3, false, true, true],
  ['Asymmetric Midi Skirt', 150, 'Bottoms', 'Midi skirt with an asymmetric hemline and architectural draping.', 'Viscose',
    ['Asymmetric hem', 'Fluid, bias-cut drape', 'Side zip closure'], ['Machine wash cold', 'Hang to dry'],
    ['images.unsplash.com/photo-1570653321623-dc0d7941d9c5', 'images.unsplash.com/photo-1583496661160-fb5886a0aaaa'], ['Black', 'Ivory'], ['XS', 'S', 'M', 'L'], 25, 5, true, false, false],
  ['Minimalist Leather Boots', 280, 'Footwear', 'Sleek leather boots with a square toe and block heel. Full-grain leather.', 'Leather',
    ['Full-grain leather', 'Square toe, block heel', 'Leather-lined footbed'], ['Wipe with damp cloth', 'Use leather conditioner', 'Avoid prolonged water exposure'],
    ['images.unsplash.com/photo-1633636403566-bfe3862369fc', 'images.unsplash.com/photo-1543163521-1bf539c55dd2'], ['Black', 'Tan'], ['36', '37', '38', '39', '40', '41'], 40, 5, true, true, false],
  ['Canvas Tote Bag', 85, 'Accessories', 'Durable canvas tote with reinforced handles and interior pocket.', 'Canvas',
    ['Sturdy 16oz canvas', 'Reinforced handles', 'Interior zip pocket'], ['Spot clean with damp cloth', 'Line dry'],
    ['plus.unsplash.com/premium_photo-1670573801174-1ab41ec2afa0', 'images.unsplash.com/photo-1590874102752-ede7f3eb6885'], ['Black', 'Natural'], ['One Size'], 100, 10, false, false, true],
  ['Cropped Knit Sweater', 110, 'Tops', 'Heavy knit sweater with a cropped length and dropped shoulders.', 'Cotton',
    ['Heavyweight knit', 'Dropped shoulders', 'Cropped boxy fit'], ['Machine wash cold, gentle', 'Lay flat to dry'],
    ['plus.unsplash.com/premium_photo-1688497830977-f9ab9f958ca7', 'images.unsplash.com/photo-1576566588028-4147f3842f27'], ['Black', 'Cream', 'Grey'], ['XS', 'S', 'M', 'L'], 4, 5, false, true, false],
  ['Tailored Vest', 130, 'Tops', 'Fitted vest with a deep V-neck and adjustable back strap. Layer over shirts or bare.', 'Cotton Blend',
    ['Deep V-neck', 'Adjustable back strap', 'Structured, fitted bodice'], ['Dry clean only', 'Low heat iron'],
    ['images.unsplash.com/photo-1765306552441-cd32bb216b0c', 'images.unsplash.com/photo-1596755094514-f87e34085b2c'], ['Black', 'White'], ['XS', 'S', 'M', 'L', 'XL'], 45, 5, true, false, true],
  ['Silk Slip Dress', 220, 'Dresses', 'Bias-cut silk slip dress in jet black. Minimalist evening wear with a fluid drape.', 'Silk',
    ['Pure mulberry silk', 'Bias-cut, fluid drape', 'Adjustable straps'], ['Dry clean only', 'Do not twist or wring'],
    ['images.unsplash.com/photo-1570653321427-0e4d0c40bb84', 'images.unsplash.com/photo-1595777457583-95e059d581b8'], ['Black', 'Slate'], ['XS', 'S', 'M', 'L'], 15, 3, false, true, false],
  ['Leather Crossbody Bag', 195, 'Accessories', 'Compact leather bag with sharp geometric lines and silver hardware.', 'Leather',
    ['Soft pebbled leather', 'Adjustable crossbody strap', 'Silver-tone hardware'], ['Wipe with soft dry cloth', 'Use leather conditioner', 'Store in dust bag'],
    ['plus.unsplash.com/premium_photo-1670573800532-a861ffeca229', 'images.unsplash.com/photo-1548036328-c9fa89d128fa'], ['Black'], ['One Size'], 60, 5, false, false, true],
].map(([name, price, category, description, fabric, highlights, care, images, colors, sizes, stock, low_stock_threshold, is_new_arrival, is_trending, is_essential], i) => ({
  id: pid(i + 1),
  name, price, category, description, fabric, highlights, care,
  images: (images as string[]).map((p) => img(p)),
  colors, sizes, stock, low_stock_threshold, out_of_stock_threshold: 0, is_new_arrival, is_trending, is_essential,
  created_at: daysAgo(i * 3),
  updated_at: daysAgo(i * 3),
}));

const collections: Row[] = [
  ['New Arrivals', 'new-arrivals', 'images.unsplash.com/photo-1760512901586-f70030a53cd1', 'The latest additions to our collection — fresh drops every week.'],
  ['Bealuxe', 'bealuxe', 'images.unsplash.com/photo-1632497775897-815042a13216', 'Timeless wardrobe staples that every closet needs.'],
  ['The Office Edit', 'office-edit', 'plus.unsplash.com/premium_photo-1755534537502-1529cf891cdf', 'Polished pieces for the modern workplace.'],
  ['Evening Wear', 'evening-wear', 'images.unsplash.com/photo-1570653321427-0e4d0c40bb84', 'Dramatic silhouettes for night events and special occasions.'],
  ['Urban Utility', 'urban-utility', 'images.unsplash.com/photo-1483985988355-763728e1935b', 'Functional fashion for city living.'],
  ['Accessories', 'accessories', 'plus.unsplash.com/premium_photo-1670573801174-1ab41ec2afa0', 'Bags, belts, and beyond to complete your look.'],
  ['Footwear', 'footwear', 'images.unsplash.com/photo-1633636403566-bfe3862369fc', 'Boots, heels, and loafers crafted for comfort.'],
].map(([name, slug, image, description], i) => ({
  id: cid(i + 1), name, slug, image: img(image), description,
  created_at: daysAgo(30 - i), updated_at: daysAgo(30 - i),
}));

// collection index (1-based) -> product indexes (1-based)
const membership: Record<number, number[]> = {
  1: [1, 2, 4, 5, 8],
  2: [3, 6, 8, 10],
  3: [1, 2, 3, 8],
  4: [9, 3, 5],
  5: [3, 5, 6, 7],
  6: [6, 10],
  7: [5],
};
const collection_products: Row[] = Object.entries(membership).flatMap(([c, ps]) =>
  ps.map((p) => ({ collection_id: cid(Number(c)), product_id: pid(p) })),
);

const section = (page: string, section_type: string, title: string, subtitle: string, description: string,
  image_url: string, link_url: string, link_text: string, sort_order: number, settings: Row = {}): Row => ({
  page, section_type, title, subtitle, description, image_url, image_url_2: '', link_url, link_text,
  sort_order, is_visible: true, settings,
});

const homepage_sections: Row[] = [
  section('home', 'hero_slide', 'Spring 2026', 'Defined by sharp silhouettes and uncompromising monochrome.', '', img('images.unsplash.com/photo-1760512901586-f70030a53cd1', 1600), '/shop', 'Shop Collection', 1, { layout: 'split', theme: 'light' }),
  section('home', 'hero_slide', 'Night Mode', 'Evening essentials for the modern minimalist.', '', img('images.unsplash.com/photo-1595777457583-95e059d581b8', 2000), '/shop', 'View Evening', 2, { layout: 'fullscreen-center', theme: 'dark' }),
  section('home', 'hero_slide', 'Urban Utility', 'Functional layers for the city streets.', '', img('images.unsplash.com/photo-1483985988355-763728e1935b', 2000), '/shop', 'Shop Outerwear', 3, { layout: 'fullscreen-left', theme: 'dark' }),
  section('home', 'editorial', 'The Office Edit.', 'Redefining 9-to-5 with structured blazers and effortless accessories.', '', img('plus.unsplash.com/premium_photo-1755534537502-1529cf891cdf', 1600), '/shop', 'Read The Story', 4, { badge: 'Editorial' }),
  section('home', 'category_spotlight', 'Outerwear', '', '', img('images.unsplash.com/photo-1570653321586-3bb42aaee967', 1000), '/shop', 'Shop Coats & Blazers', 5),
  section('home', 'category_spotlight', 'Accessories', '', '', img('plus.unsplash.com/premium_photo-1670573801174-1ab41ec2afa0', 1000), '/shop', 'Shop Bags & Shoes', 6),
  section('home', 'newsletter', 'Join The Club', 'Sign up for exclusive access to new drops and member-only sales.', '', '', '', '', 7),
  section('new-arrivals', 'hero', 'New Horizons', 'Embrace the season with structured silhouettes and lighter fabrics. Designed for the transition.', '', img('images.unsplash.com/photo-1570653321427-0e4d0c40bb84', 2000), '/shop', 'Shop Now', 1),
  section('new-arrivals', 'content', 'The Concept', 'This season, we explore the duality of soft and hard. Taking inspiration from brutalist architecture and natural landscapes, the new collection features sharp tailoring softened by fluid drapes. A monochrome palette serves as the canvas for texture and form.', '', '', '/shop', 'View Lookbook', 2, { badge: 'Collection 01' }),
  section('bealuxe', 'content', 'Wardrobe Foundation.', "Trends fade, but essentials remain. Discover the pieces you'll reach for every single day. Impeccable tailoring, premium fabrics, and neutral tones designed to be mixed and matched.", '', img('images.unsplash.com/photo-1483985988355-763728e1935b', 1200), '/shop', 'Shop All Categories', 1, { badge: 'The Core Collection' }),
  section('trending', 'hero', 'Most Wanted', 'The pieces everyone is talking about. Shop the best-sellers before they are gone.', 'The Hot List', '', '', '', 1),
  section('collections', 'hero', 'Collections', '', '', '', '', '', 1),
].map((s, i) => ({ id: `00000000-0000-4000-a000-${String(i + 1).padStart(12, '0')}`, ...s, created_at: daysAgo(30), updated_at: daysAgo(30) }));

const customers: Row[] = [
  { id: demoId, email: DEMO_EMAIL, name: 'Demo Customer', phone: '+91 98765 43210', created_at: daysAgo(60), updated_at: daysAgo(60) },
];

const shippingAddress = {
  label: 'Home', line1: '221 Linking Road', line2: 'Apt 4B', city: 'Mumbai',
  state: 'Maharashtra', postal_code: '400050', country: 'IN',
};

const addresses: Row[] = [
  { id: '00000000-0000-4000-b000-000000000001', customer_id: demoId, ...shippingAddress, is_default: true, created_at: daysAgo(60), updated_at: daysAgo(60) },
];

const order = (n: number, status: string, days: number, items: [number, number, string, string][]) => {
  // Distinct prefixes so the short order number (first 8 chars) differs per order
  const id = `${['8f3a2c1d', '5b9e7a40', '2d6c4f18', 'e7a1b3c9'][n - 1]}-0000-4000-c000-${String(n).padStart(12, '0')}`;
  const orderItems = items.map(([p, quantity, size, color], i) => ({
    id: `00000000-0000-4000-d000-${String(n * 100 + i).padStart(12, '0')}`,
    order_id: id, product_id: pid(p), product_name: products[p - 1].name,
    quantity, price: products[p - 1].price, size, color, created_at: daysAgo(days),
  }));
  const subtotal = orderItems.reduce((s, it) => s + it.price * it.quantity, 0);
  const shipping_cost = subtotal >= 200 ? 0 : 15;
  const tax = Math.round(subtotal * 0.08875 * 100) / 100;
  return {
    order: {
      id, customer_id: demoId, customer_name: 'Demo Customer', customer_email: DEMO_EMAIL, status,
      subtotal, shipping_cost, tax, total: subtotal + shipping_cost + tax,
      shipping_address: shippingAddress, notes: '', created_at: daysAgo(days), updated_at: daysAgo(days),
    },
    items: orderItems,
  };
};

const seededOrders = [
  order(1, 'delivered', 45, [[3, 1, 'M', 'Black'], [6, 1, 'One Size', 'Natural']]),
  order(2, 'shipped', 12, [[9, 1, 'S', 'Black']]),
  order(3, 'processing', 3, [[1, 2, 'M', 'White'], [2, 1, 'S', 'Navy']]),
  order(4, 'pending', 1, [[7, 1, 'S', 'Cream']]),
];

// ─── Generated history (deterministic, so restarts give the same numbers) ─────

function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// Built lazily: this module is also bundled for the browser (auth only), which never needs it
function buildHistory() {
  const rand = rng(20261008);
  const pick = <T,>(list: T[]) => list[Math.floor(rand() * list.length)];

  // Relative popularity per product (index 0 = product 1)
  const popularity = [9, 7, 6, 5, 8, 4, 7, 5, 6, 3];
  function weightedProduct(): number {
    const total = popularity.reduce((a, b) => a + b, 0);
    let r = rand() * total;
    for (let i = 0; i < popularity.length; i++) { r -= popularity[i]; if (r <= 0) return i + 1; }
    return 1;
  }

  const firstNames = ['Aanya', 'Rohan', 'Isha', 'Kabir', 'Meera', 'Arjun', 'Zoya', 'Vikram', 'Tara', 'Dev', 'Naina', 'Aditya', 'Sana'];
  const lastNames = ['Kapoor', 'Mehta', 'Sharma', 'Iyer', 'Rao', 'Singh', 'Khan', 'Nair', 'Gupta', 'Bose', 'Malhotra', 'Das', 'Verma'];
  const cities = [
    ['Mumbai', 'Maharashtra', '400050'], ['Delhi', 'Delhi', '110001'], ['Bengaluru', 'Karnataka', '560001'],
    ['Pune', 'Maharashtra', '411001'], ['Hyderabad', 'Telangana', '500001'], ['Kolkata', 'West Bengal', '700001'],
  ];
  const generatedCustomers: Row[] = firstNames.map((first, i) => {
    const name = `${first} ${lastNames[i]}`;
    const email = `${first.toLowerCase()}.${lastNames[i].toLowerCase()}@example.com`;
    return { id: mockUserId(email), email, name, phone: `+91 9${String(800000000 + i * 7919).slice(0, 9)}`, created_at: daysAgo(120 - i * 9), updated_at: daysAgo(120 - i * 9) };
  });
  const allCustomers = [...customers, ...generatedCustomers];

  const statusForAge = (days: number) =>
    days > 14 ? (rand() < 0.06 ? 'cancelled' : 'delivered') : days > 5 ? 'shipped' : days > 2 ? 'processing' : 'pending';

  const generatedOrders = Array.from({ length: 76 }, (_, n) => {
    // Linearly more orders towards today, without piling them onto a single day
    const days = Math.floor(118 * (1 - Math.sqrt(rand()))) + 1;
    const created = new Date(Date.now() - days * 86_400_000 - Math.floor(rand() * 86_400_000)).toISOString();
    const customer = pick(allCustomers);
    const id = mockUserId(`order-${n}`);
    const lineCount = rand() < 0.65 ? 1 : rand() < 0.8 ? 2 : 3;
    const used = new Set<number>();
    const items = Array.from({ length: lineCount }, (_, i) => {
      let p = weightedProduct();
      while (used.has(p)) p = (p % products.length) + 1;
      used.add(p);
      const product = products[p - 1];
      return {
        id: mockUserId(`item-${n}-${i}`), order_id: id, product_id: product.id, product_name: product.name,
        quantity: rand() < 0.85 ? 1 : 2, price: product.price,
        size: pick(product.sizes as string[]), color: pick(product.colors as string[]), created_at: created,
      };
    });
    const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
    const shipping_cost = subtotal >= 200 ? 0 : 15;
    const tax = Math.round(subtotal * 0.08875 * 100) / 100;
    const [city, state, postal_code] = pick(cities);
    return {
      order: {
        id, customer_id: customer.id, customer_name: customer.name, customer_email: customer.email, status: statusForAge(days),
        subtotal, shipping_cost, tax, total: Math.round((subtotal + shipping_cost + tax) * 100) / 100,
        shipping_address: { label: 'Home', line1: `${10 + n} MG Road`, line2: '', city, state, postal_code, country: 'IN' },
        notes: '', created_at: created, updated_at: created,
      },
      items,
    };
  });

  // Storefront events: product page views, likes and add-to-cart clicks
  const productEvents: Row[] = [];
  for (let day = 0; day < 90; day++) {
    products.forEach((product, i) => {
      const views = Math.round(popularity[i] * (1.2 + rand() * 1.6) * (day < 30 ? 1.3 : 1));
      for (let v = 0; v < views; v++) {
        const at = new Date(Date.now() - day * 86_400_000 - Math.floor(rand() * 86_400_000)).toISOString();
        productEvents.push({ id: mockUserId(`ev-${day}-${i}-${v}`), product_id: product.id, event_type: 'view', created_at: at });
        if (rand() < 0.16) productEvents.push({ id: mockUserId(`ca-${day}-${i}-${v}`), product_id: product.id, event_type: 'add_to_cart', created_at: at });
        // Likes favour the editorial pieces rather than strictly the best sellers
        if (rand() < 0.05 + (i % 3 === 2 ? 0.06 : 0)) productEvents.push({ id: mockUserId(`li-${day}-${i}-${v}`), product_id: product.id, event_type: 'like', created_at: at });
      }
    });
  }

  const aboutSections: Row[] = [
    section('about', 'hero', 'About Beabeyond', 'A conceptual retail house dedicated to the art of subtraction.', 'Est. 2026', '', '', '', 1),
    section('about', 'content', 'Style is defined not by what you add, but by what you take away.', 'Founded in 2026, Beabeyond is a study in monochrome, structure and timeless form. We design fewer pieces, make them better, and build a wardrobe meant to be worn for years — not weeks.', '', img('images.unsplash.com/photo-1483985988355-763728e1935b', 1400), '/shop', 'Shop The Collection', 2, { badge: 'Our Philosophy' }),
  ].map((s, i) => ({ id: `00000000-0000-4000-a000-${String(100 + i).padStart(12, '0')}`, ...s, created_at: daysAgo(30), updated_at: daysAgo(30) }));

  return { allCustomers, generatedOrders, productEvents, aboutSections };
}

export function createSeed(): Record<string, Row[]> {
  const { allCustomers, generatedOrders, productEvents, aboutSections } = buildHistory();
  return structuredClone({
    products,
    collections,
    collection_products,
    homepage_sections: [...homepage_sections, ...aboutSections],
    customers: allCustomers,
    addresses,
    orders: [...seededOrders.map((o) => o.order), ...generatedOrders.map((o) => o.order)],
    order_items: [...seededOrders.flatMap((o) => o.items), ...generatedOrders.flatMap((o) => o.items)],
    admin_users: [{ id: '00000000-0000-4000-e000-000000000001', email: MOCK_ADMIN.email, name: 'Admin', role: 'superadmin', created_at: daysAgo(90) }],
    inventory_log: [],
    cart_items: [],
    product_events: productEvents,
    coupons: [
      { id: mockUserId('coupon-welcome'), code: 'WELCOME10', description: 'Welcome offer for first orders', discount_type: 'percent', discount_value: 10, min_order: 0, max_discount: 100, starts_at: null, ends_at: null, usage_limit: null, used_count: 0, once_per_customer: true, is_active: true, created_at: daysAgo(30), updated_at: daysAgo(30) },
      { id: mockUserId('coupon-flat50'), code: 'FLAT50', description: '₹50 off orders over ₹300', discount_type: 'fixed', discount_value: 50, min_order: 300, max_discount: null, starts_at: null, ends_at: null, usage_limit: 500, used_count: 0, once_per_customer: false, is_active: true, created_at: daysAgo(30), updated_at: daysAgo(30) },
    ],
    site_settings: Object.entries(DEFAULT_SITE_SETTINGS).map(([key, value]) => ({ key, value, updated_at: daysAgo(30) })),
  });
}
