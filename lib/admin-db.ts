import { createClient } from '@/lib/supabase/server';
import { Product, Collection, Order, OrderItem, DashboardStats, InventoryItem, HomepageSection, Customer } from './types';
import { mergeSiteSettings, SITE_SETTING_KEYS, type SiteSettings } from './site-settings';
import { normalizeCode, type Coupon } from './coupons';
import { isSoldOut, isLowStock, availableStock } from './stock';

function mapProduct(row: any): Product {
  return {
    ...row,
    images: row.images || [],
    highlights: row.highlights || [],
    care: row.care || [],
    colors: row.colors || [],
    sizes: row.sizes || [],
    price: Number(row.price),
    stock: Number(row.stock) || 0,
    low_stock_threshold: Number(row.low_stock_threshold) || 5,
    out_of_stock_threshold: Number(row.out_of_stock_threshold) || 0,
  };
}

function mapOrder(row: any, items: OrderItem[] = []): Order {
  return {
    ...row,
    total: Number(row.total),
    subtotal: Number(row.subtotal),
    shipping_cost: Number(row.shipping_cost),
    tax: Number(row.tax),
    discount: Number(row.discount) || 0,
    coupon_code: row.coupon_code || null,
    shipping_address: typeof row.shipping_address === 'string'
      ? JSON.parse(row.shipping_address)
      : (row.shipping_address || {}),
    items,
  };
}

export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: admin, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('email', user.email)
    .maybeSingle();

  // Legacy installs without the admin_users table keep the old allow-all behaviour
  if (error && /does not exist|relation/i.test(error.message)) {
    return { user, admin: { id: user.id, email: user.email, name: user.email?.split('@')[0] || 'Admin', role: 'superadmin' } };
  }
  if (admin) return { user, admin };

  // Bootstrap: before any admin exists, the first signed-in user may set the store up
  const { count } = await supabase.from('admin_users').select('*', { count: 'exact', head: true });
  if (!count) {
    return { user, admin: { id: user.id, email: user.email, name: user.email?.split('@')[0] || 'Admin', role: 'superadmin' } };
  }
  throw new Error('Forbidden');
}

// ─── Products ───────────────────────────────────────────

export async function getProducts(search?: string, category?: string): Promise<Product[]> {
  const supabase = await createClient();
  let query = supabase.from('products').select('*').order('created_at', { ascending: false });
  if (search) query = query.ilike('name', `%${search}%`);
  if (category) query = query.eq('category', category);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(mapProduct);
}

export async function getProduct(id: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
  if (error) throw error;
  return data ? mapProduct(data) : null;
}

export async function createProduct(input: Partial<Product>): Promise<Product> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('products').insert({
    name: input.name,
    price: input.price,
    category: input.category,
    description: input.description || '',
    fabric: input.fabric || '',
    images: input.images || [],
    highlights: input.highlights || [],
    care: input.care || [],
    colors: input.colors || [],
    sizes: input.sizes || [],
    is_new_arrival: input.is_new_arrival || false,
    is_trending: input.is_trending || false,
    is_essential: input.is_essential || false,
    stock: input.stock ?? 0,
    low_stock_threshold: input.low_stock_threshold ?? 5,
    out_of_stock_threshold: input.out_of_stock_threshold ?? 0,
  }).select().single();
  if (error) throw error;
  return mapProduct(data);
}

export async function updateProduct(id: string, input: Partial<Product>): Promise<Product> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('products').update({
    name: input.name,
    price: input.price,
    category: input.category,
    description: input.description,
    fabric: input.fabric,
    images: input.images,
    highlights: input.highlights,
    care: input.care,
    colors: input.colors,
    sizes: input.sizes,
    is_new_arrival: input.is_new_arrival,
    is_trending: input.is_trending,
    is_essential: input.is_essential,
    stock: input.stock,
    low_stock_threshold: input.low_stock_threshold,
    out_of_stock_threshold: input.out_of_stock_threshold,
  }).eq('id', id).select().single();
  if (error) throw error;
  return mapProduct(data);
}

export async function deleteProduct(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

// ─── Collections ────────────────────────────────────────

export async function getCollections(): Promise<Collection[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('collections').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getCollection(id: string): Promise<Collection | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('collections').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function createCollection(input: Partial<Collection>): Promise<Collection> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('collections').insert({
    name: input.name,
    slug: input.slug,
    image: input.image || '',
    description: input.description || '',
  }).select().single();
  if (error) throw error;
  return data;
}

export async function updateCollection(id: string, input: Partial<Collection>): Promise<Collection> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('collections').update({
    name: input.name,
    slug: input.slug,
    image: input.image,
    description: input.description,
  }).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteCollection(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('collections').delete().eq('id', id);
  if (error) throw error;
}

// ─── Collection Products ────────────────────────────────

export async function getCollectionProducts(collectionId: string): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('collection_products')
    .select('product_id, products(*)')
    .eq('collection_id', collectionId);
  if (error) throw error;
  return (data || []).map((cp: any) => mapProduct(cp.products));
}

export async function addProductToCollection(collectionId: string, productId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('collection_products').insert({
    collection_id: collectionId,
    product_id: productId,
  });
  if (error) throw error;
}

export async function removeProductFromCollection(collectionId: string, productId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('collection_products').delete()
    .eq('collection_id', collectionId)
    .eq('product_id', productId);
  if (error) throw error;
}

export async function getCollectionsWithProduct(productId: string): Promise<{ collection_id: string }[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('collection_products')
    .select('collection_id')
    .eq('product_id', productId);
  if (error) throw error;
  return data || [];
}

// ─── Orders ─────────────────────────────────────────────

export async function getOrders(status?: string): Promise<Order[]> {
  const supabase = await createClient();
  let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
  if (status) query = query.eq('status', status);
  const { data, error } = await query;
  if (error) throw error;

  const orders: Order[] = [];
  for (const row of (data || [])) {
    const { data: items } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', row.id);
    orders.push(mapOrder(row, items || []));
  }
  return orders;
}

export async function getOrder(id: string): Promise<Order | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
  if (error) throw error;
  if (!data) return null;
  const { data: items } = await supabase.from('order_items').select('*').eq('order_id', id);
  return mapOrder(data, items || []);
}

export async function updateOrderStatus(id: string, status: string): Promise<Order> {
  const supabase = await createClient();
  const { data: before } = await supabase.from('orders').select('status, coupon_code').eq('id', id).single();
  const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select().single();
  if (error) throw error;
  const { data: items } = await supabase.from('order_items').select('*').eq('order_id', id);

  // Cancelling puts the units back on the shelf and frees the coupon use
  if (status === 'cancelled' && before && before.status !== 'cancelled') {
    for (const item of items || []) {
      if (item.product_id) {
        await supabase.rpc('update_product_stock', { p_product_id: item.product_id, p_change: item.quantity, p_reason: `Order ${id.slice(0, 8)} cancelled` });
      }
    }
    if (before.coupon_code) await supabase.rpc('release_coupon', { p_code: before.coupon_code });
  }
  return mapOrder(data, items || []);
}

// ─── Inventory ──────────────────────────────────────────

export async function getInventory(): Promise<InventoryItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('id, name, stock, low_stock_threshold')
    .order('name');
  if (error) throw error;
  return (data || []).map(p => ({
    product_id: p.id,
    product_name: p.name,
    stock: Number(p.stock),
    reserved: 0,
    low_stock_threshold: Number(p.low_stock_threshold),
  }));
}

export async function updateStock(productId: string, quantity: number, reason?: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.rpc('update_product_stock', {
    p_product_id: productId,
    p_change: quantity,
    p_reason: reason || 'manual adjustment',
  });
  if (error) throw error;
}

// ─── Homepage Sections ───────────────────────────────────

export async function getHomepageSections(page?: string): Promise<HomepageSection[]> {
  const supabase = await createClient();
  let query = supabase.from('homepage_sections').select('*').order('sort_order', { ascending: true });
  if (page) query = query.eq('page', page);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(s => ({ ...s, settings: typeof s.settings === 'string' ? JSON.parse(s.settings) : (s.settings || {}) }));
}

export async function getHomepageSection(id: string): Promise<HomepageSection | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('homepage_sections').select('*').eq('id', id).single();
  if (error) throw error;
  if (!data) return null;
  return { ...data, settings: typeof data.settings === 'string' ? JSON.parse(data.settings) : (data.settings || {}) };
}

export async function createHomepageSection(input: Partial<HomepageSection>): Promise<HomepageSection> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('homepage_sections').insert({
    page: input.page || 'home',
    section_type: input.section_type,
    title: input.title || '',
    subtitle: input.subtitle || '',
    description: input.description || '',
    image_url: input.image_url || '',
    image_url_2: input.image_url_2 || '',
    link_url: input.link_url || '',
    link_text: input.link_text || '',
    sort_order: input.sort_order ?? 0,
    is_visible: input.is_visible ?? true,
    settings: input.settings || {},
  }).select().single();
  if (error) throw error;
  return { ...data, settings: typeof data.settings === 'string' ? JSON.parse(data.settings) : (data.settings || {}) };
}

export async function updateHomepageSection(id: string, input: Partial<HomepageSection>): Promise<HomepageSection> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('homepage_sections').update({
    page: input.page,
    section_type: input.section_type,
    title: input.title,
    subtitle: input.subtitle,
    description: input.description,
    image_url: input.image_url,
    image_url_2: input.image_url_2,
    link_url: input.link_url,
    link_text: input.link_text,
    sort_order: input.sort_order,
    is_visible: input.is_visible,
    settings: input.settings,
  }).eq('id', id).select().single();
  if (error) throw error;
  return { ...data, settings: typeof data.settings === 'string' ? JSON.parse(data.settings) : (data.settings || {}) };
}

export async function deleteHomepageSection(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('homepage_sections').delete().eq('id', id);
  if (error) throw error;
}

// ─── Analytics / Dashboard ──────────────────────────────

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  const [{ count: total_products }, { count: total_collections }, { count: total_orders }] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('collections').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
  ]);

  const { data: revenueData } = await supabase.from('orders').select('total');
  const total_revenue = (revenueData || []).reduce((sum, o) => sum + Number(o.total), 0);

  const { count: pending_orders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .in('status', ['pending', 'processing']);

  const { count: low_stock_count } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .lte('stock', supabase.rpc('raw', { query: 'low_stock_threshold' }).throwOnError() as any);

  const { data: lowStockProducts } = await supabase
    .from('products')
    .select('id')
    .lte('stock', 5);
  const lowStockCount = lowStockProducts?.length || 0;

  const { data: recentOrders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  const recentOrdersWithItems: Order[] = [];
  for (const row of (recentOrders || [])) {
    const { data: items } = await supabase.from('order_items').select('*').eq('order_id', row.id);
    recentOrdersWithItems.push(mapOrder(row, items || []));
  }

  // Revenue by month
  const { data: allOrders } = await supabase.from('orders').select('total, created_at');
  const revenueByMonth: Record<string, number> = {};
  for (const o of (allOrders || [])) {
    const month = new Date(o.created_at).toLocaleString('en-US', { month: 'short', year: '2-digit' });
    revenueByMonth[month] = (revenueByMonth[month] || 0) + Number(o.total);
  }

  // Orders by status
  const { data: statusData } = await supabase.from('orders').select('status');
  const statusCounts: Record<string, number> = {};
  for (const o of (statusData || [])) {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  }

  // Top products by revenue
  const { data: topItems } = await supabase
    .from('order_items')
    .select('product_name, quantity, price')
    .limit(5);
  const topMap: Record<string, { sold: number; revenue: number }> = {};
  for (const item of (topItems || [])) {
    if (!topMap[item.product_name]) topMap[item.product_name] = { sold: 0, revenue: 0 };
    topMap[item.product_name].sold += item.quantity;
    topMap[item.product_name].revenue += item.quantity * Number(item.price);
  }

  return {
    total_products: total_products || 0,
    total_collections: total_collections || 0,
    total_orders: total_orders || 0,
    total_revenue,
    pending_orders: pending_orders || 0,
    low_stock_count: lowStockCount,
    recent_orders: recentOrdersWithItems,
    revenue_by_month: Object.entries(revenueByMonth).map(([month, revenue]) => ({ month, revenue })),
    orders_by_status: Object.entries(statusCounts).map(([status, count]) => ({ status, count })),
    top_products: Object.entries(topMap).map(([name, data]) => ({ name, ...data })),
  };
}

// ─── Site Settings ──────────────────────────────────────

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = await createClient();
  const { data } = await supabase.from('site_settings').select('key, value');
  return mergeSiteSettings(data);
}

export async function saveSiteSettings(input: Partial<SiteSettings>): Promise<SiteSettings> {
  const supabase = await createClient();
  const rows = Object.entries(input)
    .filter(([key]) => (SITE_SETTING_KEYS as string[]).includes(key))
    .map(([key, value]) => ({ key, value, updated_at: new Date().toISOString() }));
  if (rows.length) {
    const { error } = await supabase.from('site_settings').upsert(rows, { onConflict: 'key' });
    if (error) throw error;
  }
  return getSiteSettings();
}

// ─── Customers ──────────────────────────────────────────

export interface CustomerSummary extends Customer {
  orders: number;
  spent: number;
  last_order: string | null;
}

export async function getCustomers(): Promise<CustomerSummary[]> {
  const supabase = await createClient();
  const [{ data: customers, error }, { data: orders }] = await Promise.all([
    supabase.from('customers').select('*').order('created_at', { ascending: false }),
    supabase.from('orders').select('customer_id, total, status, created_at'),
  ]);
  if (error) throw error;
  return (customers || []).map((c) => {
    const mine = (orders || []).filter((o) => o.customer_id === c.id && o.status !== 'cancelled');
    return {
      ...c,
      orders: mine.length,
      spent: mine.reduce((sum, o) => sum + Number(o.total), 0),
      last_order: mine.map((o) => o.created_at).sort().pop() || null,
    };
  });
}

// ─── Analytics ──────────────────────────────────────────

export interface ProductMetric {
  id: string;
  name: string;
  category: string;
  image: string;
  price: number;
  stock: number;
  units: number;
  revenue: number;
  views: number;
  likes: number;
  carts: number;
  conversion: number; // orders containing the product / views, as %
}

export interface Analytics {
  range: number;
  kpis: {
    revenue: number; revenuePrev: number;
    orders: number; ordersPrev: number;
    aov: number; aovPrev: number;
    units: number; unitsPrev: number;
    views: number; viewsPrev: number;
    likes: number; likesPrev: number;
    conversion: number; conversionPrev: number;
    customers: number; newCustomers: number;
  };
  daily: { date: string; revenue: number; orders: number; views: number }[];
  funnel: { views: number; carts: number; orders: number };
  byCategory: { category: string; revenue: number; units: number }[];
  byStatus: { status: string; count: number }[];
  products: ProductMetric[];
  topCustomers: { name: string; email: string; orders: number; spent: number }[];
  lowStock: { id: string; name: string; stock: number; available: number; threshold: number; soldOut: boolean }[];
  discounts: { total: number; orders: number };
  recentOrders: Order[];
}

const pct = (part: number, whole: number) => (whole > 0 ? (part / whole) * 100 : 0);

export async function getAnalytics(range = 30): Promise<Analytics> {
  const supabase = await createClient();
  const now = Date.now();
  const since = new Date(now - range * 86_400_000);
  const prevSince = new Date(now - 2 * range * 86_400_000);

  const [{ data: orderRows }, { data: products }, { data: customers }, statsNow, statsPrev, daily] = await Promise.all([
    supabase.from('orders').select('*').gte('created_at', prevSince.toISOString()).order('created_at', { ascending: false }),
    supabase.from('products').select('*'),
    supabase.from('customers').select('id, created_at'),
    supabase.rpc('product_event_stats', { since: since.toISOString() }),
    supabase.rpc('product_event_stats', { since: prevSince.toISOString() }),
    supabase.rpc('product_event_daily', { since: since.toISOString() }),
  ]);

  const allOrders = (orderRows || []).filter((o) => o.status !== 'cancelled');
  const current = allOrders.filter((o) => new Date(o.created_at) >= since);
  const previous = allOrders.filter((o) => new Date(o.created_at) < since);

  const ids = current.map((o) => o.id).concat(previous.map((o) => o.id));
  const { data: itemRows } = ids.length
    ? await supabase.from('order_items').select('*').in('order_id', ids)
    : { data: [] as OrderItem[] };
  const currentIds = new Set(current.map((o) => o.id));
  const itemsNow = (itemRows || []).filter((i) => currentIds.has(i.order_id));
  const itemsPrev = (itemRows || []).filter((i) => !currentIds.has(i.order_id));

  // Event totals: the "prev" RPC covers both periods, so subtract the current one
  const sumEvents = (rows: { event_type: string; count: number }[] | null, type: string) =>
    (rows || []).filter((r) => r.event_type === type).reduce((sum, r) => sum + Number(r.count), 0);
  const viewsNow = sumEvents(statsNow.data, 'view');
  const viewsPrev = sumEvents(statsPrev.data, 'view') - viewsNow;
  const likesNow = sumEvents(statsNow.data, 'like');
  const likesPrev = sumEvents(statsPrev.data, 'like') - likesNow;
  const cartsNow = sumEvents(statsNow.data, 'add_to_cart');

  const revenue = current.reduce((s, o) => s + Number(o.total), 0);
  const revenuePrev = previous.reduce((s, o) => s + Number(o.total), 0);
  const units = itemsNow.reduce((s, i) => s + i.quantity, 0);
  const unitsPrev = itemsPrev.reduce((s, i) => s + i.quantity, 0);

  // Daily series, one row per calendar day in the range
  const dayKey = (d: Date) => d.toISOString().slice(0, 10);
  const days = new Map<string, { date: string; revenue: number; orders: number; views: number }>();
  for (let i = range - 1; i >= 0; i--) {
    const key = dayKey(new Date(now - i * 86_400_000));
    days.set(key, { date: key, revenue: 0, orders: 0, views: 0 });
  }
  for (const o of current) {
    const d = days.get(dayKey(new Date(o.created_at)));
    if (d) { d.revenue += Number(o.total); d.orders += 1; }
  }
  for (const r of daily.data || []) {
    const d = days.get(r.day);
    if (d && r.event_type === 'view') d.views += Number(r.count);
  }

  // Per-product metrics
  const eventCount = (productId: string, type: string) =>
    (statsNow.data || []).filter((r: { product_id: string; event_type: string }) => r.product_id === productId && r.event_type === type)
      .reduce((s: number, r: { count: number }) => s + Number(r.count), 0);
  const productMetrics: ProductMetric[] = (products || []).map((p) => {
    const lines = itemsNow.filter((i) => i.product_id === p.id);
    const views = eventCount(p.id, 'view');
    const ordersWith = new Set(lines.map((l) => l.order_id)).size;
    return {
      id: p.id, name: p.name, category: p.category, image: p.images?.[0] || '', price: Number(p.price), stock: Number(p.stock),
      units: lines.reduce((s, l) => s + l.quantity, 0),
      revenue: lines.reduce((s, l) => s + l.quantity * Number(l.price), 0),
      views, likes: eventCount(p.id, 'like'), carts: eventCount(p.id, 'add_to_cart'),
      conversion: pct(ordersWith, views),
    };
  });

  const byCategory = Object.values(productMetrics.reduce<Record<string, { category: string; revenue: number; units: number }>>((acc, p) => {
    acc[p.category] ||= { category: p.category, revenue: 0, units: 0 };
    acc[p.category].revenue += p.revenue;
    acc[p.category].units += p.units;
    return acc;
  }, {})).sort((a, b) => b.revenue - a.revenue);

  const statusRows = (orderRows || []).filter((o) => new Date(o.created_at) >= since);
  const byStatus = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => ({
    status, count: statusRows.filter((o) => o.status === status).length,
  }));

  const spenders = Object.values(current.reduce<Record<string, { name: string; email: string; orders: number; spent: number }>>((acc, o) => {
    acc[o.customer_email] ||= { name: o.customer_name, email: o.customer_email, orders: 0, spent: 0 };
    acc[o.customer_email].orders += 1;
    acc[o.customer_email].spent += Number(o.total);
    return acc;
  }, {})).sort((a, b) => b.spent - a.spent).slice(0, 5);

  const recent = (orderRows || []).slice(0, 6);
  const { data: recentItems } = recent.length
    ? await supabase.from('order_items').select('*').in('order_id', recent.map((o) => o.id))
    : { data: [] as OrderItem[] };

  return {
    range,
    kpis: {
      revenue, revenuePrev,
      orders: current.length, ordersPrev: previous.length,
      aov: current.length ? revenue / current.length : 0,
      aovPrev: previous.length ? revenuePrev / previous.length : 0,
      units, unitsPrev,
      views: viewsNow, viewsPrev,
      likes: likesNow, likesPrev,
      conversion: pct(current.length, viewsNow), conversionPrev: pct(previous.length, viewsPrev),
      customers: (customers || []).length,
      newCustomers: (customers || []).filter((c) => new Date(c.created_at) >= since).length,
    },
    daily: [...days.values()],
    funnel: { views: viewsNow, carts: cartsNow, orders: current.length },
    discounts: {
      total: current.reduce((sum, o) => sum + Number(o.discount || 0), 0),
      orders: current.filter((o) => o.coupon_code).length,
    },
    byCategory,
    byStatus,
    products: productMetrics,
    topCustomers: spenders,
    lowStock: (products || [])
      .filter((p) => isSoldOut(p) || isLowStock(p))
      .map((p) => ({ id: p.id, name: p.name, stock: Number(p.stock), available: availableStock(p), threshold: Number(p.low_stock_threshold || 5), soldOut: isSoldOut(p) }))
      .sort((a, b) => a.available - b.available),
    recentOrders: recent.map((o) => mapOrder(o, (recentItems || []).filter((i) => i.order_id === o.id))),
  };
}

// ─── Coupons ────────────────────────────────────────────

export interface CouponWithStats extends Coupon {
  orders: number;
  discount_given: number;
  revenue: number;
}

type CouponInput = Partial<Omit<Coupon, 'id' | 'used_count' | 'created_at' | 'updated_at'>>;

function couponRow(input: CouponInput) {
  const row: Record<string, unknown> = {
    code: input.code !== undefined ? normalizeCode(input.code) : undefined,
    description: input.description,
    discount_type: input.discount_type,
    discount_value: input.discount_value !== undefined ? Number(input.discount_value) : undefined,
    min_order: input.min_order !== undefined ? Number(input.min_order) || 0 : undefined,
    max_discount: input.max_discount !== undefined ? (input.max_discount ? Number(input.max_discount) : null) : undefined,
    starts_at: input.starts_at !== undefined ? input.starts_at || null : undefined,
    ends_at: input.ends_at !== undefined ? input.ends_at || null : undefined,
    usage_limit: input.usage_limit !== undefined ? (input.usage_limit ? Number(input.usage_limit) : null) : undefined,
    once_per_customer: input.once_per_customer,
    is_active: input.is_active,
  };
  if (row.discount_type === 'percent' && Number(row.discount_value) > 100) throw new Error('Percentage discount can’t exceed 100');
  if (row.discount_value !== undefined && !(Number(row.discount_value) > 0)) throw new Error('Discount value must be above 0');
  if (row.code !== undefined && !/^[A-Z0-9_-]{3,24}$/.test(String(row.code))) throw new Error('Code must be 3–24 letters, numbers, - or _');
  return row;
}

export async function getCoupons(): Promise<CouponWithStats[]> {
  const supabase = await createClient();
  const [{ data: coupons, error }, { data: orders }] = await Promise.all([
    supabase.from('coupons').select('*').order('created_at', { ascending: false }),
    supabase.from('orders').select('coupon_code, discount, total, status').not('coupon_code', 'is', null),
  ]);
  if (error) throw error;
  return (coupons || []).map((c) => {
    const used = (orders || []).filter((o) => o.coupon_code === c.code && o.status !== 'cancelled');
    return {
      ...c,
      discount_value: Number(c.discount_value), min_order: Number(c.min_order),
      max_discount: c.max_discount === null ? null : Number(c.max_discount),
      orders: used.length,
      discount_given: used.reduce((s, o) => s + Number(o.discount || 0), 0),
      revenue: used.reduce((s, o) => s + Number(o.total || 0), 0),
    };
  });
}

export async function createCoupon(input: CouponInput): Promise<Coupon> {
  const supabase = await createClient();
  const row = couponRow({ discount_type: 'percent', min_order: 0, once_per_customer: false, is_active: true, description: '', ...input });
  const { data, error } = await supabase.from('coupons').insert({ ...row, used_count: 0 }).select().single();
  if (error) throw new Error(/duplicate|unique/i.test(error.message) ? 'A coupon with this code already exists' : error.message);
  return data;
}

export async function updateCoupon(id: string, input: CouponInput): Promise<Coupon> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('coupons').update(couponRow(input)).eq('id', id).select().single();
  if (error) throw new Error(/duplicate|unique/i.test(error.message) ? 'A coupon with this code already exists' : error.message);
  return data;
}

export async function deleteCoupon(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('coupons').delete().eq('id', id);
  if (error) throw error;
}

export async function setSoldOutThreshold(threshold: number, productIds?: string[]): Promise<number> {
  const supabase = await createClient();
  let query = supabase.from('products').update({ out_of_stock_threshold: Math.max(0, Math.floor(threshold)) });
  query = productIds?.length ? query.in('id', productIds) : query.gte('stock', 0);
  const { data, error } = await query.select('id');
  if (error) throw error;
  return (data || []).length;
}
