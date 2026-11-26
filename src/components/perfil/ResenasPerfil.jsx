import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMisResenas, fetchPendientes } from '../Redux/resenasSlice'
import Estrellas from '../resenas/Estrellas'
import ModalCalificacion from '../resenas/ModalCalificacion'
import MensajePublicacion from '../publicaciones/MensajePublicacion'
import { btnBase, btnDark, btnOutline, btnSize } from '../ui/estilosBoton'
import { nombreCorto, plazoCalificacion } from '../../utils/resenas'
import { formatearFecha } from '../../utils/formatos'

const TITULO = 'text-[1.125rem] text-ink'
const FILA = 'flex flex-wrap items-center justify-between gap-3 rounded-[0.25rem] border border-border bg-card p-4'

// Pendientes (con "Calificar") y reseñas escritas (con "Editar" mientras no estén publicadas)
export default function ResenasPerfil() {
  const dispatch = useDispatch()
  const { pendientes, mias } = useSelector((state) => state.resenas)
  const [calificando, actualizarCalificando] = useState(null)

  useEffect(() => {
    dispatch(fetchPendientes())
    dispatch(fetchMisResenas())
  }, [dispatch])

  const error = pendientes.error || mias.error
  if (error) return <MensajePublicacion error onRetry={() => { dispatch(fetchPendientes()); dispatch(fetchMisResenas()) }}>{error}</MensajePublicacion>
  if (!pendientes.datos || !mias.datos) return <MensajePublicacion>Cargando tus reseñas…</MensajePublicacion>

  return (
    <div className="grid gap-8">
      <section>
        <h2 className={TITULO}>Pendientes</h2>
        {pendientes.datos.length === 0 ? (
          <p className="mt-3 text-[0.75rem] text-muted">No tenés calificaciones pendientes.</p>
        ) : (
          <ul className="mt-3 grid gap-3">
            {pendientes.datos.map((pendiente) => (
              <li key={pendiente.idReserva} className={FILA}>
                <div>
                  <p className="text-[0.875rem] text-ink">{pendiente.vehiculo.marca} {pendiente.vehiculo.modelo} {pendiente.vehiculo.anio} · con {nombreCorto(pendiente.otraParte)}</p>
                  <p className="mt-1 text-xs text-muted">
                    {formatearFecha(pendiente.fechaInicio)} — {formatearFecha(pendiente.fechaFin)} · Tenés hasta el {plazoCalificacion(pendiente)}
                  </p>
                </div>
                <button type="button" onClick={() => actualizarCalificando({ idReserva: pendiente.idReserva, otraParte: pendiente.otraParte, rol: pendiente.rol })} className={`${btnBase} ${btnDark} ${btnSize}`}>Calificar</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className={TITULO}>Escritas</h2>
        {mias.datos.length === 0 ? (
          <p className="mt-3 text-[0.75rem] text-muted">Todavía no escribiste reseñas.</p>
        ) : (
          <ul className="mt-3 grid gap-3">
            {mias.datos.map((resena) => (
              <li key={resena.idResena} className={FILA}>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <Estrellas valor={resena.estrellas} />
                    <span className={'rounded-[0.1875rem] border px-2 py-[0.1875rem] text-[0.625rem] font-semibold ' + (resena.publicada ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700')}>
                      {resena.publicada ? 'Publicada' : `Oculta hasta que ${resena.otraParte ? nombreCorto(resena.otraParte) : 'la otra persona'} califique`}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted">Reserva #{resena.idReserva} · Como {resena.rol === 'PROPIETARIO' ? 'conductor' : 'propietario'}</p>
                  {resena.comentario && <p className="mt-2 text-[0.8125rem] leading-relaxed text-soft break-words">{resena.comentario}</p>}
                </div>
                {!resena.publicada && (
                  <button type="button" onClick={() => actualizarCalificando({ idReserva: resena.idReserva, otraParte: resena.otraParte, rol: resena.rol, resena })} className={`${btnBase} ${btnOutline} ${btnSize}`}>Editar</button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {calificando && <ModalCalificacion {...calificando} alCerrar={() => actualizarCalificando(null)} />}
    </div>
  )
}
