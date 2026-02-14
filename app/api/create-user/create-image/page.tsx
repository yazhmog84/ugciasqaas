'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Image as ImageIcon, Sparkles, Download } from 'lucide-react'

export default function CreateImagePage() {
  const [prompt, setPrompt] = useState('')
  const [credits, setCredits] = useState(0)
  const [loading, setLoading] = useState(false)
  const [resultUrl, setResultUrl] = useState('')
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
        if(data.user) {
            supabase.from('users').select('credits').eq('id', data.user.id).single()
            .then(({ data: d }) => setCredits(d?.credits || 0))
        } else {
            router.push('/login')
        }
    })
  }, [])

  async function handleGenerate() {
    if (!prompt) return
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    try {
        const res = await fetch('/api/generate-image', {
            method: 'POST',
            body: JSON.stringify({ prompt, userId: user?.id })
        })
        const data = await res.json()
        if (data.imageUrl) setResultUrl(data.imageUrl)
    } catch (e) {
        console.error(e)
    } finally {
        setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <Link href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white mb-8">
        <ArrowLeft size={18} /> Retour Dashboard
      </Link>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        
        {/* Input */}
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                    <ImageIcon className="text-pink-500" /> Générateur Ads
                </h1>
                <p className="text-slate-400">Créez des visuels publicitaires uniques avec DALL-E 3.</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">Description de votre image</label>
                <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white h-40 focus:border-pink-500 outline-none"
                    placeholder="Une bouteille de parfum posée sur un rocher au bord de la mer au coucher du soleil, style cinématique, 8k..."
                />
                <div className="mt-4 flex justify-between items-center">
                    <span className="text-sm text-slate-500">Coût: 2 crédits</span>
                    <button 
                        onClick={handleGenerate}
                        disabled={loading || !prompt}
                        className="bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-pink-500/20 disabled:opacity-50 transition flex items-center gap-2"
                    >
                        {loading ? 'Création...' : <><Sparkles size={18} /> Générer</>}
                    </button>
                </div>
            </div>
        </div>

        {/* Preview */}
        <div className="bg-black/20 border border-white/10 rounded-2xl flex items-center justify-center min-h-[400px] relative overflow-hidden">
            {loading ? (
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-400 animate-pulse">L'IA dessine votre pub...</p>
                </div>
            ) : resultUrl ? (
                <div className="relative w-full h-full group">
                    <img src={resultUrl} className="w-full h-full object-contain" alt="Generated Ad" />
                    <a href={resultUrl} download target="_blank" className="absolute bottom-4 right-4 bg-white text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg opacity-0 group-hover:opacity-100 transition">
                        <Download size={18} /> Télécharger
                    </a>
                </div>
            ) : (
                <p className="text-slate-600">Le résultat apparaîtra ici</p>
            )}
        </div>

      </div>
    </div>
  )
}