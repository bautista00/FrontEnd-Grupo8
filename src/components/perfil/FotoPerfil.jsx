import { useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { quitarFoto, subirFoto } from '../Redux/userSlice'
import Avatar from '../ui/Avatar'
import { smallButtonStyles } from '../publicaciones/estilosPublicacion'

const MAX_BYTES = 5 * 1024 * 1024

export default function FotoPerfil({ usuario }) {
  const dispatch = useDispatch()
  const entrada = useRef(null)
  const [guardando, actualizarGuardando] = useState(false)
  const [error, actualizarError] = useState(null)

  async function guardar(accion, mensaje) {
    actualizarGuardando(true)
    actualizarError(null)
    try {
      await dispatch(accion).unwrap()
      toast.success(mensaje)
    } catch (e) {
      actualizarError(e.message)
    } finally {
      actualizarGuardando(false)
    }
  }

  function elegir(event) {
    const archivo = event.target.files[0]
    event.target.value = ''
    if (!archivo) return
    if (!['image/jpeg', 'image/png'].includes(archivo.type)) return actualizarError('La foto tiene que ser JPG o PNG.')
    if (archivo.size > MAX_BYTES) return actualizarError('La foto no puede pesar más de 5 MB.')
    guardar(subirFoto(archivo), 'Foto actualizada')
  }

  return (
    <section className="flex flex-wrap items-center gap-5 rounded-[0.25rem] border border-border bg-card p-5">
      <Avatar foto={usuario.foto} nombre={usuario.nombre} apellido={usuario.apellido} size={80} />
      <div>
        <div className="flex flex-wrap gap-2">
          <input ref={entrada} type="file" accept="image/jpeg,image/png" onChange={elegir} className="hidden" />
          <button type="button" disabled={guardando} onClick={() => entrada.current.click()} className={smallButtonStyles}>
            {guardando ? 'Guardando…' : usuario.foto ? 'Cambiar foto' : 'Subir foto'}
          </button>
          {usuario.foto && (
            <button type="button" disabled={guardando} onClick={() => guardar(quitarFoto(), 'Foto quitada')} className={smallButtonStyles}>Quitar</button>
          )}
        </div>
        <p className="mt-2 text-xs text-muted">JPG o PNG de hasta 5 MB.</p>
        {error && <p role="alert" className="mt-2 text-xs text-error">{error}</p>}
      </div>
    </section>
  )
}
