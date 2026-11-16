import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import TarjetaMiVehiculo from '../components/vehiculos/TarjetaMiVehiculo'
import IconoPublicacion from '../components/publicaciones/IconoPublicacion'
import MensajePublicacion from '../components/publicaciones/MensajePublicacion'
import PaginacionPublicaciones from '../components/publicaciones/PaginacionPublicaciones'
import { pageStyles, headingStyles, titleStyles, eyebrowStyles, introStyles } from '../components/publicaciones/estilosPublicacion'
import { btnBase, btnDark, btnSize } from '../components/ui/estilosBoton'
import { fetchMisVehiculos } from '../components/Redux/vehiculosSlice'

export default function MisVehiculos() {
  const dispatch = useDispatch()
  const { vehiculos: datos, loading, error } = useSelector((state) => state.vehiculos)
  const [pagina, setPagina] = useState(0)

  useEffect(() => {
    dispatch(fetchMisVehiculos(pagina))
  }, [dispatch, pagina])

  function reintentar() {
    dispatch(fetchMisVehiculos(pagina))
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
              <TarjetaMiVehiculo key={vehiculo.idVehiculo} vehiculo={vehiculo} />
            ))}
          </div>
          <PaginacionPublicaciones pagina={pagina} totalPages={datos.totalPages} totalElements={datos.totalElements} onChange={setPagina} />
        </>
      )}
    </main>
  )
}