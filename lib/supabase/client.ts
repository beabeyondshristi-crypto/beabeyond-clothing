import { createBrowserClient } from '@supabase/ssr'
import { createMockClient, USE_MOCK_DATA } from './mock'
import { SUPABASE_URL, SUPABASE_KEY } from './env'

export function createClient() {
  if (USE_MOCK_DATA) {
    return createMockClient({
      get: (name) => document.cookie.split('; ').find((c) => c.startsWith(`${name}=`))?.slice(name.length + 1),
      set: (name, value) => { document.cookie = `${name}=${value}; path=/; max-age=2592000; samesite=lax` },
      remove: (name) => { document.cookie = `${name}=; path=/; max-age=0` },
    }) as unknown as ReturnType<typeof createSupabaseClient>
  }

  return createSupabaseClient()
}

function createSupabaseClient() {
  return createBrowserClient(
    SUPABASE_URL,
    SUPABASE_KEY,
    {
      cookieOptions: {
        path: '/',
        sameSite: 'lax',
        secure: false,
      },
    }
  )
}
