import { useEffect, useState } from 'react'
import PublicationPagination from './PublicationPagination'
import PublicationMessage from './PublicationMessage'
import PublicationPhoto from './PublicationPhoto'

const URL = 'http://localhost:8080'

// Lista de vehículos del usuario para elegir cuál publicar
export default function PublicationVehicleOptions({ seleccionado, onChange }) {
  const [datos, setDatos] = useState(null)
  const [error, setError] = useState('')
  const [pagina, setPagina] = useState(0)
  const [recargar, setRecargar] = useState(0)

  useEffect(() => {
    const token = localStorage.getItem('jwtToken')

    fetch(`${URL}/vehiculo/mios?page=${pagina}&size=10`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((respuesta) => {
        if (!respuesta.ok) throw new Error('No se pudieron cargar tus vehículos')
        return respuesta.json()
      })
      .then((resultado) => {
        setDatos(resultado)
        setError('')
      })
      .catch((error) => {
        console.error('Error al cargar', error)
        setError('No se pudieron cargar tus vehículos. Intentá nuevamente.')
      })
  }, [pagina, recargar])

  if (error) return <PublicationMessage error onRetry={() => setRecargar(recargar + 1)}>{error}</PublicationMessage>
  if (!datos) return <PublicationMessage>Cargando tus vehículos…</PublicationMessage>
  if (datos.content.length === 0) return <PublicationMessage>Todavía no tenés vehículos registrados.</PublicationMessage>

  return (
    <>
      <div className="grid grid-cols-2 gap-3 phone:grid-cols-1">
        {datos.content.map((vehiculo) => (
          <label key={vehiculo.idVehiculo} className="flex items-center gap-3 p-3 border border-border rounded-[0.375rem] cursor-pointer has-[input:checked]:border-ink has-[input:checked]:bg-paper">
            <input
              className="accent-ink"
              type="radio"
              name="idVehiculo"
              value={vehiculo.idVehiculo}
              checked={seleccionado === String(vehiculo.idVehiculo)}
              onChange={() => onChange(vehiculo)}
            />
            <div className="grid place-items-center w-18 h-14 shrink-0 bg-surface rounded-[0.25rem] overflow-hidden">
              <PublicationPhoto idVehiculo={vehiculo.idVehiculo} />
            </div>
            <div>
              <h3 className="text-[0.875rem] leading-5">{vehiculo.marca} {vehiculo.modelo} {vehiculo.anio}</h3>
              <p className="text-muted text-[0.6875rem] leading-[1.6]">{vehiculo.patente}</p>
              <p className="text-muted text-[0.6875rem] leading-[1.6]">{vehiculo.tipoVehiculo}</p>
            </div>
          </label>
        ))}
      </div>
      <PublicationPagination pagina={pagina} totalPages={datos.totalPages} totalElements={datos.totalElements} onChange={setPagina} />
    </>
  )
}
