import axios from 'axios'

/**
 * Cliente HTTP central. Usa /api (proxy de Vite hacia el backend) y
 * withCredentials para enviar la cookie de sesión en cada petición.
 */
export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

/** Extrae un mensaje de error legible de una respuesta de axios. */
export function mensajeError(err, fallback = 'Ocurrió un error. Intenta de nuevo.') {
  const data = err?.response?.data
  if (data?.errors?.length) return data.errors.map((e) => e.mensaje).join(' ')
  return data?.message || err?.message || fallback
}
