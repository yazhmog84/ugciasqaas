import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Configuration des Avatars (URLs publiques accessibles par D-ID)
const AVATARS: Record<string, string> = {
  emma: "https://img.freepik.com/free-photo/portrait-young-businesswoman-holding-eyeglasses-hand-against-gray-background_23-2148029483.jpg", 
  marcus: "https://img.freepik.com/free-photo/handsome-confident-smiling-man-with-hands-crossed-chest_176420-18743.jpg",
  sophie: "https://img.freepik.com/free-photo/portrait-beautiful-young-woman-standing-grey-wall_231208-10760.jpg",
}

export async function POST(req: Request) {
  try {
    const { script, avatarId } = await req.json()

    // 1. AUTHENTIFICATION
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) return NextResponse.json({ error: 'Token invalide' }, { status: 401 })

    // 2. VERIF CRÉDITS
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('credits')
      .eq('id', user.id)
      .single()

    if (!userData || userData.credits < 10) {
      return NextResponse.json({ error: 'Crédits insuffisants' }, { status: 402 })
    }

    // 3. DÉDUCTION CRÉDITS
    await supabaseAdmin
      .from('users')
      .update({ credits: userData.credits - 10 })
      .eq('id', user.id)

    // 4. INSERTION DB (PROCESSING)
    const { data: video } = await supabaseAdmin
      .from('videos')
      .insert({
        user_id: user.id,
        script: script,
        avatar_id: avatarId,
        status: 'processing'
      })
      .select()
      .single()

    // 5. LANCEMENT PROCESS D-ID (BACKGROUND)
    // On ne met pas "await" ici pour répondre immédiatement au client
    generateVideoWithDID(video.id, script, avatarId, user.id).catch(err => 
        console.error("Background Error:", err)
    )

    return NextResponse.json({ 
        success: true, 
        videoId: video.id,
        message: "Génération D-ID lancée" 
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// --- FONCTION DE GÉNÉRATION D-ID (Back-end process) ---
async function generateVideoWithDID(videoId: string, script: string, avatarId: string, userId: string) {
    const apiKey = process.env.DID_API_KEY
    if (!apiKey) {
        console.error("DID_API_KEY manquante")
        await markAsFailed(videoId, userId)
        return
    }

    try {
        const avatarUrl = AVATARS[avatarId] || AVATARS['emma']

        // A. Création du Talk
        const createTalkResponse = await fetch('https://api.d-id.com/talks', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                source_url: avatarUrl,
                script: {
                    type: "text",
                    input: script,
                    provider: { type: "microsoft", voice_id: "fr-FR-DeniseNeural" }
                },
                config: {
                    fluent: true,
                    pad_audio: "0.0"
                }
            })
        })

        if (createTalkResponse.status !== 201) {
            const err = await createTalkResponse.json()
            throw new Error(`D-ID Error: ${JSON.stringify(err)}`)
        }

        const { id: talkId } = await createTalkResponse.json()
        console.log(`[D-ID] Talk créé ID: ${talkId}`)

        // B. Polling (Attente de la fin)
        let status = "created"
        let resultUrl = ""
        let attempts = 0

        while (status !== "done" && attempts < 30) { // Timeout ~60s
            await new Promise(r => setTimeout(r, 2000))
            
            const statusRes = await fetch(`https://api.d-id.com/talks/${talkId}`, {
                headers: { 'Authorization': `Basic ${apiKey}` }
            })
            const statusData = await statusRes.json()
            
            status = statusData.status
            console.log(`[D-ID] Status: ${status}`)

            if (status === "done") {
                resultUrl = statusData.result_url
            } else if (status === "error") {
                throw new Error("D-ID Generation Failed")
            }
            attempts++
        }

        if (!resultUrl) throw new Error("Timeout D-ID")

        // C. Sauvegarde Finale
        await supabaseAdmin
            .from('videos')
            .update({
                status: 'completed',
                video_url: resultUrl,
                completed_at: new Date().toISOString()
            })
            .eq('id', videoId)

    } catch (error) {
        console.error("Erreur Génération:", error)
        await markAsFailed(videoId, userId)
    }
}

// Helper pour gérer l'échec et le remboursement
async function markAsFailed(videoId: string, userId: string) {
    await supabaseAdmin.from('videos').update({ status: 'failed' }).eq('id', videoId)
    
    // Remboursement
    const { data: u } = await supabaseAdmin.from('users').select('credits').eq('id', userId).single()
    if (u) {
        await supabaseAdmin.from('users').update({ credits: u.credits + 10 }).eq('id', userId)
    }
}