'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../../lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Video, Film, ArrowUpRight, Loader2 } from 'lucide-react'

export default function DashboardPage() {
  const [videos, setVideos] = useState<any[]>([])
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  
  // Création du client unique
  const supabase = createClient()

  useEffect(() => {
    const loadData = async () => {
      try {
        // 1. Vérif session
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
          router.replace('/login')
          return
        }

        // 2. Chargement profil (UTILISER maybeSingle pour éviter le crash)
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .maybeSingle() // 👈 C'est ça qui corrige ton erreur "JSON object requested..."
        
        if (userError) console.error("Erreur Profil:", userError.message)
        
        // Si pas de profil, on met des valeurs par défaut pour ne pas planter
        setUserProfile(userData || { credits: 0 })

        // 3. Chargement vidéos
        const { data: videosData, error: videoError } = await supabase
          .from('videos')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (videoError) console.error("Erreur Vidéos:", videoError.message)
        setVideos(videosData || [])

      } catch (err) {
        console.error("Erreur critique:", err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router, supabase])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <Loader2 className="animate-spin text-purple-500 w-10 h-10" />
      </div>
    )
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Tableau de bord</h1>
          <p className="text-slate-400 mt-1">Gérez vos créations et vos crédits.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg text-sm font-medium text-slate-300">
            💳 {userProfile?.credits ?? 0} Crédits
          </div>
          <Link 
            href="/create" 
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition"
          >
            <Plus size={18} />
            Nouvelle vidéo
          </Link>
        </div>
      </div>

      {/* Liste Vidéos */}
      {videos.length === 0 ? (
        <div className="border border-dashed border-slate-800 rounded-2xl p-12 text-center bg-slate-900/50">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Film className="text-slate-500" size={32} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Aucune vidéo générée</h3>
          <p className="text-slate-400 mb-6">Commencez dès maintenant à créer du contenu viral.</p>
          <Link href="/create" className="text-purple-400 hover:text-purple-300 font-medium flex items-center justify-center gap-1">
            Créer ma première vidéo <ArrowUpRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div key={video.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-purple-500/50 transition">
              <div className="aspect-video bg-black/50 flex items-center justify-center relative group">
                 {video.thumbnail_url ? (
                    <img src={video.thumbnail_url} alt="thumbnail" className="w-full h-full object-cover" />
                 ) : (
                    <Video className="text-slate-600" />
                 )}
                 <Link href={`/video/${video.id}`} className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition">
                    <span className="bg-white text-black px-4 py-2 rounded-full font-bold text-sm">Voir</span>
                 </Link>
              </div>
              <div className="p-4">
                <h4 className="font-medium text-white truncate">{video.title || 'Vidéo sans titre'}</h4>
                <div className="flex justify-between items-center mt-2 text-sm text-slate-500">
                  <span>{new Date(video.created_at).toLocaleDateString()}</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${video.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {video.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}