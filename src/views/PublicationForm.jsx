import { useState } from 'react'
import { Link } from 'react-router-dom'
import FormField, { inputStyles } from '../components/ui/FormField'
import { btnBase, btnDark, btnOutline, btnSize } from '../components/ui/buttonStyles'
import PublicationIcon from '../components/publicaciones/PublicationIcon'
import PublicationSection from '../components/publicaciones/PublicationSection'
import PublicationVehicle from '../components/publicaciones/PublicationVehicle'
import PublicationLocation from '../components/publicaciones/PublicationLocation'
import PublicationPrice from '../components/publicaciones/PublicationPrice'
import PublicationAvailability from '../components/publicaciones/PublicationAvailability'
import PublicationPreview from '../components/publicaciones/PublicationPreview'
import PendingChangesBar from '../components/publicaciones/PendingChangesBar'
import './publicaciones.css'

function valoresIniciales(publicacion) {
  return {
    idVehiculo: publicacion?.idVehiculo ? String(publicacion.idVehiculo) : '',
    precioDia: publicacion?.precioDia ?? '',
    descuentoPorcentaje: publicacion?.descuentoPorcentaje ?? '',
    direccion: publicacion?.direccion ?? '',
    zona: publicacion?.zona ?? '',
    localidad: publicacion?.localidad ?? '',
    ciudad: publicacion?.ciudad ?? '',
    provincia: publicacion?.provincia ?? '',
    codigoPostal: publicacion?.codigoPostal ?? '',
    horaRetiroDevolucion: publicacion?.horaRetiroDevolucion ?? '',
    descripcion: publicacion?.descripcion ?? '',
    periodos: publicacion?.periodos ?? [],
  }
}

export default function PublicationForm({ modo = 'crear', publicacion, vehiculos = [], rutaRegistroVehiculo }) {
  const editando = modo === 'editar'
  const [valores, setValores] = useState(() => valoresIniciales(publicacion))
  const [versionFormulario, setVersionFormulario] = useState(0)
  const iniciales = valoresIniciales(publicacion)
  const hayCambios = JSON.stringify(valores) !== JSON.stringify(iniciales)
  const vehiculo = editando ? publicacion : vehiculos.find((item) => String(item.idVehiculo) === valores.idVehiculo)
  const pasos = [
    ['Vehículo', Boolean(valores.idVehiculo)],
    ['Ubicación', ['direccion', 'zona', 'localidad', 'ciudad', 'provincia', 'codigoPostal', 'horaRetiroDevolucion']
      .every((campo) => valores[campo].trim() !== '')],
    ['Precio y días', valores.precioDia !== '' && Number(valores.precioDia) >= 1
      && Number(valores.descuentoPorcentaje || 0) >= 0 && Number(valores.descuentoPorcentaje || 0) <= 50
      && valores.periodos.length > 0],
    ['Descripción', Boolean(valores.descripcion.trim())],
  ]

  function cambiarCampo(event) {
    const { name, value } = event.target
    setValores({ ...valores, [name]: value })
  }

  function cambiarPeriodos(periodos) {
    setValores({ ...valores, periodos })
  }

  function descartar() {
    setValores(valoresIniciales(publicacion))
    setVersionFormulario(versionFormulario + 1)
  }

  return (
    <main className={'publications-page publication-form-page' + (editando && hayCambios ? ' publication-with-pending' : '')}>
      {editando ? <Link to="/mis-publicaciones" className="publication-eyebrow publication-back">← Mis publicaciones</Link>
        : <p className="publication-eyebrow">Panel de propietario · Nueva publicación</p>}
      <div className={'publications-heading' + (editando ? ' publication-edit-heading' : '')}>
        <div>
          <h1>{editando ? 'Editar publicación' : 'Crear publicación'}</h1>
          <p className="publication-intro">{editando
            ? 'Actualizá el precio, los días disponibles y las condiciones del alquiler.'
            : 'Elegí uno de tus vehículos y definí dónde se retira, el precio y los días en que se puede alquilar.'}</p>
        </div>
        {editando && <div className="publication-actions">
          <label className="publication-pause">Pausar publicación <input type="checkbox" role="switch" disabled /></label>
          <button type="button" disabled className="publication-small-button"><PublicationIcon nombre="eye" />Ver como usuario</button>
        </div>}
      </div>
      {!editando && <ol className="publication-progress">
        {pasos.map(([etiqueta, completo], indice) => <li key={etiqueta} className={completo ? 'complete' : ''}>
          <strong>{String(indice + 1).padStart(2, '0') + ' ' + etiqueta}</strong><span>{completo ? 'Completo' : 'Pendiente'}</span>
        </li>)}
      </ol>}
      <div className="publication-form-layout">
        <form onSubmit={(event) => event.preventDefault()} className="publication-form">
          <PublicationVehicle editando={editando} vehiculo={vehiculo} vehiculos={vehiculos}
            seleccionado={valores.idVehiculo} onChange={(idVehiculo) => setValores({ ...valores, idVehiculo })}
            rutaRegistro={rutaRegistroVehiculo} />
          {editando ? <>
            <PublicationSection titulo="Precio"><PublicationPrice valores={valores} onChange={cambiarCampo} /></PublicationSection>
            <PublicationSection titulo="Disponibilidad">
              <p className="publication-description">Marcá los períodos en los que se puede reservar el auto. Fuera de ellos, nadie puede elegir esos días.</p>
              <PublicationAvailability key={versionFormulario} periodos={valores.periodos} onChange={cambiarPeriodos} />
            </PublicationSection>
            <PublicationLocation valores={valores} onChange={cambiarCampo} editando />
          </> : <>
            <PublicationLocation valores={valores} onChange={cambiarCampo} />
            <PublicationSection titulo="Precio y días disponibles" numero="3">
              <PublicationPrice valores={valores} onChange={cambiarCampo} />
              <p className="publication-description">Solo se puede reservar dentro de estos períodos. Después los ajustás desde la publicación.</p>
              <PublicationAvailability key={versionFormulario} periodos={valores.periodos} onChange={cambiarPeriodos} />
            </PublicationSection>
          </>}
          <PublicationSection titulo="Descripción" numero={!editando && '4'}>
            <FormField id="descripcion" label={!editando && 'Contale al cliente cómo es el auto y qué esperás *'}>
              <textarea id="descripcion" name="descripcion" aria-label="Descripción del alquiler" rows={5} maxLength={600}
                className={inputStyles + ' font-sans resize-y'} placeholder="Estado del auto, cómo se entrega, si puede salir de la provincia…"
                value={valores.descripcion} onChange={cambiarCampo} />
            </FormField>
            <p className="publication-character-count">{valores.descripcion.length} de 600</p>
          </PublicationSection>
          {editando ? <PublicationSection titulo={<><PublicationIcon nombre="warning" />Zona crítica</>} className="publication-danger">
            <p>Pausar oculta el auto del catálogo y lo podés reactivar cuando quieras. Desactivar lo da de baja definitivamente: las reservas existentes se mantienen, pero la publicación no se puede reactivar.</p>
            <div className="publication-actions">
              <button type="button" disabled className="publication-small-button">Pausar publicación</button>
              <button type="button" disabled className="publication-text-button text-error">Desactivar publicación</button>
            </div>
          </PublicationSection> : <div className="publication-form-actions">
            <Link to="/mis-publicaciones" className={btnBase + ' ' + btnOutline + ' ' + btnSize}>Cancelar</Link>
            <button type="submit" disabled className={btnBase + ' ' + btnDark + ' ' + btnSize}>Publicar <PublicationIcon nombre="arrow" /></button>
          </div>}
        </form>
        <PublicationPreview vehiculo={vehiculo} valores={valores} editando={editando} />
      </div>
      {editando && hayCambios && <PendingChangesBar onDiscard={descartar} />}
    </main>
  )
}
