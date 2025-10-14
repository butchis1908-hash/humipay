import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

type Props = { onReady: () => void }

export default function AdminLogin({ onReady }: Props) {
  const [email, setEmail] = useState('admin@gmail.com')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function login(e: React.FormEvent) {
    e.preventDefault()
    setErr(null); setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) { setErr(error.message); return }
    // verify is_admin
    const { data: prof } = await supabase.from('profiles').select('is_admin').single()
    if (!prof?.is_admin) {
      setErr('Tu cuenta no tiene permisos de administrador.')
      await supabase.auth.signOut()
      return
    }
    onReady()
  }

  return (
    <div className="max-w-sm mx-auto bg-white border rounded-2xl p-4 shadow-sm">
      <h2 className="font-semibold text-lg mb-2">Acceso administrador</h2>
      <form onSubmit={login} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Correo</label>
          <input className="mt-1 w-full border rounded-lg px-3 py-2" value={email} onChange={e=>setEmail(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Contraseña</label>
          <input type="password" className="mt-1 w-full border rounded-lg px-3 py-2" value={password} onChange={e=>setPassword(e.target.value)} />
        </div>
        <button disabled={loading} className="px-4 py-2 rounded-lg bg-humi-warm text-white hover:bg-humi-deep disabled:opacity-50 w-full">Ingresar</button>
        {err && <div className="text-sm text-red-600">{err}</div>}
      </form>
    </div>
  )
}
