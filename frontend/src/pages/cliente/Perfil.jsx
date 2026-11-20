import { useEffect, useState } from 'react'
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap'
import { api, mensajeError } from '../../api/client.js'

export default function Perfil() {
  const [perfil, setPerfil] = useState(null)
  const [cargando, setCargando] = useState(true)

  // Edición de datos permitidos
  const [telefono, setTelefono] = useState('')
  const [direccion, setDireccion] = useState('')
  const [msgPerfil, setMsgPerfil] = useState(null)

  // Cambio de contraseña
  const [passwordActual, setPasswordActual] = useState('')
  const [passwordNueva, setPasswordNueva] = useState('')
  const [passwordConfirma, setPasswordConfirma] = useState('')
  const [msgPass, setMsgPass] = useState(null)

  useEffect(() => {
    api
      .get('/client/perfil')
      .then((res) => {
        setPerfil(res.data.perfil)
        setTelefono(res.data.perfil.telefono || '')
        setDireccion(res.data.perfil.direccion || '')
      })
      .catch((err) => setMsgPerfil({ tipo: 'danger', texto: mensajeError(err) }))
      .finally(() => setCargando(false))
  }, [])

  const guardarPerfil = async (e) => {
    e.preventDefault()
    setMsgPerfil(null)
    try {
      await api.put('/client/perfil', { telefono, direccion })
      setMsgPerfil({ tipo: 'success', texto: 'Perfil actualizado.' })
    } catch (err) {
      setMsgPerfil({ tipo: 'danger', texto: mensajeError(err) })
    }
  }

  const cambiarPassword = async (e) => {
    e.preventDefault()
    setMsgPass(null)
    if (passwordNueva !== passwordConfirma) {
      setMsgPass({ tipo: 'danger', texto: 'La confirmación no coincide.' })
      return
    }
    try {
      await api.put('/client/password', { passwordActual, passwordNueva })
      setMsgPass({ tipo: 'success', texto: 'Contraseña actualizada.' })
      setPasswordActual('')
      setPasswordNueva('')
      setPasswordConfirma('')
    } catch (err) {
      setMsgPass({ tipo: 'danger', texto: mensajeError(err) })
    }
  }

  if (cargando) return <div className="text-center mt-5"><Spinner animation="border" /></div>

  return (
    <Container>
      <h2 className="mb-3">Mi perfil</h2>
      <Row className="g-4">
        <Col md={6}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="p-4">
              <h5 className="mb-3">Información personal</h5>
              {msgPerfil && <Alert variant={msgPerfil.tipo}>{msgPerfil.texto}</Alert>}

              <Form onSubmit={guardarPerfil}>
                <Row>
                  <Col sm={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nombre</Form.Label>
                      <Form.Control value={perfil?.nombre || ''} disabled readOnly />
                    </Form.Group>
                  </Col>
                  <Col sm={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Apellido</Form.Label>
                      <Form.Control value={perfil?.apellido || ''} disabled readOnly />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-3">
                  <Form.Label>Documento</Form.Label>
                  <Form.Control value={`${perfil?.tipo_documento || ''} ${perfil?.documento || ''}`} disabled readOnly />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control value={perfil?.email || ''} disabled readOnly />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control value={telefono} onChange={(e) => setTelefono(e.target.value)} maxLength={30} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Dirección</Form.Label>
                  <Form.Control value={direccion} onChange={(e) => setDireccion(e.target.value)} maxLength={150} />
                </Form.Group>
                <Button type="submit" variant="primary">Guardar cambios</Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="p-4">
              <h5 className="mb-3">Cambiar contraseña</h5>
              {msgPass && <Alert variant={msgPass.tipo}>{msgPass.texto}</Alert>}

              <Form onSubmit={cambiarPassword}>
                <Form.Group className="mb-3">
                  <Form.Label>Contraseña actual</Form.Label>
                  <Form.Control type="password" value={passwordActual} onChange={(e) => setPasswordActual(e.target.value)} required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Nueva contraseña</Form.Label>
                  <Form.Control type="password" value={passwordNueva} onChange={(e) => setPasswordNueva(e.target.value)} minLength={6} required />
                  <Form.Text className="text-muted">Mínimo 6 caracteres.</Form.Text>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Confirmar nueva contraseña</Form.Label>
                  <Form.Control type="password" value={passwordConfirma} onChange={(e) => setPasswordConfirma(e.target.value)} required />
                </Form.Group>
                <Button type="submit" variant="dark">Actualizar contraseña</Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
