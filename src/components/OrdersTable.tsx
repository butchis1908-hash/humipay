import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { exportXlsx } from '../utils/export'

type Lote = { id: string; codigo: string }
type Pedido = {
  id: string; nombre: string; telefono: string; humita_dulce: number; humita_salada: number;
  medio_pago: 'yape'|'plin'|'efectivo'; monto_est: number; pagado: boolean; comentarios: string | null; created_at: string;
}

export default function OrdersTable() {
  const [lotes, setLotes] = useState<Lote[]>([])
  const [loteId, setLoteId] = useState<string>('')
  const [items, setItems] = useState<Pedido[]>([])
  const [q, setQ] = useState('')
  const [fPago, setFPago] = useState<string>('all')
  const [fPagado, setFPagado] = useState<string>('all')

  async function fetchLotes() {
    const { data } = await supabase.from('lotes').select('id,codigo').order('fecha_inicio', { ascending: false })
    setLotes(data || [])
    if (data && data.length > 0 && !loteId) setLoteId(data[0].id)
  }

  async function fetchPedidos() {
    if (!loteId) return
    const { data } = await supabase.from('pedidos').select('*').eq('lote_id', loteId).order('created_at', { ascending: false })
    setItems(data || [])
  }

  useEffect(()=>{ fetchLotes() }, [])
  useEffect(()=>{ fetchPedidos() }, [loteId])

  async function togglePagado(p: Pedido) {
    await supabase.from('pedidos').update({ pagado: !p.pagado }).eq('id', p.id)
    fetchPedidos()
  }

  const filtered = useMemo(()=> {
    return items.filter(p => {
      const okQ = q ? (p.nombre.toLowerCase().includes(q.toLowerCase()) || p.telefono.includes(q)) : true
      const okPago = fPago==='all' ? true : p.medio_pago===fPago as any
      const okPagado = fPagado==='all' ? true : (fPagado==='si' ? p.pagado : !p.pagado)
      return okQ && okPago && okPagado
    })
  }, [items, q, fPago, fPagado])

  const totals = useMemo(()=> {
    const t = filtered.reduce((acc, p) => {
      acc.dulce += p.humita_dulce
      acc.salada += p.humita_salada
      acc.monto += Number(p.monto_est||0)
      acc.count += 1
      return acc
    }, { dulce:0, salada:0, monto:0, count:0 })
    return t
  }, [filtered])

  // === NUEVO: KPIs pagados vs no pagados ===
  const paidCount = useMemo(() => filtered.filter(p => p.pagado).length, [filtered])
  const unpaidCount = useMemo(() => Math.max(filtered.length - paidCount, 0), [filtered, paidCount])
  const percentPaid = filtered.length ? Math.round((paidCount / filtered.length) * 100) : 0

  function onExport() {
    const lote = lotes.find(l => l.id===loteId)
    exportXlsx(filtered, lote ? lote.codigo : 'Lote')
  }

  return (
    <div className="bg-white border rounded-2xl p-4 shadow-sm space-y-3">
      <h3 className="font-semibold">Pedidos</h3>

      {/* Filtros y selección de lote */}
      <div className="grid md:grid-cols-4 gap-3">
        <select className="border rounded-lg px-3 py-2" value={loteId} onChange={e=>setLoteId(e.target.value)}>
          {lotes.map(l => <option key={l.id} value={l.id}>{l.codigo}</option>)}
        </select>
        <input placeholder="Buscar por nombre o celular" className="border rounded-lg px-3 py-2" value={q} onChange={e=>setQ(e.target.value)} />
        <select className="border rounded-lg px-3 py-2" value={fPago} onChange={e=>setFPago(e.target.value)}>
          <option value="all">Todos los pagos</option>
          <option value="yape">Yape</option>
          <option value="plin">Plin</option>
          <option value="efectivo">Efectivo</option>
        </select>
        <select className="border rounded-lg px-3 py-2" value={fPagado} onChange={e=>setFPagado(e.target.value)}>
          <option value="all">Pagados y no pagados</option>
          <option value="si">Solo pagados</option>
          <option value="no">Solo no pagados</option>
        </select>
      </div>

      {/* NUEVO: KPIs y barra de progreso */}
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="rounded-xl border p-4 bg-orange-50">
          <div className="text-sm text-gray-600">Pedidos</div>
          <div className="text-2xl font-bold">{totals.count}</div>
        </div>
        <div className="rounded-xl border p-4 bg-green-50">
          <div className="text-sm text-gray-600">Pagados</div>
          <div className="text-2xl font-bold">{paidCount}</div>
        </div>
        <div className="rounded-xl border p-4 bg-red-50">
          <div className="text-sm text-gray-600">Pendientes de pago</div>
          <div className="text-2xl font-bold">{unpaidCount}</div>
        </div>
      </div>

      <div className="rounded-xl border p-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-700">Progreso de pagos</span>
          <span className="font-medium">{percentPaid}%</span>
        </div>
        <div className="w-full h-3 rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-3 bg-green-600"
            style={{ width: `${percentPaid}%` }}
          />
        </div>
      </div>

      {/* Totales y export */}
      <div className="flex items-center justify-between text-sm text-gray-700">
        <div>
          Pedidos: <b>{totals.count}</b> • Dulce: <b>{totals.dulce}</b> • Salada: <b>{totals.salada}</b> • Total: <b>S/ {totals.monto.toFixed(2)}</b>
        </div>
        <button onClick={onExport} className="px-3 py-1.5 rounded-lg bg-humi-warm text-white hover:bg-humi-deep">
          Exportar Excel
        </button>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="p-2">Fecha</th>
              <th className="p-2">Nombre</th>
              <th className="p-2">Celular</th>
              <th className="p-2">Dulce</th>
              <th className="p-2">Salada</th>
              <th className="p-2">Pago</th>
              <th className="p-2">Monto</th>
              <th className="p-2">Pagado</th>
              <th className="p-2">Comentarios</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-t">
                <td className="p-2">{new Date(p.created_at).toLocaleString('es-PE')}</td>
                <td className="p-2">{p.nombre}</td>
                <td className="p-2">{p.telefono}</td>
                <td className="p-2">{p.humita_dulce}</td>
                <td className="p-2">{p.humita_salada}</td>
                <td className="p-2">{p.medio_pago}</td>
                <td className="p-2">S/ {Number(p.monto_est||0).toFixed(2)}</td>
                <td className="p-2">
                  <button onClick={()=>togglePagado(p)} className={"px-2 py-1 rounded text-white " + (p.pagado?'bg-green-600':'bg-gray-400')}>
                    {p.pagado ? 'Sí' : 'No'}
                  </button>
                </td>
                <td className="p-2">{p.comentarios || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

