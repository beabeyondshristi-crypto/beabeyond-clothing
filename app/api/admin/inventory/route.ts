import { NextRequest, NextResponse } from 'next/server';
import { getInventory, updateStock, requireAdmin } from '@/lib/admin-db';

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
