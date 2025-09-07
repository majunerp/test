import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(new URL('/?error=supabase-not-configured', request.url))
  }

  if (code) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url))
    } else {
      console.error('Auth exchange error:', error)
      return NextResponse.redirect(new URL(`/?error=auth-exchange-${error.message}`, request.url))
    }
  } else {
    const error = searchParams.get('error')
    const error_description = searchParams.get('error_description')
    console.error('Auth callback error:', error, error_description)
    return NextResponse.redirect(new URL(`/?error=auth-${error || 'no-code'}`, request.url))
  }

  return NextResponse.redirect(new URL('/?error=auth-failed', request.url))
}