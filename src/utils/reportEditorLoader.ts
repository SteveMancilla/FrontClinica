import { getMedicalAttention } from '@/services/medicalAttentionService'
import { getMedicalReport } from '@/services/medicalReportService'
import type {
  Doctor,
  MedicalReport,
  MedicalReportDraft,
  ReportEditorContext,
  ReportTemplate,
  Specialty,
} from '@/types/medical'
import { mapMedicalAttentionToAppointment } from '@/utils/apiMappers'
import {
  computeDraftStatus,
  mapReportStatusToDraft,
} from '@/utils/reportDraft'

export function createDraftFromApiReport(report: MedicalReport): MedicalReportDraft {
  const sections = (report.sections ?? [])
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((section) => ({
      ...section,
      content: section.content ?? '',
    }))

  const draft: MedicalReportDraft = {
    id: report.id,
    appointmentId: report.appointmentId,
    patientId: report.patientId,
    doctorId: report.doctorId,
    studyId: report.studyId,
    templateId: report.templateId,
    sections,
    diagnosticImpression: report.diagnosticImpression ?? '',
    status: mapReportStatusToDraft(report.status),
    updatedAt: report.updatedAt,
  }

  draft.status = computeDraftStatus(draft)
  return draft
}

function resolveTemplate(report: MedicalReport): ReportTemplate {
  const fromApi = report.reportTemplate
  const fromSections = (report.sections ?? []).map((section) => ({
    id: section.id,
    title: section.title,
    order: section.order,
    baseText: section.baseText,
    isRequired: section.isRequired,
    voiceEnabled: section.voiceEnabled,
  }))

  return {
    id: report.templateId,
    studyId: report.studyId,
    name: fromApi?.name ?? report.studyName ?? 'Plantilla clínica',
    formatType: fromApi?.formatType ?? report.study?.formatType ?? 'structured',
    description: fromApi?.description,
    sections: fromApi?.sections?.length ? fromApi.sections : fromSections,
  }
}

function buildEditorFromReport(
  report: MedicalReport,
): { context: ReportEditorContext; draft: MedicalReportDraft } {
  if (!report.patient) {
    throw new Error('El informe no incluye datos del paciente.')
  }
  if (!report.study) {
    throw new Error('El informe no incluye datos del estudio.')
  }

  const patient = report.patient
  const study = { ...report.study, templateId: report.templateId }
  const template = resolveTemplate(report)

  const doctor: Doctor =
    report.reportingPhysician ??
    report.doctor ??
    ({
      id: report.doctorId,
      fullName: report.doctorFullName ?? 'Médico responsable',
      specialty: study.specialtyName ?? '',
    } satisfies Doctor)

  const specialty: Specialty = {
    id: study.specialtyId,
    name: study.specialtyName ?? 'Especialidad',
  }

  return {
    context: {
      reportId: report.id,
      appointment: mapMedicalAttentionToAppointment({
        id: report.appointmentId,
        patientId: report.patientId,
        doctorId: report.doctorId,
        specialtyId: study.specialtyId,
        studyId: report.studyId,
        reportTemplateId: report.templateId,
        attentionDate: report.reportDate,
        attentionTime: report.reportTime,
        origin: patient.origin,
        status: report.status,
        createdAt: report.createdAt,
      }),
      patient,
      doctor,
      study,
      specialty,
      template,
    },
    draft: createDraftFromApiReport(report),
  }
}

export async function loadReportEditor(
  reportId: string | null,
  appointmentId: string | null,
): Promise<{ context: ReportEditorContext; draft: MedicalReportDraft } | null> {
  if (reportId) {
    const report = await getMedicalReport(reportId)
    const result = buildEditorFromReport(report)
    try {
      const attention = await getMedicalAttention(report.appointmentId)
      result.context.appointment = mapMedicalAttentionToAppointment(attention)
    } catch {
      // Mantener fecha derivada del informe si falla la atención
    }
    return result
  }

  if (appointmentId) {
    const attention = await getMedicalAttention(appointmentId)
    const nestedReportId = attention.medicalReport?.id
    if (!nestedReportId) return null

    const report = await getMedicalReport(nestedReportId)
    const result = buildEditorFromReport(report)
    result.context.appointment = mapMedicalAttentionToAppointment(attention)
    return result
  }

  return null
}
