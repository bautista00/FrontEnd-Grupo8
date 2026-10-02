const APP_NAME = 'Volanta'

const FOOTER_LINKS = ['Términos y condiciones', 'Políticas de cancelación', 'Privacidad', 'Centro de ayuda']

export default function Footer() {
  return (
    <footer className="mt-auto py-8 px-(--gutter) border-t border-border bg-paper text-[12px] text-muted">
      <div className="max-w-page mx-auto flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="font-serif text-[14px] font-bold text-ink">{APP_NAME}</span>
          <span className="text-disabled">|</span>
          <span>
            © {new Date().getFullYear()} {APP_NAME}. Todos los derechos reservados.
          </span>
        </div>

        <nav className="flex flex-wrap justify-center gap-6 text-soft" aria-label="Legal">
          {FOOTER_LINKS.map((label) => (
            <a key={label} href="#" className="transition-[color] hover:text-ink">
              {label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  )
}
