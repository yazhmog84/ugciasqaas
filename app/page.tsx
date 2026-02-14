// app/page.tsx
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { Play, Zap, Users, Globe, Layers, ArrowRight, ShieldCheck, Smile } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-purple-500 selection:text-white">
      <Navbar />

      {/* --- HERO SECTION (Identique à avant, garde le code existant ici) --- */}
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
            <div className="relative bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl aspect-video flex items-center justify-center">
               <div className="text-center">
                  <Play className="w-20 h-20 text-white/20 mx-auto mb-4" />
                  <p className="text-slate-500">Interface Dashboard Preview</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- LOGO CLOUD --- */}
      <section className="py-10 border-y border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-medium text-slate-500 mb-8 uppercase tracking-wider">Ils utilisent notre technologie</p>
          <div className="flex flex-wrap justify-center items-center gap-12 grayscale opacity-50 font-bold text-2xl text-white/40">
            <span>NETFLIX</span>
            <span>Shopify</span>
            <span>Uber</span>
            <span>Spotify</span>
            <span>Notion</span>
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS (NOUVEAU) --- */}
      <section className="py-24 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4">
           <div className="text-center mb-16">
             <h2 className="text-3xl font-bold mb-4">Comment ça marche ?</h2>
             <p className="text-slate-400">3 étapes simples pour votre première vidéo virale.</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { num: "01", title: "Choisissez votre avatar", desc: "Sélectionnez parmi 50+ acteurs UGC triés sur le volet." },
                { num: "02", title: "Entrez votre script", desc: "Copiez-collez votre texte ou laissez notre IA le rédiger pour vous." },
                { num: "03", title: "Téléchargez", desc: "Recevez votre vidéo MP4 en HD, prête à être postée sur TikTok." }
              ].map((step, i) => (
                <div key={i} className="relative p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
                   <div className="text-6xl font-bold text-white/5 absolute top-4 right-4">{step.num}</div>
                   <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center text-purple-400 mb-6">
                     <Layers />
                   </div>
                   <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                   <p className="text-slate-400">{step.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* --- USE CASES (NOUVEAU) --- */}
      <section className="py-24 bg-gradient-to-b from-slate-900 to-slate-950 border-t border-white/5">
         <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1">
               <h2 className="text-4xl font-bold mb-6">Parfait pour le E-commerce</h2>
               <p className="text-lg text-slate-400 mb-8">
                 Arrêtez d'envoyer vos produits à des influenceurs. Créez des témoignages clients, des unboxings et des démos produits en quelques clics sans logistique.
               </p>
               <ul className="space-y-4">
                  {['Publicités TikTok & Reels', 'Fiches produits vidéo', 'Retargeting Ads', 'Témoignages Trustpilot'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-300">
                       <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400"><ShieldCheck size={14} /></div>
                       {item}
                    </li>
                  ))}
               </ul>
            </div>
            <div className="flex-1 relative">
               <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl blur-3xl opacity-20"></div>
               <div className="relative bg-black border border-white/10 rounded-2xl p-4 aspect-[4/3] flex items-center justify-center">
                  <span className="text-slate-500">Vidéo E-commerce Demo</span>
               </div>
            </div>
         </div>
      </section>

      {/* --- FEATURES GRID (EXISTANT) --- */}
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
              { icon: <Smile className="text-pink-400" />, title: "Émotions", desc: "Contrôlez le ton de voix : enthousiaste, calme, professionnel ou vendeur." },
              { icon: <Layers className="text-green-400" />, title: "Formats Multiples", desc: "9:16 pour les stories, 16:9 pour Youtube, 1:1 pour les feeds." },
              { icon: <ShieldCheck className="text-orange-400" />, title: "Droits Commerciaux", desc: "Toutes les vidéos vous appartiennent à 100% pour un usage commercial." },
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

      {/* --- CTA SECTION (NOUVEAU) --- */}
      <section className="py-20 px-4">
         <div className="max-w-5xl mx-auto bg-gradient-to-r from-indigo-900 to-purple-900 rounded-3xl p-12 text-center relative overflow-hidden border border-white/10">
            <div className="relative z-10">
               <h2 className="text-3xl md:text-4xl font-bold mb-6">Prêt à créer votre première vidéo ?</h2>
               <p className="text-purple-200 mb-8 max-w-2xl mx-auto">Rejoignez plus de 10,000 marketeurs qui utilisent VideoUGC.ai pour scaler leur acquisition.</p>
               <Link href="/signup" className="inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-xl font-bold hover:bg-slate-100 transition shadow-xl">
                 Commencer Gratuitement <ArrowRight size={20} />
               </Link>
            </div>
            {/* Décoration */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
         </div>
      </section>

      <Footer />
    </div>
  )
}