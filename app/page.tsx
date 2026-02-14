// app/page.tsx
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { Play, Check, Zap, Users, Globe } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-purple-500 selection:text-white">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-indigo-600/20 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-purple-300 mb-8 animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            Nouvelle version v2.0 disponible
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-slate-400">
            L'UGC n'a jamais été <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">aussi simple.</span>
          </h1>
          
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Générez des vidéos publicitaires authentiques avec des avatars IA indiscernables de la réalité. Script, voix, visage : tout est automatisé.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/signup" className="w-full sm:w-auto px-8 py-4 bg-white text-slate-950 rounded-xl text-lg font-bold hover:bg-slate-200 transition shadow-xl shadow-white/5 flex items-center justify-center gap-2">
              <Zap size={20} />
              Créer une vidéo gratuitement
            </Link>
            <Link href="#demo" className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white border border-white/10 rounded-xl text-lg font-bold hover:bg-white/10 transition backdrop-blur-sm flex items-center justify-center gap-2">
              <Play size={20} />
              Voir la démo
            </Link>
          </div>

          {/* Hero Image / UI Mockup */}
          <div className="relative mx-auto max-w-5xl">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-30"></div>
            <div className="relative bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="https://cdn.dribbble.com/userupload/13333334/file/original-12345.png" 
                // Note: Remplace par une capture d'écran de ton dashboard
                alt="Dashboard Interface" 
                className="w-full opacity-90"
              />
              {/* Overlay Play Button if it's a video */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group cursor-pointer">
                <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 transition duration-300">
                  <Play className="fill-white text-white ml-1" size={32} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST SECTION */}
      <section className="py-10 border-y border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-medium text-slate-500 mb-8 uppercase tracking-wider">Ils utilisent notre technologie</p>
          <div className="flex flex-wrap justify-center items-center gap-12 grayscale opacity-50">
            {/* Logos Placeholder - Remplace par des SVGs */}
            <span className="text-2xl font-bold text-white">Acme Corp</span>
            <span className="text-2xl font-bold text-white">GlobalTech</span>
            <span className="text-2xl font-bold text-white">Nebula</span>
            <span className="text-2xl font-bold text-white">FoxRun</span>
            <span className="text-2xl font-bold text-white">Circle</span>
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section id="features" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Tout ce dont vous avez besoin</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Une suite complète d'outils pour automatiser votre production de contenu vidéo.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Users className="text-blue-400" />, title: "50+ Avatars UGC", desc: "Des créateurs de tous âges et origines pour matcher avec votre audience cible." },
              { icon: <Globe className="text-purple-400" />, title: "120+ Langues", desc: "Traduisez vos scripts instantanément et touchez une audience mondiale." },
              { icon: <Zap className="text-yellow-400" />, title: "Rendu Éclair", desc: "Obtenez votre vidéo HD en moins de 2 minutes chrono. Sans attente." },
            ].map((feature, i) => (
              <div key={i} className="p-8 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition duration-300 group">
                <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}