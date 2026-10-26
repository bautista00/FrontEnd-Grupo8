import { useEffect, useState } from 'react'
import CategoryFilter from '../components/home/CategoryFilter'
import Hero from '../components/home/Hero'
import SearchBar from '../components/home/SearchBar'
import SortSelect from '../components/home/SortSelect'
import VehicleGrid from '../components/home/VehicleGrid'
import { RotateCcwIcon } from '../components/icons/Icons'
import PublicationMessage from '../components/publicaciones/PublicationMessage'
import PublicationPagination from '../components/publicaciones/PublicationPagination'
import { obtener } from '../utils/api'
import { PUBLICACIONES_POR_PAGINA } from '../utils/catalogo'

export default function Home() {
  // Zonas y tipos de vehículo para los filtros
  const [zonas, setZonas] = useState([])
  const [tipos, setTipos] = useState([])

  const [zona, setZona] = useState('all')
  const [tipoId, setTipoId] = useState('all')
  const [sortBy, setSortBy] = useState('recientes')
  const [fechaRetiro, setFechaRetiro] = useState('')
  const [fechaDevolucion, setFechaDevolucion] = useState('')
  const [pagina, setPagina] = useState(0)
  const [recargar, setRecargar] = useState(0)

  // Página de resultados del backend, junto con la consulta que la pidió
  const [resultado, setResultado] = useState(null)
  //Promise hace una petición a la API para obtener las zonas y tipos de vehículo, y 
  // luego actualiza el estado con los resultados. Operacion de manera asincrona, esperando a que se resuelvan las promesas de la API antes de actualizar el estado.
  useEffect(() => {
    Promise.all([obtener('/publicaciones/zonas'), obtener('/tipo-vehiculo')])
      .then(([listaZonas, listaTipos]) => {
        setZonas(listaZonas)
        setTipos(listaTipos)
      })
      .catch((error) => console.error('Error al cargar los filtros del catálogo', error))
  }, [])

  // El backend filtra, ordena y pagina sobre todas las publicaciones activas.
  // Las fechas solo se mandan cuando están elegidas las dos.
  const parametros = new URLSearchParams({ orden: sortBy, page: pagina, size: PUBLICACIONES_POR_PAGINA })
  if (zona !== 'all') parametros.set('zona', zona)
  if (tipoId !== 'all') parametros.set('idTipoVehiculo', tipoId)
  if (fechaRetiro && fechaDevolucion) {
    parametros.set('fechaInicio', fechaRetiro)
    parametros.set('fechaFin', fechaDevolucion)
  }
  const consulta = parametros.toString()

  //En este caso useEffect hace una petición a la API para obtener las publicaciones que 
  //coinciden con los filtros seleccionados por el usuario.
  useEffect(() => {
    let vigente = true
    obtener(`/publicaciones/buscar?${consulta}`)
      .then((datos) => { if (vigente) setResultado({ consulta, datos }) })
      .catch((error) => {
        console.error('Error al cargar el catálogo', error)
        if (vigente) setResultado({ consulta, error: error.message })
      })
    return () => { vigente = false }
  }, [consulta, recargar])

  // Mientras llega la consulta nueva se siguen mostrando los resultados anteriores
  const actualizando = resultado !== null && resultado.consulta !== consulta
  const catalogo = resultado?.datos

  // Cada filtro nuevo vuelve a la primera página
  const filtrar = (actualizar) => (valor) => {
    actualizar(valor)
    setPagina(0)
  }

  const hayFiltros = zona !== 'all' || tipoId !== 'all' || sortBy !== 'recientes' || fechaRetiro !== '' || fechaDevolucion !== ''

  const resetFiltros = () => {
    setZona('all')
    setTipoId('all')
    setSortBy('recientes')
    setFechaRetiro('')
    setFechaDevolucion('')
    setPagina(0)
  }

  const scrollToFleet = () => {
    document.getElementById('fleet-results')?.scrollIntoView({ behavior: 'smooth' })
  }

  const cambiarPagina = (nueva) => {
    setPagina(nueva)
    scrollToFleet()
  }

  return (
    <main className="flex-1 w-full max-w-page mx-auto px-(--gutter) pt-10 pb-14 lg:pt-14">
      <Hero />

      <SearchBar
        zonas={zonas}
        zona={zona}
        onZonaChange={filtrar(setZona)}
        fechaRetiro={fechaRetiro}
        fechaDevolucion={fechaDevolucion}
        onFechaRetiroChange={filtrar(setFechaRetiro)}
        onFechaDevolucionChange={filtrar(setFechaDevolucion)}
        onSearch={scrollToFleet}
      />

      <section id="fleet-results">
        <div className="flex flex-col items-stretch gap-4 mb-5 min-[56.25rem]:flex-row min-[56.25rem]:items-center min-[56.25rem]:justify-between">
          <CategoryFilter tipos={tipos} tipoId={tipoId} onChange={filtrar(setTipoId)} />
          <SortSelect value={sortBy} onChange={filtrar(setSortBy)} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 text-[0.75rem] text-muted">
          <span>
            Mostrando <strong className="text-ink">{catalogo?.totalElements ?? 0}</strong> unidades disponibles bajo estándares de
            certificación
          </span>

          {hayFiltros && (
            <button
              type="button"
              className="inline-flex items-center gap-1 p-0 bg-transparent border-0 text-[0.75rem] text-inherit transition-[color] hover:text-ink"
              onClick={resetFiltros}
            >
              <RotateCcwIcon size={12} />
              Restablecer filtros
            </button>
          )}
        </div>

        {resultado?.error && !actualizando ? (
          <PublicationMessage error onRetry={() => setRecargar(recargar + 1)}>{resultado.error}</PublicationMessage>
        ) : !catalogo ? (
          <PublicationMessage>Cargando vehículos…</PublicationMessage>
        ) : catalogo.content.length === 0 && !actualizando ? (
          <p className="py-12 text-center text-[0.875rem] text-muted">No se encontraron vehículos para esta selección.</p>
        ) : (
          <div aria-busy={actualizando} className={actualizando ? 'opacity-60 transition-opacity' : undefined}>
            <VehicleGrid items={catalogo.content} />
            <PublicationPagination
              pagina={catalogo.number}
              totalPages={catalogo.totalPages}
              totalElements={catalogo.totalElements}
              onChange={cambiarPagina}
              disabled={actualizando}
            />
          </div>
        )}
      </section>
    </main>
  )
}
