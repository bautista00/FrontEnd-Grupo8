import ConfirmarAccion from '../ui/ConfirmarAccion'

export default function ConfirmarCancelacion({ reserva, alCerrar, alConfirmar, cancelando, mensaje }) {
  const formato = new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
  const inicio = formato.format(new Date(reserva.fechaInicio + 'T12:00:00'))
  const fin = formato.format(new Date(reserva.fechaFin + 'T12:00:00'))

  return <ConfirmarAccion
    titulo="¿Cancelar la reserva?"
    descripcion={`Las fechas del ${inicio} al ${fin} quedan libres para otras personas. No se puede deshacer.`}
    confirmar="Sí, cancelar reserva"
    cancelar="No, mantener reserva"
    textoProcesando="Cancelando…"
    procesando={cancelando}
    mensaje={mensaje}
    alCerrar={alCerrar}
    alConfirmar={alConfirmar}
  />
}
