import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { pageStyles, titleStyles, eyebrowStyles, introStyles, helpStyles, actionsStyles } from '../components/publicaciones/estilosPublicacion'
import MensajePublicacion from '../components/publicaciones/MensajePublicacion'
import CampoTexto from '../components/ui/CampoTexto'
import CampoFormulario, { inputStyles } from '../components/ui/CampoFormulario'
import { btnBase, btnDark, btnOutline, btnSize } from '../components/ui/estilosBoton'
import { normalizarPatente, validarVehiculo, valoresAVehiculo, valoresInicialesVehiculo } from '../utils/vehiculos'
import { fetchUser } from '../components/Redux/userSlice'
import { fetchTiposVehiculo, fetchVehiculo, fetchFlotaVehiculos, createVehiculo, updateVehiculo, limpiarErrorGuardar } from '../components/Redux/vehiculosSlice'

const PASOS = ['Datos', 'Fotos', 'Publicación']

// Muestra el error de un campo debajo del input
const aviso = (mensaje) => mensaje && <span role="alert" className="text-error">{mensaje}</span>

export default function FormularioVehiculo(props) {
  const { id } = useParams()
  return <VehicleEditor key={props.modo === 'editar' ? id : 'nuevo'} {...props} id={id} />
}

function VehicleEditor({ modo = 'crear', id }) {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { token, user: usuario, error: errorUsuario } = useSelector((state) => state.users)
  const { tiposVehiculo: tipos, errorTipos, loadingGuardar: guardando, errorGuardar, vehiculoActual, errorVehiculo, flota } = useSelector((state) => state.vehiculos)
  const editando = modo === 'editar'
  // En el alta el dueño es el usuario logueado; al editar se usa para comprobar que el vehículo sea suyo
  const idUsuarioSesion = usuario?.idUsuario
  // Alta iniciada desde Crear publicación: al cancelar o terminar se vuelve a ese formulario
  const desdePublicacion = !editando && location.state?.desdePublicacion === true
  const volver = desdePublicacion
    ? { to: '/publicaciones/nueva', state: { retomarBorrador: true }, texto: 'Volver a crear publicación' }
    : { to: '/mis-vehiculos', texto: 'Volver a mis vehículos' }

  const [valores, setValores] = useState(valoresInicialesVehiculo())
  const [errores, setErrores] = useState({})

  // Lo que antes eran estados locales ahora se calcula a partir del store
  const vehiculo = editando && String(vehiculoActual?.idVehiculo) === String(id) ? vehiculoActual : null
  const otros = flota.filter((v) => String(v.idVehiculo) !== String(id)) // resto de la flota, para detectar patentes repetidas
  const idUsuario = editando ? vehiculo?.idUsuario : idUsuarioSesion // dueño del vehículo
  // El backend rechaza cambios de otro usuario; acá además se evita mostrarle el formulario
  const noEsTuyo = Boolean(vehiculo && idUsuarioSesion && vehiculo.idUsuario !== idUsuarioSesion)

  // Los tipos de vehículo y el usuario logueado se piden al store si todavía no están
  useEffect(() => {
    if (tipos.length === 0) dispatch(fetchTiposVehiculo())
  }, [tipos.length, dispatch])

  useEffect(() => {
    if (!usuario?.idUsuario) dispatch(fetchUser())
  }, [usuario, dispatch])

  useEffect(() => {
    dispatch(limpiarErrorGuardar())
  }, [dispatch])

  // Se piden al store la flota (para detectar patentes repetidas) y, al editar, el vehículo
  useEffect(() => {
    if (!token) return
    dispatch(fetchFlotaVehiculos())
    if (editando) dispatch(fetchVehiculo(id))
  }, [dispatch, token, editando, id])

  // Cuando llegan los datos, se cargan en el formulario (lo que escribe la persona sigue siendo estado local)
  useEffect(() => {
    if (editando) {
      if (vehiculo && !noEsTuyo) setValores(valoresInicialesVehiculo(vehiculo, tipos))
    } else if (tipos.length > 0) {
      setValores(valoresInicialesVehiculo(undefined, tipos))
    }
  }, [editando, vehiculo, noEsTuyo, tipos])

  function cambiar(event) {
    if (guardando) return
    const { name, value } = event.target
    setValores({ ...valores, [name]: name === 'patente' ? normalizarPatente(value) : value })
    if (errores[name]) setErrores({ ...errores, [name]: undefined })
  }

  async function guardar(event) {
    event.preventDefault()
    if (guardando) return
    const encontrados = validarVehiculo(valores, tipos, otros)
    setErrores(encontrados)
    if (Object.keys(encontrados).length > 0) return
    const datos = { ...valoresAVehiculo(valores), idUsuario }
    try {
      // unwrap() devuelve el payload si salió bien y lanza el error si falló
      const guardado = await dispatch(editando ? updateVehiculo({ id, ...datos }) : createVehiculo(datos)).unwrap()
      navigate(
        editando ? '/mis-vehiculos' : '/vehiculos/' + guardado.idVehiculo + '/fotos',
        { state: desdePublicacion ? { desdePublicacion } : null },
      )
    } catch {
      // No hace falta mostrar nada acá: el rejected del slice ya guardó el mensaje en errorGuardar
    }
  }

  // Si no se pudo traer algo de lo necesario, se muestra el error del slice
  const errorPrevio = (tipos.length === 0 && errorTipos)
    || (!usuario?.idUsuario && errorUsuario)
    || (editando && errorVehiculo)
    || (noEsTuyo && 'Este vehículo no es tuyo')
    || null
  const cargando = tipos.length === 0 || !idUsuarioSesion || (editando && !vehiculo)
  if (cargando && !errorPrevio) {
    return <main className={pageStyles + ' pb-20'}><MensajePublicacion>Cargando…</MensajePublicacion></main>
  }

  if (errorPrevio) {
    return (
      <main className={pageStyles + ' pb-20'}>
        <MensajePublicacion error>{errorPrevio}</MensajePublicacion>
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
            <CampoTexto id="patente" label="Patente *" placeholder="AB123CD" maxLength={7} autoComplete="off" value={valores.patente} onChange={cambiar} hint={aviso(errores.patente)} />
            <CampoFormulario id="idTipoVehiculo" label="Tipo de vehículo *" hint={aviso(errores.idTipoVehiculo)}>
              <select id="idTipoVehiculo" name="idTipoVehiculo" className={inputStyles} value={valores.idTipoVehiculo} onChange={cambiar}>
                {tipos.map((t) => <option key={t.idTipoVehiculo} value={t.idTipoVehiculo}>{t.nombre}</option>)}
              </select>
            </CampoFormulario>
            <CampoTexto id="marca" label="Marca *" placeholder="Ej. Toyota" maxLength={50} value={valores.marca} onChange={cambiar} hint={aviso(errores.marca)} />
            <CampoTexto id="modelo" label="Modelo y versión *" placeholder="Ej. Corolla XEI 2.0" maxLength={50} value={valores.modelo} onChange={cambiar} hint={aviso(errores.modelo)} />
            <CampoTexto id="anio" type="number" label="Año *" value={valores.anio} onChange={cambiar} hint={aviso(errores.anio)} />
            <CampoTexto id="color" label="Color *" placeholder="Ej. Gris plata" maxLength={30} value={valores.color} onChange={cambiar} hint={aviso(errores.color)} />
            <CampoTexto id="cantidadAsientos" type="number" label="Cantidad de asientos *" value={valores.cantidadAsientos} onChange={cambiar} hint={aviso(errores.cantidadAsientos)} />
          </div>

          <p className={helpStyles}>La patente no se muestra en el catálogo.</p>

          {errorGuardar && <div className="mt-4"><MensajePublicacion error>{errorGuardar}</MensajePublicacion></div>}

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