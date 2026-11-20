const copFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

/** Formatea un número/string como moneda colombiana: 1000000 -> $1.000.000 */
export function formatCOP(valor) {
  const n = Number(valor)
  if (!Number.isFinite(n)) return '$0'
  return copFormatter.format(n)
}

/** Formatea una fecha ISO a algo legible: 2026-11-20 14:35 */
export function formatFecha(fecha) {
  if (!fecha) return ''
  const d = new Date(fecha)
  if (Number.isNaN(d.getTime())) return String(fecha)
  return d.toLocaleString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Etiqueta legible para el tipo de movimiento. */
export function etiquetaTipo(tipo) {
  const mapa = {
    CONSIGNACION: 'Consignación',
    RETIRO: 'Retiro',
    TRANSFERENCIA_ENVIADA: 'Transferencia enviada',
    TRANSFERENCIA_RECIBIDA: 'Transferencia recibida',
  }
  return mapa[tipo] || tipo
}
