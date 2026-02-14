import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import Replicate from 'replicate'

// Config
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN })

// Supabase Admin (nécessaire pour écrire dans la DB sans session utilisateur côté serveur parfois)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { script, avatarId, userId, avatarUrl } = await req.json()

    // 1. Check Crédits
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('credits')
      .eq('id', userId)
      .single()

    if (!user || user.credits < 10) {
      return NextResponse.json({ error: 'Crédits insuffisants' }, { status: 403 })
    }

    // 2. Déduire crédits
    await supabaseAdmin
      .from('users')
      .update({ credits: user.credits - 10 })
      .eq('id', userId)

    // 3. Créer entrée DB "processing"
    const { data: video, error: insertError } = await supabaseAdmin
      .from('videos')
      .insert({
        user_id: userId,
        script: script,
        status: 'processing',
        avatar_id: avatarId // Assure-toi que la colonne s'appelle bien avatar_id dans Supabase
      })
      .select()
      .single()

    // CORRECTION ICI : On vérifie que la vidéo a bien été créée
    if (insertError || !video) {
      throw new Error("Erreur lors de l'initialisation de la vidéo en base de données.")
    }

    // --- EXECUTION EN ARRIÈRE PLAN ---
    (async () => {
      try {
        // A. Générer Audio (OpenAI)
        const mp3 = await openai.audio.speech.create({
          model: "tts-1-hd",
          voice: "nova",
          input: script,
        })
        const buffer = Buffer.from(await mp3.arrayBuffer())
        
        // B. Upload Audio vers Supabase Storage
        const fileName = `${video.id}.mp3` // Ici video.id est maintenant sûr grâce au if(!video) plus haut
        
        const { error: uploadError } = await supabaseAdmin.storage
            .from('audio') // Assure-toi d'avoir créé ce bucket "audio" en public dans Supabase
            .upload(fileName, buffer, {
                contentType: 'audio/mpeg',
                upsert: true
            })

        if (uploadError) throw uploadError

        const { data: { publicUrl: audioUrl } } = supabaseAdmin.storage
            .from('audio')
            .getPublicUrl(fileName)

        // C. Lancer Replicate (SadTalker)
        const output = await replicate.run(
          "cjwbw/sadtalker:a519cc0cf9ca289139366e6396e625a4d621f8a7e04273574944d15655c654d3",
          {
            input: {
              source_image: avatarUrl || "https://i.pravatar.cc/150?img=1",
              driven_audio: audioUrl,
              enhancer: "gfpgan",
            }
          }
        )

        // D. Update DB avec la vidéo finale
        // Replicate renvoie parfois une string directement, parfois un tableau
        const videoResultUrl = Array.isArray(output) ? output[0] : output;
        
        await supabaseAdmin
          .from('videos')
          .update({
            status: 'completed',
            video_url: videoResultUrl
          })
          .eq('id', video.id)

      } catch (err) {
        console.error("Erreur Background:", err)
        // En cas d'échec, on marque la vidéo comme 'failed' pour rembourser ou prévenir l'user
        await supabaseAdmin
          .from('videos')
          .update({ status: 'failed' })
          .eq('id', video.id)
      }
    })()

    // On renvoie l'ID immédiatement au front pour qu'il puisse poller le statut
    return NextResponse.json({ videoId: video.id })

  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}