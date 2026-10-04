import { Link, NavLink, useLocation } from 'react-router-dom'
import { CartIcon } from '../icons/Icons'
import { btnBase, btnDark, btnSize } from '../ui/buttonStyles'

const APP_NAME = 'Volanta'

const NAV_LINK_BASE =
  'px-3 py-2 rounded-[4px] text-[11px] font-medium tracking-[0.08em] uppercase whitespace-nowrap transition-[background-color,color] hover:text-ink'
const NAV_LINK_IDLE = `${NAV_LINK_BASE} text-soft`
const NAV_LINK_ACTIVE = `${NAV_LINK_BASE} bg-surface text-ink`

// Valor fijo de ejemplo: todavía no hay carrito real.
const CANTIDAD_CARRITO = 1

// Los destinos que aún no existen se muestran deshabilitados.
const NAV_LINKS = [
  { label: 'Explorar', href: '/' },
  { label: 'Mis reservas' },
  { label: 'Mis publicaciones', href: '/mis-publicaciones' },
  { label: 'Mis vehículos' },
]

export default function Navbar() {
  const { pathname } = useLocation()
  return (
    <header className="z-10 bg-card border-b border-border min-[901px]:sticky min-[901px]:top-0">
      <div className="max-w-page mx-auto px-(--gutter) min-h-16 flex flex-wrap items-center gap-x-8 gap-y-2 tablet:pt-3 tablet:pb-2">
        <Link to="/" className="font-serif text-[20px] font-medium tracking-[0.3em] uppercase tablet:flex-1">
          {APP_NAME}
        </Link>

        <nav
          className="flex flex-1 items-center gap-1 tablet:order-3 tablet:flex-[0_0_100%] tablet:overflow-x-auto tablet:pb-1 tablet:[scrollbar-width:none] tablet:[&::-webkit-scrollbar]:hidden"
          aria-label="Principal"
        >
          {NAV_LINKS.map((link) => link.href ? (
            <NavLink
              key={link.label}
              to={link.href}
              end={link.href === '/'}
              className={({ isActive }) => isActive || (link.href === '/mis-publicaciones' && pathname.startsWith('/publicaciones/')) ? NAV_LINK_ACTIVE : NAV_LINK_IDLE}
            >
              {link.label}
            </NavLink>
          ) : <span key={link.label} aria-disabled="true" title="Esta vista todavía está pendiente" className={`${NAV_LINK_BASE} text-disabled cursor-default`}>{link.label}</span>)}
        </nav>

        <div className="flex items-center gap-4 phone:gap-2">
          <button
            type="button"
            className="relative grid place-items-center size-9 p-0 bg-transparent border-0 text-ink"
            aria-label="Carrito"
          >
            <CartIcon size={20} />
            {CANTIDAD_CARRITO > 0 && <span className="absolute top-0 right-0 min-w-4 h-4 px-1 rounded-full bg-gold text-white text-[10px] font-bold leading-4 text-center">{CANTIDAD_CARRITO}</span>}
          </button>

          <a href="#" className={NAV_LINK_IDLE}>
            Iniciar sesión
          </a>
          <a href="#" className={`${btnBase} ${btnDark} ${btnSize} phone:px-2.5 phone:py-2`}>
            Registrarse
          </a>
        </div>
      </div>
    </header>
  )
}
