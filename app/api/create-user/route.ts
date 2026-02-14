import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Client Admin pour contourner les RLS lors de la mise à jour des crédits
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, 
  { auth: { persistSession: false } }
)

export async function POST(req: Request) {
  try {
    const { script, avatarId } = await req.json()

    // 1. Récupérer l'utilisateur connecté via le token envoyé par le client
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    // On récupère le token du header Authorization
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    
    // Astuce: On réutilise le token pour savoir qui fait la requête
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Utilisateur non authentifié' }, { status: 401 })
    }

    // 2. Vérifier les crédits
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('credits')
      .eq('id', user.id)
      .single()

    if (!userData || userData.credits < 10) {
      return NextResponse.json({ error: 'Crédits insuffisants' }, { status: 403 })
    }

    // 3. Déduire les crédits
    await supabaseAdmin
      .from('users')
      .update({ credits: userData.credits - 10 })
      .eq('id', user.id)

    // 4. (ICI TU APPELLERAS TON API IA : Replicate, HeyGen, etc.)
    // Pour l'instant, on simule une vidéo "en cours"
    
    const { data: videoData, error: videoError } = await supabaseAdmin
      .from('videos')
      .insert({
        user_id: user.id,
        script: script,
        status: 'processing', // Passera à 'completed' quand l'IA aura fini
        avatar_id: avatarId
      })
      .select()
      .single()

    if (videoError) throw videoError

    // Simulation : On update le statut après 2 secondes pour faire croire que c'est fini (pour le test)
    // Dans la vraie vie, tu utiliserais un Webhook de Replicate
    setTimeout(async () => {
       await supabaseAdmin
         .from('videos')
         .update({ 
           status: 'completed',
           video_url: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4' // Vidéo de test
         })
         .eq('id', videoData.id)
    }, 5000)

    return NextResponse.json({ videoId: videoData.id })

  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}