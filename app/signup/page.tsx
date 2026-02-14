'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        // Optionnel: rediriger vers une page de confirmation si email confirm activé
        /* options: { emailRedirectTo: `${location.origin}/auth/callback` } */
      })
      
      if (authError) throw authError

      // Plus besoin d'insert manuel ici, le Trigger SQL le fait !
      router.push('/login?message=Compte créé ! Connectez-vous.')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ... (Garde ton return JSX identique)
  return (
      // ... ton code JSX existant ...
      <form onSubmit={handleSignup} className="space-y-4">
          {/* ... tes inputs ... */}
          <button disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white p-3 rounded font-bold">
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
      </form>
      // ...
  )
}