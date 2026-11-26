import { useSelector } from 'react-redux'
import { btnBase, btnDark, btnOutline, btnSize } from '../ui/estilosBoton'
import { devolucionPendiente } from '../../utils/resenas'

// Chip "Devolución pendiente" y los botones para confirmarla (propietario) o calificar.
// Los modales viven en MisReservas: la tarjeta cambia de lista al finalizar la reserva.
export default function AccionesReserva({ reserva, alConfirmarDevolucion, alCalificar }) {
  const idUsuario = useSelector((state) => state.users.user?.idUsuario)
  const pendientes = useSelector((state) => state.resenas.pendientes.datos)
  const esPropietario = reserva.propietario?.idUsuario === idUsuario
  const pendiente = devolucionPendiente(reserva)
  const puedeCalificar = pendientes?.some((item) => item.idReserva === reserva.idReserva)

  if (!pendiente && !puedeCalificar) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {pendiente && (
        <span className="rounded-[0.1875rem] border border-amber-200 bg-amber-50 px-2 py-[0.1875rem] text-[0.625rem] font-semibold text-amber-700">Devolución pendiente</span>
      )}
      {pendiente && esPropietario && (
        <button type="button" onClick={() => alConfirmarDevolucion(reserva)} className={`${btnBase} ${btnDark} ${btnSize} text-[0.625rem]`}>Confirmar devolución</button>
      )}
      {puedeCalificar && (
        <button type="button" onClick={() => alCalificar(reserva)} className={`${btnBase} ${btnOutline} ${btnSize}`}>Calificar</button>
      )}
    </div>
  )
}
