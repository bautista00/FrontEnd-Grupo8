import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { APIProvider } from '@vis.gl/react-google-maps'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} language="es" region="AR">
      <BrowserRouter>
          <App />
      </BrowserRouter>
    </APIProvider>
  </StrictMode>,
)
