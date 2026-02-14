import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const { videoId } = await req.json()
    const supabase = await createClient()

    const { data: video } = await supabase
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .single()

    if (!video) return NextResponse.json({ error: 'Vidéo introuvable' }, { status: 404 })

    if (video.status === 'completed' || video.status === 'failed') {
      return NextResponse.json(video)
    }

    // Encodage Clé API (Le même que dans generate-video)
    const apiKey = process.env.DID_API_KEY || ''
    const authHeader = apiKey.startsWith('Basic ') ? apiKey : `Basic ${Buffer.from(apiKey).toString('base64')}`

    const response = await fetch(`https://api.d-id.com/talks/${video.d_id_id}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
        return NextResponse.json(video) // On attend le prochain poll
    }

    const didStatus = await response.json()

    if (didStatus.status === 'done') {
      const { data: updated } = await supabase
        .from('videos')
        .update({ 
          status: 'completed',
          video_url: didStatus.result_url 
        })
        .eq('id', videoId)
        .select()
        .single()
      return NextResponse.json(updated)
    } 
    else if (didStatus.status === 'error' || didStatus.status === 'rejected') {
       // ÉCHEC DÉTECTÉ -> REMBOURSEMENT
       
       // 1. Marquer comme échoué
       const { data: updated } = await supabase
        .from('videos')
        .update({ status: 'failed' })
        .eq('id', videoId)
        .select()
        .single()
       
       // 2. Rembourser l'utilisateur
       // On récupère les crédits actuels
       const { data: user } = await supabase.from('users').select('credits').eq('id', video.user_id).single()
       if (user) {
           await supabase.from('users').update({ credits: user.credits + 10 }).eq('id', video.user_id)
       }

      return NextResponse.json(updated)
    }

    return NextResponse.json(video)

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}