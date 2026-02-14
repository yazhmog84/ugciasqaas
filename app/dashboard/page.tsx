'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client' // ✅ Le bon import
import Link from 'next/link'
import { Plus, Video, Film, ArrowUpRight } from 'lucide-react' // Vérifie tes imports d'icônes

export default function DashboardPage() {
  const [videos, setVideos] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Charge les crédits
        const { data: userData } = await supabase.from('users').select('*').eq('id', user.id).single()
        setUser(userData)
        // Charge les vidéos
        const { data: videosData } = await supabase.from('videos').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
        setVideos(videosData || [])
      }
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) return <div className="text-white p-10 text-center">Chargement...</div>

  // ... (Garde ton JSX, il est correct)
  return (
    <div className="space-y-8">
       {/* ... Ton code d'affichage ... */}
       {/* Juste pour tester, affiche les crédits bruts ici : */}
       <div className="text-white">Crédits: {user?.credits ?? 0}</div>
    </div>
  )
}