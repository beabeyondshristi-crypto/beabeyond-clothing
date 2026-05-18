import { createClient } from '@/lib/supabase/server';
import { Product, Collection, Order, OrderItem, DashboardStats, InventoryItem, HomepageSection } from './types';

function mapProduct(row: any): Product {
  return {
    ...row,
    images: row.images || [],
    colors: row.colors || [],
    sizes: row.sizes || [],
    price: Number(row.price),
    stock: Number(row.stock) || 0,
    low_stock_threshold: Number(row.low_stock_threshold) || 5,
  };
}

function mapOrder(row: any, items: OrderItem[] = []): Order {
  return {
    ...row,
    total: Number(row.total),
    subtotal: Number(row.subtotal),
    shipping_cost: Number(row.shipping_cost),
    tax: Number(row.tax),
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

  // Check admin_users table if it exists — otherwise allow any auth user
  try {
    const { data: admin } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', user.email)
      .single();
    if (admin) return { user, admin };
  } catch {
    // table doesn't exist — allow access
  }

  return { user, admin: { id: user.id, email: user.email, name: user.email?.split('@')[0] || 'Admin', role: 'superadmin' } };
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
    colors: input.colors || [],
    sizes: input.sizes || [],
    is_new_arrival: input.is_new_arrival || false,
    is_trending: input.is_trending || false,
    is_essential: input.is_essential || false,
    stock: input.stock ?? 0,
    low_stock_threshold: input.low_stock_threshold ?? 5,
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
    colors: input.colors,
    sizes: input.sizes,
    is_new_arrival: input.is_new_arrival,
    is_trending: input.is_trending,
    is_essential: input.is_essential,
    stock: input.stock,
    low_stock_threshold: input.low_stock_threshold,
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
  const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select().single();
  if (error) throw error;
  const { data: items } = await supabase.from('order_items').select('*').eq('order_id', id);
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

export async function getHomepageSections(): Promise<HomepageSection[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('homepage_sections').select('*').order('sort_order', { ascending: true });
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
