// Patentes argentinas: formato nuevo (AB123CD) y formato anterior (ABC123).
const PATENTE_NUEVA_REGEX = /^[A-Z]{2}\d{3}[A-Z]{2}$/
const PATENTE_ANTIGUA_REGEX = /^[A-Z]{3}\d{3}$/

export const ANIO_MIN = 1990
export const ANIO_ACTUAL = new Date().getFullYear()
// Se admite el año siguiente porque los modelos nuevos salen antes de que termine el año.
export const ANIO_MAX = ANIO_ACTUAL + 1
export const ASIENTOS_MIN = 1
export const ASIENTOS_MAX = 9
export const ASIENTOS_POR_DEFECTO = 5
export const FOTO_TIPO_PERMITIDA = ['image/jpeg', 'image/png']
export const FOTO_MAX_MB = 10

export function normalizarPatente(valor) {
  return String(valor ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '')
}

export function patenteValida(valor) {
  const patente = normalizarPatente(valor)
  return PATENTE_NUEVA_REGEX.test(patente) || PATENTE_ANTIGUA_REGEX.test(patente)
}

// Los valores del formulario son siempre strings (vienen de inputs y selects).
// `tipos` son los del backend: en el alta se preselecciona el primero para que el select no quede vacío.
export function valoresInicialesVehiculo(vehiculo, tipos = []) {
  const idTipoVehiculo = vehiculo ? vehiculo.idTipoVehiculo : tipos[0]?.idTipoVehiculo
  return {
    patente: vehiculo?.patente ?? '',
    idTipoVehiculo: String(idTipoVehiculo ?? ''),
    marca: vehiculo?.marca ?? '',
    modelo: vehiculo?.modelo ?? '',
    anio: String(vehiculo?.anio ?? ANIO_ACTUAL),
    color: vehiculo?.color ?? '',
    cantidadAsientos: String(vehiculo?.cantidadAsientos ?? ASIENTOS_POR_DEFECTO),
  }
}

// `tipos`: los tipos de vehículo del backend.
// `otrosVehiculos`: el resto de la flota, para detectar patentes repetidas.
export function validarVehiculo(valores, tipos, otrosVehiculos = []) {
  const errores = {}

  // Mismos textos que ValidacionVolanta del backend (salvo el formato de patente, que solo valida el front)
  if (!valores.patente.trim()) errores.patente = 'Ingresá la patente.'
  else if (!patenteValida(valores.patente)) errores.patente = 'La patente no es válida. Ejemplos: AB123CD o ABC123.'
  else if (otrosVehiculos.some((otro) => normalizarPatente(otro.patente) === normalizarPatente(valores.patente))) {
    errores.patente = 'Ya hay un vehículo registrado con esa patente.'
  }

  if (!tipos.some((tipo) => String(tipo.idTipoVehiculo) === valores.idTipoVehiculo)) {
    errores.idTipoVehiculo = 'Elegí un tipo de vehículo de la lista.'
  }

  if (!valores.marca.trim()) errores.marca = 'Ingresá la marca.'
  if (!valores.modelo.trim()) errores.modelo = 'Ingresá el modelo.'
  if (!valores.color.trim()) errores.color = 'Ingresá el color.'

  const anio = Number(valores.anio)
  if (valores.anio === '' || !Number.isInteger(anio) || anio < ANIO_MIN || anio > ANIO_MAX) {
    errores.anio = `El año tiene que estar entre ${ANIO_MIN} y ${ANIO_MAX}.`
  }

  const asientos = Number(valores.cantidadAsientos)
  if (valores.cantidadAsientos === '' || !Number.isInteger(asientos) || asientos < ASIENTOS_MIN || asientos > ASIENTOS_MAX) {
    errores.cantidadAsientos = `La cantidad de asientos tiene que estar entre ${ASIENTOS_MIN} y ${ASIENTOS_MAX}.`
  }

  return errores
}

export function valoresAVehiculo(valores) {
  return {
    patente: normalizarPatente(valores.patente),
    idTipoVehiculo: Number(valores.idTipoVehiculo),
    marca: valores.marca.trim(),
    modelo: valores.modelo.trim(),
    anio: Number(valores.anio),
    color: valores.color.trim(),
    cantidadAsientos: Number(valores.cantidadAsientos),
  }
}

// Devuelve un mensaje de error, o null si el archivo es válido.
export function validarArchivoFoto(archivo) {
  if (!FOTO_TIPO_PERMITIDA.includes(archivo.type)) {
    return 'solo se permiten archivos JPG o PNG'
  }
  if (archivo.size > FOTO_MAX_MB * 1024 * 1024) {
    return `supera el máximo de ${FOTO_MAX_MB} MB`
  }
  return null
}

// Reasigna `orden` según la posición: la primera foto es la portada.
const reordenar = (fotos) => fotos.map((foto, indice) => ({ ...foto, orden: indice + 1 }))

export function moverFoto(fotos, indice, desplazamiento) {
  const destino = indice + desplazamiento
  if (destino < 0 || destino >= fotos.length) return fotos
  const copia = [...fotos]
  ;[copia[indice], copia[destino]] = [copia[destino], copia[indice]]
  return reordenar(copia)
}

export function quitarFoto(fotos, indice) {
  return reordenar(fotos.filter((_, posicion) => posicion !== indice))
}

export function agregarFotos(fotos, nuevas) {
  return reordenar([...fotos, ...nuevas])
}

export const portadaDe = (vehiculo) => {
  if (!vehiculo) return null
  return vehiculo.fotos[0]?.url || null
}

export const tieneFotos = (vehiculo) => vehiculo.fotos.length > 0
export const puedePublicar = (vehiculo) => tieneFotos(vehiculo)

export const VEHICULOS_POR_PAGINA = 9