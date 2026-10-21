import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { pageStyles, headingStyles, titleStyles, eyebrowStyles, introStyles } from '../components/publicaciones/publicationStyles'
import PublicationIcon from '../components/publicaciones/PublicationIcon'
import PublicationMessage from '../components/publicaciones/PublicationMessage'
import PublicationPagination from '../components/publicaciones/PublicationPagination'
import PublicationPhoto from '../components/publicaciones/PublicationPhoto'
import { btnBase, btnDark, btnSize } from '../components/ui/buttonStyles'
import { obtener, enviar } from '../utils/api'

// Lista de los vehículos del usuario (GET /vehiculo/mios) con acceso a editar y eliminar
export default function MyVehicles() {
  const token = localStorage.getItem('jwtToken')
  const [datos, setDatos] = useState(null)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  const [pagina, setPagina] = useState(0)
  const [recargar, setRecargar] = useState(0)

  useEffect(() => {
    if (!token) return
    obtener(`/vehiculo/mios?page=${pagina}&size=10`, token)
      .then((resultado) => { setDatos(resultado); setError('') })
      .catch((error) => {
        console.error('Error al cargar vehículos', error)
        setError('No se pudieron cargar tus vehículos. Intentá nuevamente.')
      })
  }, [token, pagina, recargar])

  function eliminar(vehiculo) {
    if (!window.confirm(`¿Eliminar ${vehiculo.marca} ${vehiculo.modelo} (${vehiculo.patente})?`)) return
    setAviso('')
    enviar(`/vehiculo/${vehiculo.idVehiculo}`, 'DELETE', token, null, 'No se pudo eliminar el vehículo. Puede tener publicaciones o reservas asociadas.')
      .then(() => setRecargar(recargar + 1))
      .catch((error) => setAviso(error.message))
  }

  return (
    <main className={pageStyles + ' pb-20'}>
      <div className={headingStyles}>
        <div>
          <p className={eyebrowStyles}>Panel de propietario</p>
          <h1 className={titleStyles}>Mis vehículos</h1>
          <p className={introStyles}>Cargá tus autos y sus fotos. Después los podés publicar desde Mis publicaciones.</p>
        </div>
        <Link to="/vehiculos/nuevo" className={btnBase + ' ' + btnDark + ' ' + btnSize}>
          <PublicationIcon nombre="plus" /> Agregar vehículo
        </Link>
      </div>

      {!token ? (
        <PublicationMessage>Iniciá sesión para administrar tus vehículos.</PublicationMessage>
      ) : error ? (
        <PublicationMessage error onRetry={() => setRecargar(recargar + 1)}>{error}</PublicationMessage>
      ) : !datos ? (
        <PublicationMessage>Cargando tus vehículos…</PublicationMessage>
      ) : datos.content.length === 0 ? (
        <PublicationMessage>Todavía no tenés vehículos registrados.</PublicationMessage>
      ) : (
        <>
          {aviso && <PublicationMessage error>{aviso}</PublicationMessage>}
          <ul className="grid gap-3 mt-6">
            {datos.content.map((v) => (
              <li key={v.idVehiculo} className="flex flex-wrap items-center gap-4 p-3 bg-card border border-border rounded-lg">
                <div className="grid place-items-center w-24 h-16 shrink-0 bg-surface rounded-[0.25rem] overflow-hidden">
                  <PublicationPhoto idVehiculo={v.idVehiculo} alt={`${v.marca} ${v.modelo}`} />
                </div>
                <div className="flex-1 min-w-48">
                  <h2 className="text-[0.9375rem]">{v.marca} {v.modelo} {v.anio}</h2>
                  <p className="text-[0.6875rem] leading-[1.6] text-muted">
                    {v.patente} · {v.color} · {v.cantidadAsientos} asientos{v.tipoVehiculo ? ` · ${v.tipoVehiculo}` : ''}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link to={`/vehiculos/${v.idVehiculo}/editar`} className="border border-border rounded-[0.25rem] px-3 py-2 text-[0.75rem]">Editar</Link>
                  <button type="button" onClick={() => eliminar(v)} className="border border-border rounded-[0.25rem] px-3 py-2 text-[0.75rem] text-red-700">Eliminar</button>
                </div>
              </li>
            ))} 
          </ul>
          <PublicationPagination pagina={pagina} totalPages={datos.totalPages} totalElements={datos.totalElements} onChange={setPagina} />
        </>
      )}
    </main>
  )
}
