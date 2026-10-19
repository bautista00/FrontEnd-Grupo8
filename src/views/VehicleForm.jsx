import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import FormField, { inputStyles } from '../components/ui/FormField'
import { btnBase, btnDark, btnOutline, btnSize } from '../components/ui/buttonStyles'
import { pageStyles, titleStyles, eyebrowStyles, introStyles, helpStyles, actionsStyles } from '../components/publicaciones/publicationStyles'
import { useVehiculos } from '../context/VehiculosContext'
import { TIPOS } from '../data/vehiculos'
import {
  ANIO_MAX, ANIO_MIN, ASIENTOS_MAX, ASIENTOS_MIN,
  validarVehiculo, valoresAVehiculo, valoresInicialesVehiculo,
} from '../utils/vehiculos'

const PASOS = ['Datos', 'Fotos', 'Publicación']

function Campo({ id, label, error, children }) {
  return (
    <FormField id={id} label={label}>
      {children}
      {error && <p id={id + '-error'} role="alert" className="mt-2 text-xs text-error">{error}</p>}
    </FormField>
  )
}

function Formulario({ vehiculo, modo }) {
  const editando = modo === 'editar'
  const navigate = useNavigate()
  const { vehiculos, crearVehiculo, actualizarVehiculo } = useVehiculos()
  const [valores, setValores] = useState(() => valoresInicialesVehiculo(vehiculo))
  const [errores, setErrores] = useState({})

  function cambiarCampo(event) {
    const { name, value } = event.target
    setValores({ ...valores, [name]: name === 'patente' ? value.toUpperCase() : value })
    if (errores[name]) setErrores({ ...errores, [name]: undefined })
  }

  function enviar(event) {
    event.preventDefault()
    const otros = vehiculos.filter((item) => item.idVehiculo !== vehiculo?.idVehiculo)
    const encontrados = validarVehiculo(valores, otros)
    if (Object.keys(encontrados).length > 0) {
      setErrores(encontrados)
      return
    }
    const datos = valoresAVehiculo(valores)
    if (editando) {
      actualizarVehiculo(vehiculo.idVehiculo, datos)
      navigate('/mis-vehiculos')
    } else {
      navigate(`/vehiculos/${crearVehiculo(datos)}/fotos`)
    }
  }

  const propsInput = (nombre) => ({
    id: nombre,
    name: nombre,
    value: valores[nombre],
    onChange: cambiarCampo,
    className: inputStyles + (errores[nombre] ? ' border-error' : ''),
    'aria-invalid': Boolean(errores[nombre]),
    'aria-describedby': errores[nombre] ? nombre + '-error' : undefined,
  })

  return (
    <main className={pageStyles + ' pb-20 phone:pb-12'}>
      <div className="max-w-3xl mx-auto">
        <Link to="/mis-vehiculos" className={eyebrowStyles + ' inline-block mb-3'}>← Volver a mis vehículos</Link>

        {!editando && (
          <ol className="flex flex-wrap items-center gap-2 m-0 mb-4 p-0 list-none text-[11px] uppercase tracking-[0.08em]" aria-label="Pasos para publicar un vehículo">
            {PASOS.map((paso, indice) => (
              <li key={paso} aria-current={indice === 0 ? 'step' : undefined} className={'flex items-center gap-2 ' + (indice === 0 ? 'text-ink font-semibold' : 'text-muted')}>
                {indice > 0 && <span aria-hidden="true">›</span>}
                {indice + 1} {paso}
              </li>
            ))}
          </ol>
        )}

        <h1 className={titleStyles}>{editando ? 'Editar vehículo' : 'Registrar vehículo'}</h1>
        <p className={introStyles}>{editando
          ? 'Los cambios se ven también en la publicación del vehículo.'
          : 'Completá los datos del auto. En el paso siguiente cargás las fotos.'}</p>

        <form onSubmit={enviar} noValidate className="grid gap-6 mt-8 p-6 bg-white border border-border rounded-lg phone:p-[18px]">
          <div className="grid grid-cols-2 gap-5 phone:grid-cols-1">
            <Campo id="patente" label="Patente *" error={errores.patente}>
              <input {...propsInput('patente')} placeholder="AB123CD" maxLength={9} autoComplete="off" />
            </Campo>
            <Campo id="idTipoVehiculo" label="Tipo de vehículo *" error={errores.idTipoVehiculo}>
              <select {...propsInput('idTipoVehiculo')}>
                {TIPOS.map((tipo) => <option key={tipo.idTipoVehiculo} value={String(tipo.idTipoVehiculo)}>{tipo.nombre}</option>)}
              </select>
            </Campo>
            <Campo id="marca" label="Marca *" error={errores.marca}>
              <input {...propsInput('marca')} placeholder="Ej. Toyota" />
            </Campo>
            <Campo id="modelo" label="Modelo y versión *" error={errores.modelo}>
              <input {...propsInput('modelo')} placeholder="Ej. Corolla XEI 2.0" />
            </Campo>
            <Campo id="anio" label="Año *" error={errores.anio}>
              <input {...propsInput('anio')} type="number" inputMode="numeric" min={ANIO_MIN} max={ANIO_MAX} />
            </Campo>
            <Campo id="color" label="Color *" error={errores.color}>
              <input {...propsInput('color')} placeholder="Ej. Gris plata" />
            </Campo>
            <Campo id="cantidadAsientos" label="Cantidad de asientos *" error={errores.cantidadAsientos}>
              <input {...propsInput('cantidadAsientos')} type="number" inputMode="numeric" min={ASIENTOS_MIN} max={ASIENTOS_MAX} />
            </Campo>
          </div>

          <p className={helpStyles}>La patente no se muestra en el catálogo.</p>

          <div className={actionsStyles + ' justify-end'}>
            <Link to="/mis-vehiculos" className={btnBase + ' ' + btnOutline + ' ' + btnSize}>Cancelar</Link>
            <button type="submit" className={btnBase + ' ' + btnDark + ' ' + btnSize}>
              {editando ? 'Guardar cambios' : 'Continuar a las fotos'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}

export default function VehicleForm({ modo = 'crear' }) {
  const { id } = useParams()
  const { obtenerVehiculo } = useVehiculos()
  const vehiculo = modo === 'editar' ? obtenerVehiculo(id) : null

  if (modo === 'editar' && !vehiculo) {
    return (
      <main className={pageStyles + ' pb-20'}>
        <h1 className={titleStyles}>Vehículo no encontrado</h1>
        <Link to="/mis-vehiculos" className="inline-block mt-5 text-gold">Volver a mis vehículos</Link>
      </main>
    )
  }
  // key: si cambia el vehículo, el formulario arranca con sus valores.
  return <Formulario key={vehiculo?.idVehiculo ?? 'nuevo'} vehiculo={vehiculo} modo={modo} />
}
