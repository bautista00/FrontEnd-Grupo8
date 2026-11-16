/**
 * Inicia React, configura Google Maps y habilita la navegación de la aplicación.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { APIProvider } from '@vis.gl/react-google-maps'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from './components/Redux/store.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} language="es" region="AR">
          <BrowserRouter>
              <App />
          </BrowserRouter>
        </APIProvider>
      </PersistGate>
    </Provider>
  </StrictMode>,
)
