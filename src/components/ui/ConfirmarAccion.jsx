import { useEffect, useId, useRef } from 'react'
import { btnBase, btnDark, btnOutline, btnSize } from './estilosBoton'

export default function ConfirmarAccion({ titulo, descripcion, confirmar, cancelar = 'Volver', procesando = false, confirmarDeshabilitado = false, textoProcesando = 'Guardando…', mensaje, alCerrar, alConfirmar }) {
  const dialogo = useRef(null)
  const id = useId()

  useEffect(() => {
    const modal = dialogo.current
    const overflowAnterior = document.body.style.overflow
    modal.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      modal.close()
      document.body.style.overflow = overflowAnterior
    }
  }, [])

  return <dialog ref={dialogo} aria-labelledby={`${id}-titulo`} aria-describedby={descripcion ? `${id}-descripcion` : undefined}
    onCancel={(event) => { event.preventDefault(); if (!procesando) alCerrar() }}
    className="fixed inset-0 m-auto w-[calc(100%_-_2rem)] max-w-lg max-h-[calc(100dvh-2rem)] overflow-y-auto border border-border rounded-lg bg-card p-8 text-ink shadow-md backdrop:bg-black/40 phone:p-6">
    <h2 id={`${id}-titulo`} className="text-[1.625rem] leading-[1.3] phone:text-[1.4375rem]">{titulo}</h2>
    {descripcion && <p id={`${id}-descripcion`} className="mt-3 text-[0.8125rem] leading-[1.8] text-soft">{descripcion}</p>}
    {mensaje && <p role="alert" className="mt-4 text-[0.75rem] leading-relaxed text-error">{mensaje}</p>}
    <div className="mt-8 flex flex-wrap justify-end gap-3 phone:flex-col [&_button:disabled]:cursor-not-allowed [&_button:disabled]:opacity-60">
      <button type="button" disabled={procesando} onClick={alCerrar} className={`${btnBase} ${btnOutline} ${btnSize}`}>{cancelar}</button>
      <button type="button" disabled={procesando || confirmarDeshabilitado} onClick={alConfirmar} className={`${btnBase} ${btnDark} ${btnSize}`}>{procesando ? textoProcesando : confirmar}</button>
    </div>
  </dialog>
}
