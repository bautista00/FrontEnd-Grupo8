// Datos simulados para la maqueta: combinamos el carrito y su publicación.
import { VEHICULOS } from './vehiculos'

// true muestra el carrito vacío; false muestra el carrito con los datos de abajo.
// Esta opción sirve solamente para probar la maqueta, sin llamar al backend.
const MOSTRAR_CARRITO_VACIO = false

const CARRITO_EJEMPLO = {
  // Probá 300 para el normal, 94 para por vencer y 0 para vencido.
  // Es un valor fijo: luego se calculará usando fechaExpiracion del backend.
  segundosRestantes: 300,
  publicacion: VEHICULOS.find(
    (vehiculo) => vehiculo.idPublicacion === 1
  ),
  fechaInicio: '2026-10-12',
  fechaFin: '2026-10-16',
  cantidadDias: 4,
  precioDiaAplicado: 185000,
  precioTotal: 740000,
}

// El condicional ? : elige qué exportamos: null si está vacío, o el objeto de ejemplo.
// Conservamos el ejemplo para probar todas las variantes sin tener que borrar sus datos.
export const CARRITO = MOSTRAR_CARRITO_VACIO ? null : CARRITO_EJEMPLO
