'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase' // Assure-toi d'utiliser le bon client
// Ou import { createClient } from '@/lib/supabase/client' si tu as migré
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

  useEffect(() => {
    checkCredits()
  }, [])

  async function checkCredits() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    
    const { data } = await supabase.from('users').select('credits').eq('id', user.id).single()
    if (data) setCredits(data.credits)
  }

  async function handleGenerate() {
    if (!script) return
    if (credits && credits < 10) { setError('Crédits insuffisants'); return }
    
    setLoading(true)
    setError('')

    try {
        const { data: { session } } = await supabase.auth.getSession()
        
        const res = await fetch('/api/create-user/generate-video', { // Vérifie bien le chemin de ton API
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.access_token}`
            },
            body: JSON.stringify({ script, avatarId: selectedAvatar })
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.error)

        router.push(`/video/${data.videoId}`)

    } catch (e: any) {
        setError(e.message)
    } finally {
        setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
       {/* ... Ton UI existante ... */}
       {/* Utilise la variable AVATARS ci-dessus pour afficher la grille */}
       <div className="max-w-6xl mx-auto">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-400 mb-8"><ArrowLeft size={18}/> Retour</Link>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
             {/* Zone Script */}
             <div className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2"><MessageSquare className="text-blue-400"/> Script</h2>
                <textarea 
                    className="w-full h-64 bg-slate-900 border border-white/10 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Entrez votre texte ici..."
                    value={script}
                    onChange={e => setScript(e.target.value)}
                />
             </div>

             {/* Zone Avatar */}
             <div className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2"><Sparkles className="text-purple-400"/> Avatar</h2>
                <div className="grid grid-cols-3 gap-4">
                    {AVATARS.map(av => (
                        <button 
                            key={av.id}
                            onClick={() => setSelectedAvatar(av.id)}
                            className={`relative aspect-square rounded-xl overflow-hidden border-2 transition ${selectedAvatar === av.id ? 'border-purple-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
                        >
                            <img src={av.img} className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
                
                <button 
                    onClick={handleGenerate}
                    disabled={loading || !script}
                    className="w-full py-4 mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin"/> : <Video/>}
                    {loading ? 'Génération D-ID...' : 'Générer la vidéo (10 crédits)'}
                </button>
                {error && <p className="text-red-400 text-center mt-2">{error}</p>}
             </div>
          </div>
       </div>
    </div>
  )
}