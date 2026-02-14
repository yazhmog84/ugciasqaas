import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const { script, avatarUrl } = await req.json() // On attend une URL d'image, pas un ID interne
    
    // 1. Initialiser Supabase
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    // 2. Vérifier Crédits
    const { data: userProfile } = await supabase
      .from('users')
      .select('credits')
      .eq('id', user.id)
      .single()

    if (!userProfile || userProfile.credits < 10) {
      return NextResponse.json({ error: 'Crédits insuffisants' }, { status: 403 })
    }

    // 3. Appeler D-ID API (/talks)
    const response = await fetch('https://api.d-id.com/talks', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${process.env.DID_API_KEY}`, // Ta clé API encodée ou brute selon .env
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source_url: avatarUrl, // L'image de l'avatar
        script: {
          type: 'text',
          input: script,
          provider: {
            type: 'microsoft',
            voice_id: 'fr-FR-DeniseNeural' // Voix FR par défaut
          }
        },
        config: {
          fluent: true,
          pad_audio: 0.0
        }
      }),
    })

    if (!response.ok) {
      const err = await response.json()
      console.error('D-ID Error:', err)
      return NextResponse.json({ error: err.description || 'Erreur D-ID' }, { status: 500 })
    }

    const didData = await response.json() // Renvoie { id: "tlk_...", ... }

    // 4. Déduire crédits
    await supabase.from('users').update({ credits: userProfile.credits - 10 }).eq('id', user.id)

    // 5. Sauvegarder dans ta DB
    const { data: videoRecord, error: dbError } = await supabase
      .from('videos')
      .insert({
        user_id: user.id,
        d_id_id: didData.id, // ID du job D-ID
        status: 'processing', // Statut initial
        title: script.slice(0, 30) + '...',
        script: script
      })
      .select()
      .single()

    if (dbError) throw dbError

    return NextResponse.json({ videoId: videoRecord.id }) // On renvoie l'ID de TA base de données

  } catch (error: any) {
    console.error('Server Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}