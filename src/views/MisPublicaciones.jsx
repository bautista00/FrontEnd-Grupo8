import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import ConfirmarAccion from '../components/ui/ConfirmarAccion'
import { pageStyles, headingStyles, titleStyles, eyebrowStyles, introStyles } from '../components/publicaciones/estilosPublicacion'
import IconoPublicacion from '../components/publicaciones/IconoPublicacion'
import FilaPublicacion from '../components/publicaciones/FilaPublicacion'
import MensajePublicacion from '../components/publicaciones/MensajePublicacion'
import PaginacionPublicaciones from '../components/publicaciones/PaginacionPublicaciones'
import { btnBase, btnDark, btnSize } from '../components/ui/estilosBoton'
import { ESTADOS_PUBLICACION, compararMisPublicaciones } from '../utils/publicaciones'
import { cambiarEstadoPublicacion, fetchMisPublicaciones, limpiarEditor, limpiarErrorGuardado } from '../components/Redux/publicacionesSlice'

// Botones para filtrar por estado: "Todas" + uno por cada estado
const FILTROS = [
  { valor: 'TODAS', etiqueta: 'Todas' },
  ...Object.entries(ESTADOS_PUBLICACION).map(([valor, datos]) => ({ valor, etiqueta: datos.etiqueta })),
]

export default function MisPublicaciones() {
  const dispatch = useDispatch()
  // Página de resultados que devuelve el backend ({ content, totalPages, totalElements })
  const { misPublicaciones: datos, loading, error, guardando: procesando, errorGuardado, incierto } = useSelector((state) => state.publicaciones)
  const vigente = useRef(false)

  useEffect(() => {
    vigente.current = true
    dispatch(limpiarEditor())
    return () => { vigente.current = false }
  }, [dispatch])

  // Filtros de la consulta
  const [pagina, setPagina] = useState(0)
  const [estado, setEstado] = useState('TODAS')
  const [texto, setTexto] = useState('')
  const [busqueda, setBusqueda] = useState('')

  const [recargar, setRecargar] = useState(0)
  const [porDesactivar, setPorDesactivar] = useState(null)
  const [accionPendiente, setAccionPendiente] = useState(null)

  const token = useSelector((state) => state.users.token)

  // Cada vez que cambia un filtro, la página o "recargar", volvemos a consultar
  useEffect(() => {
    if (!token) return
    dispatch(fetchMisPublicaciones({ pagina, estado, busqueda }))
  }, [dispatch, token, pagina, estado, busqueda, recargar])

  function cambiarFiltro(valor) {
    if (procesando || incierto) return
    if (valor === estado && pagina === 0) return
    setEstado(valor)
    setPagina(0)
  }

  function buscar(event) {
    event.preventDefault()
    if (procesando || incierto) return
    setBusqueda(texto.trim())
    setPagina(0)
    setRecargar((actual) => actual + 1)
  }

  // Pausar y reactivar son PUT a su propia ruta; desactivar es un DELETE
  async function cambiarEstado(publicacion, accion, confirmado = false) {
    if (procesando || loading || error || incierto) return
    if (accion === 'desactivar' && !confirmado) {
      dispatch(limpiarErrorGuardado())
      setPorDesactivar(publicacion)
      return
    }
    setAccionPendiente({ id: publicacion.idPublicacion, accion })
    try {
      const guardada = await dispatch(cambiarEstadoPublicacion({ publicacion, accion })).unwrap()
      if (!vigente.current) return
      setPorDesactivar(null)
      toast.success(accion === 'pausar' ? 'La publicación se pausó.' : accion === 'reactivar' ? 'La publicación se reactivó.' : 'La publicación se desactivó.')
      if (estado !== 'TODAS' && estado !== guardada.estado) {
        setPagina(Math.min(pagina, Math.max(0, Math.ceil((datos.totalElements - 1) / 10) - 1)))
        setRecargar((actual) => actual + 1)
      } else if (estado === 'TODAS' && datos.totalPages > 1) {
        setRecargar((actual) => actual + 1)
      }
    } catch {
      // El error se muestra desde el slice.
    } finally {
      if (vigente.current) setAccionPendiente(null)
    }
  }

  function consultarDeNuevo() {
    dispatch(limpiarErrorGuardado())
    setRecargar((actual) => actual + 1)
  }

  function cambiarPagina(nuevaPagina) {
    if (procesando || incierto) return
    setPagina(nuevaPagina)
  }

  // Lo que se muestra debajo de los filtros
  let resultados
  if (error && !datos) {
    resultados = <MensajePublicacion error onRetry={consultarDeNuevo}>{error}</MensajePublicacion>
  } else if (!datos) {
    resultados = <MensajePublicacion>Cargando tus publicaciones…</MensajePublicacion>
  } else if (datos.content.length === 0) {
    resultados = (
      <div className="flex min-h-[18.75rem] flex-col items-center justify-center gap-3.5 p-8 text-center bg-white border border-border rounded-lg">
        <IconoPublicacion nombre="carLarge" />
        <h2 className="text-[1.375rem]">
          {loading ? 'Actualizando tus publicaciones…' : error ? 'Los últimos resultados estaban vacíos'
            : busqueda || estado !== 'TODAS' ? 'No hay publicaciones con esos filtros' : 'Todavía no tenés publicaciones'}
        </h2>
        <p className="text-muted text-[0.75rem] leading-[1.7]">Podés crear una publicación o cambiar los filtros.</p>
      </div>
    )
  } else {
    resultados = (
      <>
        <p className="mb-4 text-[0.75rem] text-muted">{datos.totalElements} {datos.totalElements === 1 ? 'publicación encontrada' : 'publicaciones encontradas'}<span role="status" className="inline-block min-w-32 ml-3">{loading ? 'Actualizando…' : error ? 'Sin actualizar' : ''}</span></p>
        <div className="grid gap-6">
          {[...datos.content].sort(compararMisPublicaciones).map((publicacion) => (
            <FilaPublicacion
              key={publicacion.idPublicacion}
              publicacion={publicacion}
              onCambiarEstado={cambiarEstado}
              deshabilitado={procesando || loading || Boolean(error) || incierto}
              accionPendiente={accionPendiente?.id === publicacion.idPublicacion ? accionPendiente.accion : null}
            />
          ))}
        </div>
        <PaginacionPublicaciones
          pagina={datos.number ?? pagina}
          totalPages={datos.totalPages}
          totalElements={datos.totalElements}
          onChange={cambiarPagina}
          disabled={procesando || loading || Boolean(error) || incierto}
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
          <IconoPublicacion nombre="plus" /> Publicar nuevo auto
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
              className={'border-0 rounded-[0.375rem] px-3.5 py-1.5 text-[0.75rem] phone:px-[0.5625rem] disabled:opacity-100! '
                + (estado === filtro.valor ? 'bg-ink text-white' : 'bg-transparent text-soft')}
            >
              {filtro.etiqueta}
            </button>
          ))}
        </div>
        <form onSubmit={buscar} className="flex gap-2 w-80 max-w-full phone:w-full" role="search">
          <div className="relative flex-1 min-w-0">
            <IconoPublicacion nombre="search" className="absolute top-1/2 left-3 -translate-y-1/2" />
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
          <button type="submit" disabled={procesando || incierto} className="border border-border rounded-[0.25rem] bg-card px-3 text-[0.75rem] disabled:opacity-100!">Buscar</button>
        </form>
      </div>

      {errorGuardado && <MensajePublicacion error>{errorGuardado.message}{incierto ? ' Comprobá el estado antes de volver a guardar.' : ''}</MensajePublicacion>}
      {incierto && (errorGuardado?.tipo === 'guardar' && errorGuardado.idPublicacion
        ? <Link to={`/publicaciones/${errorGuardado.idPublicacion}/editar`} className="text-xs underline">Revisar publicación pendiente</Link>
        : <button type="button" onClick={consultarDeNuevo} className="text-xs underline">Comprobar estado</button>)}
      <p role="status" className="sr-only">{procesando ? 'Guardando estado…' : ''}</p>
      {error && datos && <MensajePublicacion error onRetry={consultarDeNuevo}>{error} Se muestran los últimos resultados cargados.</MensajePublicacion>}
      <div aria-busy={loading}>{resultados}</div>
      {porDesactivar && <ConfirmarAccion
        titulo="¿Desactivar esta publicación?"
        descripcion="Dejará de aparecer en el catálogo. No vas a poder reactivarla."
        confirmar="Desactivar publicación"
        cancelar="Mantener publicación"
        procesando={procesando}
        confirmarDeshabilitado={incierto}
        textoProcesando="Desactivando…"
        mensaje={errorGuardado ? errorGuardado.message + (incierto ? ' Cerrá este aviso y comprobá el estado antes de intentar otra vez.' : '') : null}
        alCerrar={() => { if (!procesando) setPorDesactivar(null) }}
        alConfirmar={() => cambiarEstado(porDesactivar, 'desactivar', true)}
      />}
    </main>
  )
}
