import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchPendientes, fetchResenasReserva } from '../Redux/resenasSlice'
import Estrellas from '../resenas/Estrellas'
import ModalCalificacion from '../resenas/ModalCalificacion'
import { btnBase, btnDark, btnOutline, btnSize } from '../ui/estilosBoton'
import { nombreCorto, otraParteDe } from '../../utils/resenas'

// Tu reseña y la de la otra parte; la de la otra parte se ve recién cuando está publicada
export default function CalificacionesReserva({ reserva }) {
  const dispatch = useDispatch()
  const idUsuario = useSelector((state) => state.users.user?.idUsuario)
  const { reserva: entrada, pendientes } = useSelector((state) => state.resenas)
  const [calificando, actualizarCalificando] = useState(false)

  useEffect(() => {
    dispatch(fetchResenasReserva(reserva.idReserva))
    dispatch(fetchPendientes())
  }, [dispatch, reserva.idReserva])

  const datos = entrada.datos && String(entrada.datos.idReserva) === String(reserva.idReserva) ? entrada.datos : null
  const { otraParte, rol } = otraParteDe(reserva, idUsuario)
  const puedeCalificar = pendientes.datos?.some((item) => item.idReserva === reserva.idReserva)

  return (
    <section className="mt-6 p-6 bg-card border border-border rounded-lg phone:p-4.5" aria-labelledby="calificaciones-title">
      <h2 id="calificaciones-title" className="font-sans text-[0.625rem] leading-normal tracking-wider uppercase text-muted">Calificaciones</h2>

      {entrada.error && !datos ? (
        <p role="alert" className="mt-3 text-[0.75rem] text-error">{entrada.error}</p>
      ) : !datos ? (
        <p className="mt-3 text-[0.75rem] text-muted">Cargando…</p>
      ) : (
        <div className="mt-3 grid gap-5">
          <div>
            <h3 className="text-[0.8125rem] font-semibold text-ink">Tu reseña</h3>
            {datos.mia ? (
              <div className="mt-2">
                <Estrellas valor={datos.mia.estrellas} size={14} />
                {datos.mia.comentario && <p className="mt-1 text-[0.75rem] leading-relaxed text-soft break-words">{datos.mia.comentario}</p>}
                <p className="mt-1 text-xs text-muted">{datos.mia.publicada ? 'Publicada' : `Oculta hasta que ${nombreCorto(otraParte)} califique`}</p>
                {!datos.mia.publicada && (
                  <button type="button" onClick={() => actualizarCalificando(true)} className={`${btnBase} ${btnOutline} ${btnSize} mt-2`}>Editar</button>
                )}
              </div>
            ) : puedeCalificar ? (
              <button type="button" onClick={() => actualizarCalificando(true)} className={`${btnBase} ${btnDark} ${btnSize} mt-2`}>Calificar</button>
            ) : (
              <p className="mt-2 text-[0.75rem] text-muted">Ya no podés calificar esta reserva.</p>
            )}
          </div>

          <div>
            <h3 className="text-[0.8125rem] font-semibold text-ink">La reseña de {nombreCorto(otraParte)}</h3>
            {datos.deLaOtraParte ? (
              <div className="mt-2">
                <Estrellas valor={datos.deLaOtraParte.estrellas} size={14} />
                {datos.deLaOtraParte.comentario && <p className="mt-1 text-[0.75rem] leading-relaxed text-soft break-words">{datos.deLaOtraParte.comentario}</p>}
              </div>
            ) : (
              <p className="mt-2 text-[0.75rem] text-muted">
                {datos.otraParteYaCalifico ? 'Ya te calificó, la vas a ver cuando califiques.' : 'Todavía no te calificó.'}
              </p>
            )}
          </div>
        </div>
      )}

      {calificando && (
        <ModalCalificacion idReserva={reserva.idReserva} otraParte={otraParte} rol={rol} resena={datos?.mia} alCerrar={() => actualizarCalificando(false)} />
      )}
    </section>
  )
}
