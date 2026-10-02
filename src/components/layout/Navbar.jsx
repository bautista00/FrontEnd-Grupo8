import { CartIcon } from '../icons/Icons'
import { btnBase, btnDark, btnSize } from '../ui/buttonStyles'

const APP_NAME = 'Volanta'

const NAV_LINK_BASE =
  'px-3 py-2 rounded-[4px] text-[11px] font-medium tracking-[0.08em] uppercase whitespace-nowrap transition-[background-color,color] hover:text-ink'
const NAV_LINK_IDLE = `${NAV_LINK_BASE} text-soft`
const NAV_LINK_ACTIVE = `${NAV_LINK_BASE} bg-surface text-ink`

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
    <header className="z-10 bg-card border-b border-border min-[901px]:sticky min-[901px]:top-0">
      <div className="max-w-page mx-auto px-(--gutter) min-h-16 flex flex-wrap items-center gap-x-8 gap-y-2 tablet:pt-3 tablet:pb-2">
        <a href="#" className="font-serif text-[20px] font-medium tracking-[0.3em] uppercase tablet:flex-1">
          {APP_NAME}
        </a>

        <nav
          className="flex flex-1 items-center gap-1 tablet:order-3 tablet:flex-[0_0_100%] tablet:overflow-x-auto tablet:pb-1 tablet:[scrollbar-width:none] tablet:[&::-webkit-scrollbar]:hidden"
          aria-label="Principal"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={link.active ? NAV_LINK_ACTIVE : NAV_LINK_IDLE}
            >
              {link.label}
            </a>
          ))}
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
