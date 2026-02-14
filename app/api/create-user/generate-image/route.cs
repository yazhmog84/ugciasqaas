import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { prompt, userId } = await req.json()

    // Check crédits (Images coûtent moins cher, disons 2 crédits)
    const { data: user } = await supabaseAdmin.from('users').select('credits').eq('id', userId).single()
    if (user.credits < 2) return NextResponse.json({ error: 'Crédits insuffisants' }, { status: 403 })

    // Génération DALL-E 3
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Professional advertising photo, high quality, commercial lighting: ${prompt}`,
      n: 1,
      size: "1024x1024",
    });

    const imageUrl = response.data[0].url

    // Sauvegarde en DB (Créer une table 'images' si tu veux, ou utiliser 'videos' avec un type)
    // Ici je simplifie en ne déduisant que les crédits et renvoyant l'URL
    await supabaseAdmin.from('users').update({ credits: user.credits - 2 }).eq('id', userId)

    return NextResponse.json({ imageUrl })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}