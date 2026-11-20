import { useState } from 'react'
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { api, mensajeError } from '../../api/client.js'
import { formatCOP } from '../../utils/format.js'
import MovimientosTable from '../../components/MovimientosTable.jsx'

const MONTOS_RAPIDOS = [20000, 50000, 100000, 200000]

export default function Atm() {
  const navigate = useNavigate()
  const [step, setStep] = useState('login') // 'login' | 'menu'
  const [cuenta, setCuenta] = useState(null)
  const [vista, setVista] = useState('inicio') // inicio | saldo | retiro | movimientos

  // login
  const [numeroCuenta, setNumeroCuenta] = useState('')
  const [pin, setPin] = useState('')

  // datos
  const [saldo, setSaldo] = useState(null)
  const [movimientos, setMovimientos] = useState([])
  const [valorRetiro, setValorRetiro] = useState('')

  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const [cargando, setCargando] = useState(false)

  const limpiarMensajes = () => { setError(''); setOk('') }

  const handleLogin = async (e) => {
    e.preventDefault()
    limpiarMensajes()
    setCargando(true)
    try {
      const res = await api.post('/atm/login', { numeroCuenta: numeroCuenta.trim(), pin })
      setCuenta(res.data.cuenta)
      setStep('menu')
      setVista('inicio')
      setPin('')
    } catch (err) {
      setError(mensajeError(err, 'No se pudo ingresar.'))
    } finally {
      setCargando(false)
    }
  }

  const consultarSaldo = async () => {
    limpiarMensajes()
    setVista('saldo')
    setCargando(true)
    try {
      const res = await api.get('/atm/saldo')
      setSaldo(res.data.saldo)
    } catch (err) {
      setError(mensajeError(err))
    } finally {
      setCargando(false)
    }
  }

  const verMovimientos = async () => {
    limpiarMensajes()
    setVista('movimientos')
    setCargando(true)
    try {
      const res = await api.get('/atm/movimientos')
      setMovimientos(res.data.movimientos)
    } catch (err) {
      setError(mensajeError(err))
    } finally {
      setCargando(false)
    }
  }

  const retirar = async (monto) => {
    limpiarMensajes()
    const valor = Number(monto ?? valorRetiro)
    if (!valor || valor <= 0) { setError('Ingresa un valor válido.'); return }
    setCargando(true)
    try {
      const res = await api.post('/atm/retiro', { valor })
      setSaldo(res.data.saldo)
      setOk(`Retiro exitoso de ${formatCOP(valor)}. Nuevo saldo: ${formatCOP(res.data.saldo)}`)
      setValorRetiro('')
    } catch (err) {
      setError(mensajeError(err, 'No se pudo realizar el retiro.'))
    } finally {
      setCargando(false)
    }
  }

  const salir = async () => {
    try { await api.post('/atm/logout') } catch { /* ignore */ }
    setStep('login')
    setCuenta(null)
    setNumeroCuenta('')
    setPin('')
    setSaldo(null)
    setMovimientos([])
    limpiarMensajes()
  }

  // ---------- Pantalla de login ----------
  if (step === 'login') {
    return (
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={4}>
            <Card className="shadow border-0 mt-4">
              <Card.Body className="p-4 text-center">
                <div style={{ fontSize: '3rem' }}>🏧</div>
                <h3 className="mb-4">Cajero Automático</h3>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleLogin}>
                  <Form.Group className="mb-3 text-start">
                    <Form.Label>Número de cuenta</Form.Label>
                    <Form.Control
                      value={numeroCuenta}
                      onChange={(e) => setNumeroCuenta(e.target.value)}
                      inputMode="numeric"
                      placeholder="1000000001"
                      required
                      autoFocus
                    />
                  </Form.Group>
                  <Form.Group className="mb-4 text-start">
                    <Form.Label>PIN (4 dígitos)</Form.Label>
                    <Form.Control
                      type="password"
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      inputMode="numeric"
                      maxLength={4}
                      placeholder="••••"
                      required
                    />
                  </Form.Group>
                  <div className="d-grid gap-2">
                    <Button type="submit" variant="success" size="lg" disabled={cargando}>
                      {cargando ? 'Validando…' : 'Ingresar'}
                    </Button>
                    <Button variant="link" onClick={() => navigate('/')}>Volver al inicio</Button>
                  </div>
                </Form>
                <div className="small text-muted mt-3">
                  Prueba: cuenta <code>1000000001</code> · PIN <code>1234</code>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    )
  }

  // ---------- Menú del cajero ----------
  return (
    <Container>
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card className="shadow border-0">
            <Card.Header className="bg-success text-white d-flex justify-content-between align-items-center">
              <div>
                <div className="fw-bold">{cuenta?.titular}</div>
                <small>Cuenta {cuenta?.tipo} · {cuenta?.numeroCuenta}</small>
              </div>
              <Button variant="outline-light" size="sm" onClick={salir}>Finalizar</Button>
            </Card.Header>
            <Card.Body className="p-4">
              {error && <Alert variant="danger">{error}</Alert>}
              {ok && <Alert variant="success">{ok}</Alert>}

              {/* Botonera principal */}
              <Row className="g-2 mb-4">
                <Col xs={6} md={3}>
                  <Button className="w-100" variant={vista === 'saldo' ? 'success' : 'outline-success'} onClick={consultarSaldo}>
                    Consultar saldo
                  </Button>
                </Col>
                <Col xs={6} md={3}>
                  <Button className="w-100" variant={vista === 'retiro' ? 'success' : 'outline-success'} onClick={() => { limpiarMensajes(); setVista('retiro') }}>
                    Retirar
                  </Button>
                </Col>
                <Col xs={6} md={3}>
                  <Button className="w-100" variant={vista === 'movimientos' ? 'success' : 'outline-success'} onClick={verMovimientos}>
                    Movimientos
                  </Button>
                </Col>
                <Col xs={6} md={3}>
                  <Button className="w-100" variant="outline-danger" onClick={salir}>
                    Salir
                  </Button>
                </Col>
              </Row>

              {cargando && <div className="text-center my-3"><Spinner animation="border" /></div>}

              {/* Panel según la vista */}
              {!cargando && vista === 'saldo' && saldo !== null && (
                <div className="text-center py-4">
                  <div className="text-muted">Saldo disponible</div>
                  <div className="saldo-grande text-success">{formatCOP(saldo)}</div>
                </div>
              )}

              {!cargando && vista === 'retiro' && (
                <div>
                  <h5 className="mb-3">Selecciona o escribe el monto</h5>
                  <Row className="g-2 mb-3">
                    {MONTOS_RAPIDOS.map((m) => (
                      <Col xs={6} md={3} key={m}>
                        <Button variant="outline-secondary" className="w-100" onClick={() => retirar(m)}>
                          {formatCOP(m)}
                        </Button>
                      </Col>
                    ))}
                  </Row>
                  <Form onSubmit={(e) => { e.preventDefault(); retirar() }}>
                    <Row className="g-2 align-items-end">
                      <Col sm={8}>
                        <Form.Label>Otro monto</Form.Label>
                        <Form.Control
                          type="number" min="1" step="1000"
                          value={valorRetiro}
                          onChange={(e) => setValorRetiro(e.target.value)}
                          placeholder="Ej: 150000"
                        />
                      </Col>
                      <Col sm={4}>
                        <Button type="submit" variant="success" className="w-100">Retirar</Button>
                      </Col>
                    </Row>
                  </Form>
                </div>
              )}

              {!cargando && vista === 'movimientos' && (
                <div>
                  <h5 className="mb-3">Últimos movimientos</h5>
                  <MovimientosTable movimientos={movimientos} />
                </div>
              )}

              {!cargando && vista === 'inicio' && (
                <p className="text-muted text-center py-4">Selecciona una operación.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
