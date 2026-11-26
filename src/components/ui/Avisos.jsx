import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { ToastContainer, toast } from 'react-toastify'

export default function Avisos() {
  const token = useSelector((state) => state.users.token)

  useEffect(() => {
    toast.dismiss()
    toast.clearWaitingQueue()
  }, [token])

  return <ToastContainer
    className="avisos-volanta"
    position="top-right"
    autoClose={6000}
    limit={2}
    hideProgressBar
    closeOnClick={false}
    pauseOnHover
    pauseOnFocusLoss
    draggable={false}
    role="status"
    aria-label="Notificaciones"
    ariaLabel="Notificaciones"
    closeButton={({ closeToast }) => (
      <button type="button" onClick={closeToast} aria-label="Cerrar notificación"
        className="ml-auto shrink-0 self-start border-0 bg-transparent px-1 text-xl leading-none text-muted hover:text-ink">×</button>
    )}
  />
}
