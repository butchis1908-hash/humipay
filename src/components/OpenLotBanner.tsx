type Props = {
  codigo: string
  fecha_limite: string
}

export default function OpenLotBanner({ codigo, fecha_limite }: Props) {
  const fecha = new Date(fecha_limite)
  const f = fecha.toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })
  return (
    <div className="rounded-2xl p-4 bg-orange-100 border border-orange-200 mb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-humi-warm/20 flex items-center justify-center font-bold text-humi-deep">🍽️</div>
        <div>
          <div className="font-semibold text-gray-800">Lote activo: {codigo}</div>
          <div className="text-sm text-gray-600">Pedidos hasta el {f}</div>
        </div>
      </div>
    </div>
  )
}
