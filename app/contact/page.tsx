import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Mail, MapPin } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-4">Contactez-nous</h1>
            <p className="text-slate-400">Une question ? Un partenariat ? Notre équipe répond en moins de 24h.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12">
            
            {/* Info */}
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold mb-4">Nos bureaux</h3>
                <div className="flex items-start gap-4 text-slate-300">
                  <MapPin className="text-purple-500 shrink-0" />
                  <p>123 Avenue des Champs-Élysées<br/>75008 Paris, France</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-4">Email</h3>
                <div className="flex items-start gap-4 text-slate-300">
                  <Mail className="text-purple-500 shrink-0" />
                  <p>support@videougc.ai<br/>sales@videougc.ai</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Sujet</label>
                <select className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500">
                  <option>Support technique</option>
                  <option>Commercial / Agence</option>
                  <option>Autre</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Message</label>
                <textarea 
                  rows={4}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500 text-white"
                  placeholder="Comment pouvons-nous vous aider ?"
                ></textarea>
              </div>

              <button className="w-full bg-white text-slate-900 font-bold py-3 rounded-xl hover:bg-slate-200 transition">
                Envoyer le message
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}