import { useEffect, useState } from 'react'
import { Container, Card, Form, Spinner, Alert } from 'react-bootstrap'
import { api, mensajeError } from '../../api/client.js'
import MovimientosTable from '../../components/MovimientosTable.jsx'

export default function Movimientos() {
  const [cuentas, setCuentas] = useState([])
  const [cuentaId, setCuentaId] = useState('')
  const [movimientos, setMovimientos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  // Carga las cuentas para el filtro
  useEffect(() => {
    api.get('/client/cuentas').then((res) => setCuentas(res.data.cuentas)).catch(() => {})
  }, [])

  // Carga movimientos (todos o por cuenta)
  useEffect(() => {
    setCargando(true)
    setError('')
    const url = cuentaId ? `/client/movimientos?cuentaId=${cuentaId}` : '/client/movimientos'
    api
      .get(url)
      .then((res) => setMovimientos(res.data.movimientos))
      .catch((err) => setError(mensajeError(err)))
      .finally(() => setCargando(false))
  }, [cuentaId])

  return (
    <Container>
      <h2 className="mb-3">Historial de movimientos</h2>

      <Card className="shadow-sm border-0">
        <Card.Body>
          <Form.Group className="mb-3" style={{ maxWidth: 320 }}>
            <Form.Label>Filtrar por cuenta</Form.Label>
            <Form.Select value={cuentaId} onChange={(e) => setCuentaId(e.target.value)}>
              <option value="">Todas mis cuentas</option>
              {cuentas.map((c) => (
                <option key={c.id} value={c.id}>{c.numero_cuenta} · {c.tipo}</option>
              ))}
            </Form.Select>
          </Form.Group>

          {error && <Alert variant="danger">{error}</Alert>}

          {cargando ? (
            <div className="text-center my-4"><Spinner animation="border" /></div>
          ) : (
            <MovimientosTable movimientos={movimientos} mostrarCuenta />
          )}
        </Card.Body>
      </Card>
    </Container>
  )
}
