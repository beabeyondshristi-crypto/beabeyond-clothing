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
    const { data, error } = await supabase.from('customers').select('*').eq('id', user.id).single();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    const status = message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { supabase, user } = await getCustomer();
    const body = await req.json();
    const updates: Record<string, string> = {};
    if (body.name) updates.name = body.name;
    if (body.phone) updates.phone = body.phone;

    const { data, error } = await supabase.from('customers').update(updates).eq('id', user.id).select().single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    const status = message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
