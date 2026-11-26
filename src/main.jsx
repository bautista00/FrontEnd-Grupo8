/**
 * Inicia React, configura Google Maps y habilita la navegación de la aplicación.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { APIProvider } from '@vis.gl/react-google-maps'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from './components/Redux/store.js'
import Avisos from './components/ui/Avisos'

const router = createBrowserRouter([
  { path: '*', element: <><App /><Avisos /></> },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} language="es" region="AR">
          <RouterProvider router={router} />
        </APIProvider>
      </PersistGate>
    </Provider>
  </StrictMode>,
)
