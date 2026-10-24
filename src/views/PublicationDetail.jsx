import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { pageStyles, titleStyles } from '../components/publicaciones/publicationStyles'
import PublicationMessage from '../components/publicaciones/PublicationMessage'
import PublicationSection from '../components/publicaciones/PublicationSection'
import DetailBreadcrumb from '../components/detalle/DetailBreadcrumb'
import DetailGallery from '../components/detalle/DetailGallery'
import DetailLocation from '../components/detalle/DetailLocation'
import DetailReservation from '../components/detalle/DetailReservation'
import DetailSpecs from '../components/detalle/DetailSpecs'
import { obtener, enviar } from '../utils/api'
import { formatFechaPublicacion } from '../utils/publicaciones'

export default function PublicationDetail({ actualizarCarrito, actualizarCarritoConsultado }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const token = localStorage.getItem('jwtToken')

  // Publicación completa: sus datos (con la ubicación) + vehículo + períodos publicados
  const [publicacion, setPublicacion] = useState(null)
  const [error, setError] = useState('')
  const [recargar, setRecargar] = useState(0)

  // Estado del botón "Agregar al carrito"
  const [agregando, setAgregando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [datosParaAgregar, setDatosParaAgregar] = useState(null)

  useEffect(() => {
    Promise.all([
      // 1. La publicación (ya trae la ubicación, aproximada salvo para el dueño o una reserva confirmada);
      //    con su id de vehículo pedimos el vehículo
      obtener(`/publicaciones/${id}`, token).then((datos) => Promise.all([
        datos,
        obtener(`/vehiculo/${datos.idVehiculo}`, token),
      ])),
      // Los períodos solo necesitan el id de la URL: se piden al mismo tiempo
      obtener(`/disponibilidades/publicacion/${id}`, token),
    ])
      .then(([[datos, vehiculo], periodos]) => {
        // 2. Juntamos todo en un solo objeto
        setPublicacion({
          ...vehiculo,
          ...datos,
          periodos: periodos.map((periodo) => ({ desde: periodo.fechaInicio, hasta: periodo.fechaFin })),
        })
        setError('')
      })
      .catch((error) => {
        console.error('Error al cargar la publicación', error)
        setError('No pudimos cargar la publicación. Intentá nuevamente.')
      })
  }, [id, token, recargar])

  function agregarAlCarrito(fechaInicio, fechaFin) {
    if (agregando) return

    // Sin sesión lo mandamos al login, que después lo devuelve a esta publicación
    if (!token) {
      navigate('/login', { state: { volverA: `/publicaciones/${id}` } })
      return
    }

    setAgregando(true)
    setMensaje('')

    // Registra la selección confirmada para enviarla desde el efecto.
    setDatosParaAgregar({
      idPublicacion: id,
      fechaInicio,
      fechaFin,
      publicacion,
      token
    })
  }

  useEffect(() => {
    if (datosParaAgregar === null) return

    const {
      idPublicacion,
      fechaInicio,
      fechaFin,
      publicacion,
      token
    } = datosParaAgregar

    // Si el backend explica el problema (por ejemplo, fechas ocupadas), se muestra ese mensaje
    enviar(`/carritos/publicaciones/${idPublicacion}`, 'POST', token, { fechaInicio, fechaFin }, 'No pudimos agregar el vehículo al carrito. Intentá nuevamente.')
      .then((datosCarrito) => {
        // Guardamos en App la respuesta del backend y la publicación ya cargada.
        actualizarCarrito({ ...datosCarrito, publicacion })
        actualizarCarritoConsultado(true)
        navigate('/carrito')
      })
      .catch((error) => {
        console.error('Error al agregar al carrito', error)
        setMensaje(error.message)
      })
      .finally(() => {
        setAgregando(false)
        setDatosParaAgregar(null)
      })
  }, [datosParaAgregar, actualizarCarrito, actualizarCarritoConsultado, navigate])

  if (error) {
    return (
      <main className={pageStyles + ' pb-20'}>
        <PublicationMessage error onRetry={() => setRecargar(recargar + 1)}>{error}</PublicationMessage>
        <Link to="/" className="text-[0.75rem] text-soft hover:underline">← Volver al catálogo</Link>
      </main>
    )
  }
  if (!publicacion) {
    return <main className={pageStyles + ' pb-20'}><PublicationMessage>Cargando la publicación…</PublicationMessage></main>
  }

  const titulo = `${publicacion.marca} ${publicacion.modelo} ${publicacion.anio}`
  const reservable = !publicacion.estado || publicacion.estado === 'ACTIVA'
  const meta = [
    publicacion.tipoVehiculo,
    publicacion.color && `Color ${publicacion.color.toLowerCase()}`,
    publicacion.cantidadAsientos && `${publicacion.cantidadAsientos} asientos`,
    [publicacion.localidad, publicacion.zona].filter(Boolean).join(', '),
    publicacion.fechaPublicacion && `Publicado el ${formatFechaPublicacion(publicacion.fechaPublicacion)}`,
  ].filter(Boolean)

  return (
    <main className={pageStyles + ' pb-20 phone:pb-12'}>
      <DetailBreadcrumb titulo={titulo} />

      <header>
        <h1 className={titleStyles}>{titulo}</h1>
        <p className="flex flex-wrap items-center mt-2 text-[0.6875rem] leading-[1.7] text-muted">
          {meta.map((texto) => (
            <span key={texto} className="not-last:after:mx-2 not-last:after:content-['·']">{texto}</span>
          ))}
        </p>
      </header>

      <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] items-start gap-6 mt-6 tablet:grid-cols-1">
        <div className="grid min-w-0 gap-6">
          <DetailGallery idVehiculo={publicacion.idVehiculo} alt={titulo} />
          <DetailSpecs publicacion={publicacion} />
          <PublicationSection titulo="Descripción del vehículo">
            <p className="max-w-[40rem] text-[0.75rem] leading-[1.8] text-soft">{publicacion.descripcion}</p>
          </PublicationSection>
          <DetailLocation publicacion={publicacion} />
        </div>

        {reservable ? (
          <DetailReservation
            publicacion={publicacion}
            periodos={publicacion.periodos}
            agregando={agregando}
            mensaje={mensaje}
            onAgregar={agregarAlCarrito}
          />
        ) : (
          <PublicationMessage>Esta publicación no está disponible para reservar en este momento.</PublicationMessage>
        )}
      </div>
    </main>
  )
}
