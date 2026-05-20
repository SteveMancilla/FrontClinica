import { Info } from 'lucide-react'
import AdminDashboard from '@/components/dashboard/AdminDashboard'
import AssistantDashboard from '@/components/dashboard/AssistantDashboard'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import DoctorDashboard from '@/components/dashboard/DoctorDashboard'
import { getCurrentUser } from '@/services/authService'
import { getInfoBannerText } from '@/utils/dashboard'

export default function DashboardPage() {
  const user = getCurrentUser()

  if (!user) return null

  const quickAction =
    user.role === 'admin'
      ? { label: 'Ver productividad', to: '/productivity' }
      : user.role === 'doctor'
        ? { label: 'Ir a mis informes', to: '/reports' }
        : { label: 'Registrar paciente', to: '/patients' }

  return (
    <div className="space-y-6">
      <DashboardHeader user={user} quickAction={quickAction} />

      <div className="flex gap-3 rounded-lg border border-clinic-sky/50 bg-clinic-teal/5 px-4 py-3 text-sm text-clinic-text">
        <Info className="h-5 w-5 shrink-0 text-clinic-teal" />
        <p>{getInfoBannerText(user.role)}</p>
      </div>

      {user.role === 'admin' && <AdminDashboard />}
      {user.role === 'doctor' && <DoctorDashboard user={user} />}
      {user.role === 'assistant' && <AssistantDashboard user={user} />}
    </div>
  )
}
