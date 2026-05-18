import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

async function getCustomer() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('Unauthorized');
  return { supabase, user };
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { supabase, user } = await getCustomer();
    const { id } = await params;
    const body = await req.json();

    if (body.is_default) {
      await supabase.from('addresses').update({ is_default: false }).eq('customer_id', user.id);
    }

    const { data, error } = await supabase
      .from('addresses')
      .update({
        label: body.label,
        line1: body.line1,
        line2: body.line2,
        city: body.city,
        state: body.state,
        postal_code: body.postal_code,
        country: body.country,
        is_default: body.is_default,
      })
      .eq('id', id)
      .eq('customer_id', user.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    const status = message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { supabase, user } = await getCustomer();
    const { id } = await params;
    const { error } = await supabase.from('addresses').delete().eq('id', id).eq('customer_id', user.id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    const status = message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
