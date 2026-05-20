import { Link } from 'react-router-dom'
import {
  AlertCircle,
  CalendarDays,
  ClipboardList,
  FileText,
  UserPlus,
  Users,
} from 'lucide-react'
import OperationalTasksList from '@/components/dashboard/OperationalTasksList'
import QuickActionCard from '@/components/dashboard/QuickActionCard'
import SectionCard from '@/components/dashboard/SectionCard'
import StatGrid from '@/components/dashboard/StatGrid'
import StatusBadge from '@/components/ui/StatusBadge'
import type { AuthUser } from '@/types/auth'
import { Loader2 } from 'lucide-react'
import { useDashboardData } from '@/hooks/useDashboardData'
import {
  getAppointmentStatusLabel,
  getAppointmentStatusVariant,
} from '@/utils/appointmentStatus'
import {
  getAssistantDashboardStats,
  getAssistantDoctorCard,
  getAssistantOperationalTasks,
  getAssistantRecentAppointments,
  getAssistantRecentPatients,
} from '@/utils/dashboard'

interface AssistantDashboardProps {
  user: AuthUser
}

export default function AssistantDashboard({ user }: AssistantDashboardProps) {
  const { patients, appointments, reports, studies, doctors, loadState, loadError } =
    useDashboardData()

  if (loadState === 'loading') {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-clinic-text/70">
        <Loader2 className="h-6 w-6 animate-spin text-clinic-blue" />
        Cargando resumen…
      </div>
    )
  }

  if (loadState === 'error') {
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {loadError ?? 'No se pudo cargar el dashboard.'}
      </p>
    )
  }

  const stats = getAssistantDashboardStats(user, patients, appointments, reports)
  const tasks = getAssistantOperationalTasks(user, patients, appointments, reports)
  const recentAppointments = getAssistantRecentAppointments(
    user,
    appointments,
    patients,
    studies,
    doctors,
  )
  const recentPatients = getAssistantRecentPatients(user, patients)
  const doctorCard = getAssistantDoctorCard(user, doctors, appointments, reports)

  return (
    <div className="space-y-6">
      <SectionCard title="Accesos rápidos">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <QuickActionCard label="Registrar paciente" to="/patients" icon={UserPlus} />
          <QuickActionCard label="Nueva atención" to="/patients?newAppointment=1" icon={CalendarDays} />
          <QuickActionCard label="Ver pacientes" to="/patients" icon={Users} />
          <QuickActionCard label="Ver informes" to="/reports" icon={FileText} />
          <QuickActionCard label="Mi perfil" to="/profile" icon={Users} />
        </div>
      </SectionCard>

      <StatGrid
        columns={3}
        items={[
          {
            title: 'Pacientes registrados',
            value: stats.registeredPatients,
            icon: <Users className="h-5 w-5" />,
            accent: 'info',
          },
          {
            title: 'Atenciones creadas',
            value: stats.createdAppointments,
            icon: <CalendarDays className="h-5 w-5" />,
          },
          {
            title: 'Estudios pendientes',
            value: stats.pendingStudies,
            icon: <ClipboardList className="h-5 w-5" />,
            accent: 'warning',
          },
          {
            title: 'Falta completar datos',
            value: stats.incompletePatients,
            icon: <AlertCircle className="h-5 w-5" />,
            accent: 'danger',
          },
          {
            title: 'Informes pendientes del médico',
            value: stats.reportsPendingForAssociatedDoctor,
            icon: <FileText className="h-5 w-5" />,
            accent: 'purple',
          },
          {
            title: 'Atenciones de hoy',
            value: stats.todayAppointments,
            icon: <CalendarDays className="h-5 w-5" />,
            detail: 'Operativas del día',
          },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Tareas operativas del día">
          <OperationalTasksList tasks={tasks} />
        </SectionCard>

        <SectionCard title="Médico asociado">
          {doctorCard ? (
            <div className="rounded-lg border border-clinic-teal/30 bg-clinic-teal/5 p-4">
              <p className="font-semibold text-clinic-deep-blue">{doctorCard.doctorName}</p>
              <p className="text-sm text-clinic-text/70">{doctorCard.specialty}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-clinic-text/60">Informes pendientes</p>
                  <p className="text-2xl font-bold text-amber-700">{doctorCard.pendingReports}</p>
                </div>
                <div>
                  <p className="text-clinic-text/60">Estudios hoy</p>
                  <p className="text-2xl font-bold text-clinic-deep-blue">{doctorCard.todayAppointments}</p>
                </div>
              </div>
              <Link
                to="/reports"
                className="mt-4 inline-flex rounded-lg bg-clinic-blue px-4 py-2 text-sm font-semibold text-clinic-white hover:bg-clinic-deep-blue"
              >
                Ver informes
              </Link>
            </div>
          ) : (
            <p className="text-sm text-clinic-text/60">
              No tienes un médico asociado asignado.
            </p>
          )}
        </SectionCard>
      </div>

      <SectionCard title="Atenciones recientes">
        {recentAppointments.length === 0 ? (
          <p className="text-sm text-clinic-text/60">No hay atenciones recientes.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b text-xs uppercase text-clinic-text/50">
                  <th className="px-3 py-2">Paciente</th>
                  <th className="px-3 py-2">DNI</th>
                  <th className="px-3 py-2">Estudio</th>
                  <th className="px-3 py-2">Médico</th>
                  <th className="px-3 py-2">Estado</th>
                  <th className="px-3 py-2">Acción</th>
                </tr>
              </thead>
              <tbody>
                {recentAppointments.map((apt) => (
                  <tr key={apt.appointmentId} className="border-b border-clinic-sky/30 last:border-0">
                    <td className="px-3 py-2.5 font-medium">{apt.patientName}</td>
                    <td className="px-3 py-2.5">{apt.dni}</td>
                    <td className="px-3 py-2.5">{apt.studyName}</td>
                    <td className="px-3 py-2.5">{apt.doctorName}</td>
                    <td className="px-3 py-2.5">
                      <StatusBadge
                        label={getAppointmentStatusLabel(apt.status)}
                        variant={getAppointmentStatusVariant(apt.status)}
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-wrap gap-2">
                        <Link to="/patients" className="text-clinic-blue hover:underline">
                          Ver pacientes
                        </Link>
                        <Link to={`/patients/${apt.patientId}`} className="text-clinic-blue hover:underline">
                          Paciente
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Pacientes recientes">
        {recentPatients.length === 0 ? (
          <p className="text-sm text-clinic-text/60">Aún no has registrado pacientes.</p>
        ) : (
          <ul className="divide-y divide-clinic-sky/40">
            {recentPatients.map((p) => (
              <li key={p.patientId} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <p className="font-medium text-clinic-text">{p.fullName}</p>
                  <p className="text-xs text-clinic-text/60">
                    DNI {p.dni} · {p.phone} · {p.origin}
                  </p>
                </div>
                <p className="text-xs text-clinic-text/50">
                  {new Date(p.createdAt).toLocaleDateString('es-PE')}
                </p>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

    </div>
  )
}
