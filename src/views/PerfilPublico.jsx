import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import MensajePublicacion from '../components/publicaciones/MensajePublicacion'
import { pageStyles } from '../components/publicaciones/estilosPublicacion'
import TarjetaVehiculo from '../components/home/TarjetaVehiculo'
import Avatar from '../components/ui/Avatar'
import Estrellas from '../components/resenas/Estrellas'
import ResumenResenas from '../components/resenas/ResumenResenas'
import ListaResenas from '../components/resenas/ListaResenas'
import { fetchPerfilPublico } from '../components/Redux/resenasSlice'
import { btnBase, btnOutline, btnSize } from '../components/ui/estilosBoton'
import { miembroDesde, promedio } from '../utils/resenas'

const ROLES = [
  { clave: 'PROPIETARIO', texto: 'Como propietario' },
  { clave: 'CONDUCTOR', texto: 'Como conductor' },
]

// La key inicia un perfil nuevo al cambiar el id (por ejemplo, al entrar al perfil de un autor de reseña)
export default function PerfilPublico() {
  const { id } = useParams()
  return <Contenido key={id} id={id} />
}

function Contenido({ id }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { datos, loading, error } = useSelector((state) => state.resenas.perfil)
  const idPropio = useSelector((state) => state.users.user?.idUsuario)
  const [pestana, actualizarPestana] = useState('Publicaciones')
  const [rol, actualizarRol] = useState('PROPIETARIO')

  useEffect(() => {
    dispatch(fetchPerfilPublico(id))
  }, [dispatch, id])

  // Si se entró directo por la URL no hay pantalla anterior a la que volver
  function volver() {
    navigate(location.key === 'default' ? '/' : -1)
  }

  const botonVolver = <button type="button" onClick={volver} className={`${btnBase} ${btnOutline} ${btnSize} mb-6`}><span aria-hidden="true">←</span> Volver</button>
  // Mientras llega el perfil nuevo, el store puede tener el de otra persona
  const perfil = datos && datos.idUsuario === id ? datos : null

  if (error && !perfil) {
    return <main className={pageStyles + ' pb-20'}>{botonVolver}<MensajePublicacion error onRetry={() => dispatch(fetchPerfilPublico(id))}>{error}</MensajePublicacion></main>
  }
  if (!perfil || loading && !perfil) {
    return <main className={pageStyles + ' pb-20'}>{botonVolver}<MensajePublicacion>Cargando el perfil…</MensajePublicacion></main>
  }

  const { perfil: usuario, publicaciones } = perfil
  const esPropio = String(idPropio) === String(id)
  const resenas = perfil[rol]

  return (
    <main className={pageStyles + ' pb-20'}>
      {botonVolver}

      {esPropio && (
        <p className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[0.25rem] border border-border bg-surface px-4 py-3 text-[0.75rem] text-soft">
          Así ven tu perfil los demás
          <Link to="/perfil" className="font-medium text-ink underline">Editar mis datos</Link>
        </p>
      )}

      <div className="grid grid-cols-[16rem_minmax(0,1fr)] items-start gap-8 tablet:grid-cols-1">
        <aside className="flex flex-col items-center gap-2 rounded-[0.25rem] border border-border bg-card p-6 text-center">
          <Avatar foto={usuario.foto} nombre={usuario.nombre} apellido={usuario.apellido} size={96} />
          <h1 className="mt-2 font-serif text-[1.5rem] text-ink">{usuario.nombre} {usuario.apellido}</h1>
          {usuario.fechaRegistro && <p className="text-xs text-muted">{miembroDesde(usuario.fechaRegistro)}</p>}
          <dl className="mt-3 grid w-full gap-3 border-t border-border pt-4 text-left">
            {ROLES.map(({ clave, texto }) => {
              const media = promedio(perfil[clave])
              return (
                <div key={clave}>
                  <dt className="text-[0.625rem] uppercase tracking-[0.08em] text-muted">{texto}</dt>
                  <dd className="m-0 mt-1 flex items-center gap-2 text-[0.8125rem] text-ink">
                    {media === null ? <span className="text-muted">Sin reseñas</span> : <><Estrellas valor={media} size={14} />{media.toFixed(1).replace('.', ',')}</>}
                  </dd>
                </div>
              )
            })}
          </dl>
        </aside>

        <div className="min-w-0">
          <div role="tablist" aria-label="Secciones del perfil" className="mb-6 flex gap-1 border-b border-border">
            {['Publicaciones', 'Reseñas'].map((nombre) => (
              <button key={nombre} type="button" role="tab" aria-selected={pestana === nombre} onClick={() => actualizarPestana(nombre)}
                className={'-mb-px border-0 border-b-2 bg-transparent px-4 py-2.5 text-[0.75rem] font-medium ' + (pestana === nombre ? 'border-ink text-ink' : 'border-transparent text-muted hover:text-ink')}>
                {nombre}
              </button>
            ))}
          </div>

          <div role="tabpanel">
            {pestana === 'Publicaciones' ? (
              publicaciones.length === 0 ? (
                <p className="text-[0.75rem] text-muted">No tiene publicaciones activas.</p>
              ) : (
                <div className="grid grid-cols-2 gap-5 phone:grid-cols-1">
                  {publicaciones.map((publicacion) => <TarjetaVehiculo key={publicacion.idPublicacion} publicacion={publicacion} />)}
                </div>
              )
            ) : (
              <div className="grid gap-5">
                <div role="group" aria-label="Rol" className="flex gap-2">
                  {ROLES.map(({ clave, texto }) => (
                    <button key={clave} type="button" aria-pressed={rol === clave} onClick={() => actualizarRol(clave)}
                      className={'rounded-[0.25rem] border px-3 py-2 text-[0.75rem] ' + (rol === clave ? 'border-ink bg-ink text-white' : 'border-border bg-card text-soft')}>
                      {texto}
                    </button>
                  ))}
                </div>
                <ResumenResenas resenas={resenas} />
                <ListaResenas resenas={resenas} />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
