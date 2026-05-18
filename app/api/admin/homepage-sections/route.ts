import { NextRequest, NextResponse } from 'next/server';
import { getHomepageSections, createHomepageSection, requireAdmin } from '@/lib/admin-db';

export async function GET() {
  try {
    await requireAdmin();
    const sections = await getHomepageSections();
    return NextResponse.json(sections);
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
    const section = await createHomepageSection(body);
    return NextResponse.json(section, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
