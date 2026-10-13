import { useEffect, useState } from 'react'
import { consultarVehiculos } from '../../services/publicacionesApi'
import PublicationPagination from './PublicationPagination'
import PublicationMessage from './PublicationMessage'
import PublicationPhoto from './PublicationPhoto'

function VehiclePage({ sesion, pagina, seleccionado, onChange, onPage, disabled, onRetry }) {
  const [datos, setDatos] = useState(null)
  const [error, setError] = useState('')
  const { apiUrl, token } = sesion
  useEffect(() => {
    let vigente = true
    consultarVehiculos(apiUrl, token, pagina).then((resultado) => { if (vigente) setDatos(resultado) })
      .catch((errorConsulta) => { if (vigente) setError(errorConsulta.message) })
    return () => { vigente = false }
  }, [apiUrl, token, pagina])
  if (error) return <PublicationMessage error onRetry={onRetry}>{error}</PublicationMessage>
  if (!datos) return <PublicationMessage>Cargando tus vehículos…</PublicationMessage>
  return <>
    <div className="grid grid-cols-2 gap-3 phone:grid-cols-1">
      {datos.content.map((item) => <label key={item.idVehiculo} className="flex items-center gap-3 p-3 border border-border rounded-[6px] cursor-pointer has-[input:checked]:border-ink has-[input:checked]:bg-paper">
        <input className="accent-ink" type="radio" name="idVehiculo" value={item.idVehiculo} checked={seleccionado === String(item.idVehiculo)} disabled={disabled}
          onChange={() => onChange(item)} />
        <div className="grid place-items-center w-18 h-14 shrink-0 bg-surface rounded-[4px] overflow-hidden"><PublicationPhoto idVehiculo={item.idVehiculo} apiUrl={apiUrl} token={token} /></div>
        <div><h3 className="text-[14px] leading-5">{item.marca} {item.modelo} {item.anio}</h3><p className="text-muted text-[11px] leading-[1.6]">{item.patente}</p><p className="text-muted text-[11px] leading-[1.6]">{item.tipoVehiculo}</p></div>
      </label>)}
    </div>
    {!datos.content.length && <PublicationMessage>Todavía no tenés vehículos registrados.</PublicationMessage>}
    <PublicationPagination {...datos} pagina={pagina} onChange={onPage} disabled={disabled} />
  </>
}

export default function PublicationVehicleOptions(props) {
  const [pagina, setPagina] = useState(0)
  const [revision, setRevision] = useState(0)
  return <VehiclePage key={pagina + '-' + revision} {...props} pagina={pagina} onPage={setPagina} onRetry={() => setRevision(revision + 1)} />
}
