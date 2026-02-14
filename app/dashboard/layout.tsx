// app/dashboard/layout.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, PlusCircle, Film, CreditCard, Settings, LogOut, Sparkles, Bell, Search, Image as ImageIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'



export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const navigation = [
    { name: 'Vue d\'ensemble', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Créer une vidéo', href: '/create', icon: PlusCircle },
    { name: 'Mes Vidéos', href: '/dashboard/library', icon: Film }, // Tu pourras créer cette page plus tard
    { name: 'Abonnement', href: '/pricing', icon: CreditCard },
    { name: 'Paramètres', href: '/dashboard/settings', icon: Settings },
    { name: 'Créer une Pub Image', href: '/create-image', icon: ImageIcon },
  ]

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* SIDEBAR */}
    <aside className="w-64 bg-slate-900/50 backdrop-blur-xl border-r border-white/5 flex flex-col fixed h-full z-20 hidden md:flex">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white">VideoUGC<span className="text-purple-400">.ai</span></span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                  isActive 
                    ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon size={20} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition"
          >
            <LogOut size={20} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT area */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* TOP BAR */}
        <header className="h-16 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-10 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4 text-slate-400 text-sm">
            <span className="hidden md:inline">Dashboard</span>
            <span className="hidden md:inline">/</span>
            <span className="text-white font-medium">Vue d'ensemble</span>
          </div>

          <div className="flex items-center gap-6">
             {/* Search Fake */}
             <div className="hidden md:flex items-center bg-white/5 rounded-full px-4 py-1.5 border border-white/10 focus-within:border-purple-500/50 transition">
                <Search size={14} className="text-slate-500 mr-2" />
                <input type="text" placeholder="Rechercher une vidéo..." className="bg-transparent outline-none text-sm text-white placeholder-slate-600 w-48" />
             </div>
             
             {/* Notifications */}
             <button className="relative text-slate-400 hover:text-white transition">
                <Bell size={20} />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-950"></span>
             </button>
             
             {/* Avatar User */}
             <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 border border-white/20"></div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
