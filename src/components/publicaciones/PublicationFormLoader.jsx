import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { consultarPublicacion, consultarVehiculo, consultarUbicacion, consultarPeriodos } from '../../services/publicacionesApi'
import { periodoDesdeApi } from './publicationFormData'
import { pageStyles, titleStyles } from './publicationStyles'
import PublicationSession from './PublicationSession'
import PublicationMessage from './PublicationMessage'

function LoadEdition({ id, sesion, Form, opciones }) {
  const [datos, setDatos] = useState(null)
  const [error, setError] = useState('')
  const [revision, setRevision] = useState(0)
  const { apiUrl, token, usuario } = sesion
  useEffect(() => {
    let vigente = true
    consultarPublicacion(apiUrl, token, id).then((publicacion) => {
      return consultarVehiculo(apiUrl, token, publicacion.idVehiculo).then((vehiculo) => {
        if (vehiculo.idUsuario !== usuario.idUsuario) throw new Error('Esta publicación no pertenece a tu cuenta.')
        return Promise.all([consultarUbicacion(apiUrl, token, publicacion.idUbicacion), consultarPeriodos(apiUrl, token, id)])
          .then(([ubicacion, periodos]) => ({ ...vehiculo, ...ubicacion, ...publicacion, codigoPostal: ubicacion.codigoPostal, placeId: ubicacion.placeId, periodos: periodos.map(periodoDesdeApi) }))
      })
    }).then((publicacion) => { if (vigente) setDatos(publicacion) })
      .catch((errorConsulta) => { if (vigente) setError(errorConsulta.message) })
    return () => { vigente = false }
  }, [apiUrl, token, usuario.idUsuario, id, revision])
  if (error) return <main className={pageStyles}><h1 className={titleStyles}>Editar publicación</h1><PublicationMessage error onRetry={() => { setError(''); setRevision(revision + 1) }}>{error}</PublicationMessage><Link to="/mis-publicaciones">← Mis publicaciones</Link></main>
  if (!datos) return <main className={pageStyles}><PublicationMessage>Cargando la publicación…</PublicationMessage></main>
  return <Form {...opciones} publicacion={datos} sesion={sesion} />
}

export default function PublicationFormLoader({ Form, id, token, apiUrl, ...opciones }) {
  const editando = opciones.modo === 'editar'
  const fallback = (contenido) => <main className={pageStyles}><h1 className={titleStyles}>{editando ? 'Editar publicación' : 'Crear publicación'}</h1>{contenido}</main>
  if (editando && (!id || !/^\d+$/.test(id) || Number(id) < 1)) return fallback(<PublicationMessage error>Elegí una publicación desde <Link to="/mis-publicaciones" className="underline">Mis publicaciones</Link> para editarla.</PublicationMessage>)
  return <PublicationSession token={token} apiUrl={apiUrl} fallback={fallback}>
    {(sesion) => editando ? <LoadEdition key={id} id={id} sesion={sesion} Form={Form} opciones={opciones} /> : <Form {...opciones} sesion={sesion} />}
  </PublicationSession>
}
