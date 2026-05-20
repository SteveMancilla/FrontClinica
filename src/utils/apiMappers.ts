import type {
  Appointment,
  Doctor,
  MedicalAttention,
  MedicalReport,
  ReportSection,
  Patient,
  ReportTemplate,
  ReportTemplateSection,
  Study,
  StudyFormatType,
} from '@/types/medical'

type JsonRecord = Record<string, unknown>

function str(value: unknown): string {
  return value == null ? '' : String(value)
}

function optionalStr(value: unknown): string | undefined {
  if (value == null || value === '') return undefined
  return String(value)
}

export function mapPatientFromApi(raw: JsonRecord): Patient {
  return {
    id: str(raw.id),
    dni: str(raw.dni),
    fullName: str(raw.full_name ?? raw.fullName),
    age: Number(raw.age ?? 0),
    sex: raw.sex as Patient['sex'],
    phone: str(raw.phone),
    address: optionalStr(raw.address),
    email: optionalStr(raw.email),
    origin: raw.origin as Patient['origin'],
    emergencyContactName: optionalStr(raw.emergency_contact_name ?? raw.emergencyContactName),
    emergencyContactPhone: optionalStr(raw.emergency_contact_phone ?? raw.emergencyContactPhone),
    notes: optionalStr(raw.notes),
    status: (raw.status as Patient['status']) ?? 'active',
    createdAt: str(raw.created_at ?? raw.createdAt ?? new Date().toISOString()),
    registeredByUserId: optionalStr(raw.registered_by ?? raw.registeredByUserId),
    primaryDoctorId: optionalStr(raw.primary_doctor_id ?? raw.primaryDoctorId),
  }
}

export function mapPatientToApi(input: {
  dni: string
  fullName: string
  age: number
  sex: string
  phone: string
  address?: string
  email?: string
  origin: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  notes?: string
  status?: string
}): JsonRecord {
  return {
    dni: input.dni,
    full_name: input.fullName,
    age: input.age,
    sex: input.sex,
    phone: input.phone,
    address: input.address || null,
    email: input.email || null,
    origin: input.origin,
    emergency_contact_name: input.emergencyContactName || null,
    emergency_contact_phone: input.emergencyContactPhone || null,
    notes: input.notes || null,
    status: input.status ?? 'active',
  }
}

function mapTemplateSectionFromApi(raw: JsonRecord): ReportTemplateSection {
  return {
    id: str(raw.id),
    title: str(raw.title),
    order: Number(raw.order_index ?? raw.order ?? 0),
    baseText: str(raw.base_text ?? raw.baseText),
    isRequired: Boolean(raw.is_required ?? raw.isRequired ?? true),
    voiceEnabled: Boolean(raw.voice_enabled ?? raw.voiceEnabled ?? true),
  }
}

export function mapReportTemplateFromApi(raw: JsonRecord): ReportTemplate {
  const sectionsRaw = (raw.sections ?? raw.report_template_sections ?? []) as JsonRecord[]
  const sections = sectionsRaw.map(mapTemplateSectionFromApi)

  return {
    id: str(raw.id),
    studyId: str(raw.study_id ?? raw.studyId),
    name: str(raw.name),
    formatType: str(raw.format_type ?? raw.formatType) as StudyFormatType,
    description: optionalStr(raw.description),
    isActive: (raw.status ?? 'active') === 'active',
    sections,
    isComplete: sections.length > 0,
    updatedAt: str(raw.updated_at ?? raw.updatedAt ?? new Date().toISOString()),
  }
}

export function mapStudyFromApi(raw: JsonRecord): Study {
  const templatesRaw = (raw.report_templates ?? raw.reportTemplates ?? []) as JsonRecord[]
  const activeTemplate = templatesRaw.find((t) => t.status === 'active')
  const specialty = raw.specialty as JsonRecord | undefined

  return {
    id: str(raw.id),
    name: str(raw.name),
    block: optionalStr(raw.block) as Study['block'],
    specialtyId: str(raw.specialty_id ?? specialty?.id ?? ''),
    templateId: activeTemplate ? str(activeTemplate.id) : '',
    formatType: str(raw.format_type ?? raw.formatType) as StudyFormatType,
    isActive: (raw.status ?? 'active') === 'active',
    code: optionalStr(raw.code),
    specialtyName: specialty ? str(specialty.name) : undefined,
    activeReportTemplate: activeTemplate
      ? mapReportTemplateFromApi(activeTemplate)
      : undefined,
  }
}

export function mapMedicalReportSectionFromApi(raw: JsonRecord): ReportSection {
  return {
    id: str(raw.id),
    title: str(raw.title),
    order: Number(raw.order_index ?? raw.order ?? 0),
    baseText: str(raw.base_text ?? raw.baseText ?? ''),
    content: str(raw.content ?? ''),
    isRequired: true,
    voiceEnabled: true,
  }
}

export function mapDoctorFromApi(raw: JsonRecord): Doctor {
  const title = str(raw.title ?? '')
  const specialty = str(raw.specialty ?? '')

  return {
    id: str(raw.id),
    fullName: str(raw.full_name ?? raw.fullName),
    specialty: title || specialty,
    position: optionalStr(raw.position),
    role: raw.role as Doctor['role'],
  }
}

export function mapMedicalReportFromApi(raw: JsonRecord): MedicalReport {
  const sectionsRaw = (raw.sections ?? []) as JsonRecord[]
  const patient = raw.patient as JsonRecord | undefined
  const study = raw.study as JsonRecord | undefined
  const doctor = raw.doctor as JsonRecord | undefined
  const reportingPhysicianRaw = raw.reporting_physician as JsonRecord | undefined
  const reportTemplate = raw.report_template as JsonRecord | undefined

  const reportingPhysician = reportingPhysicianRaw
    ? mapDoctorFromApi(reportingPhysicianRaw)
    : undefined

  return {
    id: str(raw.id),
    appointmentId: str(raw.medical_attention_id ?? raw.appointmentId),
    patientId: str(raw.patient_id ?? raw.patientId),
    doctorId: str(raw.doctor_id ?? raw.doctorId),
    studyId: str(raw.study_id ?? raw.studyId),
    templateId: str(raw.report_template_id ?? raw.templateId),
    reportDate: str(raw.created_at ?? '').slice(0, 10),
    reportTime: '00:00',
    status: raw.status as MedicalReport['status'],
    diagnosticImpression: optionalStr(raw.diagnostic_impression ?? raw.diagnosticImpression),
    pdfPath: optionalStr(raw.pdf_path ?? raw.pdfPath),
    createdAt: str(raw.created_at ?? new Date().toISOString()),
    updatedAt: str(raw.updated_at ?? new Date().toISOString()),
    sections: sectionsRaw.map(mapMedicalReportSectionFromApi),
    patientFullName: patient ? str(patient.full_name ?? patient.fullName) : undefined,
    patientDni: patient ? str(patient.dni) : undefined,
    studyName: study ? str(study.name) : undefined,
    doctorFullName: doctor ? str(doctor.full_name ?? doctor.fullName) : undefined,
    patient: patient ? mapPatientFromApi(patient) : undefined,
    study: study ? mapStudyFromApi(study) : undefined,
    reportTemplate: reportTemplate ? mapReportTemplateFromApi(reportTemplate) : undefined,
    doctor: reportingPhysician ?? (doctor ? mapDoctorFromApi(doctor) : undefined),
    reportingPhysician,
  }
}

export function mapMedicalAttentionToAppointment(attention: MedicalAttention): Appointment {
  return {
    id: attention.id,
    patientId: attention.patientId,
    doctorId: attention.doctorId,
    specialtyId: attention.specialtyId,
    studyId: attention.studyId,
    appointmentDate: attention.attentionDate,
    appointmentTime: attention.attentionTime,
    reason: attention.reason ?? '',
    notes: attention.observations,
    origin: attention.origin,
    status: attention.status,
    createdByRole: 'admin',
    createdAt: attention.createdAt,
  }
}

export function mapMedicalAttentionFromApi(raw: JsonRecord): MedicalAttention {
  const medicalReportRaw = raw.medical_report ?? raw.medicalReport

  return {
    id: str(raw.id),
    patientId: str(raw.patient_id ?? raw.patientId),
    doctorId: str(raw.doctor_id ?? raw.doctorId),
    assistantId: optionalStr(raw.assistant_id ?? raw.assistantId),
    specialtyId: str(raw.specialty_id ?? raw.specialtyId),
    studyId: str(raw.study_id ?? raw.studyId),
    reportTemplateId: str(raw.report_template_id ?? raw.reportTemplateId),
    attentionDate: str(raw.attention_date ?? raw.attentionDate),
    attentionTime: str(raw.attention_time ?? raw.attentionTime).slice(0, 5),
    origin: raw.origin as MedicalAttention['origin'],
    reason: optionalStr(raw.reason),
    observations: optionalStr(raw.observations),
    status: raw.status as MedicalAttention['status'],
    createdAt: str(raw.created_at ?? new Date().toISOString()),
    patient: raw.patient ? mapPatientFromApi(raw.patient as JsonRecord) : undefined,
    study: raw.study ? mapStudyFromApi(raw.study as JsonRecord) : undefined,
    reportTemplate: raw.report_template
      ? mapReportTemplateFromApi(raw.report_template as JsonRecord)
      : undefined,
    medicalReport: medicalReportRaw
      ? mapMedicalReportFromApi(medicalReportRaw as JsonRecord)
      : undefined,
  }
}

export function mapApiValidationErrors(
  errors?: Record<string, string[]>,
): Record<string, string> {
  if (!errors) return {}

  const mapped: Record<string, string> = {}
  const fieldMap: Record<string, string> = {
    full_name: 'fullName',
    emergency_contact_name: 'emergencyContactName',
    emergency_contact_phone: 'emergencyContactPhone',
  }

  for (const [key, messages] of Object.entries(errors)) {
    const camelKey = fieldMap[key] ?? key
    mapped[camelKey] = messages[0] ?? 'Valor inválido'
  }

  return mapped
}
