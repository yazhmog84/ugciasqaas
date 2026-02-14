import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Client Admin pour modifier les crédits (Bypass RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ⚠️ Assure-toi d'avoir cette clé dans .env.local
)

export async function POST(request: Request) {
  try {
    const { script, userId } = await request.json()

    // 1. Vérifier crédits
    const { data: user } = await supabaseAdmin.from('users').select('credits').eq('id', userId).single()
    
    if (!user || user.credits < 10) {
      return NextResponse.json({ error: 'Crédits insuffisants (Min 10)' }, { status: 402 })
    }

    // 2. Retirer 10 crédits
    await supabaseAdmin.from('users').update({ credits: user.credits - 10 }).eq('id', userId)

    // 3. Créer la vidéo (Simulation)
    const { data: video, error } = await supabaseAdmin
      .from('videos')
      .insert({
        user_id: userId,
        script: script,
        status: 'processing'
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, videoId: video.id })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}