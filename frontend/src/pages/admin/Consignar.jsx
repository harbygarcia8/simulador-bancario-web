import { useEffect, useState } from 'react'
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap'
import { api, mensajeError } from '../../api/client.js'
import { formatCOP } from '../../utils/format.js'

export default function Consignar() {
  const [cuentas, setCuentas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [cuentaId, setCuentaId] = useState('')
  const [valor, setValor] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const [enviando, setEnviando] = useState(false)

  const cargarCuentas = () => {
    api
      .get('/admin/cuentas')
      .then((res) => {
        const activas = res.data.cuentas.filter((c) => c.estado === 'ACTIVA')
        setCuentas(activas)
        if (activas.length) setCuentaId(String(activas[0].id))
      })
      .catch((err) => setError(mensajeError(err)))
      .finally(() => setCargando(false))
  }

  useEffect(() => {
    cargarCuentas()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setOk('')
    setEnviando(true)
    try {
      const res = await api.post('/admin/consignaciones', {
        cuentaId: Number(cuentaId),
        valor: Number(valor),
        descripcion: descripcion.trim() || undefined,
      })
      setOk(`${res.data.message} Nuevo saldo: ${formatCOP(res.data.saldo)}`)
      setValor('')
      setDescripcion('')
      cargarCuentas()
    } catch (err) {
      setError(mensajeError(err, 'No se pudo realizar la consignación.'))
    } finally {
      setEnviando(false)
    }
  }

  if (cargando) return <div className="text-center mt-5"><Spinner animation="border" /></div>

  return (
    <Container>
      <h2 className="mb-3">Realizar consignación</h2>
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-4">
              {error && <Alert variant="danger">{error}</Alert>}
              {ok && <Alert variant="success">{ok}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Cuenta destino</Form.Label>
                  <Form.Select value={cuentaId} onChange={(e) => setCuentaId(e.target.value)} required>
                    {cuentas.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.numero_cuenta} · {c.nombre} {c.apellido} · {formatCOP(c.saldo)}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Valor a consignar</Form.Label>
                  <Form.Control
                    type="number" min="1" step="0.01"
                    value={valor} onChange={(e) => setValor(e.target.value)}
                    placeholder="Ej: 100000" required
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Descripción (opcional)</Form.Label>
                  <Form.Control
                    value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
                    maxLength={150} placeholder="Ej: Consignación en caja"
                  />
                </Form.Group>

                <div className="d-grid">
                  <Button type="submit" variant="primary" disabled={enviando || !cuentaId}>
                    {enviando ? 'Procesando…' : 'Consignar'}
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
