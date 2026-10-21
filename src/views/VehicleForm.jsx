import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { pageStyles, titleStyles, eyebrowStyles } from '../components/publicaciones/publicationStyles'
import PublicationMessage from '../components/publicaciones/PublicationMessage'
import { olvidarPortada } from '../components/publicaciones/PublicationPhoto'
import InputField from '../components/ui/InputField'
import FormField, { inputStyles } from '../components/ui/FormField'
import { btnBase, btnDark, btnSize } from '../components/ui/buttonStyles'
import { obtener, enviar, subirArchivo } from '../utils/api'

const VACIO = { patente: '', marca: '', modelo: '', anio: '', color: '', cantidadAsientos: '', idTipoVehiculo: '' }

// Alta y edición de un vehículo + sus fotos (/vehiculo y /imagen-vehiculo)
export default function VehicleForm({ modo = 'crear' }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const token = localStorage.getItem('jwtToken')
  const editando = modo === 'editar'

  const [valores, setValores] = useState(VACIO)
  const [tipos, setTipos] = useState([])
  const [fotos, setFotos] = useState([]) // [{ id, orden, file }] ya guardadas
  const [nuevas, setNuevas] = useState([]) // archivos elegidos, todavía sin subir
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    obtener('/tipo-vehiculo').then(setTipos).catch((e) => console.error('Error al cargar tipos', e))
    if (!editando) return
    Promise.all([obtener(`/vehiculo/${id}`, token), obtener(`/imagen-vehiculo/por-vehiculo/${id}`)])
      .then(([v, imagenes]) => {
        setValores({
          patente: v.patente, marca: v.marca, modelo: v.modelo, anio: String(v.anio), color: v.color,
          cantidadAsientos: String(v.cantidadAsientos), idTipoVehiculo: v.idTipoVehiculo ? String(v.idTipoVehiculo) : '',
        })
        setFotos([...imagenes].sort((a, b) => a.orden - b.orden))
      })
      .catch(() => setError('No pudimos cargar el vehículo.'))
  }, [id, editando, token])

  function cambiar(event) {
    setValores({ ...valores, [event.target.name]: event.target.value })
  }

  function borrarFoto(foto) {
    enviar(`/imagen-vehiculo/${foto.id}`, 'DELETE', token)
      .then(() => { setFotos(fotos.filter((f) => f.id !== foto.id)); olvidarPortada(Number(id)) })
      .catch((e) => setError(e.message))
  }

  async function guardar(event) {
    event.preventDefault()
    setGuardando(true)
    setError('')
    try {
      // El back pide el idUsuario del dueño: lo sacamos de la sesión
      const usuario = await obtener('/usuarios/me', token)
      const datos = {
        patente: valores.patente.trim().toUpperCase(),
        marca: valores.marca.trim(),
        modelo: valores.modelo.trim(),
        anio: Number(valores.anio),
        color: valores.color.trim(),
        cantidadAsientos: Number(valores.cantidadAsientos),
        idUsuario: usuario.idUsuario,
        idTipoVehiculo: valores.idTipoVehiculo ? Number(valores.idTipoVehiculo) : null,
      }
      const vehiculo = editando
        ? await enviar(`/vehiculo/${id}`, 'PUT', token, datos)
        : await enviar('/vehiculo', 'POST', token, datos)

      // Fotos nuevas: una por pedido; el "orden" sigue a las que ya existen
      let orden = fotos.reduce((max, f) => Math.max(max, f.orden), 0)
      for (const archivo of nuevas) {
        const form = new FormData()
        form.append('file', archivo)
        form.append('idVehiculo', vehiculo.idVehiculo)
        form.append('orden', ++orden)
        await subirArchivo('/imagen-vehiculo', 'POST', token, form)
      }
      olvidarPortada(vehiculo.idVehiculo)
      navigate('/mis-vehiculos')
    } catch (e) {
      console.error('Error al guardar vehículo', e)
      setError(e.message)
      setGuardando(false)
    }
  }

  if (!token) {
    return <main className={pageStyles + ' pb-20'}><PublicationMessage>Iniciá sesión para administrar tus vehículos.</PublicationMessage></main>
  }

  return (
    <main className={pageStyles + ' pb-20'}>
      <Link to="/mis-vehiculos" className="text-[0.75rem] text-soft hover:underline">← Mis vehículos</Link>
      <p className={eyebrowStyles + ' mt-4'}>Panel de propietario</p>
      <h1 className={titleStyles}>{editando ? 'Editar vehículo' : 'Agregar vehículo'}</h1>

      <form onSubmit={guardar} className="grid gap-4 max-w-xl mt-6">
        <InputField id="patente" label="Patente" maxLength={6} required value={valores.patente} onChange={cambiar} />
        <InputField id="marca" label="Marca" maxLength={50} required value={valores.marca} onChange={cambiar} />
        <InputField id="modelo" label="Modelo" maxLength={50} required value={valores.modelo} onChange={cambiar} />
        <InputField id="anio" type="number" label="Año" min={1900} max={2026} required value={valores.anio} onChange={cambiar} />
        <InputField id="color" label="Color" maxLength={30} required value={valores.color} onChange={cambiar} />
        <InputField id="cantidadAsientos" type="number" label="Cantidad de asientos" min={1} max={9} required value={valores.cantidadAsientos} onChange={cambiar} />
        <FormField id="idTipoVehiculo" label="Tipo de vehículo">
          <select id="idTipoVehiculo" name="idTipoVehiculo" className={inputStyles} value={valores.idTipoVehiculo} onChange={cambiar}>
            <option value="">Sin tipo</option>
            {tipos.map((t) => <option key={t.idTipoVehiculo} value={t.idTipoVehiculo}>{t.nombre}</option>)}
          </select>
        </FormField>

        <FormField id="fotos" label="Fotos" hint="Se muestran en el orden en que las subas; la primera es la portada.">
          {fotos.length > 0 && (
            <div className="grid grid-cols-4 gap-3 mb-3">
              {fotos.map((f) => (
                <div key={f.id} className="relative aspect-[16/10] overflow-hidden bg-surface rounded-[0.25rem]">
                  <img src={`data:image/jpeg;base64,${f.file}`} alt="" className="w-full h-full object-cover" />
                  <button type="button" aria-label="Quitar foto" onClick={() => borrarFoto(f)} className="absolute top-1 right-1 px-1.5 rounded bg-ink text-white text-[0.625rem]">✕</button>
                </div>
              ))}
            </div>
          )}
          <input id="fotos" type="file" accept="image/*" multiple className={inputStyles} onChange={(e) => setNuevas([...e.target.files])} />
        </FormField>

        {error && <PublicationMessage error>{error}</PublicationMessage>}

        <button type="submit" disabled={guardando} className={btnBase + ' ' + btnDark + ' ' + btnSize + ' mt-2'}>
          {guardando ? 'Guardando…' : 'Guardar vehículo'}
        </button>
      </form>
    </main>
  )
}
