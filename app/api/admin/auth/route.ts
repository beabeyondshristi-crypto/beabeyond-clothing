import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-db';

export async function GET() {
  try {
    const { admin } = await requireAdmin();
    return NextResponse.json({
      authenticated: true,
      user: { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unauthorized';
    return NextResponse.json({ authenticated: false, error: message }, { status: message === 'Forbidden' ? 403 : 401 });
  }
}
