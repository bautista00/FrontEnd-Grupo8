import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import ReservationItinerary from "../components/reservations/ReservationItinerary"
import PaymentMethod from "../components/reservations/PaymentMethod"
import PaymentSummary from "../components/reservations/PaymentSummary"
import SelectedVehicle from "../components/reservations/SelectedVehicle"

export default function ConfirmReservation({ vaciarCarrito }) {
  // Recibimos el carrito enviado por CartSummary.
  const ubicacion = useLocation()
  const navegar = useNavigate()
  const [carrito, actualizarCarrito] = useState(() => {
    const carritoRecibido = ubicacion.state?.carrito
    if (!carritoRecibido) return null

    const segundosRestantes = Math.max(
      0,
      Math.ceil((new Date(carritoRecibido.fechaExpiracion).getTime() - Date.now()) / 1000)
    )
    return { ...carritoRecibido, segundosRestantes }
  })

  // La vista guarda el método elegido.
  const [metodoPago, actualizarMetodoPago] = useState('MERCADO_PAGO')

  // Guarda la respuesta del backend cuando se crea la reserva.
  const [confirmacion, actualizarConfirmacion] = useState(null)

  // Bloquea nuevos envíos hasta terminar la confirmación y el checkout.
  const [confirmando, actualizarConfirmando] = useState(false)

  // Guarda el mensaje que después mostraremos en pantalla.
  const [mensaje, actualizarMensaje] = useState('')

  const fechaExpiracion = carrito ? carrito.fechaExpiracion : null

  useEffect(() => {
    if (!fechaExpiracion) return

    // El contador continúa con el mismo vencimiento; no reinicia los 15 minutos.
    const intervalo = setInterval(() => {
      const segundosRestantes = Math.max(
        0,
        Math.ceil((new Date(fechaExpiracion).getTime() - Date.now()) / 1000)
      )
      actualizarCarrito((carritoActual) => ({ ...carritoActual, segundosRestantes }))
    }, 1000)

    return () => clearInterval(intervalo)
  }, [fechaExpiracion])

  const confirmarReserva = () => {
    // Evitamos repetir el envío o confirmar un carrito vencido.
    if (carrito === null || confirmando || confirmacion !== null) return
    if (new Date(carrito.fechaExpiracion).getTime() <= Date.now()) return

    const token = localStorage.getItem('jwtToken')

    if (!token) {
      actualizarMensaje('Necesitás iniciar sesión para confirmar.')
      return
    }

    actualizarConfirmando(true)
    actualizarMensaje('')

    // Distinguimos si falló la creación o el inicio del pago.
    let reservaCreada = false

    fetch(
      `http://localhost:8080/carritos/${carrito.idCarrito}/confirmar`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        // Convertimos el objeto a JSON para enviarlo al backend.
        body: JSON.stringify({ metodoPago })
      }
    )
      .then((respuesta) => {
        if (!respuesta.ok) {
          return respuesta.json()
            .catch(() => ({}))
            .then((datosError) => {
              return Promise.reject(new Error(
                datosError.mensaje || 'No se pudo crear la reserva.'
              ))
            })
        }

        return respuesta.json()
      })
      .then((datosConfirmacion) => {
        reservaCreada = true
        // Guardamos los identificadores y estados que devuelve el backend.
        actualizarConfirmacion(datosConfirmacion)
        // La reserva ya existe: el carrito compartido queda vacío para ambos métodos.
        vaciarCarrito()

        if (metodoPago === 'EFECTIVO') {
          // Navegamos solamente después de crear la reserva correctamente.
          navegar('/reservas/resultado', {
            state: {
              carrito,
              confirmacion: datosConfirmacion,
              metodoPago
            }
          })
          return
        }

        // Con Mercado Pago pedimos el checkout del pago recién creado.
        return fetch(
          `http://localhost:8080/pagos/${datosConfirmacion.idPago}/checkout`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
          }
        )
          .then((respuesta) => {
            if (!respuesta.ok) {
              return respuesta.json()
                .catch(() => ({}))
                .then((datosError) => {
                  return Promise.reject(new Error(
                    datosError.mensaje || 'No se pudo iniciar el pago.'
                  ))
                })
            }

            return respuesta.json()
          })
          .then((checkout) => {
            // Salimos de la app: Mercado Pago nos devuelve a /reservas/:idReserva.
            window.location.href = checkout.initPoint
          })
      })
      .catch((error) => {
        console.error('Error al confirmar la reserva:', error)
        const mensajeError = error instanceof TypeError
          ? 'No pudimos conectar con el servidor. Intentá nuevamente.'
          : error.message || 'No se pudo completar la operación.'

        // Si falló el checkout, la reserva ya existe: no pedimos reintentar.
        actualizarMensaje(
          reservaCreada
            ? `La reserva se creó. ${mensajeError} Podés revisarla en Mis reservas.`
            : mensajeError
        )
      })
      .finally(() => {
        actualizarConfirmando(false)
      })
  }

  // Evitamos leer datos cuando no hay carrito.
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
        <p className="mt-2 text-[0.75rem] leading-[1.7] text-muted">Revisá los datos del alquiler y elegí cómo pagar.</p>
      </header>

      <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] items-start gap-6 tablet:grid-cols-1">
        <div className="min-w-0">
          {/* Cada componente recibe los datos que necesita. */}
          <SelectedVehicle vehiculo={carrito.publicacion} />
          <ReservationItinerary datos={carrito} publicacion={carrito.publicacion} />
          <PaymentMethod
            metodoPago={metodoPago}
            alCambiar={actualizarMetodoPago}
            bloqueado={confirmando || confirmacion !== null}
          />

          {mensaje && (
            <p className="mt-4 p-3 bg-amber-50 border border-border rounded-[0.25rem] text-[0.6875rem] leading-[1.6] text-amber-700">{mensaje}</p>
          )}

          <Link to="/carrito" className="inline-block mt-6 text-[0.6875rem] text-soft hover:underline">← Volver al carrito</Link>
        </div>

        {/* El resumen recibe los datos y la función para confirmar. */}
        <PaymentSummary
          carrito={carrito}
          metodoPago={metodoPago}
          alConfirmar={confirmarReserva}
          confirmando={confirmando}
          reservaCreada={confirmacion !== null}
        />
      </div>
    </main>
  )
}
