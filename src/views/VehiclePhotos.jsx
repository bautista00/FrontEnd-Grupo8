import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import PhotoDropzone from '../components/vehicles/PhotoDropzone'
import PhotoTile from '../components/vehiculos/PhotoTile'
import { btnBase, btnDark, btnOutline, btnSize } from '../components/ui/buttonStyles'
import { pageStyles, titleStyles, eyebrowStyles, introStyles, actionsStyles } from '../components/publicaciones/publicationStyles'
import { useVehiculos } from '../context/VehiculosContext'
import { agregarFotos, moverFoto, quitarFoto, validarArchivoFoto } from '../utils/vehiculos'

function Fotos({ vehiculo }) {
  const navigate = useNavigate()
  const { guardarFotos } = useVehiculos()
  // Se trabaja sobre una copia: los cambios recién se guardan con "Guardar fotos".
  const [fotos, setFotos] = useState(vehiculo.fotos)
  const [problemas, setProblemas] = useState([])
  const sinPublicacion = !vehiculo.publicacionActual

  function agregar(archivos) {
    const nuevas = []
    const rechazadas = []
    archivos.forEach((archivo, posicion) => {
      const error = validarArchivoFoto(archivo)
      if (error) rechazadas.push(`${archivo.name}: ${error}.`)
      else nuevas.push({ idFoto: Date.now() + posicion, url: URL.createObjectURL(archivo), orden: 0 })
    })
    setProblemas(rechazadas)
    if (nuevas.length > 0) setFotos(agregarFotos(fotos, nuevas))
  }

  function guardar(destino) {
    guardarFotos(vehiculo.idVehiculo, fotos)
    navigate(destino)
  }

  return (
    <main className={pageStyles + ' pb-20 phone:pb-12'}>
      <div className="max-w-4xl mx-auto">
        <Link to="/mis-vehiculos" className={eyebrowStyles + ' inline-block mb-3'}>← Volver a mis vehículos</Link>
        <h1 className={titleStyles}>Fotos del {vehiculo.marca} {vehiculo.modelo}</h1>
        <p className={introStyles}>La primera foto es la portada en el catálogo. Usá las flechas para cambiar el orden.</p>

        <div className="mt-8">
          <PhotoDropzone onArchivos={agregar} />
        </div>

        {problemas.length > 0 && (
          <ul role="alert" className="grid gap-1 mt-4 p-0 list-none text-xs text-error">
            {problemas.map((problema) => <li key={problema}>{problema}</li>)}
          </ul>
        )}

        <h2 className="mt-8 text-[18px]">Fotos cargadas ({fotos.length})</h2>
        {fotos.length > 0
          ? <ul className="grid grid-cols-3 gap-4 mt-4 p-0 list-none phone:grid-cols-1 tablet:grid-cols-2">
              {fotos.map((foto, indice) => (
                <PhotoTile
                  key={foto.idFoto}
                  foto={foto}
                  indice={indice}
                  total={fotos.length}
                  onMover={(posicion, desplazamiento) => setFotos(moverFoto(fotos, posicion, desplazamiento))}
                  onQuitar={(posicion) => setFotos(quitarFoto(fotos, posicion))}
                />
              ))}
            </ul>
          : <p className="mt-4 p-6 text-center text-[12px] leading-[1.7] text-muted bg-white border border-border rounded-lg">
              Todavía no hay fotos. Sumá al menos una: los vehículos sin foto no se pueden publicar.
            </p>}

        <div className={actionsStyles + ' justify-end mt-8'}>
          <Link to="/mis-vehiculos" className={btnBase + ' ' + btnOutline + ' ' + btnSize}>Cancelar</Link>
          <button
            type="button"
            onClick={() => guardar('/mis-vehiculos')}
            className={btnBase + ' ' + (sinPublicacion ? btnOutline : btnDark) + ' ' + btnSize}
          >
            Guardar fotos
          </button>
          {sinPublicacion && (
            <button
              type="button"
              disabled={fotos.length === 0}
              title={fotos.length === 0 ? 'Cargá al menos una foto para poder publicar' : undefined}
              onClick={() => guardar('/publicaciones/nueva')}
              className={btnBase + ' ' + btnDark + ' ' + btnSize + ' disabled:opacity-50 disabled:cursor-not-allowed'}
            >
              Guardar y crear publicación
            </button>
          )}
        </div>
      </div>
    </main>
  )
}

export default function VehiclePhotos() {
  const { id } = useParams()
  const { obtenerVehiculo } = useVehiculos()
  const vehiculo = obtenerVehiculo(id)

  if (!vehiculo) {
    return (
      <main className={pageStyles + ' pb-20'}>
        <h1 className={titleStyles}>Vehículo no encontrado</h1>
        <Link to="/mis-vehiculos" className="inline-block mt-5 text-gold">Volver a mis vehículos</Link>
      </main>
    )
  }
  return <Fotos key={vehiculo.idVehiculo} vehiculo={vehiculo} />
}
