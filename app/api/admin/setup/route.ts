import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: admin } = await supabase
      .from('admin_users')
      .select('role')
      .eq('email', user.email)
      .single();

    if (!admin || admin.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Ensure admin user exists
    await supabase.from('admin_users').upsert({
      email: user.email,
      name: user.email?.split('@')[0] || 'Admin',
      role: 'superadmin',
    }).select().single();

    // Check if we have products
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      status: 'ok',
      message: 'Setup complete',
      products_count: count || 0,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
