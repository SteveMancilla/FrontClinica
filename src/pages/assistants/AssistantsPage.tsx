import { Navigate } from 'react-router-dom'
import DoctorAssistantsManagement from '@/components/users/DoctorAssistantsManagement'
import { getCurrentUser } from '@/services/authService'

export default function AssistantsPage() {
  const user = getCurrentUser()

  if (user?.role === 'doctor') {
    return <DoctorAssistantsManagement />
  }

  if (user?.role === 'admin') {
    return <Navigate to="/users" replace />
  }

  return <Navigate to="/dashboard" replace />
}
