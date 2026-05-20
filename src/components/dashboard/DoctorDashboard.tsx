import { Link } from 'react-router-dom'
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FilePlus2,
  FileText,
  Printer,
  UserPlus,
  Users,
} from 'lucide-react'
import PendingReportsList from '@/components/dashboard/PendingReportsList'
import QuickActionCard from '@/components/dashboard/QuickActionCard'
import SectionCard from '@/components/dashboard/SectionCard'
import StatGrid from '@/components/dashboard/StatGrid'
import TopStudiesChart from '@/components/dashboard/TopStudiesChart'
import StatusBadge from '@/components/ui/StatusBadge'
import {
  getAppointmentStatusLabel,
  getAppointmentStatusVariant,
} from '@/utils/appointmentStatus'
import type { AuthUser } from '@/types/auth'
import { Loader2 } from 'lucide-react'
import { useDashboardData, resolveDoctorIdForUser } from '@/hooks/useDashboardData'
import {
  getDoctorDashboardStats,
  getDoctorPendingReports,
  getDoctorTodayAppointments,
  getDoctorWeeklyActivity,
  getMostRequestedStudies,
} from '@/utils/dashboard'

interface DoctorDashboardProps {
  user: AuthUser
}

export default function DoctorDashboard({ user }: DoctorDashboardProps) {
  const { patients, appointments, reports, studies, doctors, loadState, loadError } =
    useDashboardData()
  const doctorId = resolveDoctorIdForUser(user)

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

  const stats = getDoctorDashboardStats(reports, appointments, doctorId)
  const pendingReports = getDoctorPendingReports(reports, patients, studies, doctors, doctorId)
  const todayAppointments = getDoctorTodayAppointments(
    appointments,
    patients,
    studies,
    doctors,
    doctorId,
  )
  const weekly = getDoctorWeeklyActivity(reports, doctorId)
  const maxWeekly = Math.max(...weekly.map((d) => d.count), 1)
  const myAppointments = appointments.filter((a) => a.doctorId === doctorId)
  const topStudies = getMostRequestedStudies(appointments, studies, 5, myAppointments)

  return (
    <div className="space-y-6">
      <SectionCard title="Accesos rápidos">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <QuickActionCard label="Bandeja de informes" to="/reports" icon={FilePlus2} />
          <QuickActionCard label="Ver mis informes" to="/reports" icon={FileText} />
          <QuickActionCard label="Registrar paciente" to="/patients" icon={UserPlus} />
          <QuickActionCard label="Nueva atención" to="/patients?newAppointment=1" icon={CalendarDays} />
          <QuickActionCard label="Mi productividad" to="/productivity" icon={ClipboardList} />
          <QuickActionCard label="Mis asistentes" to="/assistants" icon={Users} />
        </div>
      </SectionCard>

      <StatGrid
        columns={3}
        items={[
          {
            title: 'Mis estudios de hoy',
            value: stats.assignedAppointmentsToday,
            icon: <CalendarDays className="h-5 w-5" />,
            accent: 'info',
          },
          {
            title: 'Mis informes pendientes',
            value:
              stats.myMissingReports + stats.myMissingDiagnosticImpression + stats.myInReviewReports,
            icon: <ClipboardList className="h-5 w-5" />,
            accent: 'warning',
          },
          {
            title: 'Falta impresión',
            value: stats.myMissingDiagnosticImpression,
            icon: <AlertCircle className="h-5 w-5" />,
            accent: 'danger',
          },
          {
            title: 'En revisión',
            value: stats.myInReviewReports,
            icon: <FileText className="h-5 w-5" />,
            accent: 'purple',
          },
          {
            title: 'Concluidos esta semana',
            value: stats.myConcludedReportsThisWeek,
            icon: <CheckCircle2 className="h-5 w-5" />,
            accent: 'success',
          },
          {
            title: 'PDFs generados',
            value: stats.myPdfGenerated,
            icon: <Printer className="h-5 w-5" />,
            detail: `${stats.weeklyAveragePerDay} informes/día`,
          },
        ]}
      />

      <SectionCard title="Mis informes pendientes">
        <PendingReportsList
          reports={pendingReports}
          showDoctor={false}
          emptyMessage="No tienes informes pendientes por el momento."
        />
      </SectionCard>

      <SectionCard title="Mis estudios asignados">
        {todayAppointments.length === 0 ? (
          <p className="text-sm text-clinic-text/60">No hay estudios asignados para hoy.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b text-xs uppercase text-clinic-text/50">
                  <th className="px-3 py-2">Hora</th>
                  <th className="px-3 py-2">Paciente</th>
                  <th className="px-3 py-2">Estudio</th>
                  <th className="px-3 py-2">Procedencia</th>
                  <th className="px-3 py-2">Estado</th>
                  <th className="px-3 py-2">Acción</th>
                </tr>
              </thead>
              <tbody>
                {todayAppointments.map((apt) => (
                  <tr key={apt.appointmentId} className="border-b border-clinic-sky/30 last:border-0">
                    <td className="px-3 py-2.5">{apt.appointmentTime}</td>
                    <td className="px-3 py-2.5 font-medium">{apt.patientName}</td>
                    <td className="px-3 py-2.5">{apt.studyName}</td>
                    <td className="px-3 py-2.5 text-clinic-text/70">{apt.origin}</td>
                    <td className="px-3 py-2.5">
                      <StatusBadge
                        label={getAppointmentStatusLabel(apt.status)}
                        variant={getAppointmentStatusVariant(apt.status)}
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <Link to="/patients" className="text-sm font-medium text-clinic-blue hover:underline">
                        Ver paciente
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Mi productividad semanal">
          {weekly.every((d) => d.count === 0) ? (
            <p className="text-sm text-clinic-text/60">
              No hay datos de productividad para este periodo.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div className="rounded-lg bg-clinic-bg px-3 py-2">
                  <p className="text-clinic-text/60">Concluidos</p>
                  <p className="text-xl font-bold text-clinic-deep-blue">{stats.myConcludedReportsThisWeek}</p>
                </div>
                <div className="rounded-lg bg-clinic-bg px-3 py-2">
                  <p className="text-clinic-text/60">Estudios</p>
                  <p className="text-xl font-bold text-clinic-deep-blue">{stats.weeklyStudiesCount}</p>
                </div>
                <div className="rounded-lg bg-clinic-bg px-3 py-2">
                  <p className="text-clinic-text/60">Pendientes</p>
                  <p className="text-xl font-bold text-amber-700">
                    {stats.myMissingReports + stats.myInReviewReports}
                  </p>
                </div>
                <div className="rounded-lg bg-clinic-bg px-3 py-2">
                  <p className="text-clinic-text/60">Promedio/día</p>
                  <p className="text-xl font-bold text-clinic-teal">{stats.weeklyAveragePerDay}</p>
                </div>
              </div>
              <div className="flex items-end gap-2 h-32">
                {weekly.map((day) => (
                  <div key={day.dayLabel} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t bg-clinic-blue transition-all"
                      style={{ height: `${(day.count / maxWeekly) * 100}%`, minHeight: day.count ? 8 : 2 }}
                    />
                    <span className="text-[10px] text-clinic-text/60">{day.dayLabel}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Mis estudios más frecuentes">
          <TopStudiesChart
            items={topStudies}
            emptyMessage="No hay estudios asignados registrados."
          />
        </SectionCard>
      </div>
    </div>
  )
}
