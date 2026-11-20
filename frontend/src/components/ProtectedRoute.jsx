import { Navigate, useLocation } from 'react-router-dom'
import { Spinner } from 'react-bootstrap'
import { useAuth } from '../auth/AuthContext.jsx'

/**
 * Protege rutas: exige sesión y, opcionalmente, un rol específico.
 * - Sin sesión -> redirige a /login
 * - Rol incorrecto -> redirige al home del rol real
 */
export default function ProtectedRoute({ children, rol }) {
  const { user, cargando } = useAuth()
  const location = useLocation()

  if (cargando) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" role="status" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (rol && user.rol !== rol) {
    return <Navigate to={user.rol === 'ADMIN' ? '/admin' : '/cliente'} replace />
  }

  return children
}
