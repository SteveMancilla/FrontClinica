import type { AuthUser } from '@/types/auth'
import type {
  Appointment,
  AppointmentStatus,
  MedicalReport,
  Patient,
  PatientOrigin,
  PatientSex,
  ReportStatus,
} from '@/types/medical'
import {
  mockAppointments,
  mockMedicalReports,
  mockPatients,
} from '@/data/mockMedical'
import type { StatusBadgeVariant } from '@/utils/appointmentStatus'

export type PatientReportsSummaryStatus =
  | 'no_appointments'
  | 'has_pending'
  | 'in_review'
  | 'all_concluded'

export const patientReportsStatusLabels: Record<
  PatientReportsSummaryStatus,
  string
> = {
  no_appointments: 'Sin atenciones',
  has_pending: 'Tiene pendientes',
  in_review: 'En revisión',
  all_concluded: 'Todo concluido',
}

export const patientReportsStatusVariants: Record<
  PatientReportsSummaryStatus,
  StatusBadgeVariant
> = {
  no_appointments: 'neutral',
  has_pending: 'warning',
  in_review: 'purple',
  all_concluded: 'success',
}

const pendingAppointmentStatuses: AppointmentStatus[] = [
  'pending_study',
  'study_done',
  'missing_report',
  'missing_diagnostic_impression',
]

const pendingReportStatuses: ReportStatus[] = [
  'missing_report',
  'missing_diagnostic_impression',
]

export function getPatientInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

export function getPatientReportsSummaryStatus(
  patientId: string,
  appointments: Appointment[],
  reports: MedicalReport[],
): PatientReportsSummaryStatus {
  const patientAppointments = appointments.filter((a) => a.patientId === patientId)
  const patientReports = reports.filter((r) => r.patientId === patientId)

  if (patientAppointments.length === 0) return 'no_appointments'

  const hasPendingAppointment = patientAppointments.some((a) =>
    pendingAppointmentStatuses.includes(a.status),
  )
  const hasPendingReport = patientReports.some((r) =>
    pendingReportStatuses.includes(r.status),
  )

  if (hasPendingAppointment || hasPendingReport) return 'has_pending'

  const hasInReview =
    patientAppointments.some((a) => a.status === 'in_review') ||
    patientReports.some((r) => r.status === 'in_review')

  if (hasInReview) return 'in_review'

  const allDone =
    patientReports.length > 0 &&
    patientReports.every(
      (r) => r.status === 'concluded' || r.status === 'pdf_generated',
    ) &&
    patientAppointments.every(
      (a) => a.status === 'concluded' || a.status === 'pdf_generated',
    )

  if (allDone) return 'all_concluded'

  return 'has_pending'
}

export function getLastAppointmentForPatient(
  patientId: string,
  appointments: Appointment[],
): Appointment | undefined {
  return [...appointments]
    .filter((a) => a.patientId === patientId)
    .sort((a, b) => {
      const da = `${a.appointmentDate}T${a.appointmentTime}`
      const db = `${b.appointmentDate}T${b.appointmentTime}`
      return db.localeCompare(da)
    })[0]
}

export interface PatientFilters {
  search: string
  sex: PatientSex | 'all'
  origin: PatientOrigin | 'all'
  status: 'all' | 'active' | 'inactive'
  registeredFrom: string
}

export const defaultPatientFilters: PatientFilters = {
  search: '',
  sex: 'all',
  origin: 'all',
  status: 'all',
  registeredFrom: '',
}

export function filterPatients(
  patients: Patient[],
  filters: PatientFilters,
): Patient[] {
  const q = filters.search.trim().toLowerCase()

  return patients.filter((patient) => {
    if (filters.sex !== 'all' && patient.sex !== filters.sex) return false
    if (filters.origin !== 'all' && patient.origin !== filters.origin) return false
    if (filters.status !== 'all') {
      const isActive = patient.status !== 'inactive'
      if (filters.status === 'active' && !isActive) return false
      if (filters.status === 'inactive' && isActive) return false
    }
    if (filters.registeredFrom) {
      const created = patient.createdAt.slice(0, 10)
      if (created < filters.registeredFrom) return false
    }
    if (q) {
      const haystack = [patient.fullName, patient.dni, patient.phone]
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })
}

export function getPatientsForUser(
  user: AuthUser | null,
  patients: Patient[],
  appointments: Appointment[] = mockAppointments,
  reports: MedicalReport[] = mockMedicalReports,
  apiDoctorUserId?: string,
): Patient[] {
  if (!user) return []
  if (user.role === 'admin') return patients

  if (user.role === 'doctor') {
    const doctorId = apiDoctorUserId || user.id
    return patients.filter(
      (p) =>
        p.primaryDoctorId === doctorId ||
        p.registeredByUserId === doctorId ||
        appointments.some((a) => a.patientId === p.id && a.doctorId === doctorId) ||
        reports.some((r) => r.patientId === p.id && r.doctorId === doctorId),
    )
  }

  if (user.role === 'assistant') {
    return patients.filter(
      (p) =>
        p.registeredByUserId === user.id ||
        appointments.some(
          (a) => a.patientId === p.id && a.createdByRole === 'assistant',
        ),
    )
  }

  return patients
}

export function getPatientPageSummary(
  patients: Patient[],
  appointments: Appointment[],
  reports: MedicalReport[],
) {
  const today = new Date().toISOString().slice(0, 10)
  const patientIdsToday = new Set(
    appointments
      .filter((a) => a.appointmentDate === today)
      .map((a) => a.patientId),
  )

  let withPending = 0
  let withConcluded = 0

  for (const patient of patients) {
    const status = getPatientReportsSummaryStatus(
      patient.id,
      appointments,
      reports,
    )
    if (status === 'has_pending') withPending += 1
    if (status === 'all_concluded') withConcluded += 1
  }

  return {
    total: patients.length,
    attendedToday: patientIdsToday.size,
    withPending,
    withConcluded,
  }
}

export function getPatientDetailSummary(
  patientId: string,
  appointments: Appointment[],
  reports: MedicalReport[],
) {
  const patientAppointments = appointments.filter((a) => a.patientId === patientId)
  const patientReports = reports.filter((r) => r.patientId === patientId)
  const lastAppointment = getLastAppointmentForPatient(patientId, appointments)

  return {
    totalStudies: patientAppointments.length,
    pendingReports: patientReports.filter((r) =>
      pendingReportStatuses.includes(r.status),
    ).length,
    concludedReports: patientReports.filter(
      (r) => r.status === 'concluded' || r.status === 'pdf_generated',
    ).length,
    lastAppointment,
    lastReport: [...patientReports].sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt),
    )[0],
  }
}

export function clonePatientsData(): Patient[] {
  return structuredClone(mockPatients)
}

/** Búsqueda rápida por DNI o nombre (drawer Nueva atención) */
export function searchPatientsForAppointment(
  patients: Patient[],
  query: string,
): Patient[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return patients.filter((p) => {
    const haystack = [p.fullName, p.dni, p.phone].join(' ').toLowerCase()
    return haystack.includes(q) || p.dni.includes(q.replace(/\D/g, ''))
  })
}

export function findPatientByDni(
  patients: Patient[],
  dni: string,
): Patient | undefined {
  const normalized = dni.trim()
  if (!normalized) return undefined
  return patients.find((p) => p.dni === normalized)
}
