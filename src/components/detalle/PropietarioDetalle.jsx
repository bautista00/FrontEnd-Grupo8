import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchPropietario } from '../Redux/resenasSlice'
import Avatar from '../ui/Avatar'
import SeccionPublicacion from '../publicaciones/SeccionPublicacion'
import { nombreCorto } from '../../utils/resenas'

export default function PropietarioDetalle({ idUsuario }) {
  const dispatch = useDispatch()
  const idPropio = useSelector((state) => state.users.user?.idUsuario)
  const { datos, error } = useSelector((state) => state.resenas.propietario)
  const esPropio = String(idPropio) === String(idUsuario)
  const propietario = String(datos?.idUsuario) === String(idUsuario) ? datos : null

  useEffect(() => {
    if (idUsuario && !esPropio) dispatch(fetchPropietario(idUsuario))
  }, [dispatch, idUsuario, esPropio])

  if (!idUsuario || esPropio) return null

  return (
    <SeccionPublicacion titulo="Auto ofrecido por">
      {!propietario ? (
        <div className="text-[0.75rem] text-muted">
          {error ? <><p role="alert">{error}</p><button type="button" onClick={() => dispatch(fetchPropietario(idUsuario))} className="mt-2 underline">Volver a intentar</button></> : <p role="status">Cargando al propietario…</p>}
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <Avatar foto={propietario.foto} nombre={propietario.nombre} apellido={propietario.apellido} size={48} />
          <p className="flex-1 text-[0.875rem] text-ink">{nombreCorto(propietario)}</p>
          <Link to={`/usuarios/${idUsuario}`} className="text-[0.75rem] font-medium text-ink underline">Ver perfil</Link>
        </div>
      )}
    </SeccionPublicacion>
  )
}
