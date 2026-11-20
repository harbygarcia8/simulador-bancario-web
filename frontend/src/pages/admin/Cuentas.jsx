import { useEffect, useState } from 'react'
import { Container, Card, Table, Badge, Spinner, Alert } from 'react-bootstrap'
import { api, mensajeError } from '../../api/client.js'
import { formatCOP } from '../../utils/format.js'

export default function Cuentas() {
  const [cuentas, setCuentas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/admin/cuentas')
      .then((res) => setCuentas(res.data.cuentas))
      .catch((err) => setError(mensajeError(err)))
      .finally(() => setCargando(false))
  }, [])

  const total = cuentas.reduce((acc, c) => acc + Number(c.saldo), 0)

  return (
    <Container>
      <h2 className="mb-3">Cuentas bancarias</h2>

      <Card className="shadow-sm border-0">
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          {cargando ? (
            <div className="text-center my-4"><Spinner animation="border" /></div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle">
                <thead>
                  <tr>
                    <th>Número</th>
                    <th>Titular</th>
                    <th>Documento</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                    <th className="text-end">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {cuentas.map((c) => (
                    <tr key={c.id}>
                      <td><code>{c.numero_cuenta}</code></td>
                      <td>{c.nombre} {c.apellido}</td>
                      <td>{c.documento}</td>
                      <td>{c.tipo}</td>
                      <td><Badge bg={c.estado === 'ACTIVA' ? 'success' : 'secondary'}>{c.estado}</Badge></td>
                      <td className="text-end fw-semibold">{formatCOP(c.saldo)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="table-light">
                    <td colSpan={5} className="text-end fw-bold">Total</td>
                    <td className="text-end fw-bold">{formatCOP(total)}</td>
                  </tr>
                </tfoot>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  )
}
