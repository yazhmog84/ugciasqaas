import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

// Configuration OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()
    
    // 1. Authentification sécurisée via Cookie
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Client Admin pour écrire les crédits (contourne RLS)
    // On réutilise tes variables d'environnement existantes
    const supabaseAdmin = await createClient() 
    // NOTE : Pour les droits d'écriture admin sur 'users', idéalement utilise createClient avec la SERVICE_ROLE_KEY
    // Mais si tes policies RLS permettent à l'user d'update ses propres crédits (déconseillé), le client normal suffit.
    // Voici la version sécurisée avec clé Admin :
    const { createClient: createAdmin } = require('@supabase/supabase-js')
    const admin = createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

    // 2. Vérifier les crédits
    const { data: userData } = await admin
      .from('users')
      .select('credits')
      .eq('id', user.id)
      .single()

    if (!userData || userData.credits < 2) {
      return NextResponse.json({ error: 'Crédits insuffisants' }, { status: 403 })
    }

    // 3. Génération DALL-E 3
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Professional high-end advertising photography, commercial aesthetic, 8k resolution: ${prompt}`,
      n: 1,
      size: "1024x1024",
      quality: "hd",
      style: "natural"
    })

    const imageUrl = response.data[0].url

    // 4. Déduire les crédits
    await admin
      .from('users')
      .update({ credits: userData.credits - 2 })
      .eq('id', user.id)

    // Optionnel : Sauvegarder l'image dans une table 'images' pour l'historique
    // await admin.from('images').insert({ user_id: user.id, url: imageUrl, prompt })

    return NextResponse.json({ imageUrl })

  } catch (error: any) {
    console.error('Erreur Image Gen:', error)
    return NextResponse.json({ error: error.message || 'Erreur interne' }, { status: 500 })
  }
}