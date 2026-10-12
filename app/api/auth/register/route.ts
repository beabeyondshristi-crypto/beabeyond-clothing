import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, phone } = await req.json();
    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Create the Supabase auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Failed to create user');

    // Create the customer record now if signed in; when email confirmation is on there is no
    // session yet, and /api/customers/me creates the record on first sign-in instead.
    if (authData.session) {
      const { error: customerError } = await supabase.from('customers').insert({
        id: authData.user.id,
        email,
        name,
        phone: phone || '',
      });
      if (customerError) throw customerError;
    }

    return NextResponse.json({ success: true, needsConfirmation: !authData.session, user: { id: authData.user.id, email, name } }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
