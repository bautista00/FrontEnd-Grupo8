import { useEffect, useState } from 'react'
import PublicationIcon from '../publicaciones/PublicationIcon'

const URL = 'http://localhost:8080'

// Galería del vehículo: foto grande con contador y miniaturas para cambiar de foto
export default function DetailGallery({ idVehiculo, alt }) {
  const [fotos, setFotos] = useState([])
  const [actual, setActual] = useState(0)

  useEffect(() => {
    if (!idVehiculo) return

    fetch(`${URL}/imagen-vehiculo/por-vehiculo/${idVehiculo}`)
      .then((respuesta) => {
        if (!respuesta.ok) throw new Error('No se pudieron cargar las fotos')
        return respuesta.json()
      })
      .then((imagenes) => {
        // Se muestran en el orden que definió el dueño
        const ordenadas = [...imagenes]
          .sort((a, b) => a.orden - b.orden)
          .filter((imagen) => imagen.file)
          .map((imagen) => `data:image/jpeg;base64,${imagen.file}`)
        setFotos(ordenadas)
        setActual(0)
      })
      .catch((error) => console.error('Error al cargar las fotos', error))
  }, [idVehiculo])

  // Si el dueño cargó menos de 4 fotos, completamos con espacios vacíos
  const miniaturas = Array.from({ length: Math.max(4, fotos.length) }, (_, indice) => fotos[indice] ?? null)

  return (
    <section aria-label="Fotos del vehículo" className="p-3 bg-card border border-border rounded-lg">
      <div className="relative grid place-items-center aspect-[16/9] overflow-hidden bg-surface rounded-[0.25rem]">
        {fotos[actual] ? (
          <img src={fotos[actual]} alt={alt} className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-disabled">
            <PublicationIcon nombre="carLarge" />
            <span className="text-[0.625rem] text-muted">El propietario todavía no cargó fotos</span>
          </div>
        )}
        {fotos.length > 0 && (
          <span className="absolute top-3 right-3 px-2 py-[0.1875rem] rounded-[0.1875rem] bg-ink text-white text-[0.625rem]">
            Foto {actual + 1} de {fotos.length}
          </span>
        )}
      </div>

      <div className="grid grid-cols-4 gap-3 mt-3">
        {miniaturas.map((foto, indice) => (
          <button
            type="button"
            key={indice}
            disabled={!foto}
            aria-label={`Ver foto ${indice + 1}`}
            aria-pressed={indice === actual}
            onClick={() => setActual(indice)}
            className={'grid place-items-center aspect-[16/10] overflow-hidden p-0 bg-surface rounded-[0.25rem] border '
              + (indice === actual && foto ? 'border-ink' : 'border-border')}
          >
            {foto ? <img src={foto} alt="" className="w-full h-full object-cover" /> : <PublicationIcon nombre="car" />}
          </button>
        ))}
      </div>
    </section>
  )
}
