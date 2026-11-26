import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import MensajePublicacion from '../components/publicaciones/MensajePublicacion'
import { pageStyles, titleStyles, eyebrowStyles, introStyles } from '../components/publicaciones/estilosPublicacion'
import { fetchUser } from '../components/Redux/userSlice'
import Avatar from '../components/ui/Avatar'
import { btnBase, btnOutline, btnSize } from '../components/ui/estilosBoton'
import FotoPerfil from '../components/perfil/FotoPerfil'
import DatosPersonales from '../components/perfil/DatosPersonales'
import ContactoPerfil from '../components/perfil/ContactoPerfil'
import CambiarContrasena from '../components/perfil/CambiarContrasena'
import ResenasPerfil from '../components/perfil/ResenasPerfil'
import { miembroDesde } from '../utils/resenas'

const PESTANAS = ['Datos', 'Contraseña', 'Reseñas']

export default function Perfil() {
  const dispatch = useDispatch()
  const { user: usuario, loading, error } = useSelector((state) => state.users)
  const [pestana, actualizarPestana] = useState('Datos')

  // El backend identifica al usuario por el token
  useEffect(() => {
    dispatch(fetchUser())
  }, [dispatch])

  function reintentar() {
    dispatch(fetchUser())
  }

  // Con el usuario ya cargado, volver a pedirlo no tapa las pestañas con el mensaje de carga
  const cargando = loading && !usuario?.idUsuario

  return (
    <main className={pageStyles + ' pb-20'}>
      <p className={eyebrowStyles}>Tu cuenta</p>
      <h1 className={titleStyles}>Mi perfil</h1>
      <p className={introStyles}>Tus datos, tu contraseña y tus reseñas.</p>

      {error && !usuario?.idUsuario ? (
        <MensajePublicacion error onRetry={reintentar}>No se pudieron cargar tus datos. Intentá nuevamente.</MensajePublicacion>
      ) : cargando || !usuario?.idUsuario ? (
        <MensajePublicacion>Cargando tus datos…</MensajePublicacion>
      ) : (
        <div className="mt-8 grid grid-cols-[16rem_minmax(0,1fr)] items-start gap-8 tablet:grid-cols-1">
          <aside className="flex flex-col items-center gap-2 rounded-[0.25rem] border border-border bg-card p-6 text-center">
            <Avatar foto={usuario.foto} nombre={usuario.nombre} apellido={usuario.apellido} size={96} />
            <p className="mt-2 font-serif text-[1.25rem] text-ink">{usuario.nombre} {usuario.apellido}</p>
            {usuario.fechaRegistro && <p className="text-xs text-muted">{miembroDesde(usuario.fechaRegistro)}</p>}
            <Link to={`/usuarios/${usuario.idUsuario}`} className={`${btnBase} ${btnOutline} ${btnSize} mt-3`}>Ver mi perfil público</Link>
          </aside>

          <div className="min-w-0">
            <div role="tablist" aria-label="Secciones del perfil" className="mb-6 flex gap-1 border-b border-border">
              {PESTANAS.map((nombre) => (
                <button key={nombre} type="button" role="tab" aria-selected={pestana === nombre} onClick={() => actualizarPestana(nombre)}
                  className={'-mb-px border-0 border-b-2 bg-transparent px-4 py-2.5 text-[0.75rem] font-medium ' + (pestana === nombre ? 'border-ink text-ink' : 'border-transparent text-muted hover:text-ink')}>
                  {nombre}
                </button>
              ))}
            </div>

            <div role="tabpanel">
              {pestana === 'Datos' && (
                <div className="grid gap-6">
                  <FotoPerfil usuario={usuario} />
                  <DatosPersonales usuario={usuario} />
                  <ContactoPerfil usuario={usuario} />
                </div>
              )}
              {pestana === 'Contraseña' && <CambiarContrasena />}
              {pestana === 'Reseñas' && <ResenasPerfil />}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
