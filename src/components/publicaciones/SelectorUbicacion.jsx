import { useRef, useState } from 'react'
import { useMapsLibrary } from '@vis.gl/react-google-maps'
import { inputStyles } from '../ui/FormField'
import PublicationIcon from './PublicationIcon'
import { tieneCoordenadas } from './ubicacion'

// devuelve el texto de la parte de la dirección que tenga ese tipo (ej: 'route', 'postal_code')
function parte(lugar, ...tipos) {
  for (const tipo of tipos) {
    const encontrada = lugar.addressComponents?.find((item) => item.types.includes(tipo))
    if (encontrada) return encontrada.longText
  }
  return ''
}

// pasa el lugar de Google a los campos que usa el formulario
function ubicacionDesdeLugar(lugar) {
  const calle = [parte(lugar, 'route'), parte(lugar, 'street_number')].filter(Boolean).join(' ')
  // en CABA el partido viene como "Comuna 13", ahí la ciudad es "Buenos Aires"
  const partido = parte(lugar, 'administrative_area_level_2')
  return {
    direccion: calle || lugar.formattedAddress || '',
    zona: parte(lugar, 'neighborhood', 'sublocality_level_1', 'locality'),
    localidad: parte(lugar, 'sublocality_level_1', 'locality'),
    ciudad: partido && !partido.startsWith('Comuna') ? partido : parte(lugar, 'locality'),
    provincia: parte(lugar, 'administrative_area_level_1'),
    codigoPostal: parte(lugar, 'postal_code'),
    latitud: lugar.location.lat(),
    longitud: lugar.location.lng(),
    placeId: lugar.id,
  }
}

export default function SelectorUbicacion({ valores, onChange, onUbicacionSeleccionada }) {
  const places = useMapsLibrary('places')
  const [sugerencias, setSugerencias] = useState([])
  const [aviso, setAviso] = useState('')
  const consulta = useRef(0)
  const sesionGoogle = useRef(null)

  function escribir(event) {
    onChange(event)
    setAviso('')
    const texto = event.target.value
    const numero = ++consulta.current
    if (!places || texto.trim().length < 3) { setSugerencias([]); return }
    // el token agrupa las búsquedas hasta que se elige una dirección (Google lo cobra como una sola)
    sesionGoogle.current ??= new places.AutocompleteSessionToken()
    places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
      input: texto, sessionToken: sesionGoogle.current, includedRegionCodes: ['ar'], language: 'es',
    }).then(({ suggestions }) => {
      if (numero === consulta.current) setSugerencias(suggestions.map((item) => item.placePrediction).filter(Boolean))
    }).catch(() => {
      if (numero === consulta.current) setSugerencias([])
    })
  }

  function elegir(prediccion) {
    consulta.current++
    setSugerencias([])
    const lugar = prediccion.toPlace()
    lugar.fetchFields({ fields: ['addressComponents', 'location', 'formattedAddress'] }).then(() => {
      sesionGoogle.current = null
      onUbicacionSeleccionada(ubicacionDesdeLugar(lugar))
    }).catch(() => setAviso('No pudimos obtener esa dirección. Probá de nuevo.'))
  }

  return <div className="relative">
    <PublicationIcon nombre="pinInput" className="absolute top-[1.3125rem] left-3 -translate-y-1/2" />
    <input id="direccion" name="direccion" required autoComplete="off" className={inputStyles + ' pl-9'}
      placeholder="Escribí la calle y la altura" value={valores.direccion} onChange={escribir}
      onBlur={() => setSugerencias([])} onKeyDown={(event) => event.key === 'Escape' && setSugerencias([])}
      role="combobox" aria-expanded={sugerencias.length > 0} aria-controls="sugerencias-direccion" />
    {sugerencias.length > 0 && <ul id="sugerencias-direccion" role="listbox" className="absolute z-10 left-0 right-0 mt-1 p-1 m-0 list-none bg-white border border-border rounded-[0.25rem] shadow-md">
      {sugerencias.map((prediccion) => <li key={prediccion.placeId} role="option" aria-selected="false">
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => elegir(prediccion)}
          className="w-full text-left border-0 bg-transparent rounded-[0.1875rem] px-3 py-2 text-[0.75rem] hover:bg-paper">
          <strong className="font-medium">{prediccion.mainText?.text}</strong>
          <span className="text-muted"> {prediccion.secondaryText?.text}</span>
        </button>
      </li>)}
    </ul>}
    {aviso ? <p className="mt-2 text-xs text-error">{aviso}</p>
      : valores.direccion.trim() && !tieneCoordenadas(valores) && <p className="mt-2 text-xs text-muted">Elegí una de las sugerencias para marcar la ubicación en el mapa.</p>}
  </div>
}
