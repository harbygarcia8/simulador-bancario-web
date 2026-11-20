import { useEffect, useState } from 'react'
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap'
import { api, mensajeError } from '../../api/client.js'
import { formatCOP } from '../../utils/format.js'

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/admin/dashboard')
      .then((res) => setData(res.data))
      .catch((err) => setError(mensajeError(err)))
      .finally(() => setCargando(false))
  }, [])

  if (cargando) return <div className="text-center mt-5"><Spinner animation="border" /></div>
  if (error) return <Container><Alert variant="danger">{error}</Alert></Container>

  const metricas = [
    { titulo: 'Total clientes', valor: data.totalClientes, color: 'primary', icono: '👥' },
    { titulo: 'Clientes activos', valor: data.clientesActivos, color: 'success', icono: '✅' },
    { titulo: 'Clientes bloqueados', valor: data.clientesBloqueados, color: 'danger', icono: '🔒' },
    { titulo: 'Cuentas activas', valor: data.cuentasActivas, color: 'info', icono: '💳' },
  ]

  return (
    <Container>
      <h2 className="mb-4">Dashboard administrativo</h2>

      <Row className="g-4 mb-4">
        {metricas.map((m) => (
          <Col key={m.titulo} sm={6} lg={3}>
            <Card className={`shadow-sm border-0 border-start border-4 border-${m.color}`}>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-muted small">{m.titulo}</div>
                    <div className="fs-2 fw-bold">{m.valor}</div>
                  </div>
                  <div style={{ fontSize: '2rem' }}>{m.icono}</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="shadow-sm border-0 bg-primary text-white">
        <Card.Body className="d-flex justify-content-between align-items-center">
          <div>
            <div className="text-white-50">Suma total de saldos del banco</div>
            <div className="display-6 fw-bold">{formatCOP(data.sumaSaldos)}</div>
          </div>
          <div style={{ fontSize: '3rem' }}>💰</div>
        </Card.Body>
      </Card>
    </Container>
  )
}
