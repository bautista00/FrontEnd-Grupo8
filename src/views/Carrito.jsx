/**
 * Muestra el carrito y permite cambiar fechas o quitar el vehículo.
 * Lee el carrito del store de Redux y coordina las modificaciones del backend.
 */

import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { CartIcon } from '../components/iconos/Iconos'
import AvisoCarrito from "../components/carrito/AvisoCarrito"
import ResumenCarrito from "../components/carrito/ResumenCarrito"
import VehiculoCarrito from "../components/carrito/VehiculoCarrito"
import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCarrito, modificarFechasCarrito, eliminarCarrito, limpiarErrorQuitar } from '../components/Redux/carritoSlice'
import ConfirmarQuitarCarrito from '../components/carrito/ConfirmarQuitarCarrito'

export default function Carrito() {
  const dispatch = useDispatch()
  const token = useSelector((state) => state.users.token)
  const { carrito, carritoConsultado, loading, error, guardandoFechas, errorFechas, idCarritoFechas, quitando, errorQuitar, idCarritoQuitar } = useSelector((state) => state.carrito)
  const mensajeFechas = String(idCarritoFechas) === String(carrito?.idCarrito) ? errorFechas : null
  const mensajeQuitar = String(idCarritoQuitar) === String(carrito?.idCarrito) ? errorQuitar : null
  const vigente = useRef(false)
  // Hora local usada para calcular cuánto falta hasta el vencimiento del backend.
  const [ahora, actualizarAhora] = useState(() => Date.now())
  const [mostrarModalQuitar, actualizarModalQuitar]=useState(false)

  // Evita cerrar el editor o el modal desde una pantalla que ya se desmontó.
  useEffect(() => {
    vigente.current = true
    return () => { vigente.current = false }
  }, [])

  // Recupera el carrito, su publicación y sus períodos solo si todavía no los conocemos.
  useEffect(() => {
    if (carritoConsultado || !token) return
    dispatch(fetchCarrito())
  }, [carritoConsultado, token, dispatch])

  // Actualiza la hora cada segundo y detiene el intervalo al salir de la vista.
  useEffect(() => {
    const intervalo = setInterval(() => {
      actualizarAhora(Date.now())
    }, 1000)

    return () => clearInterval(intervalo)
  }, [])
  
  const abrirModalQuitar =()=>{
    if (quitando || guardandoFechas) return

    dispatch(limpiarErrorQuitar())
    actualizarModalQuitar(true)
  }

  const cerrarModalQuitar = () => {
    if (quitando) return

    dispatch(limpiarErrorQuitar())
    actualizarModalQuitar(false)
  }

  // Despacha la eliminación después de confirmar el modal.
  const quitarCarrito = async () => {
    if (carrito === null || quitando || guardandoFechas) return

    try {
      await dispatch(eliminarCarrito({ idCarrito: carrito.idCarrito })).unwrap()
      if (vigente.current) {
        actualizarModalQuitar(false)
        toast.success('Se quitó el auto de tu carrito.')
      }
    } catch {
      // El modal permanece abierto y muestra el error guardado en Redux.
    }
  }

  // Guarda mediante Redux y cierra el editor después de recibir la confirmación.
  const guardarFechas = async (fechaInicio, fechaFin, alGuardarCorrectamente) => {
    if (carrito === null || guardandoFechas || quitando) return

    try {
      await dispatch(modificarFechasCarrito({
        idCarrito: carrito.idCarrito,
        fechaInicio,
        fechaFin
      })).unwrap()
      if (vigente.current) {
        alGuardarCorrectamente()
        toast.success('Se actualizaron las fechas del carrito.')
      }
    } catch {
      // El error del slice llega al editor mediante mensajeFechas.
    }
  }

  if (carrito === null && (loading || (!carritoConsultado && !error))) {
    return (
      <main className="flex-1 w-full max-w-page mx-auto px-(--gutter) pt-10 pb-16">
        <p role="status" className="text-[0.75rem] text-muted">Cargando tu carrito…</p>
      </main>
    )
  }

  if (carrito === null) {
    return (
      <main className="flex flex-1 items-start justify-center w-full max-w-page mx-auto px-(--gutter) pt-16 pb-16 phone:pt-7 phone:pb-10">
        <section className="w-full max-w-[26.25rem] px-8 py-10 bg-card border border-border rounded-lg text-center phone:px-5 phone:py-8" aria-labelledby="cart-empty-title">
          <CartIcon size={48} className="block mx-auto mb-5 text-disabled" />
          <h1 id="cart-empty-title" className="text-[1.625rem] leading-[1.3] text-ink phone:text-[1.5rem]">
            {error ? 'No pudimos cargar tu carrito' : 'Tu carrito está vacío'}
          </h1>
          {error ? (
            <p role="alert" className="mt-3 p-3 bg-red-50 border border-red-200 rounded-[0.25rem] text-[0.75rem] leading-[1.7] text-red-700">{error}</p>
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
    Math.ceil((new Date(carrito.fechaExpiracion).getTime() - ahora) / 1000)
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

      <AvisoCarrito
        segundosRestantes={segundosRestantes}
        idPublicacion={carrito.idPublicacion}
      />

      <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] items-start gap-6 tablet:grid-cols-1">
        <VehiculoCarrito
          carrito={{ ...carrito, segundosRestantes }}
          alQuitar={abrirModalQuitar}
          alGuardarFechas={guardarFechas}
          guardandoFechas={guardandoFechas}
          quitando={quitando}
          mensajeFechas={mensajeFechas}
        />
        <ResumenCarrito
          carrito={carrito}
          estaVencido={estaVencido}
          bloqueado={guardandoFechas || quitando}
        />
      </div>

      {
        mostrarModalQuitar && (
          <ConfirmarQuitarCarrito
            carrito={carrito}
            alCerrar={cerrarModalQuitar}
            alConfirmar={quitarCarrito}
            quitando={quitando}
            mensaje={mensajeQuitar}
          />
        )}
    </main>
  )
}
