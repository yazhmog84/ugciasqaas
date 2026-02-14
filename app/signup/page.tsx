'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client' // ✅ Le bon import
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Sparkles, ArrowRight } from 'lucide-react'

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
      // 1. Inscription Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })
      if (authError) throw authError

      // 2. Création profil (Si l'user n'existe pas déjà)
      if (data.user) {
        const { error: dbError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: email,
            credits: 50 // 🎁 50 crédits offerts
          })
          .select() // Vérifie que l'insert a marché
        
        // On ignore l'erreur si c'est juste un doublon
        if (dbError && !dbError.message.includes('duplicate')) {
           console.error(dbError)
        }
      }

      router.push('/login?message=Compte créé ! Connectez-vous.')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ... (Garde ton JSX actuel pour le design, il est très bien)
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Inscription</h1>
        {error && <div className="text-red-400 bg-red-900/20 p-3 rounded mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSignup} className="space-y-4">
          <input 
            type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
            className="w-full p-3 bg-slate-900 border border-slate-700 rounded text-white" required 
          />
          <input 
            type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)}
            className="w-full p-3 bg-slate-900 border border-slate-700 rounded text-white" required minLength={6}
          />
          <button disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white p-3 rounded font-bold">
            {loading ? '...' : 'Créer mon compte'}
          </button>
        </form>
        <p className="mt-4 text-center text-slate-400 text-sm">
          Déjà un compte ? <Link href="/login" className="text-purple-400">Connexion</Link>
        </p>
      </div>
    </div>
  )
}