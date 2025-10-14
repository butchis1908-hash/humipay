import { ReactNode } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function AdminShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate()

  async function logout() {
    await supabase.auth.signOut()
    // Ir al home del SPA; con _redirects, Netlify no dará 404
    navigate('/')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-xl">Panel administrador</h2>
        <button onClick={logout} className="text-sm rounded-md px-3 py-1 border hover:bg-gray-50">
          Cerrar sesión
        </button>
      </div>
      {children}
    </div>
  )
}

