import './Footer.css'

const APP_NAME = 'Volanta'

const FOOTER_LINKS = ['Términos y condiciones', 'Políticas de cancelación', 'Privacidad', 'Centro de ayuda']

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <span className="footer__name">{APP_NAME}</span>
          <span className="footer__separator">|</span>
          <span>
            © {new Date().getFullYear()} {APP_NAME}. Todos los derechos reservados.
          </span>
        </div>

        <nav className="footer__links" aria-label="Legal">
          {FOOTER_LINKS.map((label) => (
            <a key={label} href="#">
              {label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  )
}
