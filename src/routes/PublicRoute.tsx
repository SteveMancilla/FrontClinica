import { Navigate, Outlet } from 'react-router-dom'
import { getCurrentUser } from '@/services/authService'

export function PublicRoute() {
  const user = getCurrentUser()

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
