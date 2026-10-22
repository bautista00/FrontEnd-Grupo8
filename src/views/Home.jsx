import { useEffect, useMemo, useState } from 'react'
import CategoryFilter from '../components/home/CategoryFilter'
import Hero from '../components/home/Hero'
import SearchBar from '../components/home/SearchBar'
import SortSelect from '../components/home/SortSelect'
import VehicleGrid from '../components/home/VehicleGrid'
import { RotateCcwIcon } from '../components/icons/Icons'
import PublicationMessage from '../components/publicaciones/PublicationMessage'
import { obtener } from '../utils/api'
import { precioFinal } from '../utils/formatters'

const sorters = {
  recommended: (a, b) => b.fechaPublicacion.localeCompare(a.fechaPublicacion),
  'price-asc': (a, b) => precioFinal(a) - precioFinal(b),
  'price-desc': (a, b) => precioFinal(b) - precioFinal(a),
  'year-desc': (a, b) => b.anio - a.anio,
}

export default function Home() {
  // Publicaciones activas y tipos de vehículo que vienen del backend
  const [publicaciones, setPublicaciones] = useState(null)
  const [tipos, setTipos] = useState([])
  const [error, setError] = useState('')
  const [recargar, setRecargar] = useState(0)

  useEffect(() => {
    // El backend devuelve una página ({ content, ... }); pedimos 100 y filtramos/ordenamos acá
    Promise.all([
      obtener('/publicaciones?page=0&size=100'),
      obtener('/tipo-vehiculo'),
    ])
      .then(([pagina, listaTipos]) => {
        setPublicaciones(pagina.content)
        setTipos(listaTipos)
        setError('')
      })
      .catch((error) => {
        console.error('Error al cargar el catálogo', error)
        setError('No pudimos cargar el catálogo. Intentá nuevamente.')
      })
  }, [recargar])

  // Las zonas disponibles salen de las publicaciones cargadas
  const zonas = useMemo(
    () => [...new Set((publicaciones ?? []).map((p) => p.zona).filter(Boolean))].sort(),
    [publicaciones],
  )

  const [zona, setZona] = useState('all')
  const [tipoId, setTipoId] = useState('all')
  const [sortBy, setSortBy] = useState('recommended')
  const [fechaRetiro, setFechaRetiro] = useState('')
  const [fechaDevolucion, setFechaDevolucion] = useState('')

  const vehiculos = (publicaciones ?? []).filter((v) => zona === 'all' || v.zona === zona)
    .filter((v) => tipoId === 'all' || v.idTipoVehiculo === Number(tipoId))
    .sort(sorters[sortBy])

  const hayFiltros = zona !== 'all' || tipoId !== 'all' || sortBy !== 'recommended'

  const resetFiltros = () => {
    setZona('all')
    setTipoId('all')
    setSortBy('recommended')
  }

  const scrollToFleet = () => {
    document.getElementById('fleet-results')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <main className="flex-1 w-full max-w-page mx-auto px-(--gutter) pt-10 pb-14 lg:pt-14">
      <Hero />

      <SearchBar
        zonas={zonas}
        zona={zona}
        onZonaChange={setZona}
        fechaRetiro={fechaRetiro}
        fechaDevolucion={fechaDevolucion}
        onFechaRetiroChange={setFechaRetiro}
        onFechaDevolucionChange={setFechaDevolucion}
        onSearch={scrollToFleet}
      />

      <section id="fleet-results">
        <div className="flex flex-col items-stretch gap-4 mb-5 min-[56.25rem]:flex-row min-[56.25rem]:items-center min-[56.25rem]:justify-between">
          <CategoryFilter tipos={tipos} tipoId={tipoId} onChange={setTipoId} />
          <SortSelect value={sortBy} onChange={setSortBy} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 text-[0.75rem] text-muted">
          <span>
            Mostrando <strong className="text-ink">{vehiculos.length}</strong> unidades disponibles bajo estándares de
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

        {error ? (
          <PublicationMessage error onRetry={() => setRecargar(recargar + 1)}>{error}</PublicationMessage>
        ) : !publicaciones ? (
          <PublicationMessage>Cargando vehículos…</PublicationMessage>
        ) : vehiculos.length === 0 ? (
          <p className="py-12 text-center text-[0.875rem] text-muted">No se encontraron vehículos para esta selección.</p>
        ) : (
          <VehicleGrid items={vehiculos} />
        )}
      </section>
    </main>
  )
}
