// app/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link' // <--- CORRECTION 1 : Import nécessaire

interface User {
  email: string
  credits: number
  subscription_plan: string
}

interface Video {
  id: string
  script: string
  video_url: string | null
  status: string
  created_at: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadUserData()
  }, [])

  async function loadUserData() {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) {
        router.push('/login')
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('email, credits, subscription_plan')
        .eq('id', authUser.id)
        .single()

      setUser(userData)

      const { data: videosData } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false })
        .limit(10)

      setVideos(videosData || [])

    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-medium">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">V</span>
              </div>
              <h1 className="text-2xl font-bold text-white">
                VideoUGC AI
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-white">{user?.email}</span>
              </div>
              
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Crédits */}
          <div className="relative overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/70 text-sm font-medium">Crédits restants</span>
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💳</span>
              </div>
            </div>
            <div className="text-4xl font-bold text-white mb-2">{user?.credits || 0}</div>
            <div className="text-white/60 text-sm">
              {Math.floor((user?.credits || 0) / 10)} vidéos disponibles
            </div>
          </div>

          {/* Vidéos créées */}
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/70 text-sm font-medium">Vidéos créées</span>
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🎬</span>
              </div>
            </div>
            <div className="text-4xl font-bold text-white mb-2">{videos.length}</div>
            <div className="text-white/60 text-sm">
              {videos.filter(v => v.status === 'completed').length} terminées
            </div>
          </div>

          {/* Plan */}
          <div className="relative overflow-hidden bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/70 text-sm font-medium">Plan actuel</span>
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⭐</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-2 capitalize">
              {user?.subscription_plan || 'Free'}
            </div>
            <button className="text-orange-300 text-sm hover:text-orange-200 transition">
              Upgrader →
            </button>
          </div>
        </div>

        {/* Bouton créer */}
        <div className="mb-8">
          {/* CORRECTION 2 : Ajout de <Link> */}
          <Link
            href="/create"
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
          >
            <span className="text-2xl">✨</span>
            <div>
              <div className="text-lg font-bold">Créer une vidéo</div>
              <div className="text-xs text-white/80">Génère ta vidéo UGC en 2 minutes</div>
            </div>
            <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        {/* Liste des vidéos */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
          <div className="px-6 py-5 border-b border-white/10">
            <h2 className="text-xl font-bold text-white">Mes vidéos récentes</h2>
            <p className="text-sm text-white/60 mt-1">Gère et télécharge tes créations</p>
          </div>
          
          <div className="divide-y divide-white/10">
            {videos.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🎥</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Aucune vidéo pour le moment
                </h3>
                <p className="text-white/60 mb-6">
                  Crée ta première vidéo UGC avec l&apos;IA !
                </p>
                
                {/* CORRECTION 3 : Ajout de <Link> */}
                <Link
                  href="/create"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition"
                >
                  <span>✨</span>
                  <span>Créer ma première vidéo</span>
                </Link>
              </div>
            ) : (
              videos.map(video => (
                <div key={video.id} className="px-6 py-5 hover:bg-white/5 transition">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        {video.status === 'processing' && (
                          <span className="flex items-center gap-2 px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs font-medium border border-yellow-500/30">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                            En cours
                          </span>
                        )}
                        {video.status === 'completed' && (
                          <span className="flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-medium border border-green-500/30">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            Prête
                          </span>
                        )}
                        {video.status === 'failed' && (
                          <span className="flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-xs font-medium border border-red-500/30">
                            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                            Échec
                          </span>
                        )}
                      </div>
                      <p className="text-white font-medium mb-1 truncate">
                        {video.script.substring(0, 80)}...
                      </p>
                      <p className="text-sm text-white/60">
                        {new Date(video.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {video.status === 'completed' && (
                        <>
                          {/* CORRECTION 4 : Ajout de <Link> */}
                          <Link
                            href={`/video/${video.id}`}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium"
                          >
                            Voir
                          </Link>
                          {video.video_url && (
                            /* CORRECTION 5 : Ajout de <a> pour le téléchargement */
                            <a
                              href={video.video_url}
                              download
                              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition text-sm font-medium"
                            >
                              Télécharger
                            </a>
                          )}
                        </>
                      )}
                      {video.status === 'processing' && (
                        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer stats */}
        <div className="mt-8 p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-white">2min</div>
              <div className="text-sm text-white/60 mt-1">Temps moyen</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">50+</div>
              <div className="text-sm text-white/60 mt-1">Avatars dispos</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">1080p</div>
              <div className="text-sm text-white/60 mt-1">Qualité HD</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}