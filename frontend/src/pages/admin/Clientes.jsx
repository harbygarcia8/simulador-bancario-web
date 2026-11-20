import { useEffect, useState } from 'react'
import { Container, Card, Form, Table, Button, Badge, Spinner, Alert, InputGroup } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { api, mensajeError } from '../../api/client.js'

const colorEstado = { ACTIVO: 'success', BLOQUEADO: 'danger', INACTIVO: 'secondary' }

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [q, setQ] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const cargar = (busqueda = '') => {
    setCargando(true)
    setError('')
    api
      .get('/admin/clientes', { params: busqueda ? { q: busqueda } : {} })
      .then((res) => setClientes(res.data.clientes))
      .catch((err) => setError(mensajeError(err)))
      .finally(() => setCargando(false))
  }

  useEffect(() => {
    cargar()
  }, [])

  const buscar = (e) => {
    e.preventDefault()
    cargar(q)
  }

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Clientes</h2>
        <Button as={Link} to="/admin/clientes/nuevo" variant="primary">+ Crear cliente</Button>
      </div>

      <Card className="shadow-sm border-0">
        <Card.Body>
          <Form onSubmit={buscar} className="mb-3" style={{ maxWidth: 420 }}>
            <InputGroup>
              <Form.Control
                placeholder="Buscar por nombre, documento o email…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <Button type="submit" variant="outline-secondary">Buscar</Button>
            </InputGroup>
          </Form>

          {error && <Alert variant="danger">{error}</Alert>}

          {cargando ? (
            <div className="text-center my-4"><Spinner animation="border" /></div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Documento</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Estado</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((c) => (
                    <tr key={c.id}>
                      <td>{c.nombre} {c.apellido}</td>
                      <td>{c.tipo_documento} {c.documento}</td>
                      <td>{c.email}</td>
                      <td>{c.telefono || '—'}</td>
                      <td><Badge bg={colorEstado[c.estado] || 'secondary'}>{c.estado}</Badge></td>
                      <td className="text-end">
                        <Button as={Link} to={`/admin/clientes/${c.id}`} size="sm" variant="outline-primary">
                          Ver detalle
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {clientes.length === 0 && (
                    <tr><td colSpan={6} className="text-center text-muted py-3">Sin resultados.</td></tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  )
}
