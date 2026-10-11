import { Link } from 'react-router-dom'
import { CartIcon } from '../components/icons/Icons'
import CartNotice from "../components/cart/CartNotice"
import CartSummary from "../components/cart/CartSummary"
import CartVehicle from "../components/cart/CartVehicle"
import { CARRITO } from "../data/cart"
import { useState } from 'react'   
import ConfirmCartRemoval from '../components/cart/ConfirmCartRemoval'

export default function Cart() {
  //Controla si aparece el modal para quietar la publicacion del carrito. 
  const [mostrarModalQuitar, actualizarModalQuitar]=useState(false)
  
  const abrirModalQuitar =()=>{
    actualizarModalQuitar(true)
  }

  const cerrarModalQuitar = () => {
  actualizarModalQuitar(false)
}
  // null significa que no hay un carrito. Comprobamos esto antes de acceder a sus datos.
  // Al conectar la API, una respuesta 204 se representará como null en el frontend.
  if (CARRITO === null) {
    // Este return termina la función: no se calculan tiempos ni se muestran las tarjetas.
    // Navbar y Footer siguen apareciendo porque App.jsx los muestra fuera de esta vista.
    return (
      <main className="flex flex-1 items-start justify-center w-full max-w-page mx-auto px-(--gutter) pt-16 pb-16 phone:pt-7 phone:pb-10">
        <section className="w-full max-w-[420px] px-8 py-10 bg-card border border-border rounded-lg text-center phone:px-5 phone:py-8" aria-labelledby="cart-empty-title">
          {/* Reutilizamos el mismo ícono que ya existe para el carrito en Navbar. */}
          <CartIcon size={48} className="block mx-auto mb-5 text-disabled" />
          <h1 id="cart-empty-title" className="text-[26px] leading-[1.3] text-ink phone:text-[24px]">Tu carrito está vacío</h1>
          <p className="mt-3 text-[12px] leading-[1.7] text-muted">
            Cuando elijas un auto y sus fechas, lo retenemos acá por 15 minutos mientras confirmás.
          </p>
          {/* Link navega a la ruta del catálogo que ya está registrada en App.jsx. */}
          <Link to="/" className="flex items-center justify-center gap-2 w-full mt-6 px-4 py-3 bg-ink border border-ink rounded-[4px] text-[11px] text-white">Explorar catálogo de vehículos</Link>
        </section>
      </main>
    )
  }

  // El tiempo viene del mock. Math.max evita mostrar un tiempo negativo.
  const segundosRestantes = Math.max(0, CARRITO.segundosRestantes)

  // El resumen también necesita saber si el carrito venció.
  const estaVencido = segundosRestantes === 0

  return (
    <main className="flex-1 w-full max-w-page mx-auto px-(--gutter) pt-10 pb-16 phone:pt-7 phone:pb-10">
      <header className="flex items-center justify-between gap-4 mb-6 phone:flex-col phone:items-start">
        <div>
          <h1 className="text-[36px] leading-[1.2] text-ink phone:text-[30px]">Tu carrito</h1>
          <p className="mt-1.5 text-[12px] text-muted">Podés tener un auto por vez en el carrito.</p>
        </div>
        <span className="text-[10px] tracking-[0.06em] uppercase text-muted">Paso 1 de 2: revisión</span>
      </header>

      {/* El componente decide qué aviso y contador mostrar. */}
      <CartNotice segundosRestantes={segundosRestantes} />

      {/* Conservamos los datos para mostrar qué carrito venció. */}
      <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] items-start gap-6 tablet:grid-cols-1">
        <CartVehicle carrito={CARRITO} alQuitar={abrirModalQuitar}  />
        {/* Pasamos estaVencido como prop para que el resumen adapte su botón. */}
        <CartSummary carrito={CARRITO} estaVencido={estaVencido} />
      </div>

      {/* Aparece cuando mostrarModalQuitar es true. */}
      {
        mostrarModalQuitar && (
          <ConfirmCartRemoval carrito={CARRITO} alCerrar={cerrarModalQuitar}/>
        )}
    </main>
  )
}
