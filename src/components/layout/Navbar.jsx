import { CartIcon } from '../icons/Icons'
import './Navbar.css'

const APP_NAME = 'Volanta'

// Valor fijo de ejemplo: todavía no hay carrito real.
const CANTIDAD_CARRITO = 1

// Las otras vistas todavía no existen: los links quedan como "#" hasta tener router.
const NAV_LINKS = [
  { label: 'Explorar', href: '#', active: true },
  { label: 'Mis reservas', href: '#' },
  { label: 'Mis publicaciones', href: '#' },
  { label: 'Mis vehículos', href: '#' },
]

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar__inner">
        <a href="#" className="navbar__brand">
          {APP_NAME}
        </a>

        <nav className="navbar__links" aria-label="Principal">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`navbar__link${link.active ? ' navbar__link--active' : ''}`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="navbar__actions">
          <button type="button" className="navbar__cart" aria-label="Carrito">
            <CartIcon size={20} />
            {CANTIDAD_CARRITO > 0 && <span className="navbar__cart-badge">{CANTIDAD_CARRITO}</span>}
          </button>

          <a href="#" className="navbar__link">
            Iniciar sesión
          </a>
          <a href="#" className="btn btn--dark">
            Registrarse
          </a>
        </div>
      </div>
    </header>
  )
}
