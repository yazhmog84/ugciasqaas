// app/create/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Video, Sparkles, MessageSquare, Mic, Layers } from 'lucide-react'

// Avatars simulés
const avatars = [
  { id: 'emma', name: 'Emma', image: 'https://i.pravatar.cc/150?img=1' },
  { id: 'marcus', name: 'Marcus', image: 'https://i.pravatar.cc/150?img=12' },
  { id: 'sophie', name: 'Sophie', image: 'https://i.pravatar.cc/150?img=5' },
  { id: 'lucas', name: 'Lucas', image: 'https://i.pravatar.cc/150?img=13' },
  { id: 'maya', name: 'Maya', image: 'https://i.pravatar.cc/150?img=9' },
  { id: 'alex', name: 'Alex', image: 'https://i.pravatar.cc/150?img=15' },
]

export default function CreateVideoPage() {
  const [script, setScript] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState('emma')
  const [credits, setCredits] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    loadUserCredits()
  }, [])

  async function loadUserCredits() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    const { data } = await supabase
      .from('users')
      .select('credits')
      .eq('id', user.id)
      .single()

    if (data) setCredits(data.credits)
  }

 async function handleGenerate() {
    if (!script.trim()) { setError('Le script ne peut pas être vide'); return }
    if (credits < 10) { setError('Pas assez de crédits !'); return }

    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Non connecté")

      // Appel à la nouvelle route API
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          script, 
          avatarId: selectedAvatar,
          userId: user.id, // On passe l'ID pour sécuriser côté serveur
          options: { subtitles: true } 
        })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      
      // Redirection vers la page de visualisation
      router.push(`/video/${data.videoId}`)

    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white transition">
            <ArrowLeft size={18} />
            <span className="font-medium">Retour</span>
          </Link>
          <div className="flex items-center gap-3 bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
            <span className="text-slate-400 text-sm">Crédits dispo :</span>
            <span className="font-bold text-purple-400">{credits}</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Créer une nouvelle vidéo</h1>
          <p className="text-slate-400">Configurez votre avatar et votre script pour générer votre vidéo UGC.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-8 flex items-center gap-3">
             <span className="text-xl">⚠️</span> {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Colonne Gauche : Configuration */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 1. Script */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <MessageSquare size={18} />
                </div>
                <h2 className="text-lg font-bold">Votre Script</h2>
              </div>
              
              <div className="relative">
                <textarea
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  placeholder="Écrivez votre script ici... (Ex: Hey ! Je viens de découvrir cette application incroyable...)"
                  rows={8}
                  className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                />
                <div className="absolute bottom-4 right-4 text-xs text-slate-500">
                  {script.length} caractères
                </div>
              </div>
              <div className="mt-3 flex justify-between items-center text-sm text-slate-400">
                 <p>Minimum 20 caractères</p>
                 <p>~{Math.ceil(script.length / 200)} seconde(s)</p>
              </div>
            </div>

            {/* 2. Options */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                  <Layers size={18} />
                </div>
                <h2 className="text-lg font-bold">Options de rendu</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <label className="flex items-start gap-3 p-4 bg-black/20 rounded-xl border border-white/10 cursor-pointer hover:border-purple-500/50 transition">
                   <input type="checkbox" className="mt-1 w-4 h-4 rounded border-slate-600 text-purple-600 focus:ring-purple-500 bg-slate-800" defaultChecked />
                   <div>
                     <div className="font-medium text-white">Sous-titres IA</div>
                     <div className="text-xs text-slate-500 mt-0.5">Générés automatiquement</div>
                   </div>
                 </label>
                 
                 <label className="flex items-start gap-3 p-4 bg-black/20 rounded-xl border border-white/10 cursor-pointer hover:border-purple-500/50 transition">
                   <input type="checkbox" className="mt-1 w-4 h-4 rounded border-slate-600 text-purple-600 focus:ring-purple-500 bg-slate-800" />
                   <div>
                     <div className="font-medium text-white">Musique de fond</div>
                     <div className="text-xs text-slate-500 mt-0.5">Libre de droits</div>
                   </div>
                 </label>
              </div>
            </div>
          </div>

          {/* Colonne Droite : Avatar & Action */}
          <div className="space-y-8">
            
            {/* Avatar Selection */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-400">
                  <Sparkles size={18} />
                </div>
                <h2 className="text-lg font-bold">Choisir un avatar</h2>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {avatars.map(avatar => (
                  <button
                    key={avatar.id}
                    onClick={() => setSelectedAvatar(avatar.id)}
                    className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all ${
                      selectedAvatar === avatar.id 
                        ? 'border-purple-500 ring-2 ring-purple-500/20 scale-105 z-10' 
                        : 'border-transparent hover:border-white/20 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={avatar.image} alt={avatar.name} className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 p-1 text-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider">{avatar.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Resume & Action */}
            <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 rounded-2xl p-6 sticky top-24">
              <h3 className="text-lg font-bold mb-4">Récapitulatif</h3>
              <ul className="space-y-3 mb-6 text-sm text-slate-300">
                <li className="flex justify-between">
                  <span>Coût vidéo</span>
                  <span className="text-white font-bold">10 crédits</span>
                </li>
                <li className="flex justify-between">
                  <span>Temps estimé</span>
                  <span className="text-white font-bold">~2 mins</span>
                </li>
                <li className="border-t border-white/10 pt-3 flex justify-between">
                  <span>Crédits restants</span>
                  <span className={`${credits < 10 ? 'text-red-400' : 'text-green-400'} font-bold`}>
                    {credits - 10}
                  </span>
                </li>
              </ul>

              <button
                onClick={handleGenerate}
                disabled={loading || !script || credits < 10}
                className="w-full py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-200 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-white/5 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                    Génération...
                  </>
                ) : (
                  <>
                    <Video size={18} />
                    Générer la vidéo
                  </>
                )}
              </button>
              
              {credits < 10 && (
                <Link href="/pricing" className="block text-center text-xs text-red-400 mt-3 hover:underline">
                  Crédits insuffisants. Recharger →
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}