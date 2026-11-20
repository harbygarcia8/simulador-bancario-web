import { Navbar, Nav, Container, Button } from 'react-bootstrap'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'

/**
 * Barra de navegación. Muestra enlaces distintos según el rol del usuario
 * autenticado. En páginas públicas muestra solo la marca.
 */
export default function AppNavbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const linksCliente = (
    <>
      <Nav.Link as={NavLink} to="/cliente" end>Resumen</Nav.Link>
      <Nav.Link as={NavLink} to="/cliente/movimientos">Movimientos</Nav.Link>
      <Nav.Link as={NavLink} to="/cliente/transferir">Transferir</Nav.Link>
      <Nav.Link as={NavLink} to="/cliente/perfil">Mi perfil</Nav.Link>
    </>
  )

  const linksAdmin = (
    <>
      <Nav.Link as={NavLink} to="/admin" end>Dashboard</Nav.Link>
      <Nav.Link as={NavLink} to="/admin/clientes">Clientes</Nav.Link>
      <Nav.Link as={NavLink} to="/admin/cuentas">Cuentas</Nav.Link>
      <Nav.Link as={NavLink} to="/admin/consignar">Consignar</Nav.Link>
      <Nav.Link as={NavLink} to="/admin/movimientos">Movimientos</Nav.Link>
    </>
  )

  return (
    <Navbar bg="primary" variant="dark" expand="lg" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/">🏦 Banco Virtual</Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="me-auto">
            {user?.rol === 'CLIENTE' && linksCliente}
            {user?.rol === 'ADMIN' && linksAdmin}
          </Nav>
          <Nav className="align-items-lg-center">
            {user ? (
              <>
                <Navbar.Text className="me-3 text-white">
                  {user.nombre} {user.apellido} · <strong>{user.rol}</strong>
                </Navbar.Text>
                <Button variant="outline-light" size="sm" onClick={handleLogout}>
                  Cerrar sesión
                </Button>
              </>
            ) : (
              <Nav.Link as={NavLink} to="/login">Iniciar sesión</Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
