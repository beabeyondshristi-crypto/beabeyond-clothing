import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.from('products').select('count')

    if (error) {
      return NextResponse.json({ 
        status: 'error',
        message: error.message,
        hint: error.hint 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      status: 'success',
      message: 'Supabase connected!',
      products: data
    })
  } catch (err) {
    return NextResponse.json({ 
      status: 'error',
      message: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}
