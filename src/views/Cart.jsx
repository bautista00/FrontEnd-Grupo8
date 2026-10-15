import { Link } from 'react-router-dom'
import { CartIcon } from '../components/icons/Icons'
import CartNotice from "../components/cart/CartNotice"
import CartSummary from "../components/cart/CartSummary"
import CartVehicle from "../components/cart/CartVehicle"
import { useState,useEffect } from 'react'   
import ConfirmCartRemoval from '../components/cart/ConfirmCartRemoval'

export default function Cart() {
  //Controla si aparece el modal para quietar la publicacion del carrito. 
  const [mostrarModalQuitar, actualizarModalQuitar]=useState(false)

  //Guarda el carrito desde el back, empieza en null porq todavia no recibimos nada
  const [carrito,actualizarCarrito] = useState(null)

  // Guarda los errores que mostramos en pantalla.
  const [mensaje, actualizarMensaje] = useState('')

  //direccion del backend para consultar el carrito del usuario
  const URL = 'http://localhost:8080/carritos/mio'

  // Al entrar a la vista, consulta el carrito y su publicación.
  useEffect(() => {
    // Nombre provisional: coordinar esta clave con el login.
    const token = localStorage.getItem('jwtToken')

    // Sin sesión, no hacemos las consultas.
    if (!token) return

    // 1. Consultamos el carrito del usuario.
    fetch(URL, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((respuesta) => {
        // 204 significa que el carrito está vacío.
        if (respuesta.status === 204) return null

        if (!respuesta.ok) {
          throw new Error('No se pudo consultar el carrito')
        }

        return respuesta.json()
      })
      .then((datosCarrito) => {
        // Si está vacío, no necesitamos consultar una publicación.
        if (datosCarrito === null) return null

        // 2. Consultamos la publicación que está en ese carrito.
        return fetch(
          `http://localhost:8080/publicaciones/${datosCarrito.idPublicacion}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
          .then((respuestaPublicacion) => {
            if (!respuestaPublicacion.ok) {
              throw new Error('No se pudo consultar la publicación')
            }

            return respuestaPublicacion.json()
          })
          .then((publicacion) => {
            // 3. Juntamos el carrito y la publicación.
            return {
              ...datosCarrito,
              publicacion: publicacion
            }
          })
      })
      .then((carritoCompleto) => {
        if (carritoCompleto === null) {
          actualizarCarrito(null)
          return
        }

        // Calculamos el tiempo cuando recibimos el carrito real.
        const vencimiento = new Date(carritoCompleto.fechaExpiracion).getTime()
        const ahora = Date.now()
        const segundosRestantes = Math.max(
          0,
          Math.ceil((vencimiento - ahora) / 1000)
        )

        // 4. Guardamos el carrito junto al tiempo calculado en el frontend.
        actualizarCarrito({ ...carritoCompleto, segundosRestantes })
      })
      .catch((error) => {
        // Maneja los errores de cualquiera de las consultas.
        console.error('Error al cargar el carrito:', error)
        actualizarMensaje('No pudimos cargar tu carrito. Intentá nuevamente más tarde.')
      })
  }, [])

  // Obtenemos el vencimiento cuando ya existe un carrito.
  const fechaExpiracion = carrito ? carrito.fechaExpiracion : null

  useEffect(() => {
    if (!fechaExpiracion) return

    // Recalculamos el tiempo restante cada segundo.
    const intervalo = setInterval(() => {
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

    // Detenemos el intervalo al salir o cambiar el vencimiento.
    return () => clearInterval(intervalo)
  }, [fechaExpiracion])
  
  const abrirModalQuitar =()=>{
    actualizarMensaje('')
    actualizarModalQuitar(true)
  }

  const cerrarModalQuitar = () => {
    actualizarMensaje('')
    actualizarModalQuitar(false)
  }

  const quitarCarrito = () => {
    if (carrito === null) return

    const token = localStorage.getItem('jwtToken')
    if (!token) {
      actualizarMensaje('Necesitás iniciar sesión para quitar el vehículo del carrito.')
      return
    }

    actualizarMensaje('')

    // Pedimos al backend que elimine este carrito.
    fetch(`http://localhost:8080/carritos/${carrito.idCarrito}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((respuesta) => {
        if (!respuesta.ok) {
          throw new Error('No se pudo quitar el carrito')
        }

        // El backend confirmó: vaciamos el estado y cerramos el modal.
        actualizarCarrito(null)
        actualizarModalQuitar(false)
      })
      .catch((error) => {
        console.error('Error al quitar el carrito:', error)
        actualizarMensaje('No pudimos quitar el vehículo. Intentá nuevamente.')
      })
  }

  // null significa que no hay un carrito. Comprobamos esto antes de acceder a sus datos.
  // Una respuesta 204 se representa como null en el frontend.
  if (carrito === null) {
    // Este return termina la función: no se calculan tiempos ni se muestran las tarjetas.
    // Navbar y Footer siguen apareciendo porque App.jsx los muestra fuera de esta vista.
    return (
      <main className="flex flex-1 items-start justify-center w-full max-w-page mx-auto px-(--gutter) pt-16 pb-16 phone:pt-7 phone:pb-10">
        <section className="w-full max-w-[26.25rem] px-8 py-10 bg-card border border-border rounded-lg text-center phone:px-5 phone:py-8" aria-labelledby="cart-empty-title">
          {/* Reutilizamos el mismo ícono que ya existe para el carrito en Navbar. */}
          <CartIcon size={48} className="block mx-auto mb-5 text-disabled" />
          <h1 id="cart-empty-title" className="text-[1.625rem] leading-[1.3] text-ink phone:text-[1.5rem]">
            {mensaje ? 'No pudimos cargar tu carrito' : 'Tu carrito está vacío'}
          </h1>
          {/* Un error de consulta no significa que el carrito esté vacío. */}
          {mensaje ? (
            <p role="alert" className="mt-3 p-3 bg-red-50 border border-red-200 rounded-[0.25rem] text-[0.75rem] leading-[1.7] text-red-700">{mensaje}</p>
          ) : (
            <p className="mt-3 text-[0.75rem] leading-[1.7] text-muted">
              Cuando elijas un auto y sus fechas, lo retenemos acá por 15 minutos mientras confirmás.
            </p>
          )}
          {/* Link navega a la ruta del catálogo que ya está registrada en App.jsx. */}
          <Link to="/" className="flex items-center justify-center gap-2 w-full mt-6 px-4 py-3 bg-ink border border-ink rounded-[0.25rem] text-[0.6875rem] text-white">Explorar catálogo de vehículos</Link>
        </section>
      </main>
    )
  }

  // El segundo efecto mantiene actualizado el tiempo restante.
  const segundosRestantes = carrito.segundosRestantes

  // El resumen también necesita saber si el carrito venció.
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

      {/* El componente decide qué aviso y contador mostrar. */}
      <CartNotice segundosRestantes={segundosRestantes} />

      {/* Conservamos los datos para mostrar qué carrito venció. */}
      <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] items-start gap-6 tablet:grid-cols-1">
        <CartVehicle carrito={carrito} alQuitar={abrirModalQuitar}  />
        {/* Pasamos estaVencido como prop para que el resumen adapte su botón. */}
        <CartSummary carrito={carrito} estaVencido={estaVencido} />
      </div>

      {/* Aparece cuando mostrarModalQuitar es true. */}
      {
        mostrarModalQuitar && (
          <ConfirmCartRemoval
            carrito={carrito}
            alCerrar={cerrarModalQuitar}
            alConfirmar={quitarCarrito}
            mensaje={mensaje}
          />
        )}
    </main>
  )
}
