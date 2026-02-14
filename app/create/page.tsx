'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Video, Sparkles, MessageSquare, Loader2, AlertCircle } from 'lucide-react'

// Avatars statiques pour la sélection
const AVATARS = [
  { 
    id: 'emma', 
    name: 'Emma', 
    img: 'https://img.freepik.com/free-photo/portrait-young-businesswoman-holding-eyeglasses-hand-against-gray-background_23-2148029483.jpg' 
  },
  { 
    id: 'marcus', 
    name: 'Marcus', 
    img: 'https://img.freepik.com/free-photo/handsome-confident-smiling-man-with-hands-crossed-chest_176420-18743.jpg' 
  },
  { 
    id: 'sophie', 
    name: 'Sophie', 
    img: 'https://img.freepik.com/free-photo/portrait-beautiful-young-woman-standing-grey-wall_231208-10760.jpg' 
  },
]

export default function CreateVideoPage() {
  const [script, setScript] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0].id)
  const [credits, setCredits] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  
  const supabase = createClient()

  // Fonction pour charger les crédits
  const fetchCredits = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { 
        router.push('/login')
        return 
    }
    
    const { data, error } = await supabase
        .from('users')
        .select('credits')
        .eq('id', user.id)
        .maybeSingle()
    
    if (data) {
        setCredits(data.credits)
    } else {
        // Si pas de profil user, on met 0 par sécurité
        setCredits(0) 
    }
  }, [supabase, router])

  useEffect(() => {
    fetchCredits()

    // Optionnel : Souscription temps réel aux changements de crédits
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
        },
        (payload) => {
            // Si c'est mon user, je mets à jour
            setCredits((current) => (payload.new as any).credits)
        }
      )
      .subscribe()

    return () => {
        supabase.removeChannel(channel)
    }
  }, [fetchCredits, supabase])

  async function handleGenerate() {
    if (!script) return
    if (credits !== null && credits < 10) { 
        setError('Crédits insuffisants. Rechargez votre compte.')
        return 
    }
    
    setLoading(true)
    setError('')

    try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            router.push('/login')
            return
        }
        
        const selectedAvatarObj = AVATARS.find(av => av.id === selectedAvatar)
        if (!selectedAvatarObj) throw new Error("Avatar introuvable")

        // ⚠️ IMPORTANT : Assure-toi que ton fichier API est bien dans app/api/generate-video/route.ts
        const res = await fetch('/api/generate-video', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({ 
                script, 
                avatarUrl: selectedAvatarObj.img 
            })
        })

        // Gestion fine des erreurs API
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            // C'est souvent ici que l'erreur "<!DOCTYPE..." arrive (404 ou 500 HTML)
            throw new Error("L'API n'a pas répondu correctement (Erreur 404 ou 500). Vérifiez que le fichier route.ts est au bon endroit.")
        }

        const data = await res.json()
        
        if (!res.ok) {
            throw new Error(data.error || 'Erreur lors de la génération')
        }

        // Succès ! On redirige
        router.push(`/video/${data.videoId}`)

    } catch (e: any) {
        console.error("Erreur génération:", e)
        setError(e.message || "Une erreur inconnue est survenue")
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
             {/* Colonne Gauche : Script */}
             <div className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <MessageSquare className="text-blue-400"/> Script
                </h2>
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl opacity-30 group-hover:opacity-50 transition duration-1000 blur"></div>
                    <textarea 
                        className="relative w-full h-80 bg-slate-900 border border-white/10 rounded-xl p-5 focus:ring-2 focus:ring-blue-500 outline-none text-lg leading-relaxed shadow-xl resize-none"
                        placeholder="Entrez votre texte ici... L'IA va animer l'avatar pour dire ce texte avec une voix naturelle."
                        value={script}
                        onChange={e => setScript(e.target.value)}
                    />
                    <div className="absolute bottom-4 right-4 text-xs font-medium text-slate-500 bg-slate-900/80 px-2 py-1 rounded">
                        {script.length} caractères
                    </div>
                </div>
             </div>

             {/* Colonne Droite : Avatar & Actions */}
             <div className="space-y-6">
                <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-xl border border-white/5">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Sparkles className="text-purple-400"/> Avatar
                    </h2>
                    <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-sm">Solde :</span>
                        {credits === null ? (
                             <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                        ) : (
                            <span className={`font-bold px-3 py-1 rounded-full text-sm ${credits < 10 ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}`}>
                                {credits} crédits
                            </span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    {AVATARS.map(av => (
                        <button 
                            key={av.id}
                            onClick={() => setSelectedAvatar(av.id)}
                            className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 ${selectedAvatar === av.id ? 'border-purple-500 scale-105 shadow-[0_0_20px_rgba(168,85,247,0.3)]' : 'border-slate-800 opacity-70 hover:opacity-100 grayscale hover:grayscale-0'}`}
                        >
                            <img src={av.img} alt={av.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-3 pt-8">
                                <p className="text-white text-xs font-bold text-center">{av.name}</p>
                            </div>
                            {selectedAvatar === av.id && (
                                <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full shadow-lg shadow-green-500/50"></div>
                            )}
                        </button>
                    ))}
                </div>
                
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 border border-white/10 mt-4 shadow-xl">
                    <div className="flex justify-between text-sm mb-4">
                        <span className="text-slate-400">Coût estimé</span>
                        <span className="text-white font-bold flex items-center gap-1">
                            10 crédits <span className="text-xs font-normal text-slate-500">(~15s)</span>
                        </span>
                    </div>
                    
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    <button 
                        onClick={handleGenerate}
                        disabled={loading || !script || (credits !== null && credits < 10)}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-bold flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-900/30"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" />
                                <span>Création de la magie...</span>
                            </>
                        ) : (
                            <>
                                <Video size={20} className="fill-white/20" />
                                <span>Générer la vidéo</span>
                            </>
                        )}
                    </button>
                    <p className="text-center text-xs text-slate-500 mt-3">
                        Temps de génération moyen : 1 à 2 minutes.
                    </p>
                </div>
             </div>
          </div>
       </div>
    </div>
  )
}