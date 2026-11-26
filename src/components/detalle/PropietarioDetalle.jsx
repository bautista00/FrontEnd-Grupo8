import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { API_URL } from '../../utils/api'
import Avatar from '../ui/Avatar'
import SeccionPublicacion from '../publicaciones/SeccionPublicacion'
import { nombreCorto } from '../../utils/resenas'

// "Auto ofrecido por": el dueño del auto con el link a su perfil público. Si el auto es tuyo no se muestra.
export default function PropietarioDetalle({ idUsuario }) {
  const idPropio = useSelector((state) => state.users.user?.idUsuario)
  const [propietario, actualizarPropietario] = useState(null)
  const esPropio = String(idPropio) === String(idUsuario)

  useEffect(() => {
    if (!idUsuario || esPropio) return
    let vigente = true
    axios.get(`${API_URL}/usuarios/${idUsuario}/perfil`)
      .then(({ data }) => { if (vigente) actualizarPropietario(data) })
      .catch(() => {}) // es un dato extra: si falla, el bloque simplemente no aparece
    return () => { vigente = false }
  }, [idUsuario, esPropio])

  if (!propietario || esPropio) return null

  return (
    <SeccionPublicacion titulo="Auto ofrecido por">
      <div className="flex items-center gap-4">
        <Avatar foto={propietario.foto} nombre={propietario.nombre} apellido={propietario.apellido} size={48} />
        <p className="flex-1 text-[0.875rem] text-ink">{nombreCorto(propietario)}</p>
        <Link to={`/usuarios/${idUsuario}`} className="text-[0.75rem] font-medium text-ink underline">Ver perfil</Link>
      </div>
    </SeccionPublicacion>
  )
}
