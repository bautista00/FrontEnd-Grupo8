/**
 * Carga las reservas del usuario y las organiza en próximas e historial.
 * Entrega los datos a las listas y tarjetas; el filtro utiliza la información ya cargada.
 */

import FiltrosReservas from "../components/misReservas/FiltrosReservas"
import HistorialReservas from "../components/misReservas/HistorialReservas"
import ProximasReservas from "../components/misReservas/ProximasReservas"
import SinReservas from "../components/misReservas/SinReservas"
import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { fetchMisReservas, fetchReservasDeMisVehiculos, finalizarReserva, limpiarErrorFinalizar } from '../components/Redux/reservasSlice'
import { fetchPendientes } from '../components/Redux/resenasSlice'
import ConfirmarAccion from '../components/ui/ConfirmarAccion'
import ModalCalificacion from '../components/resenas/ModalCalificacion'
import { otraParteDe } from '../utils/resenas'


export default function MisReservas() {
  const dispatch = useDispatch()
  const [filtroSeleccionado, actualizarFiltro] = useState('todas')
  const [vista, actualizarVista] = useState('hice')
  const [confirmando, actualizarConfirmando] = useState(null)
  const [calificando, actualizarCalificando] = useState(null)
  const idUsuario = useSelector((state) => state.users.user?.idUsuario)
  const estado = useSelector((state) => state.reservas)
  const { finalizando, errorFinalizar, idReservaFinalizar } = estado
  const vigente = useRef(false)
  const propias = vista === 'hice'
  // "Reservas de mis autos" no tiene pagos: los pagos son del conductor
  const { reservas, publicaciones, pagos, cargadas, loading, error: mensaje } = propias
    ? estado
    : { reservas: estado.reservasDeMisAutos, publicaciones: estado.publicacionesDeMisAutos, pagos: [], cargadas: estado.cargadasDeMisAutos, loading: estado.loadingDeMisAutos, error: estado.errorDeMisAutos }

  // Obtiene las reservas del usuario y los datos necesarios para mostrar sus tarjetas.
  useEffect(() => {
    vigente.current = true
    dispatch(fetchMisReservas())
    dispatch(fetchReservasDeMisVehiculos())
    dispatch(fetchPendientes())
    return () => { vigente.current = false }
  }, [dispatch])

  // El propietario confirma la devolución; si sale bien se abre el modal para calificar
  async function confirmarDevolucion() {
    if (!confirmando || finalizando) return
    const reserva = confirmando
    try {
      const guardada = await dispatch(finalizarReserva({ idReserva: reserva.idReserva })).unwrap()
      if (!vigente.current) return
      toast.success('Devolución confirmada')
      dispatch(fetchPendientes())
      actualizarConfirmando(null)
      actualizarCalificando({ idReserva: guardada.idReserva, ...otraParteDe(guardada, idUsuario) })
    } catch {
      // el modal muestra el error del slice
    }
  }

  // Estas listas se calculan con los datos cargados; cambiar el filtro no hace otro GET.
  const hoy = new Date()
  const fechaActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`
  const esProxima = (reserva) => ['CONFIRMADA', 'PENDIENTE'].includes(reserva.estado) && reserva.fechaFin >= fechaActual
  const proximasReservas = reservas.filter(esProxima)
  const reservasHistorial = reservas.filter((reserva) => !esProxima(reserva))
  const hayReservasConfirmadas = proximasReservas.some((reserva) => reserva.estado === 'CONFIRMADA')

  const calificarReserva = (reserva) => actualizarCalificando({ idReserva: reserva.idReserva, ...otraParteDe(reserva, idUsuario) })
  function abrirDevolucion(reserva) {
    dispatch(limpiarErrorFinalizar())
    actualizarConfirmando(reserva)
  }

  return (
    <main className="flex-1 w-full max-w-page mx-auto px-(--gutter) pt-10 pb-16">
      <header className="mb-6">
        <h1 className="text-[2.25rem] leading-[1.2] text-ink">
          Mis reservas
        </h1>
        <p className="mt-2 text-[0.75rem] text-muted">
          Consultá el estado de tus alquileres, las fechas y los pagos.
        </p>
      </header>

      {mensaje && (
        <p role="alert" className="mb-4 text-[0.75rem] text-error">
          {mensaje}
        </p>
      )}

      <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Qué reservas ver">
        {[['hice', 'Reservas que hice'], ['mis-autos', 'Reservas de mis autos']].map(([id, texto]) => (
          <button key={id} type="button" aria-pressed={vista === id} onClick={() => actualizarVista(id)}
            className={`px-3 py-2 border rounded-[0.1875rem] text-[0.6875rem] ${vista === id ? 'border-ink bg-ink text-white' : 'border-border bg-transparent text-soft'}`}>
            {texto}
          </button>
        ))}
      </div>

      <FiltrosReservas hayReservasConfirmadas={hayReservasConfirmadas} filtroSeleccionado={filtroSeleccionado} alCambiar={actualizarFiltro}/>

      <p role="status" className="sr-only">{loading && cargadas ? 'Actualizando tus reservas…' : ''}</p>
      <div aria-busy={loading}>
      {(!mensaje || cargadas) && (!cargadas ? (
        <p className="text-[0.75rem] text-muted">Cargando tus reservas…</p>
      ) : reservas.length === 0 ? (
        <SinReservas mensaje={propias ? 'Todavía no tenés reservas.' : 'Todavía no reservaron tus autos.'} />
      ) : (
        <>
          {(filtroSeleccionado === 'todas' || filtroSeleccionado === 'proximas') && (
            <ProximasReservas reservas={proximasReservas} publicaciones={publicaciones} pagos={pagos} alConfirmarDevolucion={abrirDevolucion} alCalificar={calificarReserva} />
          )}

          {(filtroSeleccionado === 'todas' || filtroSeleccionado === 'historial') && (
            <HistorialReservas reservas={reservasHistorial} publicaciones={publicaciones} alConfirmarDevolucion={abrirDevolucion} alCalificar={calificarReserva} />
          )}
        </>
      ))}
      </div>

      {confirmando && (
        <ConfirmarAccion
          titulo="¿Ya recibiste tu auto?"
          descripcion="Al confirmar, la reserva queda finalizada y los dos pueden calificarse."
          confirmar="Sí, lo recibí"
          cancelar="Todavía no"
          procesando={finalizando}
          textoProcesando="Confirmando…"
          mensaje={idReservaFinalizar === confirmando.idReserva ? errorFinalizar : null}
          alCerrar={() => actualizarConfirmando(null)}
          alConfirmar={confirmarDevolucion}
        />
      )}
      {calificando && <ModalCalificacion {...calificando} alCerrar={() => actualizarCalificando(null)} />}
    </main>
  )
}
