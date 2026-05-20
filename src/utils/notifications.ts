import type { AppNotification } from '@/types/search'
import type { AuthUser } from '@/types/auth'
import type { MedicalReport, Patient, Study } from '@/types/medical'
import type { Doctor } from '@/types/medical'
import { getReportStatusLabel } from '@/utils/reportStatus'

const ATTENTION_STATUSES = new Set([
  'missing_report',
  'missing_diagnostic_impression',
  'in_review',
])

function scopeReports(reports: MedicalReport[], user: AuthUser): MedicalReport[] {
  if (user.role === 'admin') return reports
  if (user.role === 'doctor') return reports.filter((r) => r.doctorId === user.id)
  if (user.associatedDoctorId) {
    return reports.filter((r) => r.doctorId === user.associatedDoctorId)
  }
  return reports
}

function priorityForStatus(status: MedicalReport['status']): AppNotification['priority'] {
  if (status === 'missing_report') return 'high'
  if (status === 'missing_diagnostic_impression') return 'high'
  return 'medium'
}

export function buildAppNotifications(
  user: AuthUser,
  reports: MedicalReport[],
  patients: Patient[],
  studies: Study[],
  doctors: Doctor[],
  limit = 12,
): AppNotification[] {
  const patientMap = new Map(patients.map((p) => [p.id, p]))
  const studyMap = new Map(studies.map((s) => [s.id, s]))
  const doctorMap = new Map(doctors.map((d) => [d.id, d]))

  return scopeReports(reports, user)
    .filter((r) => ATTENTION_STATUSES.has(r.status))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, limit)
    .map((report) => {
      const patient = patientMap.get(report.patientId)
      const study = studyMap.get(report.studyId)
      const doctor = doctorMap.get(report.doctorId)
      const statusLabel = getReportStatusLabel(report.status)

      return {
        id: `report-${report.id}`,
        title: patient?.fullName ?? 'Informe pendiente',
        message: `${study?.name ?? 'Estudio'} · ${statusLabel}${
          user.role === 'admin' && doctor ? ` · ${doctor.fullName}` : ''
        }`,
        href: `/reports/new?reportId=${report.id}`,
        priority: priorityForStatus(report.status),
        createdAt: report.updatedAt,
      }
    })
}
