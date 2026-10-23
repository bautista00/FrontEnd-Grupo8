import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { pageStyles, titleStyles, eyebrowStyles, introStyles, helpStyles, actionsStyles } from '../components/publicaciones/publicationStyles'
import PublicationMessage from '../components/publicaciones/PublicationMessage'
import InputField from '../components/ui/InputField'
import FormField, { inputStyles } from '../components/ui/FormField'
import { btnBase, btnDark, btnOutline, btnSize } from '../components/ui/buttonStyles'
import { obtener, enviar } from '../utils/api'
import { ANIO_ACTUAL, ASIENTOS_POR_DEFECTO, normalizarPatente, validarVehiculo, valoresAVehiculo } from '../utils/vehiculos'

const VACIO = {
  patente: '', idTipoVehiculo: '', marca: '', modelo: '',
  anio: String(ANIO_ACTUAL), color: '', cantidadAsientos: String(ASIENTOS_POR_DEFECTO),
}

const PASOS = ['Datos', 'Fotos', 'Publicación']

// Muestra el error de un campo debajo del input
const aviso = (mensaje) => mensaje && <span role="alert" className="text-error">{mensaje}</span>

export default function VehicleForm({ modo = 'crear' }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const token = localStorage.getItem('jwtToken')
  const editando = modo === 'editar'

  const [valores, setValores] = useState(VACIO)
  const [tipos, setTipos] = useState([])
  const [otros, setOtros] = useState([]) // resto de la flota, para detectar patentes repetidas
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (!token) return
    let vigente = true
    async function cargar() {
      try {
        const [listaTipos, flota, vehiculo] = await Promise.all([
          obtener('/tipo-vehiculo'),
          obtener('/vehiculo/mios?size=100', token).catch(() => null),
          editando ? obtener(`/vehiculo/${id}`, token) : null,
        ])
        if (!vigente) return
        setTipos(listaTipos)
        setOtros((flota?.content ?? []).filter((v) => String(v.idVehiculo) !== String(id)))
        if (vehiculo) {
          const tipo = listaTipos.find((t) => t.idTipoVehiculo === vehiculo.idTipoVehiculo)
            ?? listaTipos.find((t) => t.nombre === vehiculo.tipoVehiculo)
          setValores({
            patente: vehiculo.patente, marca: vehiculo.marca, modelo: vehiculo.modelo,
            anio: String(vehiculo.anio), color: vehiculo.color,
            cantidadAsientos: String(vehiculo.cantidadAsientos),
            idTipoVehiculo: tipo ? String(tipo.idTipoVehiculo) : '',
          })
        } else {
          setValores((actuales) => ({ ...actuales, idTipoVehiculo: String(listaTipos[0]?.idTipoVehiculo ?? '') }))
        }
      } catch (e) {
        console.error('Error al cargar el formulario de vehículo', e)
        if (vigente) setErrorGeneral(editando ? 'No pudimos cargar el vehículo.' : 'No pudimos cargar los tipos de vehículo.')
      } finally {
        if (vigente) setCargando(false)
      }
    }
    cargar()
    return () => { vigente = false }
  }, [id, editando, token])

  function cambiar(event) {
    const { name, value } = event.target
    setValores({ ...valores, [name]: name === 'patente' ? normalizarPatente(value) : value })
    if (errores[name]) setErrores({ ...errores, [name]: undefined })
  }

  async function guardar(event) {
    event.preventDefault()
    const encontrados = validarVehiculo(valores, otros)
    // Los tipos válidos son los del backend, no la lista de ejemplo
    if (tipos.some((t) => String(t.idTipoVehiculo) === String(valores.idTipoVehiculo))) delete encontrados.idTipoVehiculo
    else encontrados.idTipoVehiculo = 'Elegí un tipo de vehículo'
    setErrores(encontrados)
    if (Object.keys(encontrados).length > 0) return

    setGuardando(true)
    setErrorGeneral('')
    try {
      const usuario = await obtener('/usuarios/me', token)
      const datos = {
        ...valoresAVehiculo(valores),
        idTipoVehiculo: Number(valores.idTipoVehiculo),
        idUsuario: usuario.idUsuario,
      }
      if (editando) {
        await enviar(`/vehiculo/${id}`, 'PUT', token, datos)
        navigate('/mis-vehiculos')
      } else {
        const vehiculo = await enviar('/vehiculo', 'POST', token, datos)
        navigate(`/vehiculos/${vehiculo.idVehiculo}/fotos`) // paso 2 del alta
      }
    } catch (e) {
      console.error('Error al guardar vehículo', e)
      setErrorGeneral(e.message)
      setGuardando(false)
    }
  }

  if (cargando) {
    return <main className={pageStyles + ' pb-20'}><PublicationMessage>Cargando…</PublicationMessage></main>
  }

  if (errorGeneral && (editando ? !valores.patente : tipos.length === 0)) {
    return (
      <main className={pageStyles + ' pb-20'}>
        <PublicationMessage error>{errorGeneral}</PublicationMessage>
        <Link to="/mis-vehiculos" className="inline-block mt-5 text-gold">Volver a mis vehículos</Link>
      </main>
    )
  }

  return (
    <main className={pageStyles + ' pb-20'}>
      <div className="max-w-3xl mx-auto">
        <Link to="/mis-vehiculos" className="text-[0.75rem] text-soft hover:underline">← Volver a mis vehículos</Link>

        {!editando && (
          <ol className={eyebrowStyles + ' flex gap-2 mt-4 p-0 list-none'} aria-label="Pasos del alta">
            {PASOS.map((paso, indice) => (
              <li key={paso} aria-current={indice === 0 ? 'step' : undefined} className={indice === 0 ? 'text-ink font-semibold' : undefined}>
                {indice > 0 && <span aria-hidden="true" className="mr-2">›</span>}
                {indice + 1} {paso}
              </li>
            ))}
          </ol>
        )}

        <h1 className={titleStyles + (editando ? ' mt-4' : '')}>{editando ? 'Editar vehículo' : 'Registrar vehículo'}</h1>
        <p className={introStyles}>
          {editando
            ? 'Los cambios se ven también en la publicación del vehículo.'
            : 'Completá los datos del auto. En el paso siguiente cargás las fotos.'}
        </p>

        <form onSubmit={guardar} noValidate className="mt-6">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 phone:grid-cols-1">
            <InputField id="patente" label="Patente *" placeholder="AB123CD" maxLength={7} autoComplete="off" value={valores.patente} onChange={cambiar} hint={aviso(errores.patente)} />
            <FormField id="idTipoVehiculo" label="Tipo de vehículo *" hint={aviso(errores.idTipoVehiculo)}>
              <select id="idTipoVehiculo" name="idTipoVehiculo" className={inputStyles} value={valores.idTipoVehiculo} onChange={cambiar}>
                {tipos.map((t) => <option key={t.idTipoVehiculo} value={t.idTipoVehiculo}>{t.nombre}</option>)}
              </select>
            </FormField>
            <InputField id="marca" label="Marca *" placeholder="Ej. Toyota" maxLength={50} value={valores.marca} onChange={cambiar} hint={aviso(errores.marca)} />
            <InputField id="modelo" label="Modelo y versión *" placeholder="Ej. Corolla XEI 2.0" maxLength={50} value={valores.modelo} onChange={cambiar} hint={aviso(errores.modelo)} />
            <InputField id="anio" type="number" label="Año *" value={valores.anio} onChange={cambiar} hint={aviso(errores.anio)} />
            <InputField id="color" label="Color *" placeholder="Ej. Gris plata" maxLength={30} value={valores.color} onChange={cambiar} hint={aviso(errores.color)} />
            <InputField id="cantidadAsientos" type="number" label="Cantidad de asientos *" value={valores.cantidadAsientos} onChange={cambiar} hint={aviso(errores.cantidadAsientos)} />
          </div>

          <p className={helpStyles}>La patente no se muestra en el catálogo.</p>

          {errorGeneral && <div className="mt-4"><PublicationMessage error>{errorGeneral}</PublicationMessage></div>}

          <div className={actionsStyles + ' justify-end mt-8'}>
            <Link to="/mis-vehiculos" className={btnBase + ' ' + btnOutline + ' ' + btnSize}>Cancelar</Link>
            <button type="submit" disabled={guardando} className={btnBase + ' ' + btnDark + ' ' + btnSize}>
              {guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Continuar a las fotos'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}