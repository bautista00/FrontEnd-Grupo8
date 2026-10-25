import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { pageStyles, titleStyles, eyebrowStyles, introStyles, helpStyles, actionsStyles } from '../components/publicaciones/publicationStyles'
import PublicationMessage from '../components/publicaciones/PublicationMessage'
import InputField from '../components/ui/InputField'
import FormField, { inputStyles } from '../components/ui/FormField'
import { btnBase, btnDark, btnOutline, btnSize } from '../components/ui/buttonStyles'
import { obtener, enviar } from '../utils/api'
import { normalizarPatente, validarVehiculo, valoresAVehiculo, valoresInicialesVehiculo } from '../utils/vehiculos'

const PASOS = ['Datos', 'Fotos', 'Publicación']

// Muestra el error de un campo debajo del input
const aviso = (mensaje) => mensaje && <span role="alert" className="text-error">{mensaje}</span>

export default function VehicleForm(props) {
  const { id } = useParams()
  return <VehicleEditor key={props.modo === 'editar' ? id : 'nuevo'} {...props} id={id} />
}

function VehicleEditor({ modo = 'crear', id }) {
  const navigate = useNavigate()
  const location = useLocation()
  const token = localStorage.getItem('jwtToken')
  const editando = modo === 'editar'
  // Alta iniciada desde Crear publicación: al cancelar o terminar se vuelve a ese formulario
  const desdePublicacion = !editando && location.state?.desdePublicacion === true
  const volver = desdePublicacion
    ? { to: '/publicaciones/nueva', state: { retomarBorrador: true }, texto: 'Volver a crear publicación' }
    : { to: '/mis-vehiculos', texto: 'Volver a mis vehículos' }

  const [valores, setValores] = useState(valoresInicialesVehiculo())
  const [tipos, setTipos] = useState([])
  const [otros, setOtros] = useState([]) // resto de la flota, para detectar patentes repetidas
  const [idUsuario, setIdUsuario] = useState(null) // dueño del vehículo
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [cargando, setCargando] = useState(true)
  const [datosParaGuardar, setDatosParaGuardar] = useState(null)
  const guardando = datosParaGuardar !== null

  useEffect(() => {
    if (!token) return
    let vigente = true
    async function cargar() {
      try {
        // El backend pide el dueño en el body y verifica que sea el usuario del token.
        // Al editar ya viene en el vehículo; en el alta es el usuario logueado.
        const [listaTipos, flota, vehiculo, usuario] = await Promise.all([
          obtener('/tipo-vehiculo'),
          obtener('/vehiculo/mios?size=100', token).catch(() => null),
          editando ? obtener(`/vehiculo/${id}`, token) : null,
          editando ? null : obtener('/usuarios/me', token),
        ])
        if (!vigente || token !== localStorage.getItem('jwtToken')) return
        setTipos(listaTipos)
        setOtros((flota?.content ?? []).filter((v) => String(v.idVehiculo) !== String(id)))
        setValores(valoresInicialesVehiculo(vehiculo, listaTipos))
        setIdUsuario(editando ? vehiculo.idUsuario : usuario.idUsuario)
      } catch (e) {
        console.error('Error al cargar el formulario de vehículo', e)
        if (vigente && token === localStorage.getItem('jwtToken')) setErrorGeneral(editando ? 'No pudimos cargar el vehículo.' : 'No pudimos cargar los tipos de vehículo.')
      } finally {
        if (vigente) setCargando(false)
      }
    }
    cargar()
    return () => { vigente = false }
  }, [id, editando, token])

  function cambiar(event) {
    if (guardando) return
    const { name, value } = event.target
    setValores({ ...valores, [name]: name === 'patente' ? normalizarPatente(value) : value })
    if (errores[name]) setErrores({ ...errores, [name]: undefined })
  }

  function guardar(event) {
    event.preventDefault()
    if (guardando) return
    const encontrados = validarVehiculo(valores, tipos, otros)
    setErrores(encontrados)
    if (Object.keys(encontrados).length > 0) return
    setErrorGeneral('')
    setDatosParaGuardar({ datos: { ...valoresAVehiculo(valores), idUsuario }, token, id, editando, desdePublicacion })
  }

  useEffect(() => {
    if (!datosParaGuardar) return
    let vigente = true
    const { datos, token: tokenEnvio, id, editando, desdePublicacion } = datosParaGuardar
    enviar(editando ? '/vehiculo/' + id : '/vehiculo', editando ? 'PUT' : 'POST', tokenEnvio, datos)
      .then((vehiculo) => {
        if (!vigente || tokenEnvio !== localStorage.getItem('jwtToken')) return
        setDatosParaGuardar(null)
        navigate(editando ? '/mis-vehiculos' : '/vehiculos/' + vehiculo.idVehiculo + '/fotos', { state: desdePublicacion ? { desdePublicacion } : null })
      })
      .catch((error) => {
        if (!vigente || tokenEnvio !== localStorage.getItem('jwtToken')) return
        setErrorGeneral(error.message)
        setDatosParaGuardar(null)
      })
    return () => { vigente = false }
  }, [datosParaGuardar, navigate])

  if (cargando) {
    return <main className={pageStyles + ' pb-20'}><PublicationMessage>Cargando…</PublicationMessage></main>
  }

  if (errorGeneral && (editando ? !valores.patente : tipos.length === 0)) {
    return (
      <main className={pageStyles + ' pb-20'}>
        <PublicationMessage error>{errorGeneral}</PublicationMessage>
        <Link aria-disabled={guardando} onClick={(event) => { if (guardando) event.preventDefault() }} to={volver.to} state={volver.state} className="inline-block mt-5 text-gold">{volver.texto}</Link>
      </main>
    )
  }

  return (
    <main className={pageStyles + ' pb-20'}>
      <div className="max-w-3xl mx-auto">
        <Link aria-disabled={guardando} onClick={(event) => { if (guardando) event.preventDefault() }} to={volver.to} state={volver.state} className="text-[0.75rem] text-soft hover:underline">← {volver.texto}</Link>

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
          <fieldset disabled={guardando} className="contents">
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
            <Link aria-disabled={guardando} onClick={(event) => { if (guardando) event.preventDefault() }} to={volver.to} state={volver.state} className={btnBase + ' ' + btnOutline + ' ' + btnSize}>Cancelar</Link>
            <button type="submit" disabled={guardando} className={btnBase + ' ' + btnDark + ' ' + btnSize}>
              {guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Continuar a las fotos'}
            </button>
          </div>
          </fieldset>
        </form>
      </div>
    </main>
  )
}