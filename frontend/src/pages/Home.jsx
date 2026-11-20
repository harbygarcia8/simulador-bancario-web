import { Container, Row, Col, Card } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'

const modulos = [
  {
    icono: '🧑‍💼',
    titulo: 'Banca Virtual',
    texto: 'Consulta tu saldo, movimientos y realiza transferencias.',
    ruta: '/login',
    color: 'primary',
  },
  {
    icono: '🛠️',
    titulo: 'Administración',
    texto: 'Gestiona clientes, cuentas, consignaciones y reportes.',
    ruta: '/login',
    color: 'dark',
  },
  {
    icono: '🏧',
    titulo: 'Cajero Automático',
    texto: 'Ingresa con tu número de cuenta y PIN para retirar.',
    ruta: '/cajero',
    color: 'success',
  },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <Container>
      <div className="text-center mb-5">
        <h1 className="fw-bold">🏦 Simulador Bancario Web</h1>
        <p className="text-muted fs-5">Elige un módulo para comenzar</p>
      </div>

      <Row className="g-4 justify-content-center">
        {modulos.map((m) => (
          <Col key={m.titulo} md={6} lg={4}>
            <Card
              className="modulo-card text-center shadow-sm border-0"
              onClick={() => navigate(m.ruta)}
              role="button"
            >
              <Card.Body className="py-5">
                <div style={{ fontSize: '3.5rem' }}>{m.icono}</div>
                <Card.Title className={`mt-3 text-${m.color}`}>{m.titulo}</Card.Title>
                <Card.Text className="text-muted">{m.texto}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  )
}
