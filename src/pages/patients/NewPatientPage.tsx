import { Navigate } from 'react-router-dom'

/** Redirige al listado con el drawer de registro abierto */
export default function NewPatientPage() {
  return <Navigate to="/patients?register=1" replace />
}
