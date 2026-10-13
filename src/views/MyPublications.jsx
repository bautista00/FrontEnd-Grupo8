import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { pageStyles, headingStyles, titleStyles, eyebrowStyles, introStyles } from '../components/publicaciones/publicationStyles'
import PublicationIcon from '../components/publicaciones/PublicationIcon'
import PublicationRow from '../components/publicaciones/PublicationRow'
import PublicationSession from '../components/publicaciones/PublicationSession'
import PublicationMessage from '../components/publicaciones/PublicationMessage'
import PublicationPagination from '../components/publicaciones/PublicationPagination'
import { btnBase, btnDark, btnSize } from '../components/ui/buttonStyles'
import { ESTADOS_PUBLICACION } from '../utils/publicaciones'
import { consultarMisPublicaciones } from '../services/publicacionesApi'

function Results({ consulta, sesion, onQuery, onPending, pendiente }) {
  const [datos, setDatos] = useState(null)
  const [error, setError] = useState('')
  const { apiUrl, token } = sesion
  useEffect(() => {
    let vigente = true
    consultarMisPublicaciones(apiUrl, token, consulta).then((pagina) => {
      if (vigente) setDatos(pagina)
    }).catch((errorConsulta) => { if (vigente) setError(errorConsulta.message) })
    return () => { vigente = false }
  }, [apiUrl, token, consulta])

  function actualizarPublicacion(publicacion) {
    const sigueEnFiltro = consulta.estado === 'TODAS' || consulta.estado === publicacion.estado
    setDatos((actuales) => ({ ...actuales, content: actuales.content.map((item) => item.idPublicacion === publicacion.idPublicacion ? publicacion : item) }))
    if (!sigueEnFiltro) {
      const total = Math.max(0, datos.totalElements - 1)
      onQuery({ ...consulta, pagina: Math.min(consulta.pagina, Math.max(0, Math.ceil(total / 10) - 1)), revision: consulta.revision + 1 })
    }
  }
  if (error) return <PublicationMessage error onRetry={() => onQuery({ ...consulta, revision: consulta.revision + 1 })}>{error}</PublicationMessage>
  if (!datos) return <PublicationMessage>Cargando tus publicaciones…</PublicationMessage>
  return <>
    <p className="mb-4 text-[12px] text-muted">{datos.totalElements} publicaciones encontradas</p>
    <div className="grid gap-6">
      {datos.content.map((publicacion) => <PublicationRow key={publicacion.idPublicacion} publicacion={publicacion}
        apiUrl={apiUrl} token={token} onConfirmed={actualizarPublicacion} onPending={onPending} disabled={pendiente} />)}
    </div>
    {datos.content.length === 0 && <div className="flex min-h-[300px] flex-col items-center justify-center gap-3.5 p-8 text-center bg-white border border-border rounded-lg">
      <PublicationIcon nombre="carLarge" />
      <h2 className="text-[22px]">{consulta.busqueda || consulta.estado !== 'TODAS' ? 'No hay publicaciones con esos filtros' : 'Todavía no tenés publicaciones'}</h2>
      <p className="text-muted text-[12px] leading-[1.7]">Podés crear una publicación o cambiar los filtros.</p>
    </div>}
    <PublicationPagination {...datos} pagina={consulta.pagina} disabled={pendiente} onChange={(pagina) => onQuery({ ...consulta, pagina })} />
  </>
}

function Publications({ sesion }) {
  const [consulta, setConsulta] = useState({ pagina: 0, estado: 'TODAS', busqueda: '', revision: 0 })
  const [busqueda, setBusqueda] = useState('')
  const [pendiente, setPendiente] = useState(false)
  const filtros = [{ valor: 'TODAS', etiqueta: 'Todas' },
    ...Object.entries(ESTADOS_PUBLICACION).map(([valor, datos]) => ({ valor, etiqueta: datos.etiqueta }))]
  function buscar(event) {
    event.preventDefault()
    if (!pendiente) setConsulta({ ...consulta, pagina: 0, busqueda: busqueda.trim() })
  }
  return <>
    <div className="flex items-center justify-between gap-4 my-6 phone:flex-col phone:items-stretch">
      <div role="group" aria-label="Filtrar publicaciones por estado" className="flex flex-wrap gap-1 phone:gap-0">
        {filtros.map((filtro) => <button key={filtro.valor} type="button" disabled={pendiente} aria-pressed={consulta.estado === filtro.valor}
          onClick={() => setConsulta({ ...consulta, pagina: 0, estado: filtro.valor })} className={'border-0 rounded-[6px] px-3.5 py-1.5 text-[12px] phone:px-[9px] disabled:opacity-50 ' + (consulta.estado === filtro.valor ? 'bg-ink text-white' : 'bg-transparent text-soft')}>
          {filtro.etiqueta}
        </button>)}
      </div>
      <form onSubmit={buscar} className="flex gap-2 w-80 max-w-full phone:w-full" role="search">
        <div className="relative flex-1 min-w-0">
          <PublicationIcon nombre="search" className="absolute top-1/2 left-3 -translate-y-1/2" />
          <input className="w-full bg-white border border-border rounded-[4px] py-2 pr-3 pl-9 text-[12px]" type="search" aria-label="Buscar por marca, modelo o patente" placeholder="Marca, modelo o patente…"
            value={busqueda} onChange={(event) => setBusqueda(event.target.value)} disabled={pendiente} />
        </div>
        <button type="submit" disabled={pendiente} className="border border-border rounded-[4px] px-3 text-[12px]">Buscar</button>
      </form>
    </div>
    <Results key={JSON.stringify(consulta)} consulta={consulta} sesion={sesion} onQuery={setConsulta} onPending={setPendiente} pendiente={pendiente} />
  </>
}

export default function MyPublications({ token, apiUrl }) {
  return <main className={pageStyles + ' pb-20 phone:pb-12'}>
    <div className={headingStyles}>
      <div>
        <p className={eyebrowStyles}>Panel de propietario · Gestión de vehículos</p>
        <h1 className={titleStyles}>Mis publicaciones</h1>
        <p className={introStyles}>Administrá tus autos en alquiler: precio, días disponibles y si aparecen en el catálogo.</p>
      </div>
      <Link to="/publicaciones/nueva" className={btnBase + ' ' + btnDark + ' ' + btnSize}><PublicationIcon nombre="plus" /> Publicar nuevo auto</Link>
    </div>
    <PublicationSession token={token} apiUrl={apiUrl}>{(sesion) => <Publications sesion={sesion} />}</PublicationSession>
  </main>
}
