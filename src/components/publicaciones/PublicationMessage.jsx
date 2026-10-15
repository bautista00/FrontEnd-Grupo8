export default function PublicationMessage({ children, error = false, onRetry }) {
  return <div role={error ? 'alert' : 'status'} className={'my-4 rounded-[0.25rem] border p-4 text-[0.75rem] leading-relaxed ' + (error ? 'border-red-200 bg-red-50 text-red-700' : 'border-border bg-paper text-soft')}>
    <p>{children}</p>
    {onRetry && <button type="button" onClick={onRetry} className="mt-2 underline">Volver a intentar</button>}
  </div>
}
