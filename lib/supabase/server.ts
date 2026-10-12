import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createMockClient, USE_MOCK_DATA } from './mock'
import { SUPABASE_URL, SUPABASE_KEY } from './env'

export async function createClient() {
  const cookieStore = await cookies()

  if (USE_MOCK_DATA) {
    return createMockClient({
      get: (name) => cookieStore.get(name)?.value,
      // Cookies can only be written from route handlers / server actions
      set: (name, value) => { try { cookieStore.set(name, value, { path: '/', maxAge: 2592000, sameSite: 'lax' }) } catch {} },
      remove: (name) => { try { cookieStore.delete(name) } catch {} },
    }) as unknown as ReturnType<typeof createSupabaseClient>
  }

  return createSupabaseClient(cookieStore)
}

function createSupabaseClient(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  return createServerClient(
    SUPABASE_URL,
    SUPABASE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
      cookieOptions: {
        path: '/',
        sameSite: 'lax',
        secure: false,
      },
    }
  )
}
