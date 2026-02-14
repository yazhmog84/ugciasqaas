'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Image as ImageIcon, Sparkles, Download, Loader2 } from 'lucide-react'

export default function CreateImagePage() {
  const [prompt, setPrompt] = useState('')
  const [credits, setCredits] = useState(0)
  const [loading, setLoading] = useState(false)
  const [resultUrl, setResultUrl] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
             router.push('/login')
             return
        }
        const { data } = await supabase.from('users').select('credits').eq('id', user.id).single()
        if (data) setCredits(data.credits)
    }
    loadData()
  }, [])

  async function handleGenerate() {
    if (!prompt) return
    if (credits < 2) {
        setError('Crédits insuffisants (2 requis)')
        return
    }

    setLoading(true)
    setError('')
    
    try {
        const { data: { session } } = await supabase.auth.getSession()
        
        const res = await fetch('/api/generate-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.access_token}`
            },
            body: JSON.stringify({ prompt })
        })
        
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Erreur génération')
        
        setResultUrl(data.imageUrl)
        // Mettre à jour les crédits affichés localement
        setCredits(prev => prev - 2)
        
    } catch (e: any) {
        console.error(e)
        setError(e.message)
    } finally {
        setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition">
            <ArrowLeft size={18} /> Retour Dashboard
        </Link>

        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-3">
                <ImageIcon className="text-pink-500" /> Générateur Publicitaire
            </h1>
            <div className="bg-white/10 px-4 py-2 rounded-full border border-white/10">
                <span className="text-slate-400">Crédits:</span> 
                <span className="font-bold ml-2 text-purple-400">{credits}</span>
            </div>
        </div>

        {error && (
            <div className="bg-red-500/20 text-red-200 p-4 rounded-xl mb-6 border border-red-500/50">
                ⚠️ {error}
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Zone de commande */}
            <div className="space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <label className="block text-sm font-medium text-slate-300 mb-3">Description de votre image (Prompt)</label>
                    <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white h-40 focus:border-pink-500 outline-none resize-none transition"
                        placeholder="Ex: Une bouteille de parfum luxueuse posée sur un rocher noir, éclairage cinématique, coucher de soleil, 8k..."
                    />
                    <div className="mt-4 flex justify-between items-center">
                        <span className="text-sm text-slate-500">Coût: <span className="text-white font-bold">2 crédits</span></span>
                        <button 
                            onClick={handleGenerate}
                            disabled={loading || !prompt || credits < 2}
                            className="bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-pink-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                            {loading ? 'Création...' : 'Générer'}
                        </button>
                    </div>
                </div>
                
                <div className="bg-blue-900/20 border border-blue-500/20 p-4 rounded-xl text-sm text-blue-200">
                    💡 <strong>Astuce :</strong> Soyez précis sur la lumière, le style (photoréaliste, 3D) et les couleurs pour un meilleur résultat.
                </div>
            </div>

            {/* Zone de résultat */}
            <div className="bg-black/40 border border-white/10 rounded-2xl flex items-center justify-center min-h-[400px] relative overflow-hidden group">
                {loading ? (
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-slate-400 animate-pulse">L'IA dessine votre image...</p>
                    </div>
                ) : resultUrl ? (
                    <>
                        <img src={resultUrl} className="w-full h-full object-contain" alt="Generated Ad" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                             <a href={resultUrl} download target="_blank" className="bg-white text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition">
                                <Download size={20} /> Télécharger HD
                            </a>
                        </div>
                    </>
                ) : (
                    <div className="text-center text-slate-600">
                        <ImageIcon size={48} className="mx-auto mb-3 opacity-20" />
                        <p>Le résultat apparaîtra ici</p>
                    </div>
                )}
            </div>

        </div>
      </div>
    </div>
  )
}