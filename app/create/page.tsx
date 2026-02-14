'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Video, Sparkles, MessageSquare, Loader2 } from 'lucide-react'

// Liste des avatars disponibles
const AVATARS = [
  { id: 'emma', name: 'Emma', type: 'Realistic', img: 'https://i.pravatar.cc/150?img=1' },
  { id: 'marcus', name: 'Marcus', type: 'Business', img: 'https://i.pravatar.cc/150?img=12' },
  { id: 'sophie', name: 'Sophie', type: 'Creative', img: 'https://i.pravatar.cc/150?img=5' },
]

export default function CreateVideoPage() {
  const [script, setScript] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0].id)
  const [credits, setCredits] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // Charger les crédits au montage
  useEffect(() => {
    checkAuthAndCredits()
  }, [])

  async function checkAuthAndCredits() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    const { data } = await supabase.from('users').select('credits').eq('id', user.id).single()
    if (data) setCredits(data.credits)
  }

  async function handleGenerate() {
    if (!script.trim() || script.length < 10) {
      setError('Le script est trop court (min 10 car.)')
      return
    }
    if (credits !== null && credits < 10) {
      setError('Crédits insuffisants. Rechargez votre compte.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error("Session expirée")

      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}` // Token pour Auth Supabase
        },
        body: JSON.stringify({
          script,
          avatarId: selectedAvatar
        })
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Erreur serveur")
      
      // Succès : on redirige immédiatement
      router.push(`/video/${data.videoId}`)

    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header simple */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white">
            <ArrowLeft size={20} /> Retour Dashboard
          </Link>
          <div className="bg-white/10 px-4 py-2 rounded-full border border-white/10">
            <span className="text-slate-400">Crédits:</span> 
            <span className="font-bold ml-2 text-purple-400">{credits !== null ? credits : '...'}</span>
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-8">Studio de Création IA</h1>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-xl mb-6">
            🚨 {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* GAUCHE : SCRIPT */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl">
              <label className="flex items-center gap-2 text-lg font-bold mb-4">
                <MessageSquare className="text-blue-400" /> Script
              </label>
              <textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                placeholder="Bonjour à tous ! Aujourd'hui je vous présente..."
                className="w-full h-64 bg-black/30 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-purple-500 outline-none resize-none"
              />
              <div className="flex justify-between mt-2 text-xs text-slate-500">
                <span>{script.length} caractères</span>
                <span>~{Math.ceil(script.length / 15)} sec de vidéo</span>
              </div>
            </div>
          </div>

          {/* DROITE : AVATAR & ACTION */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl">
              <label className="flex items-center gap-2 text-lg font-bold mb-4">
                <Sparkles className="text-purple-400" /> Choisir un Avatar
              </label>
              
              <div className="grid grid-cols-3 gap-4">
                {AVATARS.map((av) => (
                  <button
                    key={av.id}
                    onClick={() => setSelectedAvatar(av.id)}
                    className={`relative rounded-xl overflow-hidden aspect-square transition border-2 ${
                      selectedAvatar === av.id 
                        ? 'border-purple-500 ring-2 ring-purple-500/20 scale-105' 
                        : 'border-transparent hover:border-white/20 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={av.img} alt={av.name} className="object-cover w-full h-full" />
                    <div className="absolute bottom-0 w-full bg-black/70 text-xs py-1 text-center font-bold">
                      {av.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-6 border border-white/10">
               <div className="flex justify-between items-center mb-4">
                 <span className="text-indigo-200">Coût estimé</span>
                 <span className="font-bold text-xl">10 Crédits</span>
               </div>
               <button
                 onClick={handleGenerate}
                 disabled={loading || credits === null || credits < 10}
                 className="w-full bg-white text-slate-900 py-4 rounded-xl font-bold hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
               >
                 {loading ? <Loader2 className="animate-spin" /> : <Video />}
                 {loading ? 'Lancement...' : 'Générer la vidéo'}
               </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}