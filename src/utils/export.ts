import * as XLSX from 'xlsx'

export function exportXlsx(rows: any[], loteCodigo: string) {
  const data = rows.map(r => ({
    Fecha: new Date(r.created_at).toLocaleString('es-PE'),
    Nombre: r.nombre,
    Celular: r.telefono,
    Dulce: r.humita_dulce,
    Salada: r.humita_salada,
    MedioPago: r.medio_pago,
    Monto: Number(r.monto_est||0),
    Pagado: r.pagado ? 'Sí' : 'No',
    Comentarios: r.comentarios || ''
  }))
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(data)
  XLSX.utils.book_append_sheet(wb, ws, 'Pedidos')
  const fname = `${loteCodigo}.xlsx`
  XLSX.writeFile(wb, fname)
}
