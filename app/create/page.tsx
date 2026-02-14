// app/create/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const avatars = [
  { id: 'emma', name: 'Emma', image: 'https://i.pravatar.cc/150?img=1' },
  { id: 'marcus', name: 'Marcus', image: 'https://i.pravatar.cc/150?img=12' },
  { id: 'sophie', name: 'Sophie', image: 'https://i.pravatar.cc/150?img=5' },
  { id: 'lucas', name: 'Lucas', image: 'https://i.pravatar.cc/150?img=13' },
  { id: 'maya', name: 'Maya', image: 'https://i.pravatar.cc/150?img=9' },
  { id: 'alex', name: 'Alex', image: 'https://i.pravatar.cc/150?img=15' },
]

export default function CreateVideoPage() {
  const [script, setScript] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState('emma')
  const [credits, setCredits] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    loadUserCredits()
  }, [])

  async function loadUserCredits() {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    const { data } = await supabase
      .from('users')
      .select('credits')
      .eq('id', user.id)
      .single()

    if (data) setCredits(data.credits)
  }

  async function handleGenerate() {
    if (!script.trim()) {
      setError('Le script ne peut pas être vide')
      return
    }

    if (script.length < 20) {
      setError('Le script doit faire au moins 20 caractères')
      return
    }

    if (credits < 10) {
      setError('Pas assez de crédits ! (10 crédits requis)')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script,
          avatarId: selectedAvatar
        })
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      // Redirige vers la page de visualisation
      router.push(`/video/${data.videoId}`)

    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <a href="/dashboard" className="text-xl font-bold">← Retour</a>
          <div className="text-sm">
            <span className="text-gray-600">Crédits : </span>
            <span className="font-bold text-lg">{credits}</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Créer une vidéo UGC</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Script */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <label className="block text-lg font-medium mb-3">
            📝 Écris ton script
          </label>
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder="Exemple : Hey ! Tu cherches un sac ultra-léger ? J'ai trouvé celui-ci et franchement, game changer. Il est waterproof, il rentre mon laptop, ma gourde, tout ! Le meilleur ? 30€ seulement. Lien en bio !"
            rows={8}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-sm text-gray-500">
              {script.length} caractères {script.length < 20 && '(min 20)'}
            </p>
            <p className="text-sm text-gray-500">
              ~{Math.ceil(script.length / 200)} seconde(s) de vidéo
            </p>
          </div>
        </div>

        {/* Avatars */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <label className="block text-lg font-medium mb-4">
            👤 Choisis un avatar
          </label>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {avatars.map(avatar => (
              <div
                key={avatar.id}
                onClick={() => setSelectedAvatar(avatar.id)}
                className={`
                  cursor-pointer rounded-lg p-3 text-center transition-all
                  ${selectedAvatar === avatar.id 
                    ? 'ring-4 ring-blue-500 bg-blue-50' 
                    : 'border-2 border-gray-200 hover:border-blue-300'
                  }
                `}
              >
                <img
                  src={avatar.image}
                  alt={avatar.name}
                  className="w-20 h-20 rounded-full mx-auto mb-2 object-cover"
                />
                <p className="text-sm font-medium">{avatar.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <label className="block text-lg font-medium mb-4">
            ⚙️ Options
          </label>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input type="checkbox" className="w-5 h-5" defaultChecked />
              <div>
                <div className="font-medium">Sous-titres automatiques</div>
                <div className="text-sm text-gray-500">+0 crédit</div>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input type="checkbox" className="w-5 h-5" />
              <div>
                <div className="font-medium">Ajouter B-roll</div>
                <div className="text-sm text-gray-500">+5 crédits</div>
              </div>
            </label>
          </div>
        </div>

        {/* Bouton */}
        <button
          onClick={handleGenerate}
          disabled={loading || !script || credits < 10}
          className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg transition"
        >
          {loading ? (
            '⏳ Génération en cours...'
          ) : (
            `🎬 Générer la vidéo (10 crédits)`
          )}
        </button>

        {credits < 10 && (
          <p className="text-center text-red-600 mt-4">
            ⚠️ Pas assez de crédits. <a href="/pricing" className="underline">Acheter des crédits</a>
          </p>
        )}
      </main>
    </div>
  )
}
