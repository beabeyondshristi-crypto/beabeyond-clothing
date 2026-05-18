import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const supabase = await createClient();
    const { slug } = await params;

    const { data: collection } = await supabase.from('collections').select('id').eq('slug', slug).single();
    if (!collection) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const { data, error } = await supabase
      .from('collection_products')
      .select('products(*)')
      .eq('collection_id', collection.id);

    if (error) throw error;
    const products = (data || []).map((cp: any) => cp.products).filter(Boolean);
    return NextResponse.json(products);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
