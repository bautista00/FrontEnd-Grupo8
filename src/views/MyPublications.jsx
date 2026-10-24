import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { pageStyles, headingStyles, titleStyles, eyebrowStyles, introStyles } from '../components/publicaciones/publicationStyles'
import PublicationIcon from '../components/publicaciones/PublicationIcon'
import PublicationRow from '../components/publicaciones/PublicationRow'
import PublicationMessage from '../components/publicaciones/PublicationMessage'
import PublicationPagination from '../components/publicaciones/PublicationPagination'
import { btnBase, btnDark, btnSize } from '../components/ui/buttonStyles'
import { ESTADOS_PUBLICACION } from '../utils/publicaciones'
import { obtener } from '../utils/api'
import enviar from '../components/publicaciones/enviarPublicacion'

// Botones para filtrar por estado: "Todas" + uno por cada estado
const FILTROS = [
  { valor: 'TODAS', etiqueta: 'Todas' },
  ...Object.entries(ESTADOS_PUBLICACION).map(([valor, datos]) => ({ valor, etiqueta: datos.etiqueta })),
]

export default function MyPublications() {
  // Página de resultados que devuelve el backend ({ content, totalPages, totalElements })
  const [datos, setDatos] = useState(null)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')

  // Filtros de la consulta
  const [pagina, setPagina] = useState(0)
  const [estado, setEstado] = useState('TODAS')
  const [texto, setTexto] = useState('')
  const [busqueda, setBusqueda] = useState('')

  const [recargar, setRecargar] = useState(0)
  const [accionPendiente, setAccionPendiente] = useState(null)
  const [incierto, setIncierto] = useState(false)
  const procesando = accionPendiente !== null

  const token = localStorage.getItem('jwtToken')

  // Cada vez que cambia un filtro, la página o "recargar", volvemos a consultar
  useEffect(() => {
    if (!token) return
    let vigente = true

    const parametros = new URLSearchParams({ page: pagina, size: 10 })
    if (estado !== 'TODAS') parametros.set('estado', estado)
    if (busqueda) parametros.set('busqueda', busqueda)

    obtener(`/publicaciones/mias?${parametros}`, token)
      .then((resultado) => {
        if (!vigente || token !== localStorage.getItem('jwtToken')) return
        setDatos(resultado)
        setError('')
        setIncierto(false)
      })
      .catch((error) => {
        if (vigente && token === localStorage.getItem('jwtToken')) setError(error.message)
      })
    return () => { vigente = false }
  }, [token, pagina, estado, busqueda, recargar])

  useEffect(() => {
    if (!accionPendiente) return
    let vigente = true
    const { publicacion, accion, token: tokenEnvio, filtro, paginaActual, total } = accionPendiente
    const ruta = accion === 'desactivar' ? '' : `/${accion}`
    enviar(`/publicaciones/${publicacion.idPublicacion}${ruta}`, accion === 'desactivar' ? 'DELETE' : 'PUT', tokenEnvio)
      .then((respuesta) => {
        if (!vigente || tokenEnvio !== localStorage.getItem('jwtToken')) return
        const guardada = respuesta ?? { ...publicacion, estado: 'DESACTIVADA' }
        const sigueEnFiltro = filtro === 'TODAS' || filtro === guardada.estado
        setDatos((actuales) => ({ ...actuales, content: actuales.content
          .map((item) => item.idPublicacion === guardada.idPublicacion ? guardada : item)
          .filter((item) => filtro === 'TODAS' || item.estado === filtro),
        totalElements: sigueEnFiltro ? actuales.totalElements : Math.max(0, actuales.totalElements - 1) }))
        if (!sigueEnFiltro) {
          setPagina(Math.min(paginaActual, Math.max(0, Math.ceil((total - 1) / 10) - 1)))
          setDatos(null)
          setRecargar((actual) => actual + 1)
        }
      })
      .catch((error) => {
        if (!vigente || tokenEnvio !== localStorage.getItem('jwtToken')) return
        const sinConfirmacion = !error.status || error.status >= 500
        setIncierto(sinConfirmacion)
        setAviso(error.message + (sinConfirmacion ? ' Comprobá el estado antes de volver a guardar.' : ''))
      })
      .finally(() => { if (vigente) setAccionPendiente(null) })
    return () => { vigente = false }
  }, [accionPendiente])

  function cambiarFiltro(valor) {
    if (procesando || incierto) return
    if (valor === estado && pagina === 0) return
    setDatos(null)
    setError('')
    setEstado(valor)
    setPagina(0)
  }

  function buscar(event) {
    event.preventDefault()
    if (procesando || incierto) return
    setDatos(null)
    setError('')
    setBusqueda(texto.trim())
    setPagina(0)
    setRecargar((actual) => actual + 1)
  }

  // Pausar y reactivar son PUT a su propia ruta; desactivar es un DELETE
  function cambiarEstado(publicacion, accion) {
    if (procesando || incierto) return
    if (accion === 'desactivar' && !window.confirm('¿Desactivar esta publicación? No vas a poder reactivarla.')) return
    setAviso('')
    setAccionPendiente({ publicacion, accion, token, filtro: estado, paginaActual: pagina, total: datos.totalElements })
  }

  function consultarDeNuevo() {
    setDatos(null)
    setError('')
    setAviso('')
    setRecargar((actual) => actual + 1)
  }

  function cambiarPagina(nuevaPagina) {
    if (procesando || incierto) return
    setDatos(null)
    setPagina(nuevaPagina)
  }

  // Lo que se muestra debajo de los filtros
  let resultados
  if (error) {
    resultados = <PublicationMessage error onRetry={consultarDeNuevo}>{error}</PublicationMessage>
  } else if (!datos) {
    resultados = <PublicationMessage>Cargando tus publicaciones…</PublicationMessage>
  } else if (datos.content.length === 0) {
    resultados = (
      <div className="flex min-h-[18.75rem] flex-col items-center justify-center gap-3.5 p-8 text-center bg-white border border-border rounded-lg">
        <PublicationIcon nombre="carLarge" />
        <h2 className="text-[1.375rem]">
          {busqueda || estado !== 'TODAS' ? 'No hay publicaciones con esos filtros' : 'Todavía no tenés publicaciones'}
        </h2>
        <p className="text-muted text-[0.75rem] leading-[1.7]">Podés crear una publicación o cambiar los filtros.</p>
      </div>
    )
  } else {
    resultados = (
      <>
        <p className="mb-4 text-[0.75rem] text-muted">{datos.totalElements} publicaciones encontradas</p>
        <div className="grid gap-6">
          {datos.content.map((publicacion) => (
            <PublicationRow
              key={publicacion.idPublicacion}
              publicacion={publicacion}
              onCambiarEstado={cambiarEstado}
              deshabilitado={procesando || incierto}
            />
          ))}
        </div>
        <PublicationPagination
          pagina={pagina}
          totalPages={datos.totalPages}
          totalElements={datos.totalElements}
          onChange={cambiarPagina}
          disabled={procesando || incierto}
        />
      </>
    )
  }

  return (
    <main className={pageStyles + ' pb-20 phone:pb-12'}>
      <div className={headingStyles}>
        <div>
          <p className={eyebrowStyles}>Panel de propietario · Gestión de vehículos</p>
          <h1 className={titleStyles}>Mis publicaciones</h1>
          <p className={introStyles}>Administrá tus autos en alquiler: precio, días disponibles y si aparecen en el catálogo.</p>
        </div>
        <Link to="/publicaciones/nueva" className={btnBase + ' ' + btnDark + ' ' + btnSize}>
          <PublicationIcon nombre="plus" /> Publicar nuevo auto
        </Link>
      </div>

      <div className="flex items-center justify-between gap-4 my-6 phone:flex-col phone:items-stretch">
        <div role="group" aria-label="Filtrar publicaciones por estado" className="flex flex-wrap gap-1 phone:gap-0">
          {FILTROS.map((filtro) => (
            <button
              key={filtro.valor}
              type="button"
              disabled={procesando || incierto}
              aria-pressed={estado === filtro.valor}
              onClick={() => cambiarFiltro(filtro.valor)}
              className={'border-0 rounded-[0.375rem] px-3.5 py-1.5 text-[0.75rem] phone:px-[0.5625rem] '
                + (estado === filtro.valor ? 'bg-ink text-white' : 'bg-transparent text-soft')}
            >
              {filtro.etiqueta}
            </button>
          ))}
        </div>
        <form onSubmit={buscar} className="flex gap-2 w-80 max-w-full phone:w-full" role="search">
          <div className="relative flex-1 min-w-0">
            <PublicationIcon nombre="search" className="absolute top-1/2 left-3 -translate-y-1/2" />
            <input
              type="search"
              aria-label="Buscar por marca, modelo o patente"
              placeholder="Marca, modelo o patente…"
              className="w-full bg-white border border-border rounded-[0.25rem] py-2 pr-3 pl-9 text-[0.75rem]"
              value={texto}
              disabled={procesando || incierto}
              onChange={(event) => setTexto(event.target.value)}
            />
          </div>
          <button type="submit" disabled={procesando || incierto} className="border border-border rounded-[0.25rem] px-3 text-[0.75rem]">Buscar</button>
        </form>
      </div>

      {aviso && <PublicationMessage error>{aviso}</PublicationMessage>}
      {incierto && <button type="button" onClick={consultarDeNuevo} className="text-xs underline">Comprobar estado</button>}
      {procesando && <PublicationMessage>Guardando estado…</PublicationMessage>}
      {resultados}
    </main>
  )
}
