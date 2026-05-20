import type { AuthUser } from '@/types/auth'
import type { MedicalReport, ReportStatus } from '@/types/medical'
import type { ReportChipFilter } from '@/utils/reportStatus'

export interface ReportFilters {
  search: string
  status: ReportStatus | 'all'
  doctorId: string
  studyId: string
  patientId: string
  date: string
  chip: ReportChipFilter
}

export const defaultReportFilters: ReportFilters = {
  search: '',
  status: 'all',
  doctorId: 'all',
  studyId: 'all',
  patientId: 'all',
  date: '',
  chip: 'all',
}

export function filterReportsForUser(
  user: AuthUser | null,
  reports: MedicalReport[],
  apiDoctorUserId?: string,
): MedicalReport[] {
  if (!user) return []

  switch (user.role) {
    case 'admin':
      return reports
    case 'doctor': {
      const doctorIds = new Set(
        [apiDoctorUserId, user.doctorId].filter((id): id is string => Boolean(id)),
      )
      return reports.filter((r) => doctorIds.has(r.doctorId))
    }
    case 'assistant': {
      const doctorIds = new Set(
        [apiDoctorUserId, user.associatedDoctorId, user.doctorId].filter(
          (id): id is string => Boolean(id),
        ),
      )
      return reports.filter(
        (r) =>
          doctorIds.has(r.doctorId) ||
          doctorIds.has(r.assistantDoctorId ?? ''),
      )
    }
    default:
      return []
  }
}

function matchesChip(report: MedicalReport, chip: ReportChipFilter): boolean {
  if (chip === 'all') return true
  if (chip === 'concluded_group') {
    return report.status === 'concluded' || report.status === 'pdf_generated'
  }
  return report.status === chip
}

export function filterReports(
  reports: MedicalReport[],
  filters: ReportFilters,
): MedicalReport[] {
  const search = filters.search.trim().toLowerCase()

  return reports.filter((report) => {
    if (!matchesChip(report, filters.chip)) return false

    if (filters.status !== 'all' && report.status !== filters.status) {
      return false
    }
    if (filters.doctorId !== 'all' && report.doctorId !== filters.doctorId) {
      return false
    }
    if (filters.studyId !== 'all' && report.studyId !== filters.studyId) {
      return false
    }
    if (filters.patientId !== 'all' && report.patientId !== filters.patientId) {
      return false
    }
    if (filters.date && report.reportDate !== filters.date) {
      return false
    }

    if (search) {
      const haystack = [
        report.patientFullName,
        report.patientDni,
        report.studyName,
        report.doctorFullName,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      if (!haystack.includes(search)) return false
    }

    return true
  })
}

export function getReportSummary(reports: MedicalReport[]) {
  return {
    total: reports.length,
    missingReport: reports.filter((r) => r.status === 'missing_report').length,
    missingImpression: reports.filter(
      (r) => r.status === 'missing_diagnostic_impression',
    ).length,
    inReview: reports.filter((r) => r.status === 'in_review').length,
    concludedOrPdf: reports.filter(
      (r) => r.status === 'concluded' || r.status === 'pdf_generated',
    ).length,
  }
}
