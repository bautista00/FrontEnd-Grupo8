import { useEffect } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
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

export default function App() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [pathname])
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/mis-reservas" element={<MyReservations />} />
        <Route path="/mis-reservas/detalle" element={<ReservationDetails />} />
        <Route path="/mis-publicaciones" element={<MyPublications />} />
        {/* Las key distintas hacen que React arme un formulario nuevo al pasar de crear a editar */}
        <Route path="/publicaciones/nueva" element={<PublicationForm key="crear" />} />
        <Route path="/publicaciones/:id/editar" element={<PublicationForm key="editar" modo="editar" />} />
        {/* Detalle público de una publicación, al que se llega desde el catálogo. */}
        <Route path="/publicaciones/:id" element={<PublicationDetail />} />
        <Route path="/mis-vehiculos" element={<MyVehicles />} />
        <Route path="/vehiculos/nuevo" element={<VehicleForm key="crear" />} />
        <Route path="/vehiculos/:id/editar" element={<VehicleForm key="editar" modo="editar" />} />
        <Route path="/vehiculos/:id/fotos" element={<VehiclePhotos />} />
        <Route path="*" element={
          <main className="flex-1 w-full max-w-page mx-auto px-(--gutter) py-14">
            <h1 className="text-3xl">Página no encontrada</h1>
            <Link to="/" className="inline-block mt-5 text-gold">Volver al inicio</Link>
          </main>
        } />
        <Route path="/carrito" element={<Cart />} />
        {/* Esta ruta muestra la segunda pantalla del flujo de reserva. */}
        <Route path="/carrito/confirmar" element={<ConfirmReservation />} />
        {/* Resultado al crear la reserva; sus datos todavía son de ejemplo. */}
        <Route path="/reservas/resultado" element={<ReservationResult />} />
        {/* Mercado Pago vuelve al backend y el backend redirige acá con el estado del pago. */}
        <Route path="/reservas" element={<PaymentReturn />} />
        <Route path="/reservas/:idReserva" element={<PaymentReturn />} />
      </Routes>
      <Footer />
    </div>
  )
}
