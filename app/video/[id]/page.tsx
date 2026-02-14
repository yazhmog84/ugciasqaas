'use client'

import { useEffect, useState, use } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function VideoPage({ params }: { params: Promise<{ id: string }> }) {
  // Note: Dans Next 15+ params est une Promise, on utilise use()
  const { id } = use(params)
  
  const [video, setVideo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Polling pour vérifier si la vidéo est prête toutes les 2 sec
    const interval = setInterval(fetchVideo, 2000)
    fetchVideo()
    return () => clearInterval(interval)
  }, [id])

  async function fetchVideo() {
    const { data } = await supabase
      .from('videos')
      .select('*')
      .eq('id', id)
      .single()
    
    if (data) {
      setVideo(data)
      if (data.status === 'completed' || data.status === 'failed') {
        setLoading(false) // On arrête de charger si fini
      }
    }
  }

  if (!video) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Chargement...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
       <header className="p-6">
         <Link href="/dashboard" className="text-white/80 hover:text-white transition">
            ← Retour au Dashboard
         </Link>
       </header>

       <main className="flex-1 flex flex-col items-center justify-center p-4">
         <div className="max-w-4xl w-full bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden flex flex-col md:flex-row">
            
            {/* Lecteur Vidéo */}
            <div className="flex-1 bg-black aspect-[9/16] md:aspect-video flex items-center justify-center relative">
               {video.status === 'completed' ? (
                 <video 
                   src={video.video_url} 
                   controls 
                   className="w-full h-full object-contain"
                   autoPlay
                 />
               ) : (
                 <div className="text-center p-8">
                   <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                   <h2 className="text-xl font-bold text-white mb-2">
                     {video.status === 'processing' ? 'Création de la magie...' : 'En attente'}
                   </h2>
                   <p className="text-white/60">L'IA génère votre vidéo. Cela prend environ 2 minutes.</p>
                 </div>
               )}
            </div>

            {/* Sidebar Details */}
            <div className="w-full md:w-80 p-6 border-l border-white/10 flex flex-col gap-6">
               <div>
                 <h1 className="text-xl font-bold text-white mb-2">Détails</h1>
                 <p className="text-sm text-white/60">Créée le {new Date(video.created_at).toLocaleDateString()}</p>
               </div>

               <div className="bg-white/5 rounded-lg p-4">
                 <h3 className="text-xs font-bold text-white/50 uppercase mb-2">Script</h3>
                 <p className="text-white text-sm italic">"{video.script}"</p>
               </div>

               {video.status === 'completed' && (
                 <a 
                   href={video.video_url} 
                   download 
                   className="mt-auto w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl text-center transition"
                 >
                   Télécharger la vidéo
                 </a>
               )}
            </div>
         </div>
       </main>
    </div>
  )
}