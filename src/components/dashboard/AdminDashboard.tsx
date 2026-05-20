import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  Printer,
  Stethoscope,
  UserPlus,
  Users,
  UsersRound,
} from 'lucide-react'
import { Loader2 } from 'lucide-react'
import DoctorRankingTable from '@/components/dashboard/DoctorRankingTable'
import OriginDistributionCard from '@/components/dashboard/OriginDistributionCard'
import PendingReportsList from '@/components/dashboard/PendingReportsList'
import QuickActionCard from '@/components/dashboard/QuickActionCard'
import SectionCard from '@/components/dashboard/SectionCard'
import StatGrid from '@/components/dashboard/StatGrid'
import TopStudiesChart from '@/components/dashboard/TopStudiesChart'
import { useDashboardData } from '@/hooks/useDashboardData'
import {
  getAdminDashboardStats,
  getDoctorRanking,
  getMostRequestedStudies,
  getOriginDistribution,
  getReportsNeedingAttention,
} from '@/utils/dashboard'

export default function AdminDashboard() {
  const { patients, appointments, reports, studies, doctors, users, loadState, loadError } =
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

  const stats = getAdminDashboardStats(patients, appointments, reports, users)
  const ranking = getDoctorRanking(doctors, reports)
  const attentionReports = getReportsNeedingAttention(reports, patients, studies, doctors)
  const topStudies = getMostRequestedStudies(appointments, studies)
  const origins = getOriginDistribution(patients)

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <QuickActionCard label="Registrar paciente" to="/patients?register=1" icon={UserPlus} />
        <QuickActionCard label="Nueva atención" to="/patients?newAppointment=1" icon={CalendarDays} />
        <QuickActionCard label="Bandeja de informes" to="/reports" icon={FileText} />
        <QuickActionCard label="Usuarios" to="/users" icon={UsersRound} />
      </div>

      <StatGrid
        columns={4}
        items={[
          {
            title: 'Pacientes registrados',
            value: stats.totalPatients,
            icon: <Users className="h-5 w-5" />,
            detail: 'En el sistema',
            accent: 'info',
          },
          {
            title: 'Atenciones de hoy',
            value: stats.todayAppointments,
            icon: <CalendarDays className="h-5 w-5" />,
            detail: 'Agenda del día',
          },
          {
            title: 'Estudios pendientes',
            value: stats.pendingStudies,
            icon: <Stethoscope className="h-5 w-5" />,
            accent: 'warning',
            detail: 'Por realizar',
          },
          {
            title: 'Falta informe',
            value: stats.missingReports,
            icon: <FileText className="h-5 w-5" />,
            accent: 'danger',
            detail: 'Prioridad alta',
          },
        ]}
      />

      <StatGrid
        columns={4}
        items={[
          {
            title: 'Falta impresión',
            value: stats.missingDiagnosticImpression,
            icon: <AlertCircle className="h-5 w-5" />,
            accent: 'warning',
          },
          {
            title: 'En revisión',
            value: stats.inReviewReports,
            icon: <ClipboardList className="h-5 w-5" />,
            accent: 'purple',
          },
          {
            title: 'Concluidos',
            value: stats.concludedReports,
            icon: <CheckCircle2 className="h-5 w-5" />,
            accent: 'success',
          },
          {
            title: 'PDF generados',
            value: stats.pdfGeneratedReports,
            icon: <Printer className="h-5 w-5" />,
            accent: 'info',
          },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Informes que requieren atención">
          <PendingReportsList reports={attentionReports} />
        </SectionCard>
        <SectionCard title="Estudios más solicitados">
          <TopStudiesChart items={topStudies} />
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <DoctorRankingTable rows={ranking.byConcluded} />
        <SectionCard title="Procedencia de pacientes">
          <OriginDistributionCard items={origins} />
        </SectionCard>
      </div>
    </div>
  )
}
