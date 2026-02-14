'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { Download, AlertCircle, Loader2, ArrowLeft } from 'lucide-react'

export default function VideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [video, setVideo] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let interval: NodeJS.Timeout

    const checkStatus = async () => {
      try {
        // On appelle NOTRE API pour vérifier le statut chez D-ID
        const res = await fetch('/api/video-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoId: id })
        })

        if (!res.ok) throw new Error('Erreur de vérification')
        
        const data = await res.json()
        setVideo(data)

        // Stop polling si fini
        if (data.status === 'completed' || data.status === 'failed') {
          clearInterval(interval)
        }
      } catch (err) {
        console.error(err)
        // On continue d'essayer même si une requête échoue
      }
    }

    // Premier appel
    checkStatus()
    // Polling toutes les 5s
    interval = setInterval(checkStatus, 5000)

    return () => clearInterval(interval)
  }, [id])

  if (error) return <div className="p-10 text-red-500 bg-slate-950 min-h-screen">{error}</div>
  if (!video) return <div className="flex h-screen items-center justify-center bg-slate-950 text-white"><Loader2 className="animate-spin" /></div>

  // ... (Le reste de ton JSX est parfait, garde le Return que tu avais) ...
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <header className="p-6 border-b border-white/5">
        <Link href="/dashboard" className="text-slate-400 hover:text-white transition flex items-center gap-2">
          <ArrowLeft size={20} /> Retour Dashboard
        </Link>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="max-w-4xl w-full text-center">
            {video.status === 'completed' ? (
                <div className="bg-slate-900 p-4 rounded-xl border border-white/10">
                    <video src={video.video_url} controls className="w-full rounded-lg shadow-2xl" />
                    <a href={video.video_url} target="_blank" className="mt-4 inline-block bg-purple-600 px-6 py-2 rounded-lg font-bold">
                        Télécharger
                    </a>
                </div>
            ) : (
                <div className="py-20">
                    <Loader2 className="w-16 h-16 text-purple-500 animate-spin mx-auto mb-4"/>
                    <h2 className="text-2xl font-bold">Création en cours...</h2>
                    <p className="text-slate-400">Statut: {video.status}</p>
                </div>
            )}
        </div>
      </main>
    </div>
  )
}