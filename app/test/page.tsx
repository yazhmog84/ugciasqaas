// app/test/page.tsx

'use client'

import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'

export default function TestPage() {
  const [status, setStatus] = useState('Testing...')

  useEffect(() => {
    testConnection()
  }, [])

  async function testConnection() {
    try {
      // Test 1 : Connexion
      console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
      
      // Test 2 : Query simple
      const { data, error } = await supabase.from('users').select('count')
      
      if (error) {
        setStatus('❌ Erreur : ' + error.message)
      } else {
        setStatus('✅ Connexion OK !')
      }
      
      console.log('Résultat test:', data, error)
      
    } catch (err: any) {
      setStatus('❌ Exception : ' + err.message)
      console.error(err)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Test Supabase</h1>
      <div className="text-lg">{status}</div>
    </div>
  )
}
