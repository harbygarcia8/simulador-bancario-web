import { useEffect, useState } from 'react'
import { Container, Card, Spinner, Alert } from 'react-bootstrap'
import { api, mensajeError } from '../../api/client.js'
import MovimientosTable from '../../components/MovimientosTable.jsx'

export default function MovimientosGenerales() {
  const [movimientos, setMovimientos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/admin/movimientos')
      .then((res) => setMovimientos(res.data.movimientos))
      .catch((err) => setError(mensajeError(err)))
      .finally(() => setCargando(false))
  }, [])

  return (
    <Container>
      <h2 className="mb-3">Historial general de movimientos</h2>

      <Card className="shadow-sm border-0">
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {cargando ? (
            <div className="text-center my-4"><Spinner animation="border" /></div>
          ) : (
            <MovimientosTable movimientos={movimientos} mostrarCuenta mostrarTitular />
          )}
        </Card.Body>
      </Card>
    </Container>
  )
}
