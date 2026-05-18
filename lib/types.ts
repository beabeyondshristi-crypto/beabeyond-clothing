export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  images: string[];
  description: string;
  fabric: string;
  colors: string[];
  sizes: string[];
  is_new_arrival: boolean;
  is_trending: boolean;
  is_essential: boolean;
  stock: number;
  low_stock_threshold: number;
  created_at: string;
  updated_at: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  created_at: string;
}

export interface Customer {
  id: string;
  email: string;
  name: string;
  phone: string;
  created_at: string;
}

export interface Order {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  shipping_address: Record<string, string>;
  notes: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  size: string;
  color: string;
  created_at: string;
}

export interface InventoryItem {
  product_id: string;
  product_name: string;
  stock: number;
  reserved: number;
  low_stock_threshold: number;
}

export interface DashboardStats {
  total_products: number;
  total_collections: number;
  total_orders: number;
  total_revenue: number;
  pending_orders: number;
  low_stock_count: number;
  recent_orders: Order[];
  revenue_by_month: { month: string; revenue: number }[];
  orders_by_status: { status: string; count: number }[];
  top_products: { name: string; sold: number; revenue: number }[];
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'superadmin';
}

export interface HomepageSection {
  id: string;
  section_type: 'hero_slide' | 'editorial' | 'category_spotlight' | 'newsletter';
  title: string;
  subtitle: string;
  description: string;
  image_url: string;
  image_url_2: string;
  link_url: string;
  link_text: string;
  sort_order: number;
  is_visible: boolean;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}
