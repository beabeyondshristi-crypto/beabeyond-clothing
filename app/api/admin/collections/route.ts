import { NextRequest, NextResponse } from 'next/server';
import { getCollections, createCollection, requireAdmin } from '@/lib/admin-db';

export async function GET() {
  try {
    await requireAdmin();
    const collections = await getCollections();
    return NextResponse.json(collections);
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
    const collection = await createCollection(body);
    return NextResponse.json(collection, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
