/**
 * Revisa el carrito y permite confirmar la reserva en efectivo o con Mercado Pago.
 * Lee el carrito de Redux y lo recupera al entrar si falta después de una recarga.
 */

import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { confirmarCarrito, crearCheckout } from '../components/Redux/reservasSlice'
import { fetchCarrito } from '../components/Redux/carritoSlice'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import ItinerarioReserva from "../components/reservas/compartidos/ItinerarioReserva"
import MetodoPago from "../components/confirmarReserva/MetodoPago"
import ResumenPago from "../components/confirmarReserva/ResumenPago"
import VehiculoSeleccionado from "../components/reservas/compartidos/VehiculoSeleccionado"

// La key inicia una confirmación nueva si cambia el carrito seleccionado.
export default function ConfirmarReserva() {
  const ubicacion = useLocation()
  return <ReservationConfirmation key={ubicacion.state?.carrito?.idCarrito ?? 'sin-carrito'} ubicacion={ubicacion} />
}

function ReservationConfirmation({ ubicacion }) {
  const navegar = useNavigate()
  const dispatch = useDispatch()
  const token = useSelector((state) => state.users.token)
  const { carrito: carritoGuardado, carritoConfirmado, metodoPagoConfirmado, carritoConsultado, loading: cargandoCarrito, error: errorCarrito } = useSelector((state) => state.carrito)
  const {
    confirmacion: confirmacionGuardada,
    idCarritoConfirmacion,
    confirmando: confirmandoReserva,
    errorConfirmar,
    idPagoCheckout,
    loadingCheckout,
    errorCheckout
  } = useSelector((state) => state.reservas)
  const vigente = useRef(false)
  const [ahora, actualizarAhora] = useState(() => Date.now())

  const [metodoPago, actualizarMetodoPago] = useState('MERCADO_PAGO')

  const idCarrito = ubicacion.state?.carrito?.idCarrito ?? carritoGuardado?.idCarrito ?? carritoConfirmado?.idCarrito
  const esEsteCarrito = String(idCarritoConfirmacion) === String(idCarrito)
  const confirmacion = esEsteCarrito ? confirmacionGuardada : null
  const datosCarrito = confirmacion ? carritoConfirmado : carritoGuardado
  const metodoMostrado = confirmacion ? metodoPagoConfirmado : metodoPago
  const reservaCreada = confirmacion !== null
  const carrito = datosCarrito ? {
    ...datosCarrito,
    segundosRestantes: Math.max(0, Math.ceil((new Date(datosCarrito.fechaExpiracion).getTime() - ahora) / 1000))
  } : null
  const confirmando = confirmandoReserva || loadingCheckout
  const mensaje = confirmacion && String(idPagoCheckout) === String(confirmacion.idPago) && errorCheckout
    ? `La reserva se creó. ${errorCheckout} Podés revisarla en Mis reservas.`
    : esEsteCarrito ? errorConfirmar : null

  // Las respuestas actualizan Redux; esta limpieza evita navegar desde una vista que ya salió.
  useEffect(() => {
    vigente.current = true
    return () => { vigente.current = false }
  }, [])

  // La navegación normal reutiliza Redux; después de F5 recupera el carrito vigente.
  useEffect(() => {
    if (carritoConsultado || !token) return
    dispatch(fetchCarrito())
  }, [carritoConsultado, token, dispatch])

  // Mantiene el vencimiento del carrito y detiene el contador al salir.
  useEffect(() => {
    if (reservaCreada) return
    const intervalo = setInterval(() => {
      actualizarAhora(Date.now())
    }, 1000)

    return () => clearInterval(intervalo)
  }, [reservaCreada])

  // Se pasa a ResumenPago como alConfirmar; crea la reserva y luego abre su resultado o checkout.
  const confirmarReserva = async () => {
    if (!carritoGuardado || cargandoCarrito || errorCarrito || confirmando || confirmacion !== null) return
    if (new Date(carrito.fechaExpiracion).getTime() <= Date.now()) return

    try {
      const datosConfirmacion = await dispatch(confirmarCarrito({
        idCarrito: carrito.idCarrito,
        metodoPago
      })).unwrap()
      if (!vigente.current) return

      if (metodoPago === 'EFECTIVO') {
        navegar('/reservas/resultado', {
          state: { carrito, confirmacion: datosConfirmacion, metodoPago }
        })
        return
      }

      const checkout = await dispatch(crearCheckout({ idPago: datosConfirmacion.idPago })).unwrap()
      if (vigente.current) window.location.href = checkout.initPoint
    } catch {
      // Los errores de confirmación y checkout se muestran desde el slice.
    }
  }

  if (!confirmacion && (cargandoCarrito || (!carritoConsultado && !errorCarrito))) {
    return (
      <main className="flex-1 w-full max-w-page mx-auto px-(--gutter) pt-10 pb-16">
        <p role="status" className="text-[0.75rem] text-muted">Cargando tu carrito…</p>
      </main>
    )
  }

  if (!confirmacion && errorCarrito) {
    return (
      <main className="flex-1 w-full max-w-page mx-auto px-(--gutter) pt-10 pb-16">
        <h1 className="text-[1.875rem] text-ink">No pudimos cargar tu carrito</h1>
        <p role="alert" className="mt-3 text-[0.75rem] text-error">{errorCarrito}</p>
        <Link to="/carrito" className="inline-block mt-6 text-[0.6875rem] text-soft hover:underline">Volver al carrito</Link>
      </main>
    )
  }

  if (carrito === null) {
    return (
      <main className="flex-1 w-full max-w-page mx-auto px-(--gutter) pt-10 pb-16 phone:pt-7 phone:pb-10">
        <header className="mb-6">
          <h1 className="mt-1.5 text-[2.25rem] leading-[1.2] text-ink phone:text-[1.875rem]">No hay un carrito para confirmar</h1>
          <p className="mt-2 text-[0.75rem] leading-[1.7] text-muted">Volvé al carrito y presioná «Continuar con la reserva» para revisar sus datos.</p>
        </header>
        <Link to="/carrito" className="inline-block mt-6 text-[0.6875rem] text-soft hover:underline">Volver al carrito</Link>
      </main>
    )
  }

  return (
    <main className="flex-1 w-full max-w-page mx-auto px-(--gutter) pt-10 pb-16 phone:pt-7 phone:pb-10">
      <header className="mb-6">
        <p className="text-[0.625rem] leading-[1.5] tracking-[0.05em] uppercase text-muted">Reserva · Paso 2 de 2: pago y confirmación</p>
        <h1 className="mt-1.5 text-[2.25rem] leading-[1.2] text-ink phone:text-[1.875rem]">Confirmar reserva</h1>
        <p className="mt-2 text-[0.75rem] leading-[1.7] text-muted">{reservaCreada ? 'Esta reserva ya fue creada. Podés consultar su estado en Mis reservas.' : 'Revisá los datos del alquiler y elegí cómo pagar.'}</p>
      </header>

      <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] items-start gap-6 tablet:grid-cols-1">
        <div className="min-w-0">
          <VehiculoSeleccionado vehiculo={carrito.publicacion} />
          <ItinerarioReserva datos={carrito} publicacion={carrito.publicacion} />
          <MetodoPago
            metodoPago={metodoMostrado}
            alCambiar={actualizarMetodoPago}
            bloqueado={confirmando || confirmacion !== null}
            reservaCreada={reservaCreada}
          />

          {mensaje && (
            <p role="alert" className="mt-4 p-3 bg-amber-50 border border-border rounded-[0.25rem] text-[0.6875rem] leading-[1.6] text-amber-700">{mensaje}</p>
          )}

          <Link to="/carrito" className="inline-block mt-6 text-[0.6875rem] text-soft hover:underline">← Volver al carrito</Link>
        </div>

        <ResumenPago
          carrito={carrito}
          metodoPago={metodoMostrado}
          alConfirmar={confirmarReserva}
          confirmando={confirmando}
          reservaCreada={reservaCreada}
        />
      </div>
    </main>
  )
}
