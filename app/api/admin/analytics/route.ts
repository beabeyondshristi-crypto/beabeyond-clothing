import { NextRequest, NextResponse } from 'next/server';
import { getAnalytics, requireAdmin } from '@/lib/admin-db';

const RANGES = new Set([7, 30, 90]);

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const requested = Number(req.nextUrl.searchParams.get('range') || 30);
    const range = RANGES.has(requested) ? requested : 30;
    return NextResponse.json(await getAnalytics(range));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
