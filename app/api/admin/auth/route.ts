import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ authenticated: false }, { status: 401 });

    // Try admin_users table. If it doesn't exist, let them in anyway.
    try {
      let { data: admin } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', user.email)
        .single();

      if (!admin) {
        const { data: existingAdmins } = await supabase
          .from('admin_users')
          .select('id')
          .limit(1);

        const { data: newAdmin } = await supabase
          .from('admin_users')
          .insert({
            email: user.email,
            name: user.email?.split('@')[0] || 'Admin',
            role: existingAdmins && existingAdmins.length > 0 ? 'admin' : 'superadmin',
          })
          .select()
          .single();

        if (newAdmin) admin = newAdmin;
      }

      if (admin) {
        return NextResponse.json({
          authenticated: true,
          user: { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
        });
      }
    } catch {
      // admin_users table doesn't exist — let them in as superadmin
    }

    // Fallback: authenticated Supabase user gets access
    return NextResponse.json({
      authenticated: true,
      user: { id: user.id, email: user.email, name: user.email?.split('@')[0] || 'Admin', role: 'superadmin' },
    });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
