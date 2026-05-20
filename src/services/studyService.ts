import { apiDelete, apiGet, apiPost, apiPut } from '@/services/apiClient'
import type { Study, StudyFormatType } from '@/types/medical'
import { mapStudyFromApi } from '@/utils/apiMappers'
import type { StudyBlock } from '@/utils/studyGrouping'

export interface StudyInput {
  specialtyId: string
  name: string
  block: StudyBlock
  formatType: StudyFormatType
  code?: string
  status?: 'active' | 'inactive'
}

function mapStudyInputToApi(input: StudyInput): Record<string, unknown> {
  return {
    specialty_id: Number(input.specialtyId),
    name: input.name.trim(),
    block: input.block,
    format_type: input.formatType,
    code: input.code?.trim() || null,
    status: input.status ?? 'active',
  }
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

export async function getStudies(catalog = false): Promise<Study[]> {
  const query = catalog ? '?catalog=1' : ''
  const result = await apiGet<unknown[]>(`/studies${query}`)
  return unwrapList(result).map((item) => mapStudyFromApi(item as Record<string, unknown>))
}

export async function getStudy(id: string): Promise<Study> {
  const result = await apiGet<unknown>(`/studies/${id}`)
  return mapStudyFromApi(unwrapItem(result))
}

export async function createStudy(input: StudyInput): Promise<Study> {
  const result = await apiPost<unknown>('/studies', mapStudyInputToApi(input))
  return mapStudyFromApi(unwrapItem(result))
}

export async function updateStudy(id: string, input: Partial<StudyInput>): Promise<Study> {
  const body: Record<string, unknown> = {}
  if (input.specialtyId !== undefined) body.specialty_id = Number(input.specialtyId)
  if (input.name !== undefined) body.name = input.name.trim()
  if (input.block !== undefined) body.block = input.block
  if (input.formatType !== undefined) body.format_type = input.formatType
  if (input.code !== undefined) body.code = input.code.trim() || null
  if (input.status !== undefined) body.status = input.status

  const result = await apiPut<unknown>(`/studies/${id}`, body)
  return mapStudyFromApi(unwrapItem(result))
}

export async function deleteStudy(id: string): Promise<void> {
  await apiDelete(`/studies/${id}`)
}
