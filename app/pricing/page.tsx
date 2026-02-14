'use client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { createClient } from '@/lib/supabase/client' // 👈 Correction 1 : On importe la fonction, pas l'objet
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Star, Loader2 } from 'lucide-react'

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()
  
  // 👈 Correction 2 : On initialise le client Supabase ici
  const supabase = createClient()

  const plans = [
    {
      name: "Starter",
      price: "49",
      priceId: "price_XXXXXXXX1", // Pense à mettre tes vrais IDs Stripe
      credits: 100,
      features: ["10 vidéos / mois", "Avatars standards", "Sans filigrane", "Support email"],
      popular: false,
      color: "border-white/10"
    },
    {
      name: "Pro",
      price: "99",
      priceId: "price_XXXXXXXX2",
      credits: 250,
      features: ["25 vidéos / mois", "Tous les avatars (+50)", "Sous-titres IA", "Rendu prioritaire"],
      popular: true,
      color: "border-purple-500 shadow-purple-900/20"
    },
    {
      name: "Agency",
      price: "249",
      priceId: "price_XXXXXXXX3",
      credits: 1000,
      features: ["100 vidéos / mois", "API Access", "Clonage de voix", "Account Manager"],
      popular: false,
      color: "border-white/10"
    }
  ]

  async function handleCheckout(plan: any) {
    setLoading(plan.name)
    try {
      // Vérification de la session
      const { data: { session } } = await supabase.auth.getSession()
      
      // Si pas connecté, on redirige vers le login avec un paramètre de retour
      if (!session) {
        router.push(`/login?redirect=/pricing`)
        return
      }

      // Appel à ton API Stripe
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // On envoie le token pour que le back puisse vérifier l'identité (optionnel si cookies gérés, mais plus sûr)
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          priceId: plan.priceId,
          planCredits: plan.credits
        })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Erreur lors de la création du checkout')
      }

      const data = await res.json()
      
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('Pas d\'URL de redirection Stripe reçue')
      }

    } catch (error: any) {
      console.error(error)
      alert(error.message || "Une erreur est survenue.")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Investissez dans votre croissance</h1>
          <p className="text-xl text-slate-400">Paiement sécurisé. Facture immédiate.</p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <div key={i} className={`relative bg-slate-900/50 backdrop-blur-xl rounded-2xl p-8 border ${plan.color} flex flex-col ${plan.popular ? 'shadow-2xl scale-105 z-10' : 'hover:border-white/20 transition'}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg">
                  <Star size={12} fill="white" /> Populaire
                </div>
              )}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-slate-300 mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-white">{plan.price}€</span>
                </div>
                <div className="mt-4 inline-block bg-white/5 rounded-lg px-3 py-1 text-sm text-purple-300 border border-white/10">
                  {plan.credits} Crédits inclus
                </div>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((f, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-slate-300"><Check size={12} className="text-green-400" /> <span className="text-sm">{f}</span></li>
                ))}
              </ul>
              <button 
                onClick={() => handleCheckout(plan)}
                disabled={loading === plan.name}
                className={`w-full py-4 rounded-xl font-bold transition flex items-center justify-center gap-2 ${plan.popular ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' : 'bg-white text-slate-900 hover:bg-slate-200'}`}
              >
                {loading === plan.name ? <Loader2 className="animate-spin" /> : 'Choisir ce pack'}
              </button>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}