import { useEffect, useState } from 'react'
import { Container, Row, Col, Card, Form, Button, Badge, Table, Alert, Spinner } from 'react-bootstrap'
import { useParams, Link } from 'react-router-dom'
import { api, mensajeError } from '../../api/client.js'
import { formatCOP } from '../../utils/format.js'

const colorEstado = { ACTIVO: 'success', BLOQUEADO: 'danger', INACTIVO: 'secondary' }

export default function ClienteDetalle() {
  const { id } = useParams()
  const [cliente, setCliente] = useState(null)
  const [cuentas, setCuentas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [msg, setMsg] = useState(null)

  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', telefono: '', direccion: '' })

  const cargar = () => {
    setCargando(true)
    api
      .get(`/admin/clientes/${id}`)
      .then((res) => {
        setCliente(res.data.cliente)
        setCuentas(res.data.cuentas)
        setForm({
          nombre: res.data.cliente.nombre || '',
          apellido: res.data.cliente.apellido || '',
          email: res.data.cliente.email || '',
          telefono: res.data.cliente.telefono || '',
          direccion: res.data.cliente.direccion || '',
        })
      })
      .catch((err) => setMsg({ tipo: 'danger', texto: mensajeError(err) }))
      .finally(() => setCargando(false))
  }

  useEffect(() => {
    cargar()
  }, [id])

  const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }))

  const guardar = async (e) => {
    e.preventDefault()
    setMsg(null)
    try {
      await api.put(`/admin/clientes/${id}`, form)
      setMsg({ tipo: 'success', texto: 'Cliente actualizado.' })
      cargar()
    } catch (err) {
      setMsg({ tipo: 'danger', texto: mensajeError(err) })
    }
  }

  const cambiarEstado = async (estado) => {
    setMsg(null)
    try {
      await api.patch(`/admin/clientes/${id}/estado`, { estado })
      setMsg({ tipo: 'success', texto: `Cliente ${estado === 'ACTIVO' ? 'habilitado' : 'bloqueado'}.` })
      cargar()
    } catch (err) {
      setMsg({ tipo: 'danger', texto: mensajeError(err) })
    }
  }

  if (cargando) return <div className="text-center mt-5"><Spinner animation="border" /></div>
  if (!cliente) return <Container><Alert variant="danger">Cliente no encontrado.</Alert></Container>

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">
          {cliente.nombre} {cliente.apellido}{' '}
          <Badge bg={colorEstado[cliente.estado]}>{cliente.estado}</Badge>
        </h2>
        <Button as={Link} to="/admin/clientes" variant="outline-secondary" size="sm">← Volver</Button>
      </div>

      {msg && <Alert variant={msg.tipo}>{msg.texto}</Alert>}

      <Row className="g-4">
        <Col lg={6}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="p-4">
              <h5 className="mb-3">Editar información</h5>
              <Form onSubmit={guardar}>
                <Row>
                  <Col sm={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nombre</Form.Label>
                      <Form.Control value={form.nombre} onChange={set('nombre')} required />
                    </Form.Group>
                  </Col>
                  <Col sm={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Apellido</Form.Label>
                      <Form.Control value={form.apellido} onChange={set('apellido')} required />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" value={form.email} onChange={set('email')} required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control value={form.telefono} onChange={set('telefono')} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Dirección</Form.Label>
                  <Form.Control value={form.direccion} onChange={set('direccion')} />
                </Form.Group>
                <div className="d-flex gap-2 flex-wrap">
                  <Button type="submit" variant="primary">Guardar</Button>
                  {cliente.estado === 'ACTIVO' ? (
                    <Button variant="danger" onClick={() => cambiarEstado('BLOQUEADO')}>Bloquear</Button>
                  ) : (
                    <Button variant="success" onClick={() => cambiarEstado('ACTIVO')}>Habilitar</Button>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="p-4">
              <h5 className="mb-3">Cuentas del cliente</h5>
              <div className="small text-muted mb-2">Documento: {cliente.tipo_documento} {cliente.documento}</div>
              <Table size="sm" className="align-middle">
                <thead>
                  <tr><th>Número</th><th>Tipo</th><th>Estado</th><th className="text-end">Saldo</th></tr>
                </thead>
                <tbody>
                  {cuentas.map((c) => (
                    <tr key={c.id}>
                      <td><code>{c.numero_cuenta}</code></td>
                      <td>{c.tipo}</td>
                      <td><Badge bg={c.estado === 'ACTIVA' ? 'success' : 'secondary'}>{c.estado}</Badge></td>
                      <td className="text-end fw-semibold">{formatCOP(c.saldo)}</td>
                    </tr>
                  ))}
                  {cuentas.length === 0 && <tr><td colSpan={4} className="text-muted">Sin cuentas.</td></tr>}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
