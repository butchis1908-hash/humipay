import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

type Lote = {
  id: string
  codigo: string
  estado: 'abierto' | 'cerrado'
  fecha_inicio: string
  fecha_limite: string
  fecha_fin: string | null
  notas: string | null
}

export default function LotsPanel() {
  const [lotes, setLotes] = useState<Lote[]>([])
  const [codigo, setCodigo] = useState('')
  const [fechaLimite, setFechaLimite] = useState('')
  const [notas, setNotas] = useState('')
  const [loading, setLoading] = useState(false)

  async function fetchLotes() {
    setLoading(true)
    const { data } = await supabase
      .from('lotes')
      .select('*')
      .order('fecha_inicio', { ascending: false })
    setLotes(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchLotes() }, [])

  async function crearLote(e: React.FormEvent) {
    e.preventDefault()
    if (!codigo || !fechaLimite) return alert('Completa código y fecha límite')
    const { error } = await supabase.from('lotes').insert({
      codigo,
      fecha_limite: new Date(fechaLimite).toISOString(),
      estado: 'cerrado',
      notas: notas || null,
    })
    if (error) return alert(error.message)
    setCodigo(''); setFechaLimite(''); setNotas('')
    fetchLotes()
  }

  async function abrirLote(id: string) {
    // Cierra el que esté abierto (si hay)
    const { data: abiertos } = await supabase.from('lotes').select('id').eq('estado', 'abierto')
    if (abiertos && abiertos.length > 0) {
      const ids = abiertos.map(l => l.id)
      await supabase
        .from('lotes')
        .update({ estado: 'cerrado', fecha_fin: new Date().toISOString() })
        .in('id', ids)
    }
    await supabase
      .from('lotes')
      .update({ estado: 'abierto', fecha_inicio: new Date().toISOString(), fecha_fin: null })
      .eq('id', id)
    fetchLotes()
  }

  async function cerrarLote(id: string) {
    await supabase
      .from('lotes')
      .update({ estado: 'cerrado', fecha_fin: new Date().toISOString() })
      .eq('id', id)
    fetchLotes()
  }

  async function eliminarLote(lote: Lote) {
    if (lote.estado === 'abierto') {
      alert(`No puedes eliminar ${lote.codigo} porque está ABIERTO. Ciérralo primero.`)
      return
    }

    // Verifica si tiene pedidos
    const { count, error } = await supabase
      .from('pedidos')
      .select('id', { head: true, count: 'exact' })
      .eq('lote_id', lote.id)
    if (error) {
      alert('No se pudo verificar pedidos del lote. Intenta de nuevo.')
      return
    }
    if ((count ?? 0) > 0) {
      alert(`${lote.codigo} tiene ${count} pedido(s). Por seguridad no se elimina.\nElimina primero sus pedidos si realmente deseas borrarlo.`)
      return
    }

    const ok = confirm(`¿Eliminar definitivamente ${lote.codigo}? Esta acción no se puede deshacer.`)
    if (!ok) return

    const { error: delErr } = await supabase.from('lotes').delete().eq('id', lote.id)
    if (delErr) {
      alert('No se pudo eliminar el lote. Revisa permisos o dependencias.')
      return
    }
    fetchLotes()
  }

  return (
    <div className="bg-white border rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Lotes</h3>
        <button
          onClick={fetchLotes}
          className="px-3 py-1.5 rounded-lg border hover:bg-gray-50 text-sm"
          disabled={loading}
          title="Actualizar lotes"
        >
          {loading ? 'Actualizando…' : 'Actualizar'}
        </button>
      </div>

      {/* Crear lote (entra cerrado por defecto) */}
      <form onSubmit={crearLote} className="grid md:grid-cols-4 gap-3 mb-4">
        <input
          placeholder="Código (ej. Lote 001)"
          className="border rounded-lg px-3 py-2"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
        />
        <input
          type="datetime-local"
          className="border rounded-lg px-3 py-2"
          value={fechaLimite}
          onChange={(e) => setFechaLimite(e.target.value)}
        />
        <input
          placeholder="Notas (opcional)"
          className="border rounded-lg px-3 py-2 md:col-span-1"
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
        />
        <button className="px-3 py-2 rounded-lg bg-humi-warm text-white hover:bg-humi-deep">
          Crear (cerrado)
        </button>
      </form>

      {/* Tabla de lotes */}
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
            {lotes.map((l) => (
              <tr key={l.id} className="border-t">
                <td className="p-2">{l.codigo}</td>
                <td className="p-2">
                  <span className={'px-2 py-1 rounded text-white ' + (l.estado === 'abierto' ? 'bg-green-600' : 'bg-gray-400')}>
                    {l.estado}
                  </span>
                </td>
                <td className="p-2">{l.fecha_inicio ? new Date(l.fecha_inicio).toLocaleString('es-PE') : '-'}</td>
                <td className="p-2">{new Date(l.fecha_limite).toLocaleString('es-PE')}</td>
                <td className="p-2">{l.fecha_fin ? new Date(l.fecha_fin).toLocaleString('es-PE') : '-'}</td>
                <td className="p-2 space-x-2">
                  <button
                    onClick={() => abrirLote(l.id)}
                    className="px-2 py-1 border rounded hover:bg-gray-50"
                    title="Abrir lote (cierra otros)"
                  >
                    Abrir
                  </button>
                  <button
                    onClick={() => cerrarLote(l.id)}
                    className="px-2 py-1 border rounded hover:bg-gray-50"
                    title="Cerrar lote"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={() => eliminarLote(l)}
                    className={
                      'px-2 py-1 border rounded hover:bg-red-50 ' +
                      (l.estado === 'abierto'
                        ? 'opacity-50 cursor-not-allowed'
                        : 'border-red-300 text-red-700')
                    }
                    title={
                      l.estado === 'abierto'
                        ? 'No se puede eliminar un lote abierto'
                        : 'Eliminar lote'
                    }
                    disabled={l.estado === 'abierto'}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {lotes.length === 0 && (
              <tr>
                <td className="p-4 text-center text-gray-500" colSpan={6}>
                  {loading ? 'Cargando…' : 'Sin lotes para mostrar.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
