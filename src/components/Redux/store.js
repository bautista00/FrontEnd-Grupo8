import { configureStore } from "@reduxjs/toolkit"
import { persistReducer, persistStore } from "redux-persist"
import storage from "redux-persist/es/storage" // la versión ES: con Vite, "lib/storage" no se importa bien
import userReducer from "./userSlice"
import vehiculosReducer from "./vehiculosSlice"
import publicacionesReducer from "./publicacionesSlice"
import carritoReducer from "./carritoSlice"
import reservasReducer from "./reservasSlice"

const userPersistConfig = {
  key: "users",                  // solo el nombre en localStorage: "persist:users"
  storage,
  whitelist: ["user", "token"],  // ESTO elige qué se guarda: solo el logueado y su token
}

export const store = configureStore({
  reducer: {
    users: persistReducer(userPersistConfig, userReducer),
    // los demás slices van normales, sin persist
    vehiculos: vehiculosReducer,
    publicaciones: publicacionesReducer,
    carrito: carritoReducer,
    reservas: reservasReducer,
  },
})

export const persistor = persistStore(store)
