import { formatearFecha } from '../../utils/formatos'
import ConfirmarAccion from '../ui/ConfirmarAccion'

export default function ConfirmarQuitarCarrito({ carrito, alCerrar, alConfirmar, mensaje, quitando = false }) {
  const vehiculo = carrito.publicacion
  return <ConfirmarAccion
    titulo={`¿Quitar el ${vehiculo.marca} ${vehiculo.modelo} del carrito?`}
    descripcion={`Las fechas del ${formatearFecha(carrito.fechaInicio)} al ${formatearFecha(carrito.fechaFin)} se liberan y otra persona puede reservarlas.`}
    confirmar="Quitar del carrito"
    cancelar="Mantener"
    textoProcesando="Quitando…"
    procesando={quitando}
    mensaje={mensaje}
    alCerrar={alCerrar}
    alConfirmar={alConfirmar}
  />
}
