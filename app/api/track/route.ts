import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const TYPES = new Set(['view', 'like', 'unlike', 'add_to_cart']);

// Public, fire-and-forget storefront events used by Admin → Analytics
export async function POST(req: NextRequest) {
  try {
    const { product_id, type } = await req.json();
    if (typeof product_id !== 'string' || !TYPES.has(type)) {
      return NextResponse.json({ error: 'Invalid event' }, { status: 400 });
    }
    const supabase = await createClient();
    if (type === 'unlike') {
      await supabase.rpc('remove_product_like', { p_product_id: product_id });
    } else {
      await supabase.from('product_events').insert({ product_id, event_type: type });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
