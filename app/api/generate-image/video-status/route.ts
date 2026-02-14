import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const { videoId } = await req.json() // ID de ta DB Supabase
    const supabase = await createClient()

    // 1. Récupérer l'ID D-ID stocké en base
    const { data: video } = await supabase
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .single()

    if (!video) return NextResponse.json({ error: 'Vidéo introuvable' }, { status: 404 })

    // Si déjà fini, on renvoie le résultat direct
    if (video.status === 'completed' || video.status === 'failed') {
      return NextResponse.json(video)
    }

    // 2. Appeler D-ID pour vérifier le statut
    const response = await fetch(`https://api.d-id.com/talks/${video.d_id_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${process.env.DID_API_KEY}`,
        'Content-Type': 'application/json',
      },
    })

    const didStatus = await response.json()

    // 3. Mettre à jour Supabase si le statut a changé
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
       const { data: updated } = await supabase
        .from('videos')
        .update({ status: 'failed' })
        .eq('id', videoId)
        .select()
        .single()
      return NextResponse.json(updated)
    }

    // Sinon, c'est encore en cours
    return NextResponse.json(video)

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}