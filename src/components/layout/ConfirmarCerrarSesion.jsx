import ConfirmarAccion from '../ui/ConfirmarAccion'

export default function ConfirmarCerrarSesion({ alCerrar, alConfirmar }) {
  return <ConfirmarAccion
    titulo="¿Querés cerrar sesión?"
    confirmar="Sí, cerrar sesión"
    cancelar="Seguir en mi cuenta"
    alCerrar={alCerrar}
    alConfirmar={alConfirmar}
  />
}
