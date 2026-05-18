import { NextResponse } from 'next/server';
import { getDashboardStats, requireAdmin } from '@/lib/admin-db';

export async function GET() {
  try {
    await requireAdmin();
    const stats = await getDashboardStats();
    return NextResponse.json(stats);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
