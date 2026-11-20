import { useState } from 'react'
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { api, mensajeError } from '../../api/client.js'

const inicial = {
  nombre: '', apellido: '', tipoDocumento: 'CC', documento: '', email: '',
  telefono: '', direccion: '', password: '', tipoCuenta: 'AHORROS', pin: '', saldoInicial: '0',
}

export default function CrearCliente() {
  const navigate = useNavigate()
  const [form, setForm] = useState(inicial)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const [enviando, setEnviando] = useState(false)

  const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setOk('')
    setEnviando(true)
    try {
      const res = await api.post('/admin/clientes', {
        ...form,
        saldoInicial: Number(form.saldoInicial) || 0,
      })
      setOk(`Cliente creado. Número de cuenta: ${res.data.cliente.numeroCuenta}`)
      setForm(inicial)
      setTimeout(() => navigate(`/admin/clientes/${res.data.cliente.id}`), 1200)
    } catch (err) {
      setError(mensajeError(err, 'No se pudo crear el cliente.'))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Container>
      <h2 className="mb-3">Crear cliente</h2>
      <Row className="justify-content-center">
        <Col lg={9}>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-4">
              {error && <Alert variant="danger">{error}</Alert>}
              {ok && <Alert variant="success">{ok}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nombre *</Form.Label>
                      <Form.Control value={form.nombre} onChange={set('nombre')} required />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Apellido *</Form.Label>
                      <Form.Control value={form.apellido} onChange={set('apellido')} required />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Tipo documento *</Form.Label>
                      <Form.Select value={form.tipoDocumento} onChange={set('tipoDocumento')}>
                        <option value="CC">CC</option>
                        <option value="CE">CE</option>
                        <option value="TI">TI</option>
                        <option value="PASAPORTE">Pasaporte</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={8}>
                    <Form.Group className="mb-3">
                      <Form.Label>Documento *</Form.Label>
                      <Form.Control value={form.documento} onChange={set('documento')} required />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email *</Form.Label>
                      <Form.Control type="email" value={form.email} onChange={set('email')} required />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Teléfono</Form.Label>
                      <Form.Control value={form.telefono} onChange={set('telefono')} />
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Dirección</Form.Label>
                      <Form.Control value={form.direccion} onChange={set('direccion')} />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Contraseña (banca virtual) *</Form.Label>
                      <Form.Control type="text" value={form.password} onChange={set('password')} minLength={6} required />
                      <Form.Text className="text-muted">Mínimo 6 caracteres.</Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>PIN cajero (4 dígitos) *</Form.Label>
                      <Form.Control value={form.pin} onChange={set('pin')} maxLength={4} pattern="\d{4}" required />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Tipo de cuenta *</Form.Label>
                      <Form.Select value={form.tipoCuenta} onChange={set('tipoCuenta')}>
                        <option value="AHORROS">Ahorros</option>
                        <option value="CORRIENTE">Corriente</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Saldo inicial</Form.Label>
                      <Form.Control type="number" min="0" step="0.01" value={form.saldoInicial} onChange={set('saldoInicial')} />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex gap-2">
                  <Button type="submit" variant="primary" disabled={enviando}>
                    {enviando ? 'Creando…' : 'Crear cliente'}
                  </Button>
                  <Button variant="outline-secondary" onClick={() => navigate('/admin/clientes')}>
                    Cancelar
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
