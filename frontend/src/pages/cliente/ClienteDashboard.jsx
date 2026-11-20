import { useEffect, useState } from 'react'
import { Container, Row, Col, Card, Badge, Spinner, Alert, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { api, mensajeError } from '../../api/client.js'
import { useAuth } from '../../auth/AuthContext.jsx'
import { formatCOP } from '../../utils/format.js'

export default function ClienteDashboard() {
  const { user } = useAuth()
  const [cuentas, setCuentas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/client/cuentas')
      .then((res) => setCuentas(res.data.cuentas))
      .catch((err) => setError(mensajeError(err)))
      .finally(() => setCargando(false))
  }, [])

  if (cargando) {
    return <div className="text-center mt-5"><Spinner animation="border" /></div>
  }

  return (
    <Container>
      <h2 className="mb-1">Hola, {user?.nombre} 👋</h2>
      <p className="text-muted">Este es el resumen de tus cuentas.</p>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="g-4">
        {cuentas.map((c) => (
          <Col key={c.id} md={6} lg={4}>
            <Card className="shadow-sm border-0">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <Card.Subtitle className="text-muted">Cuenta {c.tipo}</Card.Subtitle>
                    <code className="d-block mb-2">{c.numero_cuenta}</code>
                  </div>
                  <Badge bg={c.estado === 'ACTIVA' ? 'success' : 'secondary'}>{c.estado}</Badge>
                </div>
                <div className="saldo-grande text-primary">{formatCOP(c.saldo)}</div>
                <Card.Text className="text-muted small">Saldo disponible</Card.Text>
                <div className="d-flex gap-2">
                  <Button as={Link} to="/cliente/transferir" size="sm" variant="primary">Transferir</Button>
                  <Button as={Link} to="/cliente/movimientos" size="sm" variant="outline-secondary">Movimientos</Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {cuentas.length === 0 && !error && (
        <Alert variant="info">Aún no tienes cuentas asociadas.</Alert>
      )}
    </Container>
  )
}
