import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import TarjetaMiVehiculo from '../components/vehiculos/TarjetaMiVehiculo'
import ConfirmarEliminarVehiculo from '../components/vehiculos/ConfirmarEliminarVehiculo' // NUEVO
import IconoPublicacion from '../components/publicaciones/IconoPublicacion'
import MensajePublicacion from '../components/publicaciones/MensajePublicacion'
import PaginacionPublicaciones from '../components/publicaciones/PaginacionPublicaciones'
import { pageStyles, headingStyles, titleStyles, eyebrowStyles, introStyles } from '../components/publicaciones/estilosPublicacion'
import { btnBase, btnDark, btnSize } from '../components/ui/estilosBoton'
import { fetchMisVehiculos, deleteVehiculo, limpiarErrorEliminar } from '../components/Redux/vehiculosSlice' // NUEVO: dos imports más

export default function MisVehiculos() {
  const dispatch = useDispatch()
  const { vehiculos: datos, loading, error, loadingEliminar, errorEliminar } = useSelector((state) => state.vehiculos) // NUEVO: dos campos más
  const [pagina, setPagina] = useState(0)
  const [aEliminar, setAEliminar] = useState(null) // NUEVO: vehículo que se está por eliminar

  useEffect(() => {
    dispatch(fetchMisVehiculos(pagina))
  }, [dispatch, pagina])

  function reintentar() {
    dispatch(fetchMisVehiculos(pagina))
  }

  // NUEVO: desde acá hasta confirmarEliminar
  function pedirEliminar(vehiculo) {
    dispatch(limpiarErrorEliminar())
    setAEliminar(vehiculo)
  }

  function cancelarEliminar() {
    if (loadingEliminar) return
    setAEliminar(null)
  }

  async function confirmarEliminar() {
    try {
      await dispatch(deleteVehiculo(aEliminar.idVehiculo)).unwrap()
      setAEliminar(null)
      // Si era la única tarjeta de una página que no es la primera, se vuelve a la anterior
      if (pagina > 0 && datos.content.length === 1) setPagina(pagina - 1)
    } catch {
      // El mensaje ya quedó en errorEliminar y el modal lo muestra
    }
  }

  return (
    <main className={pageStyles + ' pb-20'}>
      <div className={headingStyles}>
        <div>
          <p className={eyebrowStyles}>Panel de propietario · Flota propia</p>
          <h1 className={titleStyles}>Mis vehículos</h1>
          <p className={introStyles}>
            Registrá tus autos una sola vez con sus fotos. Después usás el vehículo para crear la publicación que se alquila.
          </p>
        </div>
        <Link to="/vehiculos/nuevo" className={btnBase + ' ' + btnDark + ' ' + btnSize}>
          <IconoPublicacion nombre="plus" /> Registrar vehículo
        </Link>
      </div>

      {error ? (
        <MensajePublicacion error onRetry={reintentar}>No se pudieron cargar tus vehículos. Intentá nuevamente.</MensajePublicacion>
      ) : loading || !datos ? (
        <MensajePublicacion>Cargando tus vehículos…</MensajePublicacion>
      ) : datos.content.length === 0 ? (
        <MensajePublicacion>Todavía no tenés vehículos registrados.</MensajePublicacion>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-6 mt-8 tablet:grid-cols-2 phone:grid-cols-1">
            {datos.content.map((vehiculo) => (
              <TarjetaMiVehiculo key={vehiculo.idVehiculo} vehiculo={vehiculo} onEliminar={pedirEliminar} /> // NUEVO: onEliminar
            ))}
          </div>
          <PaginacionPublicaciones pagina={pagina} totalPages={datos.totalPages} totalElements={datos.totalElements} onChange={setPagina} />
        </>
      )}

      {/* NUEVO: el modal, solo se ve si hay un vehículo elegido */}
      {aEliminar && (
        <ConfirmarEliminarVehiculo
          vehiculo={aEliminar}
          eliminando={loadingEliminar}
          mensaje={errorEliminar}
          alCerrar={cancelarEliminar}
          alConfirmar={confirmarEliminar}
        />
      )}
    </main>
  )
}