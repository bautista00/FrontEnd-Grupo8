import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation } from 'react-router-dom'
import EncabezadoResultadoReserva from '../components/resultadoReserva/EncabezadoResultadoReserva'
import ResumenVehiculoReservado from '../components/resultadoReserva/ResumenVehiculoReservado'
import InstruccionesRetiro from '../components/resultadoReserva/InstruccionesRetiro'
import ResumenPagoReserva from '../components/detalleReserva/ResumenPagoReserva'
import { fetchReserva, fetchPublicacionResultado } from '../components/Redux/reservasSlice'
import { btnBase, btnOutline, btnSize } from '../components/ui/estilosBoton'

export default function ResultadoReserva() {
  const ubicacion = useLocation()
  const dispatch = useDispatch()
  const token = useSelector((state) => state.users.token)
  const {
    reservas, pagos, reservaDetalle, pagoDetalle, idReservaDetalle, loadingDetalle, errorDetalle,
    publicacionResultado, loadingResultado, errorResultado, idReservaResultado, idPublicacionResultado,
  } = useSelector((state) => state.reservas)
  const idReserva = ubicacion.state?.idReserva ?? ubicacion.state?.confirmacion?.idReserva
  const esEsteDetalle = String(idReservaDetalle) === String(idReserva)
  const reserva = (esEsteDetalle ? reservaDetalle : null)
    ?? reservas.find((item) => String(item.idReserva) === String(idReserva))
  const pago = (esEsteDetalle ? pagoDetalle : null)
    ?? pagos.find((item) => String(item.idReserva) === String(idReserva))
  const idPublicacion = reserva?.idPublicacion
  const esEsteResultado = String(idReservaResultado) === String(idReserva)
    && String(idPublicacionResultado) === String(idPublicacion)
  const publicacion = esEsteResultado ? publicacionResultado : null
  const mensaje = esEsteResultado ? errorResultado : null
  const mensajeDetalle = esEsteDetalle ? errorDetalle : null

  useEffect(() => {
    if (token && idReserva && (!reserva || (!pago && !esEsteDetalle)) && !mensajeDetalle) {
      dispatch(fetchReserva(idReserva))
    }
  }, [dispatch, token, idReserva, reserva, pago, esEsteDetalle, mensajeDetalle])

  useEffect(() => {
    if (token && idReserva && idPublicacion) {
      dispatch(fetchPublicacionResultado({ idReserva, idPublicacion }))
    }
  }, [dispatch, token, idReserva, idPublicacion])

  if (!reserva || !pago) {
    return (
      <main className="flex-1 w-full max-w-page mx-auto px-(--gutter) py-10">
        <h1 className="text-[1.875rem] text-ink">{idReserva ? 'Resultado de tu reserva' : 'No hay una reserva para mostrar.'}</h1>
        {idReserva && !mensajeDetalle && (!reserva || loadingDetalle) && (
          <p role="status" className="mt-4 text-muted">
            {loadingDetalle ? 'Cargando tu reserva…' : 'Consultando tu reserva…'}
          </p>
        )}
        {(mensajeDetalle || (reserva && !pago && !loadingDetalle)) && <>
          <p role="alert" className="mt-4 text-error">
            {mensajeDetalle || 'No encontramos un pago registrado para esta reserva. Podés consultar sus datos en Mis reservas.'}
          </p>
          <button type="button" className={`${btnBase} ${btnOutline} ${btnSize} mt-4`}
            onClick={() => dispatch(fetchReserva(idReserva))}>
            Volver a intentar
          </button>
        </>}
        <Link to="/mis-reservas" className="inline-block mt-6 text-soft hover:underline">Ir a Mis reservas</Link>
      </main>
    )
  }

  return (
    <main className="flex-1 w-full max-w-page mx-auto px-(--gutter) pt-10 pb-16 phone:pt-7 phone:pb-10">
      <EncabezadoResultadoReserva reserva={reserva} pago={pago} />
      <div className="grid grid-cols-2 items-start gap-8 mt-10 tablet:grid-cols-1 phone:gap-6 phone:mt-7">
        {publicacion ? <>
          <ResumenVehiculoReservado reserva={reserva} pago={pago} publicacion={publicacion} />
          <InstruccionesRetiro reserva={reserva} publicacion={publicacion} />
        </> : <>
          <ResumenPagoReserva reserva={reserva} pago={pago} />
          <section className="p-6 bg-card border border-border rounded-lg">
            <h2 className="text-[1.5rem]">Datos de retiro</h2>
            {mensaje ? <>
              <p role="alert" className="mt-4 text-error">No pudimos cargar los datos de retiro. {mensaje}</p>
              <button type="button" className={`${btnBase} ${btnOutline} ${btnSize} mt-4`}
                onClick={() => dispatch(fetchPublicacionResultado({ idReserva, idPublicacion }))}>
                Volver a intentar
              </button>
            </> : (
              <p role="status" className="mt-4 text-muted">
                {loadingResultado ? 'Cargando los datos de retiro…' : 'Consultando el punto de retiro…'}
              </p>
            )}
          </section>
        </>}
      </div>
      <Link to="/mis-reservas" className="inline-block mt-6 text-soft hover:underline">Ir a Mis reservas</Link>
    </main>
  )
}
