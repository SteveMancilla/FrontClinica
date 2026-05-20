import type { SystemUser } from '@/types/auth'
import type {
  Appointment,
  MedicalReport,
  Patient,
  PatientOrigin,
  Specialty,
  SpecialtySummary,
  Study,
} from '@/types/medical'
import type { ReportTemplate } from '@/types/medical'
import {
  getStudyCatalogStatus,
  studyCatalogStatusLabels,
  type StudyCatalogStatus,
} from '@/utils/templateCatalog'

export type StudyTypeFilter = 'all' | 'eco' | 'rx' | 'other'

export interface SpecialtyFilters {
  search: string
  status: 'all' | 'active' | 'inactive'
  doctorId: string
  studyType: StudyTypeFilter
}

export const defaultSpecialtyFilters: SpecialtyFilters = {
  search: '',
  status: 'all',
  doctorId: 'all',
  studyType: 'all',
}

const ORIGINS: PatientOrigin[] = [
  'Particular',
  'Emergencia',
  'Consulta externa',
  'Referido',
  'Convenio',
  'Hospitalización',
]

export const templateStatusDisplayLabels: Record<StudyCatalogStatus, string> = {
  active: 'Plantilla activa',
  inactive: 'Plantilla inactiva',
  no_template: 'Sin plantilla',
  template_not_found: 'Plantilla no encontrada',
  incomplete: 'Plantilla incompleta',
}

function matchesSpecialtyName(userSpecialty: string | undefined, specialty: Specialty): boolean {
  if (!userSpecialty) return false
  const normalized = userSpecialty.toLowerCase()
  const name = specialty.name.toLowerCase()
  if (normalized.includes(name) || name.includes(normalized)) return true
  if (specialty.id === 'spec-img' && normalized.includes('radiolog')) return true
  if (specialty.id === 'spec-img' && normalized.includes('imagen')) return true
  return false
}

export function getDoctorsForSpecialty(
  specialty: Specialty,
  users: SystemUser[],
): SystemUser[] {
  return users.filter(
    (u) =>
      u.role === 'doctor' &&
      u.status === 'active' &&
      matchesSpecialtyName(u.specialty, specialty),
  )
}

export function getStudiesForSpecialty(specialtyId: string, studies: Study[]): Study[] {
  return studies.filter((s) => s.specialtyId === specialtyId)
}

function studyMatchesTypeFilter(study: Study, filter: StudyTypeFilter): boolean {
  if (filter === 'all') return true
  const name = study.name.toLowerCase()
  if (filter === 'eco') return name.includes('ecograf')
  if (filter === 'rx') return name.includes('radiograf')
  return !name.includes('ecograf') && !name.includes('radiograf')
}

export function getSpecialtySummaries(
  specialties: Specialty[],
  studies: Study[],
  templates: ReportTemplate[],
  appointments: Appointment[],
  reports: MedicalReport[],
  users: SystemUser[],
): SpecialtySummary[] {
  return specialties.map((specialty) => {
    const specialtyStudies = getStudiesForSpecialty(specialty.id, studies)
    const studyIds = new Set(specialtyStudies.map((s) => s.id))

    const specialtyAppointments = appointments.filter((a) => studyIds.has(a.studyId))
    const specialtyReports = reports.filter((r) => studyIds.has(r.studyId))

    const linkedTemplates = specialtyStudies
      .map((s) => templates.find((t) => t.id === s.templateId))
      .filter((t): t is ReportTemplate => Boolean(t))

    let templatesActive = 0
    let templatesPending = 0
    specialtyStudies.forEach((study) => {
      const status = getStudyCatalogStatus(study, templates)
      if (status === 'active') templatesActive += 1
      if (status === 'incomplete' || status === 'no_template' || status === 'template_not_found') {
        templatesPending += 1
      }
    })

    const doctors = getDoctorsForSpecialty(specialty, users)

    const pendingReports = specialtyReports.filter(
      (r) =>
        r.status === 'missing_report' || r.status === 'missing_diagnostic_impression',
    ).length

    const concludedReports = specialtyReports.filter(
      (r) => r.status === 'concluded' || r.status === 'pdf_generated',
    ).length

    const pdfCount = specialtyReports.filter((r) => r.status === 'pdf_generated').length

    const mainStudies = [...specialtyStudies]
      .slice(0, 4)
      .map((s) => s.name.replace(/^Ecografía de /i, '').replace(/^Radiografía de /i, 'Rx '))

    return {
      specialtyId: specialty.id,
      name: specialty.name,
      description: specialty.description,
      doctorsCount: doctors.length,
      studiesCount: specialtyStudies.length,
      templatesCount: linkedTemplates.length,
      templatesActiveCount: templatesActive,
      templatesPendingCount: templatesPending,
      reportsCount: specialtyReports.length,
      pendingReportsCount: pendingReports,
      concludedReportsCount: concludedReports,
      pdfGeneratedCount: pdfCount,
      appointmentsCount: specialtyAppointments.length,
      isActive: specialty.isActive !== false,
      mainStudies,
    }
  })
}

export function filterSpecialtySummaries(
  summaries: SpecialtySummary[],
  specialties: Specialty[],
  filters: SpecialtyFilters,
  studies: Study[],
  users: SystemUser[],
): SpecialtySummary[] {
  const q = filters.search.trim().toLowerCase()

  return summaries.filter((summary) => {
    const specialty = specialties.find((s) => s.id === summary.specialtyId)
    if (!specialty) return false

    if (filters.status === 'active' && !summary.isActive) return false
    if (filters.status === 'inactive' && summary.isActive) return false

    if (filters.doctorId !== 'all') {
      const doctors = getDoctorsForSpecialty(specialty, users)
      if (!doctors.some((d) => d.doctorId === filters.doctorId)) return false
    }

    if (filters.studyType !== 'all') {
      const specStudies = getStudiesForSpecialty(specialty.id, studies)
      if (!specStudies.some((s) => studyMatchesTypeFilter(s, filters.studyType))) {
        return false
      }
    }

    if (q) {
      const haystack = [summary.name, summary.description ?? ''].join(' ').toLowerCase()
      if (!haystack.includes(q)) return false
    }

    return true
  })
}

export function getPageSummary(summaries: SpecialtySummary[]) {
  return {
    total: summaries.length,
    active: summaries.filter((s) => s.isActive).length,
    doctors: summaries.reduce((acc, s) => acc + s.doctorsCount, 0),
    studies: summaries.reduce((acc, s) => acc + s.studiesCount, 0),
    pendingTemplates: summaries.reduce((acc, s) => acc + s.templatesPendingCount, 0),
  }
}

export interface SpecialtyReportStats {
  appointments: number
  reports: number
  missingReport: number
  missingImpression: number
  inReview: number
  concluded: number
  pdfGenerated: number
}

export function getSpecialtyReportStats(
  specialtyId: string,
  studies: Study[],
  appointments: Appointment[],
  reports: MedicalReport[],
): SpecialtyReportStats {
  const studyIds = new Set(
    getStudiesForSpecialty(specialtyId, studies).map((s) => s.id),
  )
  const specReports = reports.filter((r) => studyIds.has(r.studyId))
  const specAppointments = appointments.filter((a) => studyIds.has(a.studyId))

  return {
    appointments: specAppointments.length,
    reports: specReports.length,
    missingReport: specReports.filter((r) => r.status === 'missing_report').length,
    missingImpression: specReports.filter(
      (r) => r.status === 'missing_diagnostic_impression',
    ).length,
    inReview: specReports.filter((r) => r.status === 'in_review').length,
    concluded: specReports.filter((r) => r.status === 'concluded').length,
    pdfGenerated: specReports.filter((r) => r.status === 'pdf_generated').length,
  }
}

export function getSpecialtyOriginBreakdown(
  specialtyId: string,
  studies: Study[],
  appointments: Appointment[],
  patients: Patient[],
): { origin: PatientOrigin; total: number }[] {
  const studyIds = new Set(
    getStudiesForSpecialty(specialtyId, studies).map((s) => s.id),
  )
  const counts = new Map<PatientOrigin, number>()
  ORIGINS.forEach((o) => counts.set(o, 0))

  appointments
    .filter((a) => studyIds.has(a.studyId))
    .forEach((apt) => {
      const patient = patients.find((p) => p.id === apt.patientId)
      const origin = apt.origin ?? patient?.origin ?? 'Particular'
      counts.set(origin, (counts.get(origin) ?? 0) + 1)
    })

  return ORIGINS.map((origin) => ({
    origin,
    total: counts.get(origin) ?? 0,
  })).filter((o) => o.total > 0)
}

export function getStudyWithTemplateStatus(
  study: Study,
  templates: ReportTemplate[] = [],
) {
  const status = getStudyCatalogStatus(study, templates)
  return {
    study,
    status,
    label: templateStatusDisplayLabels[status] ?? studyCatalogStatusLabels[status],
    template: templates.find((t) => t.id === study.templateId),
  }
}

export function getDoctorReportCount(doctorId: string, reports: MedicalReport[]): number {
  return reports.filter((r) => r.doctorId === doctorId).length
}
