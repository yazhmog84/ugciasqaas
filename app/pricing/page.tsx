// app/pricing/page.tsx
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { Check, Star } from 'lucide-react'

export default function PricingPage() {
  const plans = [
    {
      name: "Découverte",
      price: "29",
      credits: 30,
      features: ["3 vidéos HD", "10 Avatars standards", "Filigrane discret", "Support email"],
      popular: false,
      color: "border-white/10"
    },
    {
      name: "Créateur",
      price: "79",
      credits: 100,
      features: ["10 vidéos HD", "Tous les avatars (+50)", "Pas de filigrane", "Sous-titres auto", "Support prioritaire"],
      popular: true,
      color: "border-purple-500 shadow-purple-900/20"
    },
    {
      name: "Agence",
      price: "199",
      credits: 300,
      features: ["30 vidéos HD", "Mode API", "Clonage de voix", "Avatars 4K", "Account Manager dédié"],
      popular: false,
      color: "border-white/10"
    }
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Investissez dans votre croissance</h1>
          <p className="text-xl text-slate-400">
            Des crédits flexibles. Pas d'abonnement caché. Vous payez ce que vous utilisez.
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <div 
              key={i} 
              className={`relative bg-slate-900/50 backdrop-blur-xl rounded-2xl p-8 border ${plan.color} flex flex-col ${plan.popular ? 'shadow-2xl scale-105 z-10' : 'hover:border-white/20 transition'}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg">
                  <Star size={12} fill="white" /> Populaire
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-lg font-medium text-slate-300 mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-white">{plan.price}€</span>
                  <span className="text-slate-500">/ pack</span>
                </div>
                <div className="mt-4 inline-block bg-white/5 rounded-lg px-3 py-1 text-sm text-purple-300 border border-white/10">
                  {plan.credits} Crédits inclus
                </div>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-slate-300">
                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                      <Check size={12} className="text-green-400" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button className={`w-full py-4 rounded-xl font-bold transition ${
                plan.popular 
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg' 
                  : 'bg-white text-slate-900 hover:bg-slate-200'
              }`}>
                Choisir ce pack
              </button>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-slate-500 text-sm">
            Paiement sécurisé via Stripe. Facture disponible instantanément. <br/>
            Besoin de plus ? <Link href="/contact" className="text-purple-400 underline">Contactez-nous</Link> pour une offre Enterprise.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}