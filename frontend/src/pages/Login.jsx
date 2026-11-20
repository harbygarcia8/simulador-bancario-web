import { useState } from 'react'
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import { mensajeError } from '../api/client.js'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setEnviando(true)
    try {
      const user = await login(email, password)
      navigate(user.rol === 'ADMIN' ? '/admin' : '/cliente', { replace: true })
    } catch (err) {
      setError(mensajeError(err, 'No se pudo iniciar sesión.'))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="shadow-sm border-0 mt-4">
            <Card.Body className="p-4">
              <h3 className="text-center mb-4">Iniciar sesión</h3>

              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Correo electrónico</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tucorreo@banco.com"
                    required
                    autoFocus
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="password">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </Form.Group>

                <div className="d-grid">
                  <Button type="submit" variant="primary" disabled={enviando}>
                    {enviando ? 'Ingresando…' : 'Ingresar'}
                  </Button>
                </div>
              </Form>

              <hr className="my-4" />
              <div className="small text-muted">
                <strong>Usuarios de prueba:</strong>
                <ul className="mb-0 ps-3">
                  <li>Admin: <code>admin@banco.com</code> / <code>Admin123</code></li>
                  <li>Cliente: <code>ana@banco.com</code> / <code>Cliente123</code></li>
                </ul>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
