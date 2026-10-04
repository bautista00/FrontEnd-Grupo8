export const inputStyles = 'w-full min-w-0 rounded-[4px] border border-border bg-card px-3 py-2.5 text-sm text-ink'

export default function FormField({ id, label, children, hint }) {
  return (
    <div>
      {label && <label htmlFor={id} className="block mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-soft">{label}</label>}
      {children}
      {hint && <p className="mt-2 text-xs leading-relaxed text-muted">{hint}</p>}
    </div>
  )
}
