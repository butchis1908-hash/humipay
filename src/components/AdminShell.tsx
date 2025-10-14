import { ReactNode } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function AdminShell({ children }: { children: ReactNode }) {
  async function logout() {
    await supabase.auth.signOut()
    window.location.reload()
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-xl">Panel administrador</h2>
        <button onClick={logout} className="text-sm rounded-md px-3 py-1 border hover:bg-gray-50">Cerrar sesión</button>
      </div>
      {children}
    </div>
  )
}
