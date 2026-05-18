import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

async function getCustomer() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('Unauthorized');
  return { supabase, user };
}

export async function GET() {
  try {
    const { supabase, user } = await getCustomer();
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('customer_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    const status = message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { supabase, user } = await getCustomer();
    const body = await req.json();
    if (!body.line1 || !body.city || !body.state || !body.postal_code) {
      return NextResponse.json({ error: 'line1, city, state, and postal_code are required' }, { status: 400 });
    }

    // If this is the first address or marked default, unset other defaults
    if (body.is_default) {
      await supabase.from('addresses').update({ is_default: false }).eq('customer_id', user.id);
    }

    // Check if this is the first address
    const { count } = await supabase
      .from('addresses')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', user.id);

    const { data, error } = await supabase.from('addresses').insert({
      customer_id: user.id,
      label: body.label || 'Home',
      line1: body.line1,
      line2: body.line2 || '',
      city: body.city,
      state: body.state,
      postal_code: body.postal_code,
      country: body.country || 'US',
      is_default: count === 0 ? true : !!body.is_default,
    }).select().single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    const status = message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
