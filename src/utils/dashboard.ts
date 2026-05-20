import type { AuthUser } from '@/types/auth'
import type {
  Appointment,
  Doctor,
  MedicalReport,
  Patient,
  PatientOrigin,
  ReportStatus,
  Study,
} from '@/types/medical'
import type { SystemUser } from '@/types/auth'
import { toLocalDateIso } from '@/utils/dates'
import { resolveDateRange } from '@/utils/productivity'

export interface AdminDashboardStats {
  totalPatients: number
  todayAppointments: number
  pendingStudies: number
  missingReports: number
  missingDiagnosticImpression: number
  inReviewReports: number
  concludedReports: number
  pdfGeneratedReports: number
  activeDoctors: number
  activeAssistants: number
}

export interface DoctorDashboardStats {
  assignedAppointmentsToday: number
  myMissingReports: number
  myMissingDiagnosticImpression: number
  myInReviewReports: number
  myConcludedReportsThisWeek: number
  myPdfGenerated: number
  weeklyStudiesCount: number
  weeklyAveragePerDay: number
}

export interface AssistantDashboardStats {
  registeredPatients: number
  createdAppointments: number
  pendingStudies: number
  incompletePatients: number
  reportsPendingForAssociatedDoctor: number
  todayAppointments: number
}

export interface TopStudyItem {
  studyId: string
  studyName: string
  count: number
  percentage: number
}

export interface OriginDistributionItem {
  origin: PatientOrigin
  count: number
  percentage: number
}

export interface DoctorRankingRow {
  doctorId: string
  doctorName: string
  specialty: string
  concluded: number
  pending: number
  missingImpression: number
  pdfGenerated: number
}

export interface DashboardReportRow {
  reportId: string
  patientId: string
  patientName: string
  dni: string
  studyId: string
  studyName: string
  doctorId: string
  doctorName: string
  status: ReportStatus
  updatedAt: string
  reportDate: string
}

export interface DashboardAppointmentRow {
  appointmentId: string
  patientId: string
  patientName: string
  dni: string
  studyId: string
  studyName: string
  doctorName: string
  appointmentDate: string
  appointmentTime: string
  origin: PatientOrigin
  status: Appointment['status']
}

export interface WeeklyDayCount {
  dayLabel: string
  count: number
}

export interface OperationalTask {
  id: string
  label: string
  status: 'pending' | 'in_progress' | 'completed'
}

export interface AssistantDoctorCard {
  doctorId: string
  doctorName: string
  specialty: string
  pendingReports: number
  todayAppointments: number
}

export interface RecentPatientRow {
  patientId: string
  fullName: string
  dni: string
  phone: string
  origin: PatientOrigin
  createdAt: string
}

const PENDING_REPORT_STATUSES: ReportStatus[] = [
  'missing_report',
  'missing_diagnostic_impression',
  'in_review',
]

const ATTENTION_REPORT_STATUSES: ReportStatus[] = [
  'missing_report',
  'missing_diagnostic_impression',
  'in_review',
]

export function getTodayIso(reference = new Date()): string {
  return toLocalDateIso(reference)
}

export function isPatientIncomplete(patient: Patient): boolean {
  return !patient.address || !patient.emergencyContactPhone
}

export function buildLookupMaps(
  patients: Patient[],
  studies: Study[],
  doctors: Doctor[],
) {
  const patientMap = new Map(patients.map((p) => [p.id, p]))
  const studyMap = new Map(studies.map((s) => [s.id, s]))
  const doctorMap = new Map(doctors.map((d) => [d.id, d]))
  return { patientMap, studyMap, doctorMap }
}

export function getAdminDashboardStats(
  patients: Patient[],
  appointments: Appointment[],
  reports: MedicalReport[],
  users: Pick<SystemUser, 'role' | 'status'>[],
  today = getTodayIso(),
): AdminDashboardStats {
  const activeDoctors = users.filter((u) => u.role === 'doctor' && u.status === 'active').length
  const activeAssistants = users.filter(
    (u) => u.role === 'assistant' && u.status === 'active',
  ).length

  return {
    totalPatients: patients.length,
    todayAppointments: appointments.filter((a) => a.appointmentDate === today).length,
    pendingStudies: appointments.filter((a) => a.status === 'pending_study').length,
    missingReports: reports.filter((r) => r.status === 'missing_report').length,
    missingDiagnosticImpression: reports.filter(
      (r) => r.status === 'missing_diagnostic_impression',
    ).length,
    inReviewReports: reports.filter((r) => r.status === 'in_review').length,
    concludedReports: reports.filter((r) => r.status === 'concluded').length,
    pdfGeneratedReports: reports.filter((r) => r.status === 'pdf_generated').length,
    activeDoctors,
    activeAssistants,
  }
}

export function getDoctorDashboardStats(
  reports: MedicalReport[],
  appointments: Appointment[],
  doctorId: string,
  today = getTodayIso(),
): DoctorDashboardStats {
  const myReports = reports.filter((r) => r.doctorId === doctorId)
  const myAppointments = appointments.filter((a) => a.doctorId === doctorId)
  const weekRange = resolveDateRange('week', '', '', new Date(`${today}T12:00:00`))

  const weekReports = myReports.filter(
    (r) => r.reportDate >= weekRange.from && r.reportDate <= weekRange.to,
  )
  const weekAppointments = myAppointments.filter(
    (a) => a.appointmentDate >= weekRange.from && a.appointmentDate <= weekRange.to,
  )

  const concludedWeek = weekReports.filter((r) => r.status === 'concluded').length
  const dayCount = 7

  return {
    assignedAppointmentsToday: myAppointments.filter((a) => a.appointmentDate === today).length,
    myMissingReports: myReports.filter((r) => r.status === 'missing_report').length,
    myMissingDiagnosticImpression: myReports.filter(
      (r) => r.status === 'missing_diagnostic_impression',
    ).length,
    myInReviewReports: myReports.filter((r) => r.status === 'in_review').length,
    myConcludedReportsThisWeek: concludedWeek,
    myPdfGenerated: myReports.filter((r) => r.status === 'pdf_generated').length,
    weeklyStudiesCount: weekAppointments.length,
    weeklyAveragePerDay:
      weekReports.length > 0 ? Math.round((weekReports.length / dayCount) * 10) / 10 : 0,
  }
}

function filterAssistantScope(
  user: AuthUser,
  appointments: Appointment[],
  patients: Patient[],
): { appointments: Appointment[]; patients: Patient[] } {
  const scopedPatients = patients.filter(
    (p) =>
      p.registeredByUserId === user.id ||
      appointments.some(
        (a) =>
          a.patientId === p.id &&
          (a.createdByRole === 'assistant' || a.doctorId === user.associatedDoctorId),
      ),
  )

  const patientIds = new Set(scopedPatients.map((p) => p.id))

  const scopedAppointments = appointments.filter(
    (a) =>
      a.createdByRole === 'assistant' ||
      a.doctorId === user.associatedDoctorId ||
      patientIds.has(a.patientId),
  )

  return { appointments: scopedAppointments, patients: scopedPatients }
}

export function getAssistantDashboardStats(
  user: AuthUser,
  patients: Patient[],
  appointments: Appointment[],
  reports: MedicalReport[],
  today = getTodayIso(),
): AssistantDashboardStats {
  const { appointments: scopedApts, patients: scopedPatients } = filterAssistantScope(
    user,
    appointments,
    patients,
  )

  const associatedDoctorId = user.associatedDoctorId
  const doctorPending = associatedDoctorId
    ? reports.filter(
        (r) =>
          r.doctorId === associatedDoctorId &&
          PENDING_REPORT_STATUSES.includes(r.status),
      ).length
    : 0

  return {
    registeredPatients: patients.filter((p) => p.registeredByUserId === user.id).length,
    createdAppointments: scopedApts.filter((a) => a.createdByRole === 'assistant').length,
    pendingStudies: scopedApts.filter((a) => a.status === 'pending_study').length,
    incompletePatients: scopedPatients.filter(isPatientIncomplete).length,
    reportsPendingForAssociatedDoctor: doctorPending,
    todayAppointments: scopedApts.filter((a) => a.appointmentDate === today).length,
  }
}

export function getMostRequestedStudies(
  appointments: Appointment[],
  studies: Study[],
  limit = 5,
  scopeAppointments?: Appointment[],
): TopStudyItem[] {
  const source = scopeAppointments ?? appointments
  const counts = new Map<string, number>()
  source.forEach((a) => counts.set(a.studyId, (counts.get(a.studyId) ?? 0) + 1))
  const total = source.length || 1
  const studyMap = new Map(studies.map((s) => [s.id, s.name]))

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([studyId, count]) => ({
      studyId,
      studyName: studyMap.get(studyId) ?? studyId,
      count,
      percentage: Math.round((count / total) * 100),
    }))
}

export function getOriginDistribution(
  patients: Patient[],
  scopePatients?: Patient[],
): OriginDistributionItem[] {
  const source = scopePatients ?? patients
  const origins: PatientOrigin[] = [
    'Particular',
    'Emergencia',
    'Consulta externa',
    'Referido',
    'Convenio',
    'Hospitalización',
  ]
  const total = source.length || 1
  return origins.map((origin) => {
    const count = source.filter((p) => p.origin === origin).length
    return { origin, count, percentage: Math.round((count / total) * 100) }
  })
}

export function getDoctorRanking(
  doctors: Doctor[],
  reports: MedicalReport[],
): { byConcluded: DoctorRankingRow[]; byPending: DoctorRankingRow[] } {
  const rows: DoctorRankingRow[] = doctors.map((doctor) => {
    const doctorReports = reports.filter((r) => r.doctorId === doctor.id)
    const pending = doctorReports.filter((r) =>
      PENDING_REPORT_STATUSES.includes(r.status),
    ).length
    return {
      doctorId: doctor.id,
      doctorName: doctor.fullName,
      specialty: doctor.specialty,
      concluded: doctorReports.filter((r) => r.status === 'concluded').length,
      pending,
      missingImpression: doctorReports.filter(
        (r) => r.status === 'missing_diagnostic_impression',
      ).length,
      pdfGenerated: doctorReports.filter((r) => r.status === 'pdf_generated').length,
    }
  })

  return {
    byConcluded: [...rows].sort((a, b) => b.concluded - a.concluded),
    byPending: [...rows].sort((a, b) => b.pending - a.pending),
  }
}

export function mapReportsToRows(
  reports: MedicalReport[],
  patients: Patient[],
  studies: Study[],
  doctors: Doctor[],
): DashboardReportRow[] {
  const { patientMap, studyMap, doctorMap } = buildLookupMaps(patients, studies, doctors)
  return reports.map((r) => {
    const patient = patientMap.get(r.patientId)
    const study = studyMap.get(r.studyId)
    const doctor = doctorMap.get(r.doctorId)
    return {
      reportId: r.id,
      patientId: r.patientId,
      patientName: patient?.fullName ?? '—',
      dni: patient?.dni ?? '—',
      studyId: r.studyId,
      studyName: study?.name ?? r.studyId,
      doctorId: r.doctorId,
      doctorName: doctor?.fullName ?? '—',
      status: r.status,
      updatedAt: r.updatedAt,
      reportDate: r.reportDate,
    }
  })
}

export function mapAppointmentsToRows(
  appointments: Appointment[],
  patients: Patient[],
  studies: Study[],
  doctors: Doctor[],
): DashboardAppointmentRow[] {
  const { patientMap, studyMap, doctorMap } = buildLookupMaps(patients, studies, doctors)
  return appointments.map((a) => {
    const patient = patientMap.get(a.patientId)
    const study = studyMap.get(a.studyId)
    const doctor = doctorMap.get(a.doctorId)
    return {
      appointmentId: a.id,
      patientId: a.patientId,
      patientName: patient?.fullName ?? '—',
      dni: patient?.dni ?? '—',
      studyId: a.studyId,
      studyName: study?.name ?? a.studyId,
      doctorName: doctor?.fullName ?? '—',
      appointmentDate: a.appointmentDate,
      appointmentTime: a.appointmentTime,
      origin: a.origin,
      status: a.status,
    }
  })
}

export function getReportsNeedingAttention(
  reports: MedicalReport[],
  patients: Patient[],
  studies: Study[],
  doctors: Doctor[],
  limit = 8,
): DashboardReportRow[] {
  return mapReportsToRows(
    reports
      .filter((r) => ATTENTION_REPORT_STATUSES.includes(r.status))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    patients,
    studies,
    doctors,
  ).slice(0, limit)
}

export function getDoctorPendingReports(
  reports: MedicalReport[],
  patients: Patient[],
  studies: Study[],
  doctors: Doctor[],
  doctorId: string,
  limit = 8,
): DashboardReportRow[] {
  return mapReportsToRows(
    reports
      .filter(
        (r) =>
          r.doctorId === doctorId && PENDING_REPORT_STATUSES.includes(r.status),
      )
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    patients,
    studies,
    doctors,
  ).slice(0, limit)
}

export function getDoctorTodayAppointments(
  appointments: Appointment[],
  patients: Patient[],
  studies: Study[],
  doctors: Doctor[],
  doctorId: string,
  today = getTodayIso(),
): DashboardAppointmentRow[] {
  return mapAppointmentsToRows(
    appointments
      .filter((a) => a.doctorId === doctorId && a.appointmentDate === today)
      .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime)),
    patients,
    studies,
    doctors,
  )
}

export function getDoctorWeeklyActivity(
  reports: MedicalReport[],
  doctorId: string,
  today = getTodayIso(),
): WeeklyDayCount[] {
  const labels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const ref = new Date(`${today}T12:00:00`)
  const days: WeeklyDayCount[] = []

  for (let i = 6; i >= 0; i--) {
    const d = new Date(ref)
    d.setDate(d.getDate() - i)
    const iso = d.toISOString().slice(0, 10)
    const count = reports.filter(
      (r) => r.doctorId === doctorId && r.reportDate === iso,
    ).length
    days.push({ dayLabel: labels[d.getDay()], count })
  }

  return days
}

export function getAssistantOperationalTasks(
  user: AuthUser,
  patients: Patient[],
  appointments: Appointment[],
  reports: MedicalReport[],
): OperationalTask[] {
  const incomplete = patients.filter(
    (p) => p.registeredByUserId === user.id && isPatientIncomplete(p),
  ).length
  const pendingApts = appointments.filter(
    (a) =>
      (a.createdByRole === 'assistant' || a.doctorId === user.associatedDoctorId) &&
      a.status === 'pending_study',
  ).length
  const doctorPending = user.associatedDoctorId
    ? reports.filter(
        (r) =>
          r.doctorId === user.associatedDoctorId &&
          PENDING_REPORT_STATUSES.includes(r.status),
      ).length
    : 0

  return [
    {
      id: 't1',
      label: 'Registrar paciente nuevo',
      status: incomplete > 0 ? 'in_progress' : 'completed',
    },
    {
      id: 't2',
      label: 'Completar datos del paciente',
      status: incomplete > 0 ? 'pending' : 'completed',
    },
    {
      id: 't3',
      label: 'Crear atención para estudio',
      status: pendingApts > 0 ? 'pending' : 'completed',
    },
    {
      id: 't4',
      label: 'Verificar estudio realizado',
      status: pendingApts > 0 ? 'in_progress' : 'completed',
    },
    {
      id: 't5',
      label: 'Derivar informe al médico',
      status: doctorPending > 2 ? 'pending' : doctorPending > 0 ? 'in_progress' : 'completed',
    },
    {
      id: 't6',
      label: 'Revisar estado de informe',
      status: doctorPending > 0 ? 'pending' : 'completed',
    },
  ]
}

export function getAssistantRecentAppointments(
  user: AuthUser,
  appointments: Appointment[],
  patients: Patient[],
  studies: Study[],
  doctors: Doctor[],
  limit = 6,
): DashboardAppointmentRow[] {
  const { appointments: scoped } = filterAssistantScope(user, appointments, patients)
  return mapAppointmentsToRows(
    [...scoped].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    patients,
    studies,
    doctors,
  ).slice(0, limit)
}

export function getAssistantRecentPatients(
  user: AuthUser,
  patients: Patient[],
  limit = 5,
): RecentPatientRow[] {
  return patients
    .filter((p) => p.registeredByUserId === user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit)
    .map((p) => ({
      patientId: p.id,
      fullName: p.fullName,
      dni: p.dni,
      phone: p.phone,
      origin: p.origin,
      createdAt: p.createdAt,
    }))
}

export function getAssistantDoctorCard(
  user: AuthUser,
  doctors: Doctor[],
  appointments: Appointment[],
  reports: MedicalReport[],
  today = getTodayIso(),
): AssistantDoctorCard | null {
  if (!user.associatedDoctorId) return null
  const doctor = doctors.find((d) => d.id === user.associatedDoctorId)
  if (!doctor) return null

  const pendingReports = reports.filter(
    (r) =>
      r.doctorId === doctor.id && PENDING_REPORT_STATUSES.includes(r.status),
  ).length

  const todayAppointments = appointments.filter(
    (a) => a.doctorId === doctor.id && a.appointmentDate === today,
  ).length

  return {
    doctorId: doctor.id,
    doctorName: doctor.fullName,
    specialty: doctor.specialty,
    pendingReports,
    todayAppointments,
  }
}

export function getGreetingTitle(fullName: string, role: AuthUser['role']): string {
  const titleMatch = fullName.match(/^(Dr\.|Dra\.)\s*/i)
  const title = titleMatch?.[1] ?? ''
  const rest = fullName.replace(/^(Dr\.|Dra\.)\s*/i, '').trim()
  const firstName = rest.split(/\s+/)[0] ?? fullName

  if (role === 'assistant') {
    return `Bienvenida, ${firstName}`
  }

  const welcome = title.toLowerCase().startsWith('dra') ? 'Bienvenida' : 'Bienvenido'
  const display = title ? `${title} ${firstName}` : firstName
  return `${welcome}, ${display}`
}

export function getDashboardSubtitle(role: AuthUser['role']): string {
  switch (role) {
    case 'admin':
      return 'Resumen general del sistema de informes médicos de la clínica.'
    case 'doctor':
      return 'Revisa tus estudios asignados, informes pendientes y productividad personal.'
    case 'assistant':
      return 'Gestiona pacientes, atenciones y tareas operativas del día.'
    default:
      return 'Panel de control del sistema.'
  }
}

export function getInfoBannerText(role: AuthUser['role']): string {
  switch (role) {
    case 'admin':
      return 'El dashboard resume la actividad global del sistema: pacientes, estudios, informes y productividad médica.'
    case 'doctor':
      return 'Tu dashboard muestra solo los estudios e informes asociados a tu usuario médico.'
    case 'assistant':
      return 'Tu dashboard muestra tareas operativas relacionadas con registro de pacientes y preparación de atenciones.'
    default:
      return ''
  }
}
