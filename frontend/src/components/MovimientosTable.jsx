import { Table, Badge } from 'react-bootstrap'
import { formatCOP, formatFecha, etiquetaTipo } from '../utils/format.js'

const colorTipo = {
  CONSIGNACION: 'success',
  RETIRO: 'danger',
  TRANSFERENCIA_ENVIADA: 'warning',
  TRANSFERENCIA_RECIBIDA: 'info',
}

/**
 * Tabla de movimientos reutilizable.
 * props:
 *  - movimientos: []
 *  - mostrarCuenta: muestra la columna de número de cuenta
 *  - mostrarTitular: muestra el nombre del titular (vista admin)
 */
export default function MovimientosTable({ movimientos, mostrarCuenta = false, mostrarTitular = false }) {
  if (!movimientos?.length) {
    return <p className="text-muted">No hay movimientos para mostrar.</p>
  }

  return (
    <div className="table-responsive">
      <Table hover className="align-middle">
        <thead>
          <tr>
            <th>Fecha</th>
            {mostrarTitular && <th>Titular</th>}
            {mostrarCuenta && <th>Cuenta</th>}
            <th>Tipo</th>
            <th>Descripción</th>
            <th className="text-end">Valor</th>
            <th className="text-end">Saldo resultante</th>
          </tr>
        </thead>
        <tbody>
          {movimientos.map((m) => {
            const valor = Number(m.valor)
            return (
              <tr key={m.id}>
                <td className="text-nowrap">{formatFecha(m.fecha)}</td>
                {mostrarTitular && <td>{m.nombre} {m.apellido}</td>}
                {mostrarCuenta && <td><code>{m.numero_cuenta}</code></td>}
                <td>
                  <Badge bg={colorTipo[m.tipo] || 'secondary'}>{etiquetaTipo(m.tipo)}</Badge>
                </td>
                <td>{m.descripcion}</td>
                <td className={`text-end fw-semibold ${valor < 0 ? 'valor-negativo' : 'valor-positivo'}`}>
                  {valor < 0 ? '-' : '+'}{formatCOP(Math.abs(valor))}
                </td>
                <td className="text-end">{formatCOP(m.saldo_resultante)}</td>
              </tr>
            )
          })}
        </tbody>
      </Table>
    </div>
  )
}
