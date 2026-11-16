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
import { fetchMisReservas } from '../components/Redux/reservasSlice'


export default function MisReservas() {
  const dispatch = useDispatch()
  const [filtroSeleccionado, actualizarFiltro] = useState('todas')
  const { reservas, publicaciones, pagos, loading, error: mensaje } = useSelector((state) => state.reservas)

  // Obtiene las reservas del usuario y los datos necesarios para mostrar sus tarjetas.
  useEffect(() => {
    dispatch(fetchMisReservas())
  }, [dispatch])

  // Estas listas se calculan con los datos cargados; cambiar el filtro no hace otro GET.
  const proximasReservas = reservas.filter((reserva) => reserva.estado === 'CONFIRMADA' || reserva.estado === 'PENDIENTE')
  const reservasHistorial = reservas.filter((reserva) => ['FINALIZADA', 'CANCELADA', 'RECHAZADA'].includes(reserva.estado))
  const hayReservasConfirmadas = proximasReservas.some((reserva) => reserva.estado === 'CONFIRMADA')

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

      <FiltrosReservas hayReservasConfirmadas={hayReservasConfirmadas} filtroSeleccionado={filtroSeleccionado} alCambiar={actualizarFiltro}/>

      {!mensaje && (loading ? (
        <p className="text-[0.75rem] text-muted">Cargando tus reservas…</p>
      ) : reservas.length === 0 ? (
        <SinReservas mensaje="Todavía no tenés reservas." />
      ) : (
        <>
          {(filtroSeleccionado === 'todas' || filtroSeleccionado === 'proximas') && (
            <ProximasReservas reservas={proximasReservas} publicaciones={publicaciones} pagos={pagos} />
          )}

          {(filtroSeleccionado === 'todas' || filtroSeleccionado === 'historial') && (
            <HistorialReservas reservas={reservasHistorial} publicaciones={publicaciones} pagos={pagos} />
          )}
        </>
      ))}
    </main>
  )
}
