import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { openai } from '@/lib/openai'
import { replicate } from '@/lib/replicate'

// Configuration des avatars (URLs publiques nécessaires pour Replicate)
// Remplace par tes vraies URLs hébergées
const AVATARS: Record<string, string> = {
  emma: "https://yazhmog84.github.io/assets/avatars/emma.jpg", // Exemple
  marcus: "https://yazhmog84.github.io/assets/avatars/marcus.jpg",
  sophie: "https://yazhmog84.github.io/assets/avatars/sophie.jpg",
}

export async function POST(req: Request) {
  try {
    const { script, avatarId } = await req.json()
    
    // --- ÉTAPE 3.1 : AUTHENTIFICATION ---
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    console.log(`[API] Demande de génération pour User: ${user.id}`)

    // --- ÉTAPE 3.2 : VÉRIFICATION CRÉDITS ---
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('credits')
      .eq('id', user.id)
      .single()

    if (!userData || userData.credits < 10) {
      return NextResponse.json({ error: 'Crédits insuffisants (10 requis)' }, { status: 402 })
    }

    // --- ÉTAPE 3.3 : DÉDUCTION CRÉDITS ---
    const { error: creditError } = await supabaseAdmin
      .from('users')
      .update({ credits: userData.credits - 10 })
      .eq('id', user.id)

    if (creditError) throw new Error("Erreur lors de la déduction des crédits")

    // --- ÉTAPE 3.4 : CRÉATION ENTRÉE VIDÉO ---
    const { data: video, error: insertError } = await supabaseAdmin
      .from('videos')
      .insert({
        user_id: user.id,
        script: script,
        avatar_id: avatarId,
        status: 'processing'
      })
      .select()
      .single()

    if (insertError) throw insertError

    // --- ÉTAPE 3.6 : BACKGROUND PROCESS ---
    // On lance la tâche sans 'await' pour ne pas bloquer la réponse
    // Note: Sur Vercel Pro/Hobby, cela peut être coupé. L'idéal est Inngest/Trigger.dev.
    generateVideoInBackground(video.id, script, avatarId, user.id).catch(err => 
      console.error("Background Error Uncaught:", err)
    )

    // --- ÉTAPE 3.5 : RÉPONSE IMMÉDIATE ---
    return NextResponse.json({ 
      success: true, 
      videoId: video.id,
      message: "Génération lancée en arrière-plan"
    })

  } catch (error: any) {
    console.error("[API Error]", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// --- FONCTION DE GÉNÉRATION (LA MAGIE) ---
async function generateVideoInBackground(videoId: string, script: string, avatarId: string, userId: string) {
  console.log(`[BG] Début génération pour Video ${videoId}`)
  
  try {
    // 1. GÉNÉRATION AUDIO (OpenAI TTS)
    console.log(`[BG] Génération audio OpenAI...`)
    const mp3 = await openai.audio.speech.create({
      model: "tts-1-hd",
      voice: "nova",
      input: script,
    })
    
    const audioBuffer = Buffer.from(await mp3.arrayBuffer())
    const audioFileName = `${videoId}_audio.mp3`

    // Upload Audio Supabase
    const { error: uploadAudioError } = await supabaseAdmin.storage
      .from('videos')
      .upload(audioFileName, audioBuffer, { contentType: 'audio/mpeg', upsert: true })

    if (uploadAudioError) throw new Error(`Upload Audio Failed: ${uploadAudioError.message}`)

    const { data: audioUrlData } = supabaseAdmin.storage
      .from('videos')
      .getPublicUrl(audioFileName)
    
    const audioUrl = audioUrlData.publicUrl
    console.log(`[BG] Audio prêt: ${audioUrl}`)

    // 2. GÉNÉRATION VIDÉO (Replicate SadTalker)
    console.log(`[BG] Lancement Replicate SadTalker...`)
    
    // URL de l'image de l'avatar (fallback sur un placeholder si pas trouvé)
    const avatarUrl = AVATARS[avatarId] || "https://i.pravatar.cc/500?img=1"

    const output = await replicate.run(
      "cjwbw/sadtalker:3aa3dac9353cc4d6bd62a35e0f26f701e5dded584752733982c1052e4b98e742",
      {
        input: {
          source_image: avatarUrl,
          driven_audio: audioUrl,
          enhancer: "gfpgan",
          preprocess: "full",
          still: false
        }
      }
    )

    // Replicate renvoie parfois une string, parfois un tableau selon les versions
    const rawVideoUrl = Array.isArray(output) ? output[0] : output
    console.log(`[BG] Replicate terminé: ${rawVideoUrl}`)

    if (!rawVideoUrl) throw new Error("Replicate n'a pas renvoyé d'URL")

    // 3. TÉLÉCHARGEMENT & UPLOAD FINAL
    console.log(`[BG] Sauvegarde de la vidéo finale...`)
    const videoRes = await fetch(rawVideoUrl as string)
    const videoBuffer = Buffer.from(await videoRes.arrayBuffer())
    const videoFileName = `${videoId}_final.mp4`

    const { error: uploadVideoError } = await supabaseAdmin.storage
      .from('videos')
      .upload(videoFileName, videoBuffer, { contentType: 'video/mp4', upsert: true })

    if (uploadVideoError) throw new Error(`Upload Video Failed: ${uploadVideoError.message}`)

    const { data: finalUrlData } = supabaseAdmin.storage
      .from('videos')
      .getPublicUrl(videoFileName)

    // 4. MISE À JOUR DB (SUCCESS)
    await supabaseAdmin
      .from('videos')
      .update({
        status: 'completed',
        video_url: finalUrlData.publicUrl,
        audio_url: audioUrl,
        completed_at: new Date().toISOString()
      })
      .eq('id', videoId)
    
    console.log(`[BG] SUCCÈS TOTAL Video ${videoId}`)

  } catch (error: any) {
    console.error(`[BG ERROR] Echec Video ${videoId}:`, error)

    // GESTION ERREUR : Statut Failed + Remboursement
    await supabaseAdmin
      .from('videos')
      .update({ status: 'failed' })
      .eq('id', videoId)

    // On récupère les crédits actuels pour rembourser proprement
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('credits')
      .eq('id', userId)
      .single()
      
    if (user) {
      await supabaseAdmin
        .from('users')
        .update({ credits: user.credits + 10 })
        .eq('id', userId)
      console.log(`[BG] Utilisateur ${userId} remboursé (10 crédits)`)
    }
  }
}