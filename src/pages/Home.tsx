import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import OpenLotBanner from '../components/OpenLotBanner'
import OrderForm from '../components/OrderForm'

type Lote = { id: string; codigo: string; fecha_limite: string }

export default function Home() {
  const [lote, setLote] = useState<Lote | null>(null)
  const precio = Number(import.meta.env.VITE_PRICE_UNIT || 3)
  const numero = String(import.meta.env.VITE_CONTACT_NUMBER || '992427070')

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('lotes').select('id,codigo,fecha_limite').eq('estado','abierto').maybeSingle()
      setLote(data as any || null)
    })()
  }, [])

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Pide tus humitas</h1>
        <p className="text-gray-600">Precio unitario: <b>S/ {precio}</b></p>
      </div>
      {lote ? (
        <>
          <OpenLotBanner codigo={lote.codigo} fecha_limite={lote.fecha_limite} />
          <OrderForm lote_id={lote.id} precioUnit={precio} telefonoPago={numero} />
        </>
      ) : (
        <div className="bg-white border rounded-2xl p-6 text-center text-gray-700">
          Por ahora no hay pedidos activos. ¡Vuelve pronto!
        </div>
      )}
    </div>
  )
}
