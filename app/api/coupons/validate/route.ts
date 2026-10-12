import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { normalizeCode } from '@/lib/coupons';

// Checkout preview: is this code valid for this subtotal, and how much does it take off?
export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json();
    if (!code || typeof code !== 'string') return NextResponse.json({ valid: false, discount: 0, message: 'Enter a code' });
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('validate_coupon', { p_code: normalizeCode(code), p_subtotal: Number(subtotal) || 0 });
    if (error) throw error;
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ valid: false, discount: 0, message: 'Couldn’t check this code right now' }, { status: 500 });
  }
}
