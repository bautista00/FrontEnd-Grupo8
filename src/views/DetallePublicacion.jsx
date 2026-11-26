/**
 * Muestra una publicación con su vehículo, ubicación y períodos disponibles.
 * Al agregar al carrito guarda la respuesta en el store de Redux y navega al carrito.
 */

import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { pageStyles, titleStyles } from '../components/publicaciones/estilosPublicacion'
import MensajePublicacion from '../components/publicaciones/MensajePublicacion'
import SeccionPublicacion from '../components/publicaciones/SeccionPublicacion'
import BreadcrumbDetalle from '../components/detalle/BreadcrumbDetalle'
import GaleriaDetalle from '../components/detalle/GaleriaDetalle'
import UbicacionDetalle from '../components/detalle/UbicacionDetalle'
import ReservaDetalle from '../components/detalle/ReservaDetalle'
import EspecificacionesDetalle from '../components/detalle/EspecificacionesDetalle'
import { fetchPublicacion } from '../components/Redux/publicacionesSlice'
import { agregarCarrito } from '../components/Redux/carritoSlice'
import PropietarioDetalle from '../components/detalle/PropietarioDetalle'
import { formatFechaPublicacion } from '../utils/publicaciones'

// La key inicia un detalle nuevo al cambiar el ID de la publicación.
export default function DetallePublicacion(props) {
  const { id } = useParams()
  return <Detail key={id} {...props} id={id} />
}

function Detail({ id }) {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const token = useSelector((state) => state.users.token)
  const { publicacion: guardada, loadingPublicacion: loading, errorPublicacion: error, errorPublicacionReintentable: reintentable } = useSelector((state) => state.publicaciones)
  const { agregando, errorAgregar, idPublicacionAgregar } = useSelector((state) => state.carrito)
  // Mientras llega la nueva, el store puede tener la publicación que se vio antes
  const publicacion = guardada && String(guardada.idPublicacion) === String(id) ? guardada : null
  const mensaje = String(idPublicacionAgregar) === String(id) ? errorAgregar : null
  const vigente = useRef(false)

  // Evita navegar desde un detalle que el usuario ya abandonó.
  useEffect(() => {
    vigente.current = true
    return () => { vigente.current = false }
  }, [])

  // Carga la publicación, el vehículo y los períodos disponibles.
  useEffect(() => {
    dispatch(fetchPublicacion(id))
  }, [dispatch, id, token])

  // Se pasa a ReservaDetalle como onAgregar y espera la confirmación antes de navegar.
  async function agregarAlCarrito(fechaInicio, fechaFin) {
    if (agregando) return

    if (!token) {
      navigate('/login', { state: { volverA: `/publicaciones/${id}` } })
      return
    }

    try {
      await dispatch(agregarCarrito({
        idPublicacion: id,
        fechaInicio,
        fechaFin,
        publicacion
      })).unwrap()
      if (vigente.current) navigate('/carrito')
    } catch {
      // El error de la operación se muestra desde el slice.
    }
  }

  if (error) {
    return (
      <main className={pageStyles + ' pb-20'}>
        <MensajePublicacion error onRetry={reintentable ? () => dispatch(fetchPublicacion(id)) : undefined}>{error}</MensajePublicacion>
        <Link to="/" className="text-[0.75rem] text-soft hover:underline">← Volver al catálogo</Link>
      </main>
    )
  }
  if (loading || !publicacion) {
    return <main className={pageStyles + ' pb-20'}><MensajePublicacion>Cargando la publicación…</MensajePublicacion></main>
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
      <BreadcrumbDetalle titulo={titulo} />

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
          <GaleriaDetalle idVehiculo={publicacion.idVehiculo} alt={titulo} />
          <EspecificacionesDetalle publicacion={publicacion} />
          <SeccionPublicacion titulo="Descripción del vehículo">
            <p className="max-w-[40rem] text-[0.75rem] leading-[1.8] text-soft">{publicacion.descripcion}</p>
          </SeccionPublicacion>
          <PropietarioDetalle idUsuario={publicacion.idUsuario} />
          <UbicacionDetalle publicacion={publicacion} />
        </div>

        {reservable ? (
          <ReservaDetalle
            publicacion={publicacion}
            periodos={publicacion.periodos}
            agregando={agregando}
            mensaje={mensaje}
            onAgregar={agregarAlCarrito}
          />
        ) : (
          <MensajePublicacion>Esta publicación no está disponible para reservar en este momento.</MensajePublicacion>
        )}
      </div>
    </main>
  )
}
