import type { UserRole } from '@/types/auth'

export type PatientSex = 'Masculino' | 'Femenino'

export type PatientOrigin =
  | 'Particular'
  | 'Emergencia'
  | 'Consulta externa'
  | 'Referido'
  | 'Convenio'
  | 'Hospitalización'

export type PatientStatus = 'active' | 'inactive'

export interface Patient {
  id: string
  dni: string
  fullName: string
  age: number
  sex: PatientSex
  phone: string
  address?: string
  origin: PatientOrigin
  createdAt: string
  birthDate?: string
  email?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  notes?: string
  status?: PatientStatus
  /** Usuario que registró al paciente */
  registeredByUserId?: string
  /** Médico responsable (p. ej. médico del asistente que registró) */
  primaryDoctorId?: string
}

export interface Doctor {
  id: string
  fullName: string
  /** Especialidad o cargo mostrado en el informe */
  specialty: string
  position?: string
  role?: UserRole
}

export interface Specialty {
  id: string
  name: string
  description?: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
  notes?: string
  iconLabel?: string
}

export interface SpecialtySummary {
  specialtyId: string
  name: string
  description?: string
  doctorsCount: number
  studiesCount: number
  templatesCount: number
  templatesActiveCount: number
  templatesPendingCount: number
  reportsCount: number
  pendingReportsCount: number
  concludedReportsCount: number
  pdfGeneratedCount: number
  appointmentsCount: number
  isActive: boolean
  mainStudies: string[]
}

export type StudyFormatType = 'structured' | 'narrative'

/** Alias semántico para plantillas de informe */
export type TemplateFormatType = StudyFormatType

export interface Study {
  id: string
  name: string
  block?:
    | 'Ecografía general'
    | 'Ecografía de partes blandas'
    | 'Ecografía articular'
    | 'Ecografía Doppler'
    | 'Elastografías'
    | 'Procedimientos'
    | 'Biopsias'
    | 'Radiografías domiciliarias'
  specialtyId: string
  templateId: string
  formatType: StudyFormatType
  isActive?: boolean
  code?: string
  specialtyName?: string
  activeReportTemplate?: ReportTemplate
}

export interface MedicalAttention {
  id: string
  patientId: string
  doctorId: string
  assistantId?: string
  specialtyId: string
  studyId: string
  reportTemplateId: string
  attentionDate: string
  attentionTime: string
  origin: PatientOrigin
  reason?: string
  observations?: string
  status: AppointmentStatus
  createdAt: string
  patient?: Patient
  study?: Study
  reportTemplate?: ReportTemplate
  medicalReport?: MedicalReport
}

export type AppointmentStatus =
  | 'pending_study'
  | 'study_done'
  | 'missing_report'
  | 'missing_diagnostic_impression'
  | 'in_review'
  | 'concluded'
  | 'pdf_generated'

export interface Appointment {
  id: string
  patientId: string
  doctorId: string
  specialtyId: string
  studyId: string
  appointmentDate: string
  appointmentTime: string
  reason: string
  notes?: string
  origin: PatientOrigin
  status: AppointmentStatus
  createdByRole: UserRole
  createdAt: string
}

export type NewAppointmentInitialStatus =
  | 'pending_study'
  | 'study_done'
  | 'missing_report'

export interface NewAppointmentInput {
  patientId: string
  doctorId: string
  specialtyId: string
  studyId: string
  appointmentDate: string
  appointmentTime: string
  reason: string
  notes?: string
  origin: PatientOrigin
  status: NewAppointmentInitialStatus
}

export type ReportStatus =
  | 'missing_report'
  | 'missing_diagnostic_impression'
  | 'in_review'
  | 'concluded'
  | 'pdf_generated'

export interface MedicalReport {
  id: string
  appointmentId: string
  patientId: string
  doctorId: string
  studyId: string
  templateId: string
  reportDate: string
  reportTime: string
  status: ReportStatus
  findingsSummary?: string
  diagnosticImpression?: string
  pdfPath?: string
  createdAt: string
  updatedAt: string
  assistantDoctorId?: string
  sections?: ReportSection[]
  /** Campos enriquecidos desde API (listados) */
  patientFullName?: string
  patientDni?: string
  studyName?: string
  doctorFullName?: string
  patient?: Patient
  study?: Study
  reportTemplate?: ReportTemplate
  doctor?: Doctor
  reportingPhysician?: Doctor
}

export interface ReportTemplateSection {
  id: string
  title: string
  order: number
  baseText: string
  isRequired: boolean
  voiceEnabled: boolean
}

export interface ReportSection extends ReportTemplateSection {
  content: string
}

export interface ReportTemplate {
  id: string
  studyId: string
  name: string
  formatType: TemplateFormatType
  description?: string
  sections: ReportTemplateSection[]
  isActive?: boolean
  /** false = plantilla pendiente de configuración completa */
  isComplete?: boolean
  updatedAt?: string
}

export interface ReportTemplateSectionInput extends ReportTemplateSection {
  notes?: string
}

export type DraftWorkflowStatus =
  | 'missing_report'
  | 'missing_diagnostic_impression'
  | 'in_review'
  | 'concluded'
  | 'pdf_generated'

export interface MedicalReportDraft {
  id: string
  appointmentId: string
  patientId: string
  doctorId: string
  studyId: string
  templateId: string
  sections: ReportSection[]
  diagnosticImpression: string
  status: DraftWorkflowStatus
  updatedAt: string
}

export interface ReportEditorContext {
  reportId?: string
  appointment: Appointment
  patient: Patient
  doctor: Doctor
  study: Study
  specialty: Specialty
  template: ReportTemplate
}

export type ProductivityPeriod = 'today' | 'week' | 'month' | 'custom'

export interface DoctorProductivitySummary {
  doctorId: string
  doctorName: string
  specialty: string
  cmp?: string
  rne?: string
  totalPatients: number
  totalStudies: number
  totalReports: number
  missingReports: number
  missingDiagnosticImpression: number
  inReview: number
  concluded: number
  pdfGenerated: number
  mainStudies: string[]
  averageReportsPerDay?: number
  lastActivityDate?: string
}

export interface StudyProductivitySummary {
  studyId: string
  studyName: string
  total: number
  concluded: number
  pending: number
}

export interface OriginProductivitySummary {
  origin: PatientOrigin
  total: number
}

export interface GeneralProductivitySummary {
  totalPatients: number
  totalStudies: number
  totalReports: number
  totalPending: number
  totalConcluded: number
  totalPdfGenerated: number
  mostRequestedStudy: string
  mostProductiveDoctor: string
  periodLabel: string
  trendHint: string
}

export interface ReportStatusDistributionItem {
  status: ReportStatus
  label: string
  count: number
}

export interface ProductivityFiltersState {
  period: ProductivityPeriod
  dateFrom: string
  dateTo: string
  doctorId: string
  specialtyId: string
  studyId: string
  origin: PatientOrigin | 'all'
}
