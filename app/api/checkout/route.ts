import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Unauthorized');

    const body = await req.json();
    const { items, shipping_address, notes } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Get customer info
    const { data: customer } = await supabase.from('customers').select('*').eq('id', user.id).single();
    if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });

    // Calculate totals
    let subtotal = 0;
    for (const item of items) {
      subtotal += item.price * item.quantity;
    }
    const shipping_cost = subtotal >= 200 ? 0 : 15;
    const tax = subtotal * 0.08875;
    const total = subtotal + shipping_cost + tax;

    // Create order
    const { data: order, error: orderError } = await supabase.from('orders').insert({
      customer_id: user.id,
      customer_name: customer.name,
      customer_email: customer.email,
      status: 'pending',
      subtotal,
      shipping_cost,
      tax,
      total,
      shipping_address: shipping_address || {},
      notes: notes || '',
    }).select().single();

    if (orderError) throw orderError;

    // Create order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      quantity: item.quantity,
      price: item.price,
      size: item.selectedSize || item.size || '',
      color: item.selectedColor || item.color || '',
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) throw itemsError;

    // Update stock
    for (const item of items) {
      const { data: product } = await supabase.from('products').select('stock').eq('id', item.id).single();
      if (product) {
        await supabase.from('products').update({ stock: Math.max(0, product.stock - item.quantity) }).eq('id', item.id);
        await supabase.from('inventory_log').insert({
          product_id: item.id,
          change: -item.quantity,
          reason: `Order ${order.id}`,
        });
      }
    }

    // Clear cart_items for this customer
    await supabase.from('cart_items').delete().eq('customer_id', user.id);

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    const status = message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
