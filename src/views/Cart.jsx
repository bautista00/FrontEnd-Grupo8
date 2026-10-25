/**
 * Muestra el carrito y permite cambiar fechas o quitar el vehículo.
 * Recibe los datos de App y coordina las consultas y modificaciones del backend.
 */

import { Link } from 'react-router-dom'
import { CartIcon } from '../components/icons/Icons'
import CartNotice from "../components/cart/CartNotice"
import CartSummary from "../components/cart/CartSummary"
import CartVehicle from "../components/cart/CartVehicle"
import { useState,useEffect } from 'react'   
import ConfirmCartRemoval from '../components/cart/ConfirmCartRemoval'
import { API_URL } from '../utils/api'

export default function Cart({
  carrito,
  actualizarCarrito,
  carritoConsultado,
  actualizarCarritoConsultado
}) {
  const token = localStorage.getItem('jwtToken')
  const [mostrarModalQuitar, actualizarModalQuitar]=useState(false)

  const [mensaje, actualizarMensaje] = useState('')

  const [mensajeVacio, actualizarMensajeVacio] = useState('')

  const [quitando, actualizarQuitando] = useState(false)
  // Datos de la eliminación confirmada, que se enviarán desde el efecto.
  const [datosParaQuitar, actualizarDatosParaQuitar] = useState(null)

  const [guardandoFechas, actualizarGuardandoFechas] = useState(false)
  const [mensajeFechas, actualizarMensajeFechas] = useState('')
  // Fechas confirmadas por el usuario, junto con los datos necesarios para guardarlas.
  const [fechasParaGuardar, actualizarFechasParaGuardar] = useState(null)

  // Recupera el carrito, su publicación y sus períodos solo si todavía no los conocemos.
  useEffect(() => {
    if (carritoConsultado) return

    // Permite ignorar la respuesta si el usuario salió de la pantalla o cambió de sesión.
    let vigente = true

    if (!token) return

    fetch(`${API_URL}/carritos/mio`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((respuesta) => {
        if (!respuesta.ok) {
          return respuesta.json()
            .catch(() => ({}))
            .then((datosError) => {
              return Promise.reject(new Error(
                datosError.mensaje || 'No se pudo consultar el carrito'
              ))
            })
        }

        return respuesta.json()
      })
      .then((datosCarrito) => {
        if (!vigente || token !== localStorage.getItem('jwtToken')) return null
        if (datosCarrito.mensaje && !datosCarrito.idCarrito) {
          actualizarMensajeVacio(datosCarrito.mensaje)
          return null
        }

        actualizarMensajeVacio('')

        return Promise.all([
          fetch(
            `${API_URL}/publicaciones/${datosCarrito.idPublicacion}`,
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          )
            .then((respuestaPublicacion) => {
              if (!respuestaPublicacion.ok) {
                return respuestaPublicacion.json()
                  .catch(() => ({}))
                  .then((datosError) => {
                    return Promise.reject(new Error(
                      datosError.mensaje || 'No se pudo consultar la publicación'
                    ))
                  })
              }

              return respuestaPublicacion.json()
            }),
          fetch(
            `${API_URL}/disponibilidades/publicacion/${datosCarrito.idPublicacion}`,
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          )
            .then((respuestaPeriodos) => {
              if (!respuestaPeriodos.ok) {
                return respuestaPeriodos.json()
                  .catch(() => ({}))
                  .then((datosError) => {
                    return Promise.reject(new Error(
                      datosError.mensaje || 'No se pudieron consultar los períodos disponibles.'
                    ))
                  })
              }

              return respuestaPeriodos.json()
            })
        ])
          .then(([publicacion, datosPeriodos]) => {
            // Adapta las fechas del backend al formato que recibe el calendario.
            const periodos = datosPeriodos.map((periodo) => ({
              desde: periodo.fechaInicio,
              hasta: periodo.fechaFin
            }))

            return {
              ...datosCarrito,
              publicacion: {
                ...publicacion,
                periodos
              }
            }
          })
      })
      .then((carritoCompleto) => {
        if (!vigente || token !== localStorage.getItem('jwtToken')) return
        if (carritoCompleto === null) {
          actualizarCarrito(null)
          actualizarCarritoConsultado(true)
          return
        }

        const vencimiento = new Date(carritoCompleto.fechaExpiracion).getTime()
        const ahora = Date.now()
        const segundosRestantes = Math.max(
          0,
          Math.ceil((vencimiento - ahora) / 1000)
        )

        actualizarCarrito({ ...carritoCompleto, segundosRestantes })
        actualizarCarritoConsultado(true)
      })
      .catch((error) => {
        if (!vigente || token !== localStorage.getItem('jwtToken')) return
        console.error('Error al cargar el carrito:', error)
        actualizarMensaje(
          error instanceof TypeError
            ? 'No pudimos conectar con el servidor. Intentá nuevamente.'
            : error.message || 'No pudimos cargar tu carrito. Intentá nuevamente más tarde.'
        )
      })
    return () => { vigente = false }
  }, [carritoConsultado, actualizarCarrito, actualizarCarritoConsultado, token])

  const fechaExpiracion = carrito ? carrito.fechaExpiracion : null

  // Actualiza el contador y detiene el intervalo al salir.
  useEffect(() => {
    if (!fechaExpiracion) return

    const intervalo = setInterval(() => {
      if (token !== localStorage.getItem('jwtToken')) return
      const vencimiento = new Date(fechaExpiracion).getTime()
      const segundosRestantes = Math.max(
        0,
        Math.ceil((vencimiento - Date.now()) / 1000)
      )

      actualizarCarrito((carritoActual) => {
        if (carritoActual === null) return null

        return {
          ...carritoActual,
          segundosRestantes
        }
      })
    }, 1000)

    return () => clearInterval(intervalo)
  }, [fechaExpiracion, actualizarCarrito, token])
  
  const abrirModalQuitar =()=>{
    if (quitando || guardandoFechas) return

    actualizarMensaje('')
    actualizarModalQuitar(true)
  }

  const cerrarModalQuitar = () => {
    if (quitando) return

    actualizarMensaje('')
    actualizarModalQuitar(false)
  }

  // Prepara la eliminación después de confirmar el modal.
  const quitarCarrito = () => {
    if (carrito === null || quitando || guardandoFechas) return

    actualizarQuitando(true)
    actualizarMensaje('')

    actualizarDatosParaQuitar({ idCarrito: carrito.idCarrito, token })
  }

  // Elimina el carrito confirmado y actualiza los datos de App.
  useEffect(() => {
    if (datosParaQuitar === null) return

    let vigente = true
    const { idCarrito, token } = datosParaQuitar

    fetch(`${API_URL}/carritos/${idCarrito}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((respuesta) => {
        if (!respuesta.ok) {
          return respuesta.json()
            .catch(() => ({}))
            .then((datosError) => {
              return Promise.reject(new Error(
                datosError.mensaje || 'No se pudo quitar el carrito'
              ))
            })
        }

        if (!vigente || token !== localStorage.getItem('jwtToken')) return
        actualizarCarrito(null)
        actualizarMensajeVacio('')
        actualizarModalQuitar(false)
      })
      .catch((error) => {
        if (!vigente || token !== localStorage.getItem('jwtToken')) return
        console.error('Error al quitar el carrito:', error)
        actualizarMensaje(
          error instanceof TypeError
            ? 'No pudimos conectar con el servidor. Intentá nuevamente.'
            : error.message || 'No pudimos quitar el vehículo. Intentá nuevamente.'
        )
      })
      .finally(() => {
        if (!vigente || token !== localStorage.getItem('jwtToken')) return
        actualizarQuitando(false)
        actualizarDatosParaQuitar(null)
      })
    return () => { vigente = false }
  }, [datosParaQuitar, actualizarCarrito])

  // Prepara el guardado. CartVehicle entrega también una función para cerrar el editor si sale bien.
  const guardarFechas = (fechaInicio, fechaFin, alGuardarCorrectamente) => {
    if (carrito === null || guardandoFechas || quitando) return

    actualizarGuardandoFechas(true)
    actualizarMensajeFechas('')

    actualizarFechasParaGuardar({
      idCarrito: carrito.idCarrito,
      fechaInicio,
      fechaFin,
      publicacion: carrito.publicacion,
      alGuardarCorrectamente,
      token
    })
  }

  // Guarda las fechas confirmadas y usa la respuesta para actualizar App.
  useEffect(() => {
    if (fechasParaGuardar === null) return

    let vigente = true
    const {
      token,
      idCarrito,
      fechaInicio,
      fechaFin,
      publicacion,
      alGuardarCorrectamente
    } = fechasParaGuardar

    fetch(
      `${API_URL}/carritos/${idCarrito}/fechas`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fechaInicio, fechaFin })
      }
    )
      .then((respuesta) => {
        if (!respuesta.ok) {
          return respuesta.json()
            .catch(() => ({}))
            .then((datosError) => {
              return Promise.reject(new Error(
                datosError.mensaje || 'No se pudieron modificar las fechas.'
              ))
            })
        }

        return respuesta.json()
      })
      .then((datosCarrito) => {
        if (!vigente || token !== localStorage.getItem('jwtToken')) return
        actualizarCarrito({
          ...datosCarrito,
          publicacion
        })

        alGuardarCorrectamente()
      })
      .catch((error) => {
        if (!vigente || token !== localStorage.getItem('jwtToken')) return
        actualizarMensajeFechas(
          error instanceof TypeError
            ? 'No pudimos conectar con el servidor. Intentá nuevamente.'
            : error.message || 'No se pudieron modificar las fechas.'
        )
      })
      .finally(() => {
        if (!vigente || token !== localStorage.getItem('jwtToken')) return
        actualizarGuardandoFechas(false)
        actualizarFechasParaGuardar(null)
      })
    return () => { vigente = false }
  }, [fechasParaGuardar, actualizarCarrito])

  if (carrito === null) {
    return (
      <main className="flex flex-1 items-start justify-center w-full max-w-page mx-auto px-(--gutter) pt-16 pb-16 phone:pt-7 phone:pb-10">
        <section className="w-full max-w-[26.25rem] px-8 py-10 bg-card border border-border rounded-lg text-center phone:px-5 phone:py-8" aria-labelledby="cart-empty-title">
          <CartIcon size={48} className="block mx-auto mb-5 text-disabled" />
          <h1 id="cart-empty-title" className="text-[1.625rem] leading-[1.3] text-ink phone:text-[1.5rem]">
            {mensaje ? 'No pudimos cargar tu carrito' : mensajeVacio || 'Tu carrito está vacío'}
          </h1>
          {mensaje ? (
            <p role="alert" className="mt-3 p-3 bg-red-50 border border-red-200 rounded-[0.25rem] text-[0.75rem] leading-[1.7] text-red-700">{mensaje}</p>
          ) : (
            <p className="mt-3 text-[0.75rem] leading-[1.7] text-muted">
              Cuando elijas un auto y sus fechas, lo retenemos acá por 15 minutos mientras confirmás.
            </p>
          )}
          <Link to="/" className="flex items-center justify-center gap-2 w-full mt-6 px-4 py-3 bg-ink border border-ink rounded-[0.25rem] text-[0.6875rem] text-white">Explorar catálogo de vehículos</Link>
        </section>
      </main>
    )
  }

  const segundosRestantes = Math.max(
    0,
    Math.ceil((new Date(carrito.fechaExpiracion).getTime() - Date.now()) / 1000)
  )

  const estaVencido = segundosRestantes === 0

  return (
    <main className="flex-1 w-full max-w-page mx-auto px-(--gutter) pt-10 pb-16 phone:pt-7 phone:pb-10">
      <header className="flex items-center justify-between gap-4 mb-6 phone:flex-col phone:items-start">
        <div>
          <h1 className="text-[2.25rem] leading-[1.2] text-ink phone:text-[1.875rem]">Tu carrito</h1>
          <p className="mt-1.5 text-[0.75rem] text-muted">Podés tener un auto por vez en el carrito.</p>
        </div>
        <span className="text-[0.625rem] tracking-[0.06em] uppercase text-muted">Paso 1 de 2: revisión</span>
      </header>

      <CartNotice
        segundosRestantes={segundosRestantes}
        idPublicacion={carrito.idPublicacion}
      />

      <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] items-start gap-6 tablet:grid-cols-1">
        <CartVehicle
          carrito={{ ...carrito, segundosRestantes }}
          alQuitar={abrirModalQuitar}
          alGuardarFechas={guardarFechas}
          guardandoFechas={guardandoFechas}
          quitando={quitando}
          mensajeFechas={mensajeFechas}
        />
        <CartSummary
          carrito={carrito}
          estaVencido={estaVencido}
          bloqueado={guardandoFechas || quitando}
        />
      </div>

      {
        mostrarModalQuitar && (
          <ConfirmCartRemoval
            carrito={carrito}
            alCerrar={cerrarModalQuitar}
            alConfirmar={quitarCarrito}
            quitando={quitando}
            mensaje={mensaje}
          />
        )}
    </main>
  )
}
