import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import { getCurrentUser } from '@/services/authService'
import LoginPage from '@/pages/auth/LoginPage'
import AssistantsPage from '@/pages/assistants/AssistantsPage'
import AppointmentsPage from '@/pages/appointments/AppointmentsPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import PatientsPage from '@/pages/patients/PatientsPage'
import NewPatientPage from '@/pages/patients/NewPatientPage'
import ProductivityPage from '@/pages/productivity/ProductivityPage'
import ProfilePage from '@/pages/profile/ProfilePage'
import ReportsPage from '@/pages/reports/ReportsPage'
import NewReportPage from '@/pages/reports/NewReportPage'
import SettingsPage from '@/pages/settings/SettingsPage'
import SpecialtiesPage from '@/pages/specialties/SpecialtiesPage'
import TemplatesPage from '@/pages/templates/TemplatesPage'
import UsersPage from '@/pages/users/UsersPage'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { PublicRoute } from '@/routes/PublicRoute'

function RootRedirect() {
  const user = getCurrentUser()
  return <Navigate to={user ? '/dashboard' : '/login'} replace />
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />

        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/appointments" element={<AppointmentsPage />} />
            <Route path="/patients" element={<PatientsPage />} />
            <Route path="/patients/:patientId" element={<PatientsPage />} />
            <Route path="/patients/new" element={<NewPatientPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/reports/new" element={<NewReportPage />} />
            <Route path="/productivity" element={<ProductivityPage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/specialties" element={<SpecialtiesPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/assistants" element={<AssistantsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </BrowserRouter>
  )
}
