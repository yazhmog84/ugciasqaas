'use client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Star, Loader2, Zap } from 'lucide-react'

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const plans = [
    {
      name: "Découverte",
      price: "0",
      priceId: null, // Pas d'ID Stripe pour le gratuit
      credits: 50,
      features: ["50 crédits offerts (une fois)", "Accès à 3 avatars", "Qualité Standard", "Export MP4"],
      popular: false,
      isFree: true,
      color: "border-white/10"
    },
    {
      name: "Creator",
      price: "29",
      priceId: "price_1Q...", // ⚠️ Remplace par ton ID Stripe
      credits: 500,
      features: ["500 crédits / mois", "Tous les avatars (+50)", "Sans filigrane", "Support prioritaire"],
      popular: true,
      isFree: false,
      color: "border-purple-500 shadow-[0_0_40px_rgba(168,85,247,0.15)]"
    },
    {
      name: "Agency",
      price: "99",
      priceId: "price_1Q...", // ⚠️ Remplace par ton ID Stripe
      credits: 2000,
      features: ["2000 crédits / mois", "API Access", "Clonage de voix", "Account Manager dédié"],
      popular: false,
      isFree: false,
      color: "border-white/10"
    }
  ]

  async function handleSelectPlan(plan: any) {
    if (plan.isFree) {
        // Pour le plan gratuit, on redirige juste vers signup/dashboard
        router.push('/signup')
        return
    }

    setLoading(plan.name)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        // On sauvegarde le choix pour après le login (optionnel, mais bonne UX)
        router.push(`/login?redirect=/pricing`)
        return
      }

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          priceId: plan.priceId,
          planCredits: plan.credits
        })
      })

      if (!res.ok) {
         const err = await res.json()
         throw new Error(err.error || 'Erreur paiement')
      }

      const data = await res.json()
      if (data.url) window.location.href = data.url
      else throw new Error('Erreur URL Stripe')

    } catch (error: any) {
      console.error(error)
      alert(error.message || "Une erreur est survenue.")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-purple-500/30">
      <Navbar />
      <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-medium mb-6">
            <Zap size={14} className="fill-purple-300" />
            Offre de lancement limitée
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            Des tarifs simples pour <br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">une créativité sans limite</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Commencez gratuitement avec 50 crédits. Passez à la vitesse supérieure quand vous êtes prêt.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-2">
          {plans.map((plan, i) => (
            <div key={i} className={`relative bg-slate-900/40 backdrop-blur-xl rounded-3xl p-8 border flex flex-col transition-all duration-300 ${plan.popular ? 'scale-105 z-10 ' + plan.color : 'hover:border-white/20 ' + plan.color}`}>
              
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg flex items-center gap-1">
                  <Star size={10} fill="white" /> Recommandé
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-lg font-semibold text-slate-300 mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-white">{plan.price}€</span>
                  {!plan.isFree && <span className="text-slate-500 text-lg">/mois</span>}
                </div>
                <p className="text-slate-500 text-sm mt-2">
                    {plan.isFree ? "Pas de carte bancaire requise" : "Annulable à tout moment"}
                </p>
              </div>

              <div className="w-full h-px bg-white/5 mb-8"></div>

              <div className="flex-1">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Fonctionnalités</div>
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-slate-300">
                          <div className="mt-0.5 min-w-[18px] h-[18px] rounded-full bg-green-500/20 flex items-center justify-center">
                            <Check size={10} className="text-green-400" strokeWidth={3} />
                          </div>
                          <span className="text-sm leading-tight">{f}</span>
                      </li>
                    ))}
                  </ul>
              </div>

              <button 
                onClick={() => handleSelectPlan(plan)}
                disabled={loading === plan.name}
                className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                    plan.popular 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-purple-900/20' 
                    : plan.isFree 
                        ? 'bg-white text-slate-900 hover:bg-slate-200'
                        : 'bg-slate-800 text-white hover:bg-slate-700 border border-white/5'
                }`}
              >
                {loading === plan.name ? <Loader2 className="animate-spin" /> : (plan.isFree ? "Commencer gratuitement" : "Choisir ce plan")}
              </button>
            </div>
          ))}
        </div>
        
        {/* FAQ Teaser */}
        <div className="mt-24 text-center">
            <p className="text-slate-500 text-sm">Besoin d'une offre sur mesure ? <a href="/contact" className="text-white underline underline-offset-4 decoration-slate-700 hover:decoration-white transition">Contactez-nous</a></p>
        </div>

      </main>
      <Footer />
    </div>
  )
}