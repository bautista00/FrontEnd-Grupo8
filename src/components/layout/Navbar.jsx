import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { CartIcon, UserIcon } from '../icons/Icons'
import { btnBase, btnDark, btnSize } from '../ui/buttonStyles'

const APP_NAME = 'Volanta'

const NAV_LINK_BASE =
  'px-3 py-2 rounded-[0.25rem] text-[0.6875rem] font-medium tracking-[0.08em] uppercase whitespace-nowrap transition-[background-color,color] hover:text-ink'
const NAV_LINK_IDLE = `${NAV_LINK_BASE} text-soft`
const NAV_LINK_ACTIVE = `${NAV_LINK_BASE} bg-surface text-ink`

// Opciones del menú del usuario: ocupan todo el ancho del desplegable
const MENU_ITEM = 'block w-full text-left bg-transparent border-0 cursor-pointer'

// Los destinos que aún no existen se muestran deshabilitados.
const NAV_LINKS = [
  { label: 'Explorar', href: '/' },
  { label: 'Mis reservas',href: '/mis-reservas' },
  { label: 'Mis publicaciones', href: '/mis-publicaciones' },
  { label: 'Mis vehículos', href: '/mis-vehiculos' },
]

export default function Navbar({ carrito }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  // Se vuelve a leer en cada navegación, así cambia apenas se entra o se sale
  const conSesion = Boolean(localStorage.getItem('jwtToken'))
  const cantidadCarrito = conSesion && carrito ? 1 : 0

  const [menuAbierto, actualizarMenuAbierto] = useState(false)
  const menuRef = useRef(null)

  // El desplegable se cierra al tocar afuera o con Escape
  useEffect(() => {
    if (!menuAbierto) return
    function cerrarAlTocarAfuera(evento) {
      if (!menuRef.current.contains(evento.target)) actualizarMenuAbierto(false)
    }
    function cerrarConEscape(evento) {
      if (evento.key === 'Escape') actualizarMenuAbierto(false)
    }
    document.addEventListener('mousedown', cerrarAlTocarAfuera)
    document.addEventListener('keydown', cerrarConEscape)
    return () => {
      document.removeEventListener('mousedown', cerrarAlTocarAfuera)
      document.removeEventListener('keydown', cerrarConEscape)
    }
  }, [menuAbierto])

  function claseLink(link, isActive) {
    return isActive || (link.href === '/mis-publicaciones' && pathname.startsWith('/publicaciones/')) ? NAV_LINK_ACTIVE : NAV_LINK_IDLE
  }

  // El carrito queda guardado en el backend: al volver a entrar, el login lo vuelve a pedir
  function cerrarSesion() {
    actualizarMenuAbierto(false)
    localStorage.removeItem('jwtToken')
    navigate('/')
  }

  return (
    <header className="z-10 bg-card border-b border-border min-[56.3125rem]:sticky min-[56.3125rem]:top-0">
      <div className="max-w-page mx-auto px-(--gutter) min-h-16 flex flex-wrap items-center gap-x-8 gap-y-2 tablet:pt-3 tablet:pb-2">
        <Link to="/" className="font-serif text-[1.25rem] font-medium tracking-[0.3em] uppercase tablet:flex-1">
          {APP_NAME}
        </Link>

        {/* En el teléfono, con sesión, estos links pasan al menú del usuario */}
        <nav
          className={`flex flex-1 items-center gap-1 tablet:order-3 tablet:flex-[0_0_100%] tablet:overflow-x-auto tablet:pb-1 tablet:[scrollbar-width:none] tablet:[&::-webkit-scrollbar]:hidden ${conSesion ? 'phone:hidden' : ''}`}
          aria-label="Principal"
        >
          {NAV_LINKS.map((link) => link.href ? (
            <NavLink
              key={link.label}
              to={link.href}
              end={link.href === '/'}
              className={({ isActive }) => claseLink(link, isActive)}
            >
              {link.label}
            </NavLink>
          ) : <span key={link.label} aria-disabled="true" title="Esta vista todavía está pendiente" className={`${NAV_LINK_BASE} text-disabled cursor-default`}>{link.label}</span>)}
        </nav>

        <div className="flex items-center gap-4 phone:gap-2">
          <Link
            to="/carrito"
            className="relative grid place-items-center size-9 p-0 bg-transparent border-0 text-ink"
            aria-label="Carrito"
          >
            <CartIcon size={20} />
            {cantidadCarrito > 0 && <span className="absolute top-0 right-0 min-w-4 h-4 px-1 rounded-full bg-gold text-white text-[0.625rem] font-bold leading-4 text-center">{cantidadCarrito}</span>}
          </Link>

          {conSesion ? (
            <>
              <div ref={menuRef} className="relative">
                <button
                  type="button"
                  onClick={() => actualizarMenuAbierto(!menuAbierto)}
                  className="grid place-items-center size-9 p-0 rounded-full border-0 bg-surface text-ink cursor-pointer transition-colors hover:bg-border"
                  aria-label="Menú de la cuenta"
                  aria-haspopup="menu"
                  aria-expanded={menuAbierto}
                >
                  <UserIcon size={18} />
                </button>

                {menuAbierto && (
                  <div role="menu" className="absolute right-0 top-full mt-2 w-56 p-1.5 flex flex-col gap-0.5 rounded-[0.25rem] border border-border bg-card shadow-md">
                    {NAV_LINKS.filter((link) => link.href).map((link) => (
                      <NavLink
                        key={link.label}
                        to={link.href}
                        end={link.href === '/'}
                        role="menuitem"
                        onClick={() => actualizarMenuAbierto(false)}
                        className={({ isActive }) => `${claseLink(link, isActive)} ${MENU_ITEM} hidden phone:block`}
                      >
                        {link.label}
                      </NavLink>
                    ))}
                    <hr className="hidden phone:block my-1 border-0 border-t border-border" />
                    <NavLink
                      to="/perfil"
                      role="menuitem"
                      onClick={() => actualizarMenuAbierto(false)}
                      className={({ isActive }) => `${isActive ? NAV_LINK_ACTIVE : NAV_LINK_IDLE} ${MENU_ITEM}`}
                    >
                      Mi perfil
                    </NavLink>
                    <button type="button" role="menuitem" onClick={cerrarSesion} className={`${NAV_LINK_IDLE} ${MENU_ITEM} hidden phone:block`}>
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
              <button type="button" onClick={cerrarSesion} className={`${NAV_LINK_IDLE} bg-transparent border-0 cursor-pointer phone:hidden`}>
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={NAV_LINK_IDLE}>
                Iniciar sesión
              </Link>
              <Link to="/registro" className={`${btnBase} ${btnDark} ${btnSize} phone:px-2.5 phone:py-2`}>
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
