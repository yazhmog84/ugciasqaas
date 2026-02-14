'use client'

import { useEffect, useState, use } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Download, AlertCircle, Loader2, ArrowLeft } from 'lucide-react'

export default function VideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [video, setVideo] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let interval: NodeJS.Timeout

    const fetchVideo = async () => {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) {
        setError('Vidéo introuvable')
        return
      }

      setVideo(data)

      // Si fini (succès ou échec), on arrête le polling
      if (data.status === 'completed' || data.status === 'failed') {
        clearInterval(interval)
      }
    }

    // Premier appel
    fetchVideo()
    // Polling toutes les 3s
    interval = setInterval(fetchVideo, 3000)

    return () => clearInterval(interval)
  }, [id])

  if (error) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
      <h1 className="text-xl font-bold mb-4">Oups !</h1>
      <p className="text-red-400 mb-6">{error}</p>
      <Link href="/dashboard" className="underline">Retour</Link>
    </div>
  )

  if (!video) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
      <Loader2 className="animate-spin w-10 h-10 text-purple-500" />
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <header className="p-6 border-b border-white/5">
        <Link href="/dashboard" className="text-slate-400 hover:text-white transition flex items-center gap-2">
          <ArrowLeft size={20} /> Retour Dashboard
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          
          {/* Header Status */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Votre Vidéo UGC</h1>
            <div className="inline-block px-3 py-1 rounded-full text-sm font-medium border bg-white/5 border-white/10">
              Statut : <span className={`uppercase ${
                video.status === 'completed' ? 'text-green-400' : 
                video.status === 'failed' ? 'text-red-400' : 'text-yellow-400'
              }`}>{video.status}</span>
            </div>
          </div>

          {/* Content Area */}
          <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
            
            {/* Player Zone */}
            <div className="flex-1 bg-black aspect-video md:aspect-auto min-h-[400px] flex items-center justify-center relative">
              
              {video.status === 'processing' && (
                <div className="text-center p-8">
                  <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">L'IA travaille...</h3>
                  <p className="text-slate-500 text-sm max-w-xs mx-auto">
                    Génération de la voix, animation du visage et rendu en cours. Cela prend environ 2 minutes.
                  </p>
                </div>
              )}

              {video.status === 'failed' && (
                <div className="text-center p-8">
                  <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2 text-red-400">Échec de la génération</h3>
                  <p className="text-slate-500 text-sm mb-6">Une erreur est survenue. Vos crédits ont été remboursés.</p>
                  <Link href="/create" className="bg-white text-black px-6 py-2 rounded-lg font-bold">
                    Réessayer
                  </Link>
                </div>
              )}

              {video.status === 'completed' && (
                <video 
                  src={video.video_url} 
                  controls 
                  autoPlay 
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            {/* Sidebar Info */}
            <div className="w-full md:w-80 bg-slate-900 p-6 border-l border-white/10 flex flex-col">
              <div className="mb-6">
                <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Script</h3>
                <div className="bg-black/30 p-4 rounded-lg text-sm text-slate-300 italic max-h-60 overflow-y-auto">
                  "{video.script}"
                </div>
              </div>

              <div className="mt-auto">
                {video.status === 'completed' ? (
                  <a 
                    href={video.video_url} 
                    download 
                    target="_blank"
                    className="flex items-center justify-center gap-2 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition"
                  >
                    <Download size={18} /> Télécharger MP4
                  </a>
                ) : (
                  <button disabled className="w-full bg-slate-800 text-slate-500 font-bold py-3 rounded-xl cursor-not-allowed">
                    Téléchargement indisponible
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}