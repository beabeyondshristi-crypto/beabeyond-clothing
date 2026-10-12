import { NextRequest, NextResponse } from 'next/server';
import { getSiteSettings, saveSiteSettings, requireAdmin } from '@/lib/admin-db';

const statusFor = (message: string) => (message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500);

export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json(await getSiteSettings());
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: statusFor(message) });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
    return NextResponse.json(await saveSiteSettings(await req.json()));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: statusFor(message) });
  }
}
