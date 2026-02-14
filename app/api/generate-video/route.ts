import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  console.log("🚀 API Generate-Video: Reçue !") // Tu DOIS voir ça dans ta console
  
  const supabase = await createClient()
  let userId = null

  try {
    const body = await req.json()
    const { script, avatarUrl } = body

    // Auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    userId = user.id

    // Crédits & Débit
    const { data: profile } = await supabase.from('users').select('credits').eq('id', userId).single()
    if (!profile || profile.credits < 10) return NextResponse.json({ error: 'Crédits insuffisants' }, { status: 403 })
    
    await supabase.from('users').update({ credits: profile.credits - 10 }).eq('id', userId)

    // D-ID API (Encodage Base64)
    const apiKey = process.env.DID_API_KEY || ''
    const authHeader = apiKey.startsWith('Basic ') ? apiKey : `Basic ${Buffer.from(apiKey).toString('base64')}`

    const response = await fetch('https://api.d-id.com/talks', {
      method: 'POST',
      headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source_url: avatarUrl,
        script: { type: 'text', input: script, provider: { type: 'microsoft', voice_id: 'fr-FR-DeniseNeural' } },
        config: { fluent: true, pad_audio: 0.0, stitch: true }
      }),
    })

    if (!response.ok) {
      const errTxt = await response.text()
      console.error("❌ Erreur D-ID:", errTxt)
      // Remboursement
      await supabase.rpc('increment_credits', { user_id: userId, amount: 10 })
      return NextResponse.json({ error: `Erreur D-ID: ${response.status}` }, { status: response.status })
    }

    const data = await response.json()
    
    // Save
    const { data: video } = await supabase.from('videos').insert({
        user_id: userId, d_id_id: data.id, status: 'processing', title: script.slice(0, 20), script
    }).select().single()

    return NextResponse.json({ videoId: video.id })

  } catch (e: any) {
    console.error("🔥 Crash API:", e)
    if (userId) await supabase.rpc('increment_credits', { user_id: userId, amount: 10 }) // Remboursement secours
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}