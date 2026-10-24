/**
 * Organiza las rutas y conserva el carrito compartido entre las pantallas.
 * Entrega los datos y las funciones para modificarlos mediante props.
 */

import { useEffect, useState } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import RequireAuth from './components/auth/RequireAuth'
import Footer from './components/layout/Footer'
import Navbar from './components/layout/Navbar'
import Home from './views/Home'
import MyPublications from './views/MyPublications'
import PublicationForm from './views/PublicationForm'
import PublicationDetail from './views/PublicationDetail'
import Login from './views/Login'
import Register from './views/Register'
import Cart from "./views/Cart"
import ConfirmReservation from "./views/ConfirmReservation"
import MyReservations from "./views/MyReservations"
import ReservationDetails from "./views/ReservationDetails"
import ReservationResult from './views/ReservationResult'
import PaymentReturn from './views/PaymentReturn'
import MyVehicles from './views/MyVehicles'
import VehicleForm from './views/VehicleForm'
import VehiclePhotos from './views/VehiclePhotos'
import Profile from './views/Profile'

export default function App() {
  const [carrito, actualizarCarrito] = useState(null)
  // Permite distinguir un carrito todavía no consultado de uno que ya sabemos que está vacío.
  const [carritoConsultado, actualizarCarritoConsultado] = useState(false)

  // Actualiza la copia local después de que el backend convierte el carrito en reserva.
  const vaciarCarrito = () => {
    actualizarCarrito(null)
    actualizarCarritoConsultado(true)
  }

  // Descarta el carrito de la sesión anterior; Login y Registro reciben esta función.
  const reiniciarCarrito = () => {
    actualizarCarrito(null)
    actualizarCarritoConsultado(false)
  }

  const { pathname } = useLocation()
  // Lleva la pantalla al inicio al cambiar de ruta.
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [pathname])
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar carrito={carrito} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login reiniciarCarrito={reiniciarCarrito} />} />
        <Route path="/registro" element={<Register reiniciarCarrito={reiniciarCarrito} />} />
        <Route path="/perfil" element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path="/mis-reservas" element={<RequireAuth><MyReservations /></RequireAuth>} />
        <Route path="/mis-reservas/detalle" element={<RequireAuth><ReservationDetails /></RequireAuth>} />
        <Route path="/mis-publicaciones" element={<RequireAuth><MyPublications /></RequireAuth>} />
        <Route path="/publicaciones/nueva" element={<RequireAuth><PublicationForm key="crear" /></RequireAuth>} />
        <Route path="/publicaciones/:id/editar" element={<RequireAuth><PublicationForm key="editar" modo="editar" /></RequireAuth>} />
        <Route
          path="/publicaciones/:id"
          element={
            <PublicationDetail
              actualizarCarrito={actualizarCarrito}
              actualizarCarritoConsultado={actualizarCarritoConsultado}
            />
          }
        />
        <Route path="/mis-vehiculos" element={<RequireAuth><MyVehicles /></RequireAuth>} />
        <Route path="/vehiculos/nuevo" element={<RequireAuth><VehicleForm key="crear" /></RequireAuth>} />
        <Route path="/vehiculos/:id/editar" element={<RequireAuth><VehicleForm key="editar" modo="editar" /></RequireAuth>} />
        <Route path="/vehiculos/:id/fotos" element={<RequireAuth><VehiclePhotos /></RequireAuth>} />
        <Route path="*" element={
          <main className="flex-1 w-full max-w-page mx-auto px-(--gutter) py-14">
            <h1 className="text-3xl">Página no encontrada</h1>
            <Link to="/" className="inline-block mt-5 text-gold">Volver al inicio</Link>
          </main>
        } />
        <Route
          path="/carrito"
          element={
            <RequireAuth>
              <Cart
                carrito={carrito}
                actualizarCarrito={actualizarCarrito}
                carritoConsultado={carritoConsultado}
                actualizarCarritoConsultado={actualizarCarritoConsultado}
              />
            </RequireAuth>
          }
        />
        <Route
          path="/carrito/confirmar"
          element={<RequireAuth><ConfirmReservation vaciarCarrito={vaciarCarrito} /></RequireAuth>}
        />
        <Route path="/reservas/resultado" element={<RequireAuth><ReservationResult /></RequireAuth>} />
        <Route path="/reservas" element={<RequireAuth><PaymentReturn /></RequireAuth>} />
        <Route path="/reservas/:idReserva" element={<RequireAuth><PaymentReturn /></RequireAuth>} />
      </Routes>
      <Footer />
    </div>
  )
}
