// components/Footer.tsx
import Link from 'next/link'
import { Twitter, Instagram, Linkedin, Github, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-white/10 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white">VideoUGC.ai</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              La plateforme n°1 pour générer des vidéos UGC virales grâce à l'intelligence artificielle. Créez plus, dépensez moins.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-purple-600 transition"><Twitter size={18} /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-pink-600 transition"><Instagram size={18} /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-blue-600 transition"><Linkedin size={18} /></a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-bold text-white mb-6">Produit</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link href="/create" className="hover:text-purple-400 transition">Générateur Vidéo</Link></li>
              <li><Link href="/#avatars" className="hover:text-purple-400 transition">Avatars IA</Link></li>
              <li><Link href="/pricing" className="hover:text-purple-400 transition">Tarifs</Link></li>
              <li><Link href="/dashboard" className="hover:text-purple-400 transition">Dashboard</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-white mb-6">Entreprise</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link href="/about" className="hover:text-purple-400 transition">À propos</Link></li>
              <li><Link href="/blog" className="hover:text-purple-400 transition">Blog</Link></li>
              <li><Link href="/careers" className="hover:text-purple-400 transition">Carrières</Link></li>
              <li><Link href="/contact" className="hover:text-purple-400 transition">Contact</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-white mb-6">Légal</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link href="/legal/privacy" className="hover:text-purple-400 transition">Confidentialité</Link></li>
              <li><Link href="/legal/terms" className="hover:text-purple-400 transition">CGU / CGV</Link></li>
              <li><Link href="/legal/mentions" className="hover:text-purple-400 transition">Mentions Légales</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">© 2024 VideoUGC AI. Tous droits réservés.</p>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Fait avec</span>
            <Heart size={14} className="text-red-500 fill-red-500" />
            <span>à Paris</span>
          </div>
        </div>
      </div>
    </footer>
  )
}