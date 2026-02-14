'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client' 
// CORRECTION : Ajout de 'Film' ici
import { ArrowUpRight, Play, Clock, MoreVertical, Plus, Film } from 'lucide-react'

export default function DashboardPage() {
  const [videos, setVideos] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      // Sécurisation : on vérifie la session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        // 1. Charger les infos user
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (userData) setUser(userData)

        // 2. Charger les vidéos
        const { data: videosData } = await supabase
          .from('videos')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(6)
        
        setVideos(videosData || [])
      }
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Bonjour{user?.email ? `, ${user.email.split('@')[0]}` : ''} 👋</h1>
          <p className="text-slate-400 mt-1">Voici ce qu'il se passe avec vos vidéos aujourd'hui.</p>
        </div>
        <Link href="/create" className="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-slate-200 transition flex items-center gap-2 shadow-lg shadow-white/5">
          <Plus size={18} />
          Nouvelle Vidéo
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Crédits */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-purple-500/30 transition">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-3xl group-hover:bg-purple-600/20 transition"></div>
          <p className="text-slate-400 text-sm font-medium mb-1">Crédits restants</p>
          <div className="text-4xl font-bold text-white mb-2">{user?.credits || 0}</div>
          <Link href="/pricing" className="text-purple-400 text-xs font-bold hover:underline flex items-center gap-1">
            Recharger le compte <ArrowUpRight size={12} />
          </Link>
        </div>

        {/* Vidéos générées */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500/30 transition">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition"></div>
          <p className="text-slate-400 text-sm font-medium mb-1">Vidéos générées</p>
          <div className="text-4xl font-bold text-white mb-2">{videos.length}</div>
          <p className="text-green-400 text-xs flex items-center gap-1">
             +2 cette semaine
          </p>
        </div>

        {/* Plan */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-pink-500/30 transition">
           <div className="absolute top-0 right-0 w-32 h-32 bg-pink-600/10 rounded-full blur-3xl group-hover:bg-pink-600/20 transition"></div>
          <p className="text-slate-400 text-sm font-medium mb-1">Plan Actuel</p>
          <div className="text-4xl font-bold text-white mb-2 capitalize">{user?.subscription_plan || 'Free'}</div>
          <Link href="/pricing" className="text-pink-400 text-xs font-bold hover:underline flex items-center gap-1">
            Passer Pro <ArrowUpRight size={12} />
          </Link>
        </div>
      </div>

      {/* Recent Videos Grid */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Vidéos Récentes</h2>
          <Link href="/dashboard/library" className="text-sm text-purple-400 hover:text-purple-300">Tout voir</Link>
        </div>

        {videos.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/5">
             <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
                <Film size={32} />
             </div>
             <p className="text-white font-medium">Aucune vidéo</p>
             <p className="text-slate-500 text-sm mb-4">Créez votre première vidéo en quelques secondes.</p>
             <Link href="/create" className="text-purple-400 hover:text-purple-300 text-sm font-bold">Commencer →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div key={video.id} className="bg-slate-900 border border-white/10 rounded-xl overflow-hidden group hover:border-white/20 transition">
                {/* Thumbnail */}
                <div className="aspect-video bg-black relative flex items-center justify-center group-hover:bg-black/80 transition">
                   {video.status === 'completed' ? (
                     <video src={video.video_url} className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition" />
                   ) : (
                     <div className="animate-pulse bg-white/10 w-full h-full flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                     </div>
                   )}
                   
                   <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition transform scale-95 group-hover:scale-100">
                      <Link href={`/video/${video.id}`} className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black hover:scale-110 transition">
                         <Play fill="black" size={20} className="ml-1" />
                      </Link>
                   </div>
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className="font-semibold text-white line-clamp-1" title={video.script}>{video.script || 'Sans titre'}</h3>
                    <button className="text-slate-500 hover:text-white"><MoreVertical size={16} /></button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock size={12} />
                    <span>{new Date(video.created_at).toLocaleDateString()}</span>
                    <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                    <span className={video.status === 'completed' ? 'text-green-400' : 'text-yellow-400 capitalize'}>
                      {video.status === 'completed' ? 'Prête' : 'En cours'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}