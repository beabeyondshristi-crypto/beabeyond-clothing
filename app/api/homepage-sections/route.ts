import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('homepage_sections')
      .select('*')
      .eq('is_visible', true)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
