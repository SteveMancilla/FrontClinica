import { apiDelete, apiGet, apiPost, apiPut } from '@/services/apiClient'
import type { ReportTemplate, ReportTemplateSection, StudyFormatType } from '@/types/medical'
import { mapReportTemplateFromApi } from '@/utils/apiMappers'

export interface ReportTemplateInput {
  studyId: string
  name: string
  formatType: StudyFormatType
  description?: string
  status?: 'active' | 'inactive'
  activate?: boolean
  sections?: ReportTemplateSection[]
}

function unwrapList(result: unknown): unknown[] {
  return Array.isArray(result) ? result : []
}

function unwrapItem(result: unknown): Record<string, unknown> {
  if (result && typeof result === 'object' && 'data' in (result as object)) {
    return (result as { data: unknown }).data as Record<string, unknown>
  }
  return result as Record<string, unknown>
}

function mapSectionsToApi(sections: ReportTemplateSection[]): Record<string, unknown>[] {
  return sections.map((section, index) => ({
    id: /^\d+$/.test(section.id) ? Number(section.id) : undefined,
    title: section.title,
    order_index: section.order || index + 1,
    base_text: section.baseText,
    is_required: section.isRequired,
    voice_enabled: section.voiceEnabled,
  }))
}

function mapTemplateInputToApi(input: ReportTemplateInput): Record<string, unknown> {
  const body: Record<string, unknown> = {
    study_id: Number(input.studyId),
    name: input.name.trim(),
    format_type: input.formatType,
    description: input.description?.trim() || null,
    status: input.status ?? 'inactive',
  }

  if (input.sections) {
    body.sections = mapSectionsToApi(input.sections)
  }
  if (input.activate !== undefined) {
    body.activate = input.activate
  }

  return body
}

export async function getReportTemplates(catalog = false): Promise<ReportTemplate[]> {
  const query = catalog ? '?catalog=1' : ''
  const result = await apiGet<unknown[]>(`/report-templates${query}`)
  return unwrapList(result).map((item) =>
    mapReportTemplateFromApi(item as Record<string, unknown>),
  )
}

export async function getReportTemplate(id: string): Promise<ReportTemplate> {
  const result = await apiGet<unknown>(`/report-templates/${id}`)
  return mapReportTemplateFromApi(unwrapItem(result))
}

export async function createReportTemplate(input: ReportTemplateInput): Promise<ReportTemplate> {
  const result = await apiPost<unknown>('/report-templates', mapTemplateInputToApi(input))
  return mapReportTemplateFromApi(unwrapItem(result))
}

export async function updateReportTemplate(
  id: string,
  input: ReportTemplateInput,
): Promise<ReportTemplate> {
  const result = await apiPut<unknown>(`/report-templates/${id}`, mapTemplateInputToApi(input))
  return mapReportTemplateFromApi(unwrapItem(result))
}

export async function deleteReportTemplate(id: string): Promise<void> {
  await apiDelete(`/report-templates/${id}`)
}

export async function restoreDefaultReportTemplates(): Promise<string> {
  const result = await apiPost<{ message?: string }>('/report-templates/restore-defaults', {})
  return result?.message ?? 'Plantillas predeterminadas restauradas.'
}
