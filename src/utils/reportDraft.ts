import {
  cloneTemplateSections,
  findReportTemplateById,
  findReportTemplateByStudyId,
} from '@/data/mockReportTemplates'
import {
  findDoctorById,
  findMedicalReportById,
  findPatientById,
  findSpecialtyById,
  findStudyById,
  mockAppointments,
  mockMedicalReports,
} from '@/data/mockMedical'
import type {
  DraftWorkflowStatus,
  MedicalReportDraft,
  ReportEditorContext,
  ReportSection,
} from '@/types/medical'

export function findAppointmentById(id: string) {
  return mockAppointments.find((a) => a.id === id)
}

export function resolveReportEditorContext(
  reportId: string | null,
  appointmentId: string | null,
): ReportEditorContext | null {
  if (reportId) {
    const report = findMedicalReportById(reportId)
    if (!report) return null
    return buildContextFromIds({
      reportId: report.id,
      appointmentId: report.appointmentId,
      patientId: report.patientId,
      doctorId: report.doctorId,
      studyId: report.studyId,
      templateId: report.templateId,
    })
  }

  if (appointmentId) {
    const appointment = findAppointmentById(appointmentId)
    if (!appointment) return null
    const study = findStudyById(appointment.studyId)
    if (!study) return null
    return buildContextFromIds({
      appointmentId: appointment.id,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      studyId: appointment.studyId,
      templateId: study.templateId,
    })
  }

  return null
}

function buildContextFromIds(ids: {
  reportId?: string
  appointmentId: string
  patientId: string
  doctorId: string
  studyId: string
  templateId: string
}): ReportEditorContext | null {
  const appointment = findAppointmentById(ids.appointmentId)
  const patient = findPatientById(ids.patientId)
  const doctor = findDoctorById(ids.doctorId)
  const study = findStudyById(ids.studyId)
  const specialty = study ? findSpecialtyById(study.specialtyId) : undefined
  const template =
    findReportTemplateById(ids.templateId) ??
    findReportTemplateByStudyId(ids.studyId)

  if (!appointment || !patient || !doctor || !study || !specialty || !template) {
    return null
  }

  return {
    reportId: ids.reportId,
    appointment,
    patient,
    doctor,
    study,
    specialty,
    template,
  }
}

export function createDraftFromContext(
  context: ReportEditorContext,
  existingReportId?: string,
): MedicalReportDraft {
  const report = existingReportId
    ? findMedicalReportById(existingReportId)
    : undefined

  const sectionOverrides: Partial<Record<string, string>> = {}
  if (report?.findingsSummary) {
    if (context.template.formatType === 'narrative') {
      const firstId = context.template.sections[0]?.id
      if (firstId) sectionOverrides[firstId] = report.findingsSummary
    } else {
      const otros = context.template.sections.find((s) =>
        s.title.toLowerCase().includes('otros'),
      )
      if (otros) sectionOverrides[otros.id] = report.findingsSummary
    }
  }

  const sections = cloneTemplateSections(context.template, sectionOverrides)

  const draft: MedicalReportDraft = {
    id: report?.id ?? `draft-${Date.now()}`,
    appointmentId: context.appointment.id,
    patientId: context.patient.id,
    doctorId: context.doctor.id,
    studyId: context.study.id,
    templateId: context.template.id,
    sections,
    diagnosticImpression: report?.diagnosticImpression ?? '',
    status: mapReportStatusToDraft(report?.status),
    updatedAt: new Date().toISOString(),
  }

  draft.status = computeDraftStatus(draft)
  return draft
}

export function mapReportStatusToDraft(
  status?: string,
): DraftWorkflowStatus {
  if (
    status === 'missing_diagnostic_impression' ||
    status === 'in_review' ||
    status === 'concluded' ||
    status === 'pdf_generated'
  ) {
    return status
  }
  return 'missing_report'
}

/** Recalcula el estado según el contenido (al editar; no conserva concluido/PDF). */
export function recomputeWorkflowStatus(draft: {
  sections: ReportSection[]
  diagnosticImpression: string
}): DraftWorkflowStatus {
  const hasSectionContent = draft.sections.some((s) => hasMeaningfulContent(s.content))
  const hasImpression = hasMeaningfulContent(draft.diagnosticImpression)

  if (!hasSectionContent) return 'missing_report'
  if (!hasImpression) return 'missing_diagnostic_impression'
  return 'in_review'
}

export function computeDraftStatus(draft: {
  sections: ReportSection[]
  diagnosticImpression: string
  status: DraftWorkflowStatus
}): DraftWorkflowStatus {
  if (draft.status === 'concluded' || draft.status === 'pdf_generated') {
    return draft.status
  }

  return recomputeWorkflowStatus(draft)
}

function hasMeaningfulContent(text: string): boolean {
  return text.trim().length > 10
}

export function getPendingReportOptions() {
  return mockMedicalReports
    .filter(
      (r) =>
        r.status === 'missing_report' ||
        r.status === 'missing_diagnostic_impression' ||
        r.status === 'in_review',
    )
    .map((report) => {
      const patient = findPatientById(report.patientId)
      const study = findStudyById(report.studyId)
      return {
        reportId: report.id,
        appointmentId: report.appointmentId,
        label: `${patient?.fullName ?? 'Paciente'} — ${study?.name ?? 'Estudio'}`,
        status: report.status,
      }
    })
}

export function getFormatTypeLabel(formatType: 'structured' | 'narrative'): string {
  return formatType === 'structured'
    ? 'Estructurado por secciones'
    : 'Narrativo'
}

export const draftStatusLabels: Record<DraftWorkflowStatus, string> = {
  missing_report: 'Falta informe',
  missing_diagnostic_impression: 'Falta impresión',
  in_review: 'En revisión',
  concluded: 'Concluido',
  pdf_generated: 'PDF generado',
}
