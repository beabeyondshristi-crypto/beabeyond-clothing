import { NextRequest, NextResponse } from 'next/server';
import { getCoupons, createCoupon, requireAdmin } from '@/lib/admin-db';

const statusFor = (m: string) => (m === 'Unauthorized' ? 401 : m === 'Forbidden' ? 403 : 400);

export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json(await getCoupons());
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: statusFor(message) });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    return NextResponse.json(await createCoupon(await req.json()), { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: statusFor(message) });
  }
}
