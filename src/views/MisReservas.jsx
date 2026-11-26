/**
 * Carga las reservas del usuario y las organiza en próximas e historial.
 * Entrega los datos a las listas y tarjetas; el filtro utiliza la información ya cargada.
 */

import FiltrosReservas from "../components/misReservas/FiltrosReservas"
import HistorialReservas from "../components/misReservas/HistorialReservas"
import ProximasReservas from "../components/misReservas/ProximasReservas"
import SinReservas from "../components/misReservas/SinReservas"
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { fetchMisReservas, fetchReservasDeMisVehiculos, finalizarReserva } from '../components/Redux/reservasSlice'
import { fetchPendientes } from '../components/Redux/resenasSlice'
import ConfirmarAccion from '../components/ui/ConfirmarAccion'
import ModalCalificacion from '../components/resenas/ModalCalificacion'
import { otraParteDe } from '../utils/resenas'


export default function MisReservas() {
  const dispatch = useDispatch()
  const [filtroSeleccionado, actualizarFiltro] = useState('todas')
  const [vista, actualizarVista] = useState('hice')
  const [confirmando, actualizarConfirmando] = useState(null)
  const [error, actualizarError] = useState(null)
  const [finalizando, actualizarFinalizando] = useState(false)
  const [calificando, actualizarCalificando] = useState(null)
  const idUsuario = useSelector((state) => state.users.user?.idUsuario)
  const estado = useSelector((state) => state.reservas)
  const propias = vista === 'hice'
  // "Reservas de mis autos" no tiene pagos: los pagos son del conductor
  const { reservas, publicaciones, pagos, cargadas, loading, error: mensaje } = propias
    ? estado
    : { reservas: estado.reservasDeMisAutos, publicaciones: estado.publicacionesDeMisAutos, pagos: [], cargadas: estado.cargadasDeMisAutos, loading: estado.loadingDeMisAutos, error: estado.errorDeMisAutos }

  // Obtiene las reservas del usuario y los datos necesarios para mostrar sus tarjetas.
  useEffect(() => {
    dispatch(fetchMisReservas())
    dispatch(fetchReservasDeMisVehiculos())
    dispatch(fetchPendientes())
  }, [dispatch])

  // El propietario confirma la devolución; si sale bien se abre el modal para calificar
  async function confirmarDevolucion() {
    const reserva = confirmando
    actualizarFinalizando(true)
    actualizarError(null)
    try {
      await dispatch(finalizarReserva({ idReserva: reserva.idReserva })).unwrap()
      toast.success('Devolución confirmada')
      dispatch(fetchPendientes())
      actualizarConfirmando(null)
      actualizarCalificando({ idReserva: reserva.idReserva, ...otraParteDe(reserva, idUsuario) })
    } catch (e) {
      actualizarError(e.message)
    } finally {
      actualizarFinalizando(false)
    }
  }

  // Estas listas se calculan con los datos cargados; cambiar el filtro no hace otro GET.
  const proximasReservas = reservas.filter((reserva) => reserva.estado === 'CONFIRMADA' || reserva.estado === 'PENDIENTE')
  const reservasHistorial = reservas.filter((reserva) => ['FINALIZADA', 'CANCELADA', 'RECHAZADA'].includes(reserva.estado))
  const hayReservasConfirmadas = proximasReservas.some((reserva) => reserva.estado === 'CONFIRMADA')

  const calificarReserva = (reserva) => actualizarCalificando({ idReserva: reserva.idReserva, ...otraParteDe(reserva, idUsuario) })

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
      {(!mensaje || cargadas) && (loading && !cargadas ? (
        <p className="text-[0.75rem] text-muted">Cargando tus reservas…</p>
      ) : reservas.length === 0 ? (
        <SinReservas mensaje={propias ? 'Todavía no tenés reservas.' : 'Todavía no reservaron tus autos.'} />
      ) : (
        <>
          {(filtroSeleccionado === 'todas' || filtroSeleccionado === 'proximas') && (
            <ProximasReservas reservas={proximasReservas} publicaciones={publicaciones} pagos={pagos} alConfirmarDevolucion={actualizarConfirmando} alCalificar={calificarReserva} />
          )}

          {(filtroSeleccionado === 'todas' || filtroSeleccionado === 'historial') && (
            <HistorialReservas reservas={reservasHistorial} publicaciones={publicaciones} pagos={pagos} alConfirmarDevolucion={actualizarConfirmando} alCalificar={calificarReserva} />
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
          mensaje={error}
          alCerrar={() => { actualizarConfirmando(null); actualizarError(null) }}
          alConfirmar={confirmarDevolucion}
        />
      )}
      {calificando && <ModalCalificacion {...calificando} alCerrar={() => actualizarCalificando(null)} />}
    </main>
  )
}
