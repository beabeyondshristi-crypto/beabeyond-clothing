import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';

    if (!q.trim()) {
      const [catRes, prodRes, colRes] = await Promise.all([
        supabase.from('products').select('category').limit(8),
        supabase.from('products').select('*').limit(8).order('created_at', { ascending: false }),
        supabase.from('collections').select('name, slug').limit(8),
      ]);
      const categories = [...new Set((catRes.data || []).map(r => r.category))];
      return NextResponse.json({
        categories,
        colors: ['Black', 'White', 'Navy'],
        collections: colRes.data || [],
        products: prodRes.data || [],
      });
    }

    const like = `%${q}%`;

    const [catRes, prodRes, colRes] = await Promise.all([
      supabase.from('products').select('category').ilike('category', like).limit(5),
      supabase.from('products').select('*').or(`name.ilike.${like},category.ilike.${like}`).limit(5),
      supabase.from('collections').select('name, slug').ilike('name', like).limit(5),
    ]);

    const categories = [...new Set((catRes.data || []).map(r => r.category))];
    const products = prodRes.data || [];

    const colorSet = new Set<string>();
    for (const p of products) {
      for (const c of (p.colors || [])) {
        if (c.toLowerCase().includes(q.toLowerCase())) colorSet.add(c);
      }
    }

    return NextResponse.json({ categories, colors: [...colorSet], collections: colRes.data || [], products });
  } catch {
    return NextResponse.json({ categories: [], colors: [], collections: [], products: [] });
  }
}
