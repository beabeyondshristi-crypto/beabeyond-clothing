import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';

    if (!q.trim()) return NextResponse.json({ categories: [], colors: [], collections: [], products: [] });

    const like = `%${q}%`;

    const [catRes, prodRes, colRes] = await Promise.all([
      supabase.from('products').select('category').ilike('category', like).limit(5),
      supabase.from('products').select('*, collections!collection_products(name, slug)').or(`name.ilike.${like},category.ilike.${like}`).limit(5),
      supabase.from('collections').select('name, slug').ilike('name', like).limit(5),
    ]);

    const categories = [...new Set((catRes.data || []).map(r => r.category))];
    const products = prodRes.data || [];

    // Extract matching colors from products
    const colorSet = new Set<string>();
    for (const p of products) {
      for (const c of (p.colors || [])) {
        if (c.toLowerCase().includes(q.toLowerCase())) colorSet.add(c);
      }
    }

    return NextResponse.json({
      categories,
      colors: [...colorSet],
      collections: colRes.data || [],
      products,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
