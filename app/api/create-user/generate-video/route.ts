import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialisation du client Supabase côté serveur (bypass RLS pour déduire les crédits)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Attention: utilise la clé SERVICE ROLE ici
)

export async function POST(request: Request) {
  try {
    const { script, avatarId, options, userId } = await request.json()

    // 1. Vérifier les crédits de l'utilisateur
    const { data: user } = await supabase
      .from('users')
      .select('credits')
      .eq('id', userId)
      .single()

    if (!user || user.credits < 10) {
      return NextResponse.json({ error: 'Crédits insuffisants' }, { status: 402 })
    }

    // 2. Déduire les crédits (10 crédits par vidéo)
    const { error: updateError } = await supabase
      .from('users')
      .update({ credits: user.credits - 10 })
      .eq('id', userId)

    if (updateError) throw updateError

    // 3. Créer l'entrée vidéo en base de données
    const { data: video, error: videoError } = await supabase
      .from('videos')
      .insert({
        user_id: userId,
        script,
        avatar_id: avatarId,
        status: 'processing', // La vidéo est marquée "en cours"
        options
      })
      .select()
      .single()

    if (videoError) throw videoError

    // 4. (ICI) Déclencher l'IA (Replicate / OpenAI)
    // Pour l'instant, on simule un succès immédiat pour tester le flux
    // Plus tard, tu remplaceras ça par l'appel réel à Replicate
    
    return NextResponse.json({ 
      success: true, 
      videoId: video.id, 
      message: "Génération lancée" 
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}