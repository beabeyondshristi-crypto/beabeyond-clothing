import { NextRequest, NextResponse } from 'next/server';
import { getInventory, updateStock, setSoldOutThreshold, requireAdmin } from '@/lib/admin-db';

export async function GET() {
  try {
    await requireAdmin();
    const inventory = await getInventory();
    return NextResponse.json(inventory);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    await updateStock(body.product_id, body.change, body.reason);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Set the sold-out threshold for chosen products (or all when product_ids is omitted)
export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
    const { threshold, product_ids } = await req.json();
    if (!Number.isFinite(Number(threshold)) || Number(threshold) < 0) {
      return NextResponse.json({ error: 'Threshold must be 0 or more' }, { status: 400 });
    }
    const updated = await setSoldOutThreshold(Number(threshold), Array.isArray(product_ids) ? product_ids : undefined);
    return NextResponse.json({ updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
