'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Sparkles, ArrowRight, Loader2, Mail, Lock, AlertCircle } from 'lucide-react'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Inscription via Supabase Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Redirection après confirmation (si activé dans Supabase)
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      })
      
      if (authError) throw authError

      // Si l'inscription réussit, le TRIGGER SQL s'occupe de créer le profil et les crédits.
      
      if (data.session) {
          // Connexion directe réussie (Email confirm désactivé)
          router.push('/dashboard')
      } else {
          // Email confirm activé
          setError('Vérifiez vos emails pour confirmer votre compte !')
      }

    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background d'ambiance */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]"></div>
        </div>

        <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-500/10 rounded-xl mb-4 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                    <Sparkles className="text-purple-400 w-6 h-6" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Créez votre compte</h1>
                <p className="text-slate-400 text-sm">
                    Rejoignez la plateforme. <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-bold">
                        🎁 50 crédits offerts à l'inscription !
                    </span>
                </p>
            </div>

            {error && (
                <div className={`mb-6 p-4 rounded-xl text-sm flex items-start gap-3 ${error.includes('Vérifiez') ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                    <AlertCircle size={18} className="mt-0.5 shrink-0"/>
                    <p>{error}</p>
                </div>
            )}

            <form onSubmit={handleSignup} className="space-y-5">
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-3.5 text-slate-500 w-5 h-5" />
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            placeholder="vous@exemple.com"
                            className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-white placeholder-slate-600 transition-all hover:border-white/20"
                        />
                    </div>
                </div>
                
                <div className="space-y-2">
                     <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">Mot de passe</label>
                     <div className="relative">
                        <Lock className="absolute left-4 top-3.5 text-slate-500 w-5 h-5" />
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            minLength={6}
                            placeholder="••••••••"
                            className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-white placeholder-slate-600 transition-all hover:border-white/20"
                        />
                     </div>
                </div>

                <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group mt-4"
                >
                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                        <>
                            Commencer gratuitement
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/5 text-center">
                <p className="text-slate-400 text-sm">
                    Déjà un compte ?{' '}
                    <Link href="/login" className="text-white font-medium hover:text-purple-400 transition underline decoration-transparent hover:decoration-purple-400 underline-offset-4">
                        Se connecter
                    </Link>
                </p>
            </div>
        </div>
    </div>
  )
}