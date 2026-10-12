import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { SUPABASE_URL, SUPABASE_KEY } from './env'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  // Mock mode has no remote session to refresh
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') return supabaseResponse

  const supabase = createServerClient(
    SUPABASE_URL,
    SUPABASE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, { ...options, sameSite: 'lax', secure: false })
          )
        },
      },
      cookieOptions: {
        path: '/',
        sameSite: 'lax',
        secure: false,
      },
    }
  )

  // Don't block every request if Supabase is unreachable
  try {
    await Promise.race([
      supabase.auth.getUser(),
      new Promise((resolve) => setTimeout(resolve, 3000)),
    ])
  } catch (error) {
    console.warn('Supabase session refresh failed:', (error as Error).message)
  }

  return supabaseResponse
}
