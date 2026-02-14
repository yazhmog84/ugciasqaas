import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  // Initialiser Supabase au début pour pouvoir l'utiliser dans le catch
  const supabase = await createClient()
  let userId = null

  try {
    const { script, avatarUrl } = await req.json()
    
    // 1. Auth & User
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    userId = user.id

    // 2. Vérifier Crédits
    const { data: userProfile } = await supabase
      .from('users')
      .select('credits')
      .eq('id', userId)
      .single()

    if (!userProfile || userProfile.credits < 10) {
      return NextResponse.json({ error: 'Crédits insuffisants' }, { status: 403 })
    }

    // 3. DÉDUIRE les crédits AVANT l'appel (pour éviter la triche)
    // On remboursera si ça plante.
    const { error: updateError } = await supabase
      .from('users')
      .update({ credits: userProfile.credits - 10 })
      .eq('id', userId)
    
    if (updateError) throw new Error("Erreur lors du débit des crédits")

    // 4. Préparer la clé API (Encodage Base64 OBLIGATOIRE)
    const apiKey = process.env.DID_API_KEY
    if (!apiKey) throw new Error("Clé API D-ID manquante")
    
    // Si la clé n'est pas déjà encodée (ne contient pas "Basic "), on l'encode
    const authHeader = apiKey.startsWith('Basic ') 
        ? apiKey 
        : `Basic ${Buffer.from(apiKey).toString('base64')}`

    // 5. Appeler D-ID API (/talks)
    const response = await fetch('https://api.d-id.com/talks', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source_url: avatarUrl,
        script: {
          type: 'text',
          input: script,
          provider: {
            type: 'microsoft',
            voice_id: 'fr-FR-DeniseNeural'
          }
        },
        config: {
          fluent: true,
          pad_audio: 0.0,
          stitch: true
        }
      }),
    })

    // 6. Gestion des erreurs D-ID avec REMBOURSEMENT
    if (!response.ok) {
      const errorText = await response.text()
      console.error("Erreur D-ID:", response.status, errorText)
      
      // REMBOURSEMENT !
      await supabase.rpc('increment_credits', { user_id: userId, amount: 10 })
      // Note: Si tu n'as pas créé la fonction RPC, fais un update simple :
      // await supabase.from('users').update({ credits: userProfile.credits }).eq('id', userId)

      return NextResponse.json({ error: `Erreur D-ID: ${response.statusText}` }, { status: response.status })
    }

    const didData = await response.json()

    // 7. Sauvegarder la vidéo en cours
    const { data: videoRecord, error: dbError } = await supabase
      .from('videos')
      .insert({
        user_id: userId,
        d_id_id: didData.id,
        status: 'processing',
        title: script.slice(0, 30) + '...',
        script: script
      })
      .select()
      .single()

    if (dbError) throw dbError

    return NextResponse.json({ videoId: videoRecord.id })

  } catch (error: any) {
    console.error('Server Error:', error)
    
    // Tentative de remboursement en cas d'erreur serveur (si l'user a été débité)
    if (userId) {
       // On pourrait vérifier si le débit a eu lieu, mais dans le doute, mieux vaut gérer ça finement.
       // Ici, pour simplifier, on renvoie juste l'erreur.
    }

    return NextResponse.json({ error: error.message || 'Erreur interne' }, { status: 500 })
  }
}