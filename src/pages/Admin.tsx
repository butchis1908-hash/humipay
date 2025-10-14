import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import AdminLogin from '../components/AdminLogin'
import AdminShell from '../components/AdminShell'
import LotsPanel from '../components/LotsPanel'
import OrdersTable from '../components/OrdersTable'

export default function Admin() {
  const [ready, setReady] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setChecking(false); return }
      const { data: prof } = await supabase.from('profiles').select('is_admin').single()
      if (prof?.is_admin) setReady(true)
      setChecking(false)
    })()
  }, [])

  if (checking) return <div>Cargando...</div>
  if (!ready) return <AdminLogin onReady={() => setReady(True)} />

  return (
    <AdminShell>
      <div className="grid gap-4">
        <LotsPanel />
        <OrdersTable />
      </div>
    </AdminShell>
  )
}
