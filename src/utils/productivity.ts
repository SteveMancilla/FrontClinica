import type { AuthUser } from '@/types/auth'
import type {
  Appointment,
  Doctor,
  DoctorProductivitySummary,
  GeneralProductivitySummary,
  MedicalReport,
  OriginProductivitySummary,
  Patient,
  PatientOrigin,
  ProductivityFiltersState,
  ProductivityPeriod,
  ReportStatus,
  ReportStatusDistributionItem,
  Specialty,
  Study,
  StudyProductivitySummary,
} from '@/types/medical'
import { toLocalDateIso } from '@/utils/dates'
import { normalizeFilterId } from '@/utils/filterIds'
import { reportStatusLabels } from '@/utils/reportStatus'

export interface DateRange {
  from: string
  to: string
}

export const defaultProductivityFilters: ProductivityFiltersState = {
  period: 'week',
  dateFrom: '',
  dateTo: '',
  doctorId: 'all',
  specialtyId: 'all',
  studyId: 'all',
  origin: 'all',
}

export function normalizeProductivityFilters(
  filters: ProductivityFiltersState,
): ProductivityFiltersState {
  return {
    ...filters,
    doctorId: normalizeFilterId(filters.doctorId),
    specialtyId: normalizeFilterId(filters.specialtyId),
    studyId: normalizeFilterId(filters.studyId),
    origin: filters.origin?.trim() ? filters.origin : 'all',
  }
}

const ORIGIN_OPTIONS: PatientOrigin[] = [
  'Particular',
  'Emergencia',
  'Consulta externa',
  'Referido',
  'Convenio',
  'Hospitalización',
]

const PENDING_REPORT_STATUSES: ReportStatus[] = [
  'missing_report',
  'missing_diagnostic_impression',
]

export function resolveDateRange(
  period: ProductivityPeriod,
  dateFrom: string,
  dateTo: string,
  referenceDate = new Date(),
): DateRange {
  const toIso = (d: Date) => toLocalDateIso(d)
  const today = toIso(referenceDate)

  if (period === 'today') {
    return { from: today, to: today }
  }

  if (period === 'week') {
    const start = new Date(referenceDate)
    start.setDate(start.getDate() - 6)
    return { from: toIso(start), to: today }
  }

  if (period === 'month') {
    const start = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1)
    return { from: toIso(start), to: today }
  }

  return {
    from: dateFrom || today,
    to: dateTo || today,
  }
}

export function getPeriodLabel(period: ProductivityPeriod, range: DateRange): string {
  switch (period) {
    case 'today':
      return 'Hoy'
    case 'week':
      return 'Esta semana'
    case 'month':
      return 'Este mes'
    case 'custom':
      return `${range.from} — ${range.to}`
    default:
      return 'Periodo seleccionado'
  }
}

function isDateInRange(date: string, range: DateRange): boolean {
  return date >= range.from && date <= range.to
}

function daysInRange(range: DateRange): number {
  const from = new Date(`${range.from}T00:00:00`)
  const to = new Date(`${range.to}T00:00:00`)
  const diff = Math.max(1, Math.round((to.getTime() - from.getTime()) / 86400000) + 1)
  return diff
}

function previousRange(range: DateRange): DateRange {
  const days = daysInRange(range)
  const from = new Date(`${range.from}T12:00:00`)
  from.setDate(from.getDate() - days)
  const to = new Date(`${range.from}T12:00:00`)
  to.setDate(to.getDate() - 1)
  return {
    from: toLocalDateIso(from),
    to: toLocalDateIso(to),
  }
}

function matchesOrigin(
  appointment: Appointment,
  patients: Patient[],
  origin: PatientOrigin | 'all',
): boolean {
  if (origin === 'all') return true
  if (appointment.origin === origin) return true
  const patient = patients.find((p) => p.id === appointment.patientId)
  return patient?.origin === origin
}

function matchesSpecialty(
  specialtyId: string,
  appointment: Appointment,
  studies: Study[],
): boolean {
  if (specialtyId === 'all') return true
  if (appointment.specialtyId === specialtyId) return true
  const study = studies.find((s) => s.id === appointment.studyId)
  return study?.specialtyId === specialtyId
}

export function filterAppointmentsForProductivity(
  appointments: Appointment[],
  patients: Patient[],
  studies: Study[],
  range: DateRange,
  filters: ProductivityFiltersState,
): Appointment[] {
  const normalized = normalizeProductivityFilters(filters)

  return appointments.filter((apt) => {
    if (!isDateInRange(apt.appointmentDate, range)) return false
    if (normalized.doctorId !== 'all' && apt.doctorId !== normalized.doctorId) return false
    if (normalized.studyId !== 'all' && apt.studyId !== normalized.studyId) return false
    if (!matchesSpecialty(normalized.specialtyId, apt, studies)) return false
    if (!matchesOrigin(apt, patients, normalized.origin)) return false
    return true
  })
}

export function filterReportsForProductivity(
  reports: MedicalReport[],
  patients: Patient[],
  appointments: Appointment[],
  studies: Study[],
  range: DateRange,
  filters: ProductivityFiltersState,
): MedicalReport[] {
  const normalized = normalizeProductivityFilters(filters)

  return reports.filter((report) => {
    if (!isDateInRange(report.reportDate, range)) return false
    if (normalized.doctorId !== 'all' && report.doctorId !== normalized.doctorId) return false
    if (normalized.studyId !== 'all' && report.studyId !== normalized.studyId) return false
    const linkedApt = appointments.find((a) => a.id === report.appointmentId)
    if (normalized.specialtyId !== 'all') {
      const specialtyId =
        linkedApt?.specialtyId ??
        studies.find((s) => s.id === report.studyId)?.specialtyId
      if (specialtyId !== normalized.specialtyId) return false
    }
    if (normalized.origin !== 'all') {
      const patient = patients.find((p) => p.id === report.patientId)
      const aptOrigin = linkedApt?.origin ?? patient?.origin
      if (aptOrigin !== normalized.origin && patient?.origin !== normalized.origin) {
        return false
      }
    }
    return true
  })
}

function topStudyNames(
  studyCounts: Map<string, number>,
  studies: Study[],
  limit = 3,
): string[] {
  return [...studyCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => studies.find((s) => s.id === id)?.name ?? id)
}

export interface GetDoctorProductivityParams {
  doctors: Doctor[]
  appointments: Appointment[]
  reports: MedicalReport[]
  studies: Study[]
  specialties: Specialty[]
  patients: Patient[]
  period: ProductivityPeriod
  dateFrom: string
  dateTo: string
  filters: ProductivityFiltersState
  currentUser: AuthUser | null
}

export function getDoctorProductivity({
  doctors,
  appointments,
  reports,
  studies,
  patients,
  period,
  dateFrom,
  dateTo,
  filters,
  currentUser,
}: GetDoctorProductivityParams): DoctorProductivitySummary[] {
  const range = resolveDateRange(period, dateFrom, dateTo)
  const normalizedFilters = normalizeProductivityFilters(filters)
  const scopedFilters = { ...normalizedFilters, doctorId: 'all' as const }

  let doctorScope = doctors
  if (currentUser?.role === 'doctor') {
    doctorScope = doctors.filter((d) => d.id === currentUser.id)
  } else if (normalizedFilters.doctorId !== 'all') {
    doctorScope = doctors.filter((d) => d.id === normalizedFilters.doctorId)
  }

  const filteredAppointments = filterAppointmentsForProductivity(
    appointments,
    patients,
    studies,
    range,
    { ...scopedFilters, doctorId: 'all' },
  )
  const filteredReports = filterReportsForProductivity(
    reports,
    patients,
    appointments,
    studies,
    range,
    { ...scopedFilters, doctorId: 'all' },
  )

  const dayCount = daysInRange(range)

  return doctorScope.map((doctor) => {
    const doctorAppointments = filteredAppointments.filter(
      (a) => a.doctorId === doctor.id,
    )
    const doctorReports = filteredReports.filter((r) => r.doctorId === doctor.id)

    const patientIds = new Set<string>()
    doctorAppointments.forEach((a) => patientIds.add(a.patientId))
    doctorReports.forEach((r) => patientIds.add(r.patientId))

    const studyCounts = new Map<string, number>()
    doctorAppointments.forEach((a) => {
      studyCounts.set(a.studyId, (studyCounts.get(a.studyId) ?? 0) + 1)
    })

    const activityDates = [
      ...doctorAppointments.map((a) => a.appointmentDate),
      ...doctorReports.map((r) => r.reportDate),
    ].sort()

    return {
      doctorId: doctor.id,
      doctorName: doctor.fullName,
      specialty: doctor.specialty,
      totalPatients: patientIds.size,
      totalStudies: doctorAppointments.length,
      totalReports: doctorReports.length,
      missingReports: doctorReports.filter((r) => r.status === 'missing_report').length,
      missingDiagnosticImpression: doctorReports.filter(
        (r) => r.status === 'missing_diagnostic_impression',
      ).length,
      inReview: doctorReports.filter((r) => r.status === 'in_review').length,
      concluded: doctorReports.filter((r) => r.status === 'concluded').length,
      pdfGenerated: doctorReports.filter((r) => r.status === 'pdf_generated').length,
      mainStudies: topStudyNames(studyCounts, studies),
      averageReportsPerDay:
        doctorReports.length > 0
          ? Math.round((doctorReports.length / dayCount) * 10) / 10
          : 0,
      lastActivityDate: activityDates.at(-1),
    }
  })
}

export interface GetStudyProductivityParams {
  appointments: Appointment[]
  reports: MedicalReport[]
  studies: Study[]
  patients: Patient[]
  period: ProductivityPeriod
  dateFrom: string
  dateTo: string
  filters: ProductivityFiltersState
}

export function getStudyProductivity({
  appointments,
  reports,
  studies,
  patients,
  period,
  dateFrom,
  dateTo,
  filters,
}: GetStudyProductivityParams): StudyProductivitySummary[] {
  const range = resolveDateRange(period, dateFrom, dateTo)
  const filteredAppointments = filterAppointmentsForProductivity(
    appointments,
    patients,
    studies,
    range,
    filters,
  )
  const filteredReports = filterReportsForProductivity(
    reports,
    patients,
    appointments,
    studies,
    range,
    filters,
  )

  const map = new Map<string, StudyProductivitySummary>()

  const ensure = (studyId: string) => {
    if (!map.has(studyId)) {
      const study = studies.find((s) => s.id === studyId)
      map.set(studyId, {
        studyId,
        studyName: study?.name ?? studyId,
        total: 0,
        concluded: 0,
        pending: 0,
      })
    }
    return map.get(studyId)!
  }

  filteredAppointments.forEach((apt) => {
    const row = ensure(apt.studyId)
    row.total += 1
  })

  filteredReports.forEach((report) => {
    const row = ensure(report.studyId)
    if (report.status === 'concluded' || report.status === 'pdf_generated') {
      row.concluded += 1
    } else {
      row.pending += 1
    }
  })

  return [...map.values()].sort((a, b) => b.total - a.total)
}

export interface GetOriginProductivityParams {
  appointments: Appointment[]
  patients: Patient[]
  period: ProductivityPeriod
  dateFrom: string
  dateTo: string
  filters: ProductivityFiltersState
}

export function getOriginProductivity({
  appointments,
  patients,
  period,
  dateFrom,
  dateTo,
  filters,
}: GetOriginProductivityParams): OriginProductivitySummary[] {
  const range = resolveDateRange(period, dateFrom, dateTo)
  const filteredAppointments = filterAppointmentsForProductivity(
    appointments,
    patients,
    [],
    range,
    filters,
  )

  const counts = new Map<PatientOrigin, number>()
  ORIGIN_OPTIONS.forEach((o) => counts.set(o, 0))

  filteredAppointments.forEach((apt) => {
    const patient = patients.find((p) => p.id === apt.patientId)
    const origin = apt.origin ?? patient?.origin ?? 'Particular'
    counts.set(origin, (counts.get(origin) ?? 0) + 1)
  })

  return ORIGIN_OPTIONS.map((origin) => ({
    origin,
    total: counts.get(origin) ?? 0,
  })).filter((o) => o.total > 0)
}

export interface GetGeneralProductivityParams {
  doctors: Doctor[]
  appointments: Appointment[]
  reports: MedicalReport[]
  studies: Study[]
  patients: Patient[]
  period: ProductivityPeriod
  dateFrom: string
  dateTo: string
  filters: ProductivityFiltersState
  currentUser: AuthUser | null
}

export function getGeneralProductivitySummary(
  params: GetGeneralProductivityParams,
): GeneralProductivitySummary {
  const range = resolveDateRange(params.period, params.dateFrom, params.dateTo)
  const doctorRows = getDoctorProductivity({
    ...params,
    specialties: [],
    filters: params.filters,
  })

  const filteredAppointments = filterAppointmentsForProductivity(
    params.appointments,
    params.patients,
    params.studies,
    range,
    params.filters,
  )
  const filteredReports = filterReportsForProductivity(
    params.reports,
    params.patients,
    params.appointments,
    params.studies,
    range,
    params.filters,
  )

  const patientIds = new Set<string>()
  filteredAppointments.forEach((a) => patientIds.add(a.patientId))
  filteredReports.forEach((r) => patientIds.add(r.patientId))

  const studyRows = getStudyProductivity({
    appointments: params.appointments,
    reports: params.reports,
    studies: params.studies,
    patients: params.patients,
    period: params.period,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    filters: params.filters,
  })

  const prevRange = previousRange(range)
  const prevReports = filterReportsForProductivity(
    params.reports,
    params.patients,
    params.appointments,
    params.studies,
    prevRange,
    params.filters,
  )

  const totalPending = filteredReports.filter((r) =>
    PENDING_REPORT_STATUSES.includes(r.status),
  ).length
  const totalConcluded = filteredReports.filter((r) => r.status === 'concluded').length
  const totalPdfGenerated = filteredReports.filter(
    (r) => r.status === 'pdf_generated',
  ).length

  const mostRequestedStudy = studyRows[0]?.studyName ?? '—'
  const mostProductive = [...doctorRows].sort(
    (a, b) => b.concluded + b.pdfGenerated - (a.concluded + a.pdfGenerated),
  )[0]

  const trend =
    prevReports.length === 0
      ? 'Sin periodo anterior comparable'
      : filteredReports.length >= prevReports.length
        ? `+${Math.round(((filteredReports.length - prevReports.length) / prevReports.length) * 100)}% respecto al periodo anterior`
        : `${Math.round(((filteredReports.length - prevReports.length) / prevReports.length) * 100)}% respecto al periodo anterior`

  return {
    totalPatients: patientIds.size,
    totalStudies: filteredAppointments.length,
    totalReports: filteredReports.length,
    totalPending,
    totalConcluded,
    totalPdfGenerated,
    mostRequestedStudy,
    mostProductiveDoctor: mostProductive?.doctorName ?? '—',
    periodLabel: getPeriodLabel(params.period, range),
    trendHint: trend,
  }
}

export function getReportStatusDistribution(
  reports: MedicalReport[],
  patients: Patient[],
  appointments: Appointment[],
  studies: Study[],
  range: DateRange,
  filters: ProductivityFiltersState,
): ReportStatusDistributionItem[] {
  const filtered = filterReportsForProductivity(
    reports,
    patients,
    appointments,
    studies,
    range,
    filters,
  )

  const statuses: ReportStatus[] = [
    'missing_report',
    'missing_diagnostic_impression',
    'in_review',
    'concluded',
    'pdf_generated',
  ]

  return statuses.map((status) => ({
    status,
    label: reportStatusLabels[status],
    count: filtered.filter((r) => r.status === status).length,
  }))
}

export function findTopDoctorByMetric(
  rows: DoctorProductivitySummary[],
  metric: 'concluded' | 'pending',
): string | null {
  if (rows.length === 0) return null
  if (metric === 'concluded') {
    return [...rows].sort(
      (a, b) => b.concluded + b.pdfGenerated - (a.concluded + a.pdfGenerated),
    )[0]?.doctorId ?? null
  }
  return [...rows].sort(
    (a, b) =>
      b.missingReports +
      b.missingDiagnosticImpression -
      (a.missingReports + a.missingDiagnosticImpression),
  )[0]?.doctorId ?? null
}

export function getDoctorDetailStudies(
  doctorId: string,
  appointments: Appointment[],
  reports: MedicalReport[],
  studies: Study[],
  range: DateRange,
): StudyProductivitySummary[] {
  const doctorApts = appointments.filter(
    (a) => a.doctorId === doctorId && isDateInRange(a.appointmentDate, range),
  )
  const doctorReports = reports.filter(
    (r) => r.doctorId === doctorId && isDateInRange(r.reportDate, range),
  )

  const map = new Map<string, StudyProductivitySummary>()

  doctorApts.forEach((apt) => {
    const study = studies.find((s) => s.id === apt.studyId)
    if (!map.has(apt.studyId)) {
      map.set(apt.studyId, {
        studyId: apt.studyId,
        studyName: study?.name ?? apt.studyId,
        total: 0,
        concluded: 0,
        pending: 0,
      })
    }
    map.get(apt.studyId)!.total += 1
  })

  doctorReports.forEach((report) => {
    const study = studies.find((s) => s.id === report.studyId)
    if (!map.has(report.studyId)) {
      map.set(report.studyId, {
        studyId: report.studyId,
        studyName: study?.name ?? report.studyId,
        total: 0,
        concluded: 0,
        pending: 0,
      })
    }
    const row = map.get(report.studyId)!
    if (report.status === 'concluded' || report.status === 'pdf_generated') {
      row.concluded += 1
    } else {
      row.pending += 1
    }
  })

  return [...map.values()].sort((a, b) => b.total - a.total)
}

export function getDoctorOriginBreakdown(
  doctorId: string,
  appointments: Appointment[],
  patients: Patient[],
  range: DateRange,
): OriginProductivitySummary[] {
  const doctorApts = appointments.filter(
    (a) => a.doctorId === doctorId && isDateInRange(a.appointmentDate, range),
  )

  const counts = new Map<PatientOrigin, number>()
  ORIGIN_OPTIONS.forEach((o) => counts.set(o, 0))

  doctorApts.forEach((apt) => {
    const patient = patients.find((p) => p.id === apt.patientId)
    const origin = apt.origin ?? patient?.origin ?? 'Particular'
    counts.set(origin, (counts.get(origin) ?? 0) + 1)
  })

  return ORIGIN_OPTIONS.map((origin) => ({
    origin,
    total: counts.get(origin) ?? 0,
  })).filter((o) => o.total > 0)
}
