'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client' // ✅ Correction 1 : On importe la fonction
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Video, Sparkles, MessageSquare, Loader2 } from 'lucide-react'

// Mêmes images que le backend pour la cohérence
const AVATARS = [
  { id: 'emma', name: 'Emma', img: 'https://img.freepik.com/free-photo/portrait-young-businesswoman-holding-eyeglasses-hand-against-gray-background_23-2148029483.jpg' },
  { id: 'marcus', name: 'Marcus', img: 'https://img.freepik.com/free-photo/handsome-confident-smiling-man-with-hands-crossed-chest_176420-18743.jpg' },
  { id: 'sophie', name: 'Sophie', img: 'https://img.freepik.com/free-photo/portrait-beautiful-young-woman-standing-grey-wall_231208-10760.jpg' },
]

export default function CreateVideoPage() {
  const [script, setScript] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0].id)
  const [credits, setCredits] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  
  // ✅ Correction 2 : On initialise le client ici
  const supabase = createClient()

  useEffect(() => {
    checkCredits()
  }, [])

  async function checkCredits() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    
    // On récupère les crédits depuis la table 'users'
    const { data } = await supabase.from('users').select('credits').eq('id', user.id).single()
    if (data) setCredits(data.credits)
  }

  async function handleGenerate() {
    if (!script) return
    if (credits !== null && credits < 10) { setError('Crédits insuffisants'); return }
    
    setLoading(true)
    setError('')

    try {
        // On récupère la session pour le token
        const { data: { session } } = await supabase.auth.getSession()
        
        // ✅ Correction 3 : La bonne URL de l'API (celle qu'on a créée ensemble)
        const res = await fetch('/api/generate-video', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // On passe le token pour sécuriser (optionnel si géré par cookies, mais recommandé)
                'Authorization': `Bearer ${session?.access_token}`
            },
            body: JSON.stringify({ 
                script, 
                avatarId: selectedAvatar,
                userId: session?.user?.id // On passe l'ID user explicitement
            })
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Erreur API')

        router.push(`/video/${data.videoId}`)

    } catch (e: any) {
        setError(e.message)
    } finally {
        setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
       <div className="max-w-6xl mx-auto">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-400 mb-8 hover:text-white transition">
            <ArrowLeft size={18}/> Retour au dashboard
          </Link>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
             {/* Zone Script */}
             <div className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <MessageSquare className="text-blue-400"/> Script
                </h2>
                <div className="relative">
                    <textarea 
                        className="w-full h-64 bg-slate-900 border border-white/10 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none text-lg leading-relaxed"
                        placeholder="Entrez votre texte ici... (Ex: Salut tout le monde, aujourd'hui je vous présente...)"
                        value={script}
                        onChange={e => setScript(e.target.value)}
                    />
                    <div className="absolute bottom-4 right-4 text-xs text-slate-500">
                        {script.length} caractères
                    </div>
                </div>
             </div>

             {/* Zone Avatar */}
             <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Sparkles className="text-purple-400"/> Avatar
                    </h2>
                    <div className="bg-white/5 px-3 py-1 rounded-full text-sm">
                        Crédits dispo : <span className={credits && credits < 10 ? "text-red-400" : "text-green-400 font-bold"}>{credits ?? '...'}</span>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    {AVATARS.map(av => (
                        <button 
                            key={av.id}
                            onClick={() => setSelectedAvatar(av.id)}
                            className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${selectedAvatar === av.id ? 'border-purple-500 scale-105 shadow-xl shadow-purple-900/20' : 'border-transparent opacity-60 hover:opacity-100 grayscale hover:grayscale-0'}`}
                        >
                            <img src={av.img} alt={av.name} className="w-full h-full object-cover" />
                            <div className="absolute bottom-0 inset-x-0 bg-black/60 p-1 text-center text-xs font-medium">
                                {av.name}
                            </div>
                        </button>
                    ))}
                </div>
                
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 mt-4">
                    <div className="flex justify-between text-sm mb-2 text-slate-300">
                        <span>Coût de la vidéo</span>
                        <span className="text-white font-bold">10 crédits</span>
                    </div>
                    <button 
                        onClick={handleGenerate}
                        disabled={loading || !script || (credits !== null && credits < 10)}
                        className="w-full py-4 mt-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-900/20"
                    >
                        {loading ? <Loader2 className="animate-spin"/> : <Video size={20}/>}
                        {loading ? 'Génération en cours...' : 'Générer la vidéo'}
                    </button>
                    {error && (
                        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}
                </div>
             </div>
          </div>
       </div>
    </div>
  )
}