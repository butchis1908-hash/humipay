import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

type Lote = {
  id: string; codigo: string; estado: 'abierto'|'cerrado'; fecha_inicio: string; fecha_limite: string; fecha_fin: string | null; notas: string | null
}

export default function LotsPanel() {
  const [lotes, setLotes] = useState<Lote[]>([])
  const [codigo, setCodigo] = useState('')
  const [fechaLimite, setFechaLimite] = useState('')
  const [notas, setNotas] = useState('')

  async function fetchLotes() {
    const { data } = await supabase.from('lotes').select('*').order('fecha_inicio', { ascending: false })
    setLotes(data || [])
  }
  useEffect(()=>{ fetchLotes() }, [])

  async function crearLote(e: React.FormEvent) {
    e.preventDefault()
    if (!codigo || !fechaLimite) return alert('Completa código y fecha límite')
    const { error } = await supabase.from('lotes').insert({
      codigo, fecha_limite: new Date(fechaLimite).toISOString(), estado: 'cerrado', notas: notas || null
    })
    if (error) return alert(error.message)
    setCodigo(''); setFechaLimite(''); setNotas('')
    fetchLotes()
  }

  async function abrirLote(id: string) {
    // cerrar cualquier abierto
    const { data: abiertos } = await supabase.from('lotes').select('id').eq('estado','abierto')
    if (abiertos && abiertos.length > 0) {
      const ids = abiertos.map(l=>l.id)
      await supabase.from('lotes').update({ estado:'cerrado', fecha_fin: new Date().toISOString() }).in('id', ids)
    }
    await supabase.from('lotes').update({ estado:'abierto', fecha_inicio: new Date().toISOString(), fecha_fin: null }).eq('id', id)
    fetchLotes()
  }

  async function cerrarLote(id: string) {
    await supabase.from('lotes').update({ estado:'cerrado', fecha_fin: new Date().toISOString() }).eq('id', id)
    fetchLotes()
  }

  return (
    <div className="bg-white border rounded-2xl p-4 shadow-sm">
      <h3 className="font-semibold mb-3">Lotes</h3>
      <form onSubmit={crearLote} className="grid md:grid-cols-4 gap-3 mb-4">
        <input placeholder="Código (ej. Lote 001)" className="border rounded-lg px-3 py-2" value={codigo} onChange={e=>setCodigo(e.target.value)} />
        <input type="datetime-local" className="border rounded-lg px-3 py-2" value={fechaLimite} onChange={e=>setFechaLimite(e.target.value)} />
        <input placeholder="Notas (opcional)" className="border rounded-lg px-3 py-2 md:col-span-1" value={notas} onChange={e=>setNotas(e.target.value)} />
        <button className="px-3 py-2 rounded-lg bg-humi-warm text-white hover:bg-humi-deep">Crear (cerrado)</button>
      </form>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="p-2">Código</th>
              <th className="p-2">Estado</th>
              <th className="p-2">Inicio</th>
              <th className="p-2">Límite</th>
              <th className="p-2">Fin</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {lotes.map(l => (
              <tr key={l.id} className="border-t">
                <td className="p-2">{l.codigo}</td>
                <td className="p-2">
                  <span className={"px-2 py-1 rounded text-white " + (l.estado==='abierto'?'bg-green-600':'bg-gray-400')}>{l.estado}</span>
                </td>
                <td className="p-2">{l.fecha_inicio ? new Date(l.fecha_inicio).toLocaleString('es-PE') : '-'}</td>
                <td className="p-2">{new Date(l.fecha_limite).toLocaleString('es-PE')}</td>
                <td className="p-2">{l.fecha_fin ? new Date(l.fecha_fin).toLocaleString('es-PE') : '-'}</td>
                <td className="p-2 space-x-2">
                  <button onClick={()=>abrirLote(l.id)} className="px-2 py-1 border rounded hover:bg-gray-50">Abrir</button>
                  <button onClick={()=>cerrarLote(l.id)} className="px-2 py-1 border rounded hover:bg-gray-50">Cerrar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
