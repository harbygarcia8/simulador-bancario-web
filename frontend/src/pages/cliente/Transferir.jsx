import { useEffect, useState } from 'react'
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap'
import { api, mensajeError } from '../../api/client.js'
import { formatCOP } from '../../utils/format.js'

export default function Transferir() {
  const [cuentas, setCuentas] = useState([])
  const [cargando, setCargando] = useState(true)

  const [cuentaOrigenId, setCuentaOrigenId] = useState('')
  const [numeroCuentaDestino, setNumeroCuentaDestino] = useState('')
  const [valor, setValor] = useState('')
  const [descripcion, setDescripcion] = useState('')

  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const [enviando, setEnviando] = useState(false)

  const cargarCuentas = () => {
    api
      .get('/client/cuentas')
      .then((res) => {
        setCuentas(res.data.cuentas)
        if (res.data.cuentas.length) setCuentaOrigenId(String(res.data.cuentas[0].id))
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
      const res = await api.post('/client/transferencias', {
        cuentaOrigenId: Number(cuentaOrigenId),
        numeroCuentaDestino: numeroCuentaDestino.trim(),
        valor: Number(valor),
        descripcion: descripcion.trim() || undefined,
      })
      setOk(`${res.data.message} Nuevo saldo: ${formatCOP(res.data.saldoOrigen)}`)
      setNumeroCuentaDestino('')
      setValor('')
      setDescripcion('')
      cargarCuentas()
    } catch (err) {
      setError(mensajeError(err, 'No se pudo realizar la transferencia.'))
    } finally {
      setEnviando(false)
    }
  }

  if (cargando) return <div className="text-center mt-5"><Spinner animation="border" /></div>

  const cuentaSel = cuentas.find((c) => String(c.id) === String(cuentaOrigenId))

  return (
    <Container>
      <h2 className="mb-3">Realizar transferencia</h2>
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-4">
              {error && <Alert variant="danger">{error}</Alert>}
              {ok && <Alert variant="success">{ok}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Cuenta de origen</Form.Label>
                  <Form.Select value={cuentaOrigenId} onChange={(e) => setCuentaOrigenId(e.target.value)} required>
                    {cuentas.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.numero_cuenta} · {c.tipo} · {formatCOP(c.saldo)}
                      </option>
                    ))}
                  </Form.Select>
                  {cuentaSel && (
                    <Form.Text className="text-muted">
                      Saldo disponible: {formatCOP(cuentaSel.saldo)}
                    </Form.Text>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Número de cuenta destino</Form.Label>
                  <Form.Control
                    type="text"
                    value={numeroCuentaDestino}
                    onChange={(e) => setNumeroCuentaDestino(e.target.value)}
                    placeholder="Ej: 1000000002"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Valor a transferir</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    step="0.01"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    placeholder="Ej: 50000"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Descripción (opcional)</Form.Label>
                  <Form.Control
                    type="text"
                    maxLength={150}
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Ej: Pago arriendo"
                  />
                </Form.Group>

                <div className="d-grid">
                  <Button type="submit" variant="primary" disabled={enviando}>
                    {enviando ? 'Procesando…' : 'Transferir'}
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
