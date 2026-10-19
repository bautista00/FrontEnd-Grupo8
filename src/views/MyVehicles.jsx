import { Link } from 'react-router-dom'
import MyVehicleCard from '../components/vehiculos/MyVehicleCard'
import PublicationIcon from '../components/publicaciones/PublicationIcon'
import { pageStyles, headingStyles, titleStyles, eyebrowStyles, introStyles } from '../components/publicaciones/publicationStyles'
import { btnBase, btnDark, btnSize } from '../components/ui/buttonStyles'
import { useVehiculos } from '../context/VehiculosContext'

export default function MyVehicles() {
  const { vehiculos } = useVehiculos()
  return (
    <main className={pageStyles + ' pb-20 phone:pb-12'}>
      <div className={headingStyles}>
        <div>
          <p className={eyebrowStyles}>Panel de propietario · Flota propia</p>
          <h1 className={titleStyles}>Mis vehículos</h1>
          <p className={introStyles}>Registrá tus autos una sola vez con sus fotos. Después usás el vehículo para crear la publicación que se alquila.</p>
        </div>
        <Link to="/vehiculos/nuevo" className={btnBase + ' ' + btnDark + ' ' + btnSize}>
          <PublicationIcon nombre="plus" /> Registrar vehículo
        </Link>
      </div>

      {vehiculos.length > 0
        ? <div className="grid grid-cols-3 gap-6 mt-8 tablet:grid-cols-2 phone:grid-cols-1">
            {vehiculos.map((vehiculo) => <MyVehicleCard key={vehiculo.idVehiculo} vehiculo={vehiculo} />)}
          </div>
        : <div className="flex min-h-[300px] flex-col items-center justify-center gap-3.5 mt-8 p-8 text-center bg-white border border-border rounded-lg">
            <PublicationIcon nombre="carLarge" />
            <h2 className="text-[22px]">Todavía no registraste vehículos</h2>
            <p className="text-muted text-[12px] leading-[1.7]">Registrá tu primer auto con sus datos y fotos para poder publicarlo.</p>
          </div>}
    </main>
  )
}
