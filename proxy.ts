import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// ⚠️ Nouvelle convention Next.js 16 : on exporte 'proxy'
export async function proxy(request: NextRequest) {
  
  // 1. PRIORITÉ ABSOLUE : On laisse passer toutes les routes API
  // Cela corrige ton bug "Unexpected token <" lors de la création vidéo
  if (request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // 2. Initialisation de la réponse
  let supabaseResponse = NextResponse.next({
    request: { headers: request.headers },
  })

  // 3. Configuration Supabase SSR
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    }
  )

  // 4. Vérification de l'utilisateur
  const { data: { user } } = await supabase.auth.getUser()

  // 5. Protection des routes (Dashboard, Create...)
  // Si pas connecté -> Redirection Login
  const protectedPaths = ['/dashboard', '/create', '/create-image']
  const isProtected = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))

  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

// La config reste identique
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}