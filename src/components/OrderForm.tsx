import { useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

type Props = {
  lote_id: string
  precioUnit: number
  telefonoPago: string
}

export default function OrderForm({ lote_id, precioUnit, telefonoPago }: Props) {
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [dulce, setDulce] = useState(0)
  const [salada, setSalada] = useState(0)
  const [medioPago, setMedioPago] = useState<'yape'|'plin'|'efectivo'>('yape')
  const [comentarios, setComentarios] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [ok, setOk] = useState<string | null>(null)
  const total = useMemo(() => (dulce + salada) * precioUnit, [dulce, salada, precioUnit])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setOk(null)
    if (!nombre.trim() || !telefono.trim()) {
      alert('Ingresa nombre y celular.')
      return
    }
    if ((dulce + salada) <= 0) {
      alert('Selecciona al menos 1 humita.')
      return
    }
    setEnviando(true)
    const { error } = await supabase.from('pedidos').insert({
      lote_id,
      nombre: nombre.trim(),
      telefono: telefono.trim(),
      humita_dulce: dulce,
      humita_salada: salada,
      medio_pago: medioPago,
      monto_est: total,
      comentarios: comentarios.trim() || null,
    })
    setEnviando(false)
    if (error) {
      console.error(error)
      alert('No se pudo registrar el pedido. Intenta de nuevo.')
      return
    }
    setOk(`¡Pedido enviado! Si pagas por Yape/Plin usa el número ${telefonoPago}. Total estimado: S/ ${total}.`)
    setNombre(''); setTelefono(''); setDulce(0); setSalada(0); setComentarios('')
  }

  return (
    <div className="bg-white border rounded-2xl p-4 shadow-sm">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input className="mt-1 w-full border rounded-lg px-3 py-2" value={nombre} onChange={e=>setNombre(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Celular</label>
            <input className="mt-1 w-full border rounded-lg px-3 py-2" value={telefono} onChange={e=>setTelefono(e.target.value)} required />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Humita dulce</label>
            <input type="number" min={0} className="mt-1 w-full border rounded-lg px-3 py-2" value={dulce} onChange={e=>setDulce(parseInt(e.target.value||'0'))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Humita salada</label>
            <input type="number" min={0} className="mt-1 w-full border rounded-lg px-3 py-2" value={salada} onChange={e=>setSalada(parseInt(e.target.value||'0'))} />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Medio de pago</label>
            <select className="mt-1 w-full border rounded-lg px-3 py-2" value={medioPago} onChange={e=>setMedioPago(e.target.value as any)}>
              <option value="yape">Yape</option>
              <option value="plin">Plin</option>
              <option value="efectivo">Efectivo</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Total estimado</label>
            <div className="mt-1 w-full border rounded-lg px-3 py-2 bg-gray-50">S/ {total}</div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Comentarios (opcional)</label>
          <textarea className="mt-1 w-full border rounded-lg px-3 py-2" rows={3} value={comentarios} onChange={e=>setComentarios(e.target.value)} />
        </div>
        <div className="flex items-center gap-3">
          <button disabled={enviando} className="px-4 py-2 rounded-lg bg-humi-warm text-white hover:bg-humi-deep disabled:opacity-50">Enviar pedido</button>
          <span className="text-sm text-gray-600">Al enviar, verás el número para Yape/Plin.</span>
        </div>
      </form>
      {ok && (
        <div className="mt-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">{ok}</div>
      )}
    </div>
  )
}
