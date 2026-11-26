import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { quitarFoto, subirFoto, limpiarErrorPerfil } from '../Redux/userSlice'
import Avatar from '../ui/Avatar'
import { smallButtonStyles } from '../publicaciones/estilosPublicacion'

const MAX_BYTES = 5 * 1024 * 1024

export default function FotoPerfil({ usuario }) {
  const dispatch = useDispatch()
  const entrada = useRef(null)
  const vigente = useRef(false)
  const { guardandoPerfil, errorPerfil, operacionPerfil } = useSelector((state) => state.users)
  const [validacion, actualizarValidacion] = useState(null)

  useEffect(() => {
    vigente.current = true
    return () => { vigente.current = false }
  }, [])

  async function guardar(accion, mensaje) {
    if (guardandoPerfil) return
    actualizarValidacion(null)
    try {
      await dispatch(accion).unwrap()
      if (vigente.current) toast.success(mensaje)
    } catch {
      // el error queda en el slice
    }
  }

  function elegir(evento) {
    const archivo = evento.target.files[0]
    evento.target.value = ''
    if (!archivo) return
    dispatch(limpiarErrorPerfil())
    if (!['image/jpeg', 'image/png'].includes(archivo.type)) return actualizarValidacion('La foto tiene que ser JPG o PNG.')
    if (archivo.size > MAX_BYTES) return actualizarValidacion('La foto no puede pesar más de 5 MB.')
    guardar(subirFoto(archivo), 'Foto actualizada')
  }

  const esFoto = [subirFoto.typePrefix, quitarFoto.typePrefix].includes(operacionPerfil)
  const error = validacion || (esFoto ? errorPerfil : null)
  return (
    <section className="flex flex-wrap items-center gap-5 rounded-[0.25rem] border border-border bg-card p-5">
      <Avatar foto={usuario.foto} nombre={usuario.nombre} apellido={usuario.apellido} size={80} />
      <div>
        <div className="flex flex-wrap gap-2">
          <input ref={entrada} type="file" accept="image/jpeg,image/png" onChange={elegir} className="hidden" />
          <button type="button" disabled={guardandoPerfil} onClick={() => entrada.current.click()} className={smallButtonStyles}>
            {guardandoPerfil && esFoto ? 'Guardando…' : usuario.foto ? 'Cambiar foto' : 'Subir foto'}
          </button>
          {usuario.foto && <button type="button" disabled={guardandoPerfil} onClick={() => guardar(quitarFoto(), 'Foto quitada')} className={smallButtonStyles}>Quitar</button>}
        </div>
        <p className="mt-2 text-xs text-muted">JPG o PNG de hasta 5 MB.</p>
        {error && <p role="alert" className="mt-2 text-xs text-error">{error}</p>}
      </div>
    </section>
  )
}
