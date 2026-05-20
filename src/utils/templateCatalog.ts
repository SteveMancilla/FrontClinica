import type { ReportTemplate, Study } from '@/types/medical'
import type { StatusBadgeVariant } from '@/utils/appointmentStatus'

export type StudyCatalogStatus =
  | 'active'
  | 'inactive'
  | 'no_template'
  | 'template_not_found'
  | 'incomplete'

export const studyCatalogStatusVariants: Record<
  StudyCatalogStatus,
  StatusBadgeVariant
> = {
  active: 'success',
  inactive: 'neutral',
  no_template: 'warning',
  template_not_found: 'danger',
  incomplete: 'warning',
}

export const studyCatalogStatusLabels: Record<StudyCatalogStatus, string> = {
  active: 'Activo',
  inactive: 'Inactivo',
  no_template: 'Sin plantilla',
  template_not_found: 'Plantilla no encontrada',
  incomplete: 'Plantilla incompleta',
}

export function isTemplateComplete(template: ReportTemplate): boolean {
  if (template.sections.length === 0) return false
  if (template.formatType === 'narrative') {
    return template.sections.some((section) => section.title.trim().length > 0)
  }
  return template.sections.some((section) => section.title.trim().length > 0)
}

export function getDefaultTemplateForStudy(
  study: Study,
  templates: ReportTemplate[],
): ReportTemplate | undefined {
  const activeForStudy = templates.find(
    (t) => t.studyId === study.id && t.isActive !== false,
  )
  if (activeForStudy) return activeForStudy
  if (study.templateId) {
    return templates.find((t) => t.id === study.templateId)
  }
  return study.activeReportTemplate
}

export function getStudyCatalogStatus(
  study: Study,
  templates: ReportTemplate[],
): StudyCatalogStatus {
  if (study.isActive === false) return 'inactive'
  const template = getDefaultTemplateForStudy(study, templates)
  if (!template) return 'no_template'
  if (!isTemplateComplete(template)) return 'incomplete'
  if (template.isActive === false) return 'inactive'
  return 'active'
}

export function getFormatTypeLabel(formatType: Study['formatType']): string {
  return formatType === 'structured'
    ? 'Estructurado por secciones'
    : 'Narrativo'
}

export function getDictationModeLabel(formatType: Study['formatType']): string {
  return formatType === 'structured'
    ? 'Dictado por secciones'
    : 'Dictado en campo único'
}

export function cloneCatalogData(): {
  studies: Study[]
  templates: ReportTemplate[]
} {
  return {
    studies: [],
    templates: [],
  }
}

export function getTemplateSummary(
  studies: Study[],
  templates: ReportTemplate[],
) {
  return {
    totalStudies: studies.length,
    activeTemplates: templates.filter((t) => t.isActive !== false && isTemplateComplete(t)).length,
    structured: templates.filter((t) => t.formatType === 'structured').length,
    narrative: templates.filter((t) => t.formatType === 'narrative').length,
    incomplete: templates.filter((t) => !isTemplateComplete(t)).length,
  }
}

/** Plantilla activa del estudio (la que usa el flujo clínico). */
export function resolveTemplateForStudy(
  study: Study,
  templates: ReportTemplate[],
): ReportTemplate | undefined {
  return getDefaultTemplateForStudy(study, templates)
}

export function resolveTemplatesForStudy(
  study: Study,
  templates: ReportTemplate[],
): ReportTemplate[] {
  return templates.filter((t) => t.studyId === study.id)
}

export function getSpecialtyName(specialtyId: string): string {
  return specialtyId || '—'
}
