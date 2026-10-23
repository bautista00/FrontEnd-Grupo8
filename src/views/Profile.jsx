import { useEffect, useState } from 'react'
import PublicationMessage from '../components/publicaciones/PublicationMessage'
import { pageStyles, titleStyles, eyebrowStyles, introStyles } from '../components/publicaciones/publicationStyles'
import { obtener } from '../utils/api'

// La fecha llega como "AAAA-MM-DD"; con el mediodía no se corre de día por la zona horaria
function formatearNacimiento(fecha) {
  return new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
    .format(new Date(fecha + 'T12:00:00'))
}

export default function Profile() {
  const token = localStorage.getItem('jwtToken')
  const [usuario, actualizarUsuario] = useState(null)
  const [error, actualizarError] = useState('')
  const [recargar, actualizarRecargar] = useState(0)

  useEffect(() => {
    let vigente = true
    // El backend identifica al usuario por el token
    obtener('/usuarios/me', token)
      .then((datos) => { if (vigente) { actualizarUsuario(datos); actualizarError('') } })
      .catch((e) => {
        console.error('Error al cargar el perfil', e)
        if (vigente) actualizarError('No se pudieron cargar tus datos. Intentá nuevamente.')
      })
    return () => { vigente = false }
  }, [token, recargar])

  function reintentar() {
    actualizarError('')
    actualizarUsuario(null)
    actualizarRecargar(recargar + 1)
  }

  const campos = usuario && [
    { label: 'Nombre', valor: usuario.nombre },
    { label: 'Apellido', valor: usuario.apellido },
    { label: 'Correo electrónico', valor: usuario.email },
    { label: 'Fecha de nacimiento', valor: formatearNacimiento(usuario.fechaNacimiento) },
    { label: 'Teléfono', valor: usuario.telefono || 'No informado' },
  ]

  return (
    <main className={pageStyles + ' pb-20'}>
      <p className={eyebrowStyles}>Tu cuenta</p>
      <h1 className={titleStyles}>Mi perfil</h1>
      <p className={introStyles}>Estos son los datos con los que te registraste.</p>

      {error ? (
        <PublicationMessage error onRetry={reintentar}>{error}</PublicationMessage>
      ) : !usuario ? (
        <PublicationMessage>Cargando tus datos…</PublicationMessage>
      ) : (
        <dl className="mt-8 max-w-xl rounded-[0.25rem] border border-border bg-card divide-y divide-border">
          {campos.map((campo) => (
            <div key={campo.label} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-5 py-4">
              <dt className="text-[0.625rem] uppercase tracking-[0.08em] text-muted">{campo.label}</dt>
              <dd className="m-0 text-[0.875rem] text-ink break-all">{campo.valor}</dd>
            </div>
          ))}
        </dl>
      )}
    </main>
  )
}
