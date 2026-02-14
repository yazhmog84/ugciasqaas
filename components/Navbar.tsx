// components/Navbar.tsx
'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X, Sparkles } from 'lucide-react'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-slate-950/80 backdrop-blur-md border-b border-white/10' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-purple-500/25 transition-all">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-white tracking-tight">VideoUGC<span className="text-purple-400">.ai</span></span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-slate-300 hover:text-white transition">Fonctionnalités</Link>
            <Link href="#examples" className="text-sm font-medium text-slate-300 hover:text-white transition">Exemples</Link>
            <Link href="/pricing" className="text-sm font-medium text-slate-300 hover:text-white transition">Tarifs</Link>
            
            <div className="flex items-center gap-4 pl-4 border-l border-white/10">
              <Link href="/login" className="text-sm font-medium text-white hover:text-purple-300 transition">
                Connexion
              </Link>
              <Link href="/signup" className="px-5 py-2.5 bg-white text-slate-900 rounded-lg text-sm font-bold hover:bg-slate-200 transition shadow-lg shadow-white/10">
                Commencer
              </Link>
            </div>
          </div>

          {/* Mobile Button */}
          <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950 border-b border-white/10 p-4 space-y-4">
          <Link href="#features" className="block text-slate-300 hover:text-white">Fonctionnalités</Link>
          <Link href="/pricing" className="block text-slate-300 hover:text-white">Tarifs</Link>
          <hr className="border-white/10" />
          <Link href="/login" className="block text-slate-300 hover:text-white">Connexion</Link>
          <Link href="/signup" className="block w-full text-center bg-purple-600 py-3 rounded-lg text-white font-bold">Commencer</Link>
        </div>
      )}
    </nav>
  )
}