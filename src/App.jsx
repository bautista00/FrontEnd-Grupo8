/**
 * Organiza las rutas de la aplicación.
 * El carrito compartido entre las pantallas vive en el store de Redux.
 */

import { useEffect } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from './components/Redux/userSlice'
import { vencimientoToken } from './utils/api'
import RequireAuth from './components/auth/RequireAuth'
import Footer from './components/layout/Footer'
import Navbar from './components/layout/Navbar'
import Home from './views/Home'
import MisPublicaciones from './views/MisPublicaciones'
import FormularioPublicacion from './views/FormularioPublicacion'
import DetallePublicacion from './views/DetallePublicacion'
import Login from './views/Login'
import Registro from './views/Registro'
import Carrito from "./views/Carrito"
import ConfirmarReserva from "./views/ConfirmarReserva"
import MisReservas from "./views/MisReservas"
import DetalleReserva from "./views/DetalleReserva"
import ResultadoReserva from './views/ResultadoReserva'
import RetornoPago from './views/RetornoPago'
import MisVehiculos from './views/MisVehiculos'
import FormularioVehiculo from './views/FormularioVehiculo'
import FotosVehiculo from './views/FotosVehiculo'
import Perfil from './views/Perfil'

export default function App() {
  const { pathname } = useLocation()
  // Lleva la pantalla al inicio al cambiar de ruta.
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [pathname])

  const dispatch = useDispatch()
  const token = useSelector((state) => state.users.token)
  // Cierra la sesión cuando vence el token; si el guardado ya venció, la cierra al abrir la app
  useEffect(() => {
    if (!token) return
    const temporizador = setTimeout(() => dispatch(logout()), vencimientoToken(token) - Date.now())
    return () => clearTimeout(temporizador)
  }, [token, dispatch])
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/perfil" element={<RequireAuth><Perfil /></RequireAuth>} />
        <Route path="/mis-reservas" element={<RequireAuth><MisReservas /></RequireAuth>} />
        <Route path="/mis-reservas/detalle" element={<RequireAuth><DetalleReserva /></RequireAuth>} />
        <Route path="/mis-publicaciones" element={<RequireAuth><MisPublicaciones /></RequireAuth>} />
        <Route path="/publicaciones/nueva" element={<RequireAuth><FormularioPublicacion key="crear" /></RequireAuth>} />
        <Route path="/publicaciones/:id/editar" element={<RequireAuth><FormularioPublicacion key="editar" modo="editar" /></RequireAuth>} />
        <Route path="/publicaciones/:id" element={<DetallePublicacion />} />
        <Route path="/mis-vehiculos" element={<RequireAuth><MisVehiculos /></RequireAuth>} />
        <Route path="/vehiculos/nuevo" element={<RequireAuth><FormularioVehiculo key="crear" /></RequireAuth>} />
        <Route path="/vehiculos/:id/editar" element={<RequireAuth><FormularioVehiculo key="editar" modo="editar" /></RequireAuth>} />
        <Route path="/vehiculos/:id/fotos" element={<RequireAuth><FotosVehiculo /></RequireAuth>} />
        <Route path="*" element={
          <main className="flex-1 w-full max-w-page mx-auto px-(--gutter) py-14">
            <h1 className="text-3xl">Página no encontrada</h1>
            <Link to="/" className="inline-block mt-5 text-gold">Volver al inicio</Link>
          </main>
        } />
        <Route path="/carrito" element={<RequireAuth><Carrito /></RequireAuth>} />
        <Route path="/carrito/confirmar" element={<RequireAuth><ConfirmarReserva /></RequireAuth>} />
        <Route path="/reservas/resultado" element={<RequireAuth><ResultadoReserva /></RequireAuth>} />
        <Route path="/reservas" element={<RequireAuth><RetornoPago /></RequireAuth>} />
        <Route path="/reservas/:idReserva" element={<RequireAuth><RetornoPago /></RequireAuth>} />
      </Routes>
      <Footer />
    </div>
  )
}
