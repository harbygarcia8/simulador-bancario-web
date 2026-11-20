import { Routes, Route, Navigate, Outlet } from 'react-router-dom'

import AppNavbar from './components/AppNavbar.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Atm from './pages/atm/Atm.jsx'

import ClienteDashboard from './pages/cliente/ClienteDashboard.jsx'
import Movimientos from './pages/cliente/Movimientos.jsx'
import Transferir from './pages/cliente/Transferir.jsx'
import Perfil from './pages/cliente/Perfil.jsx'

import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import Clientes from './pages/admin/Clientes.jsx'
import CrearCliente from './pages/admin/CrearCliente.jsx'
import ClienteDetalle from './pages/admin/ClienteDetalle.jsx'
import Cuentas from './pages/admin/Cuentas.jsx'
import Consignar from './pages/admin/Consignar.jsx'
import MovimientosGenerales from './pages/admin/MovimientosGenerales.jsx'

export default function App() {
  return (
    <>
      <AppNavbar />
      <main className="app-main">
        <Routes>
          {/* Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cajero" element={<Atm />} />

          {/* Cliente (banca virtual) */}
          <Route
            element={
              <ProtectedRoute rol="CLIENTE">
                <Outlet />
              </ProtectedRoute>
            }
          >
            <Route path="/cliente" element={<ClienteDashboard />} />
            <Route path="/cliente/movimientos" element={<Movimientos />} />
            <Route path="/cliente/transferir" element={<Transferir />} />
            <Route path="/cliente/perfil" element={<Perfil />} />
          </Route>

          {/* Administración */}
          <Route
            element={
              <ProtectedRoute rol="ADMIN">
                <Outlet />
              </ProtectedRoute>
            }
          >
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/clientes" element={<Clientes />} />
            <Route path="/admin/clientes/nuevo" element={<CrearCliente />} />
            <Route path="/admin/clientes/:id" element={<ClienteDetalle />} />
            <Route path="/admin/cuentas" element={<Cuentas />} />
            <Route path="/admin/consignar" element={<Consignar />} />
            <Route path="/admin/movimientos" element={<MovimientosGenerales />} />
          </Route>

          {/* Cualquier otra ruta */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  )
}
