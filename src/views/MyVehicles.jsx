import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import MyVehicleCard from '../components/vehiculos/MyVehicleCard'
import PublicationIcon from '../components/publicaciones/PublicationIcon'
import PublicationMessage from '../components/publicaciones/PublicationMessage'
import PublicationPagination from '../components/publicaciones/PublicationPagination'
import { pageStyles, headingStyles, titleStyles, eyebrowStyles, introStyles } from '../components/publicaciones/publicationStyles'
import { btnBase, btnDark, btnSize } from '../components/ui/buttonStyles'
import { cargarMisVehiculos } from '../utils/vehiculos'

export default function MyVehicles() {
  const token = localStorage.getItem('jwtToken')
  const [datos, setDatos] = useState(null)
  const [error, setError] = useState('')
  const [pagina, setPagina] = useState(0)
  const [recargar, setRecargar] = useState(0)

  useEffect(() => {
    if (!token) return
    let vigente = true
    cargarMisVehiculos(token, pagina)
      .then((resultado) => { if (vigente) { setDatos(resultado); setError('') } })
      .catch((e) => {
        console.error('Error al cargar vehículos', e)
        if (vigente) setError('No se pudieron cargar tus vehículos. Intentá nuevamente.')
      })
    // Si se cambia de página antes de que llegue la respuesta, se ignora la anterior
    return () => { vigente = false }
  }, [token, pagina, recargar])

  function reintentar() {
    setError('')
    setDatos(null)
    setRecargar(recargar + 1)
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
          <PublicationIcon nombre="plus" /> Registrar vehículo
        </Link>
      </div>

      {!token ? (
        <PublicationMessage>Iniciá sesión para administrar tus vehículos.</PublicationMessage>
      ) : error ? (
        <PublicationMessage error onRetry={reintentar}>{error}</PublicationMessage>
      ) : !datos ? (
        <PublicationMessage>Cargando tus vehículos…</PublicationMessage>
      ) : datos.content.length === 0 ? (
        <PublicationMessage>Todavía no tenés vehículos registrados.</PublicationMessage>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-6 mt-8 tablet:grid-cols-2 phone:grid-cols-1">
            {datos.content.map((vehiculo) => (
              <MyVehicleCard key={vehiculo.idVehiculo} vehiculo={vehiculo} />
            ))}
          </div>
          <PublicationPagination pagina={pagina} totalPages={datos.totalPages} totalElements={datos.totalElements} onChange={setPagina} />
        </>
      )}
    </main>
  )
}