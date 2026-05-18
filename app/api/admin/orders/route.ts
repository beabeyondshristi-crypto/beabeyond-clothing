import { NextRequest, NextResponse } from 'next/server';
import { getOrders, requireAdmin } from '@/lib/admin-db';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const orders = await getOrders(status);
    return NextResponse.json(orders);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
