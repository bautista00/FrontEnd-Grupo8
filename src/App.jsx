import { useEffect } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import Footer from './components/layout/Footer'
import Navbar from './components/layout/Navbar'
import Home from './views/Home'
import MyPublications from './views/MyPublications'
import PublicationForm from './views/PublicationForm'

export default function App() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [pathname])
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mis-publicaciones" element={<MyPublications />} />
        <Route path="/publicaciones/nueva" element={<PublicationForm key="crear" />} />
        <Route path="/publicaciones/editar" element={<PublicationForm key="editar" modo="editar" />} />
        <Route path="/publicaciones/:id/editar" element={<PublicationForm key="editar-id" modo="editar" />} />
        <Route path="*" element={
          <main className="flex-1 w-full max-w-page mx-auto px-(--gutter) py-14">
            <h1 className="text-3xl">Página no encontrada</h1>
            <Link to="/" className="inline-block mt-5 text-gold">Volver al inicio</Link>
          </main>
        } />
      </Routes>
      <Footer />
    </div>
  )
}
