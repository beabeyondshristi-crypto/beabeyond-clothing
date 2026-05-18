import { NextRequest, NextResponse } from 'next/server';
import {
  getCollectionProducts,
  addProductToCollection,
  removeProductFromCollection,
  requireAdmin,
} from '@/lib/admin-db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const products = await getCollectionProducts(id);
    return NextResponse.json(products);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const productId = body.product_id;
    if (!productId) return NextResponse.json({ error: 'product_id is required' }, { status: 400 });
    await addProductToCollection(id, productId);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('product_id');
    if (!productId) return NextResponse.json({ error: 'product_id query param is required' }, { status: 400 });
    await removeProductFromCollection(id, productId);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
