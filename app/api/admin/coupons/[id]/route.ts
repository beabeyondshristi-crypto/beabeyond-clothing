import { NextRequest, NextResponse } from 'next/server';
import { updateCoupon, deleteCoupon, requireAdmin } from '@/lib/admin-db';

const statusFor = (m: string) => (m === 'Unauthorized' ? 401 : m === 'Forbidden' ? 403 : 400);

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    return NextResponse.json(await updateCoupon(id, await req.json()));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: statusFor(message) });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    await deleteCoupon(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: statusFor(message) });
  }
}
