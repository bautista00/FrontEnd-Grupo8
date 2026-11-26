import { useEffect, useId, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { crearResena, editarResena, fetchResenasReserva, limpiarErrorResena } from '../Redux/resenasSlice'
import { btnBase, btnDark, btnOutline, btnSize } from '../ui/estilosBoton'
import { inputStyles } from '../ui/CampoFormulario'
import Estrellas from './Estrellas'

const MAX_COMENTARIO = 500

// Crea o edita una reseña. "otraParte" es quien se califica y "rol" el que tiene en la reserva.
// Si recibe "resena", la edita.
export default function ModalCalificacion({ idReserva, otraParte, rol, resena, alCerrar }) {
  const dispatch = useDispatch()
  const dialogo = useRef(null)
  const id = useId()
  const [estrellas, actualizarEstrellas] = useState(resena?.estrellas ?? 0)
  const [comentario, actualizarComentario] = useState(resena?.comentario ?? '')
  const { guardando: enviando, errorGuardar: error, idReservaGuardar } = useSelector((state) => state.resenas)
  const vigente = useRef(false)

  // Mismo manejo del <dialog> que ConfirmarAccion
  useEffect(() => {
    const modal = dialogo.current
    vigente.current = true
    dispatch(limpiarErrorResena())
    const overflowAnterior = document.body.style.overflow
    modal.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      vigente.current = false
      modal.close()
      document.body.style.overflow = overflowAnterior
    }
  }, [dispatch])

  const nombre = otraParte?.nombre ?? 'la otra persona'
  const titulo = rol === 'PROPIETARIO' ? `¿Cómo fue alquilar el auto de ${nombre}?` : `¿Cómo fue el alquiler con ${nombre}?`

  async function enviar() {
    if (enviando || !estrellas) return
    const datos = { idReserva, estrellas, comentario: comentario.trim() }
    try {
      const guardada = await dispatch(resena ? editarResena({ ...datos, idResena: resena.idResena }) : crearResena(datos)).unwrap()
      if (!vigente.current) return
      // Si ambos calificaron, ahora podemos consultar la reseña de la otra parte.
      if (guardada.publicada) dispatch(fetchResenasReserva(idReserva))
      toast.success('Calificación enviada')
      alCerrar()
    } catch {
      // el error queda en el slice
    }
  }

  return <dialog ref={dialogo} aria-labelledby={`${id}-titulo`}
    onCancel={(event) => { event.preventDefault(); if (!enviando) alCerrar() }}
    className="fixed inset-0 m-auto w-[calc(100%_-_2rem)] max-w-lg max-h-[calc(100dvh-2rem)] overflow-y-auto border border-border rounded-lg bg-card p-8 text-ink shadow-md backdrop:bg-black/40 phone:p-6">
    <h2 id={`${id}-titulo`} className="text-[1.625rem] leading-[1.3] phone:text-[1.4375rem]">{titulo}</h2>

    <div className="mt-5">
      <p className="mb-2 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-soft">Calificación</p>
      <Estrellas valor={estrellas} onChange={actualizarEstrellas} size={32} />
    </div>

    <div className="mt-5">
      <label htmlFor={`${id}-comentario`} className="block mb-2 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-soft">Comentario (opcional)</label>
      <textarea id={`${id}-comentario`} rows={4} maxLength={MAX_COMENTARIO} value={comentario}
        onChange={(event) => actualizarComentario(event.target.value)} className={inputStyles} />
      <p className="mt-1 text-right text-xs text-muted">{comentario.length}/{MAX_COMENTARIO}</p>
    </div>

    <p className="mt-3 text-[0.75rem] leading-relaxed text-muted">Tu reseña queda oculta hasta que {nombre} califique o pasen 7 días.</p>
    {error && idReservaGuardar === idReserva && <p role="alert" className="mt-4 text-[0.75rem] leading-relaxed text-error">{error}</p>}

    <div className="mt-8 flex flex-wrap justify-end gap-3 phone:flex-col [&_button:disabled]:cursor-not-allowed [&_button:disabled]:opacity-60">
      <button type="button" disabled={enviando} onClick={alCerrar} className={`${btnBase} ${btnOutline} ${btnSize}`}>Ahora no</button>
      <button type="button" disabled={enviando || estrellas === 0} onClick={enviar} className={`${btnBase} ${btnDark} ${btnSize}`}>{enviando ? 'Enviando…' : 'Enviar calificación'}</button>
    </div>
  </dialog>
}
