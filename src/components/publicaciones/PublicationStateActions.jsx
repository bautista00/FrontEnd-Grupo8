import { useEffect, useState } from 'react'
import { cambiarEstadoPublicacion } from '../../services/publicacionesApi'
import PublicationMessage from './PublicationMessage'

export default function PublicationStateActions({ publicacion, apiUrl, token, onConfirmed, onPending, disabled = false, children }) {
  const [operacion, setOperacion] = useState(null)
  const [estadoLocal, setEstadoLocal] = useState(publicacion.estado)
  const [error, setError] = useState('')
  const [incierto, setIncierto] = useState(false)
  useEffect(() => {
    if (!operacion) return
    let vigente = true
    cambiarEstadoPublicacion(apiUrl, token, operacion.id, operacion.accion).then((datos) => {
      if (!vigente) return
      const confirmada = datos ?? { ...operacion.anterior, estado: 'DESACTIVADA' }
      setEstadoLocal(confirmada.estado)
      setOperacion(null)
      operacion.onPending?.(false)
      operacion.onConfirmed(confirmada)
    }).catch((errorPeticion) => {
      if (!vigente) return
      setEstadoLocal(operacion.anterior.estado)
      setError(errorPeticion.message)
      setIncierto(!errorPeticion.status || errorPeticion.status >= 500)
      setOperacion(null)
      operacion.onPending?.(false)
    })
    return () => { vigente = false }
  }, [operacion, apiUrl, token])

  function confirmar(accion) {
    if (operacion || disabled || incierto || publicacion.estado === 'DESACTIVADA') return
    if (accion === 'desactivar' && !window.confirm('¿Desactivar esta publicación? No vas a poder reactivarla.')) return
    setError('')
    setEstadoLocal(accion === 'pausar' ? 'PAUSADA' : accion === 'reactivar' ? 'ACTIVA' : 'DESACTIVADA')
    onPending?.(true)
    setOperacion({ id: publicacion.idPublicacion, accion, anterior: publicacion, onConfirmed, onPending })
  }
  return <div>
    {children({ confirmar, pendiente: Boolean(operacion), disabled: disabled || Boolean(operacion) || incierto, estado: estadoLocal })}
    {operacion && <p role="status" className="mt-2 text-[11px] text-muted">Guardando estado…</p>}
    {error && <PublicationMessage error>{error}{incierto && ' No recibimos una confirmación. Volvé a cargar esta vista para comprobar el estado antes de intentar otra vez.'}</PublicationMessage>}
  </div>
}
