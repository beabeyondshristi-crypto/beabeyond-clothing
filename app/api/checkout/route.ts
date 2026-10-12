import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { availableStock } from '@/lib/stock';
import { normalizeCode, type CouponResult } from '@/lib/coupons';

const FREE_SHIPPING_AT = 200;
const SHIPPING = 15;
const TAX_RATE = 0.08875;
const round = (n: number) => Math.round(n * 100) / 100;

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Unauthorized');

    const body = await req.json();
    const { items, shipping_address, notes, coupon_code } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Get customer info
    const { data: customer } = await supabase.from('customers').select('*').eq('id', user.id).single();
    if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });

    // Prices and stock come from the database, never from the client
    const ids = [...new Set(items.map((i: { id: string }) => i.id))];
    const { data: products, error: productError } = await supabase.from('products').select('*').in('id', ids);
    if (productError) throw productError;

    const lines = [];
    for (const item of items) {
      const product = (products || []).find((p) => p.id === item.id);
      const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
      if (!product) return NextResponse.json({ error: `${item.name || 'An item'} is no longer available` }, { status: 409 });
      const requested = items.filter((i: { id: string }) => i.id === item.id).reduce((n: number, i: { quantity: number }) => n + Math.max(1, Math.floor(Number(i.quantity) || 1)), 0);
      const available = availableStock(product);
      if (requested > available) {
        return NextResponse.json({
          error: available === 0 ? `${product.name} is sold out` : `Only ${available} of ${product.name} left — please reduce the quantity`,
        }, { status: 409 });
      }
      lines.push({ product, quantity, size: item.selectedSize || item.size || '', color: item.selectedColor || item.color || '' });
    }

    const subtotal = round(lines.reduce((sum, l) => sum + Number(l.product.price) * l.quantity, 0));

    // Coupon is redeemed in the database (rules re-checked, use counted atomically)
    let discount = 0;
    let code: string | null = null;
    if (coupon_code) {
      const { data: result, error: couponError } = await supabase.rpc('redeem_coupon', { p_code: normalizeCode(coupon_code), p_subtotal: subtotal });
      if (couponError) throw couponError;
      const coupon = result as CouponResult;
      if (!coupon?.valid) return NextResponse.json({ error: coupon?.message || 'This code isn’t valid' }, { status: 400 });
      discount = round(Number(coupon.discount));
      code = coupon.code || normalizeCode(coupon_code);
    }

    const shipping_cost = subtotal >= FREE_SHIPPING_AT ? 0 : SHIPPING;
    const tax = round((subtotal - discount) * TAX_RATE);
    const total = round(subtotal - discount + shipping_cost + tax);

    // Create order
    const { data: order, error: orderError } = await supabase.from('orders').insert({
      customer_id: user.id,
      customer_name: customer.name,
      customer_email: customer.email,
      status: 'pending',
      subtotal,
      discount,
      coupon_code: code,
      shipping_cost,
      tax,
      total,
      shipping_address: shipping_address || {},
      notes: notes || '',
    }).select().single();

    if (orderError) throw orderError;

    const orderItems = lines.map((l) => ({
      order_id: order.id,
      product_id: l.product.id,
      product_name: l.product.name,
      quantity: l.quantity,
      price: Number(l.product.price),
      size: l.size,
      color: l.color,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) throw itemsError;

    // Decrement stock through the database function (shoppers can't write products directly)
    for (const l of lines) {
      await supabase.rpc('update_product_stock', {
        p_product_id: l.product.id,
        p_change: -l.quantity,
        p_reason: `Order ${order.id}`,
      });
    }

    // Clear cart_items for this customer
    await supabase.from('cart_items').delete().eq('customer_id', user.id);

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : (err as { message?: string })?.message || 'Internal server error';
    const status = message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
