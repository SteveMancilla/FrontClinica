import { apiGet, apiPost } from '@/services/apiClient'
import type { MedicalAttention, PatientOrigin } from '@/types/medical'
import { mapMedicalAttentionFromApi } from '@/utils/apiMappers'

export interface CreateMedicalAttentionPayload {
  patientId: string
  doctorId: string
  studyId: string
  attentionDate: string
  attentionTime: string
  origin: PatientOrigin
  reason?: string
  observations?: string
  status?: string
  assistantId?: string
  createdBy?: string
}

type CreateResponse = {
  message?: string
  data: unknown
}

/** Laravel valida attention_time con date_format:H:i (ej. "09:00") */
function normalizeAttentionTime(time: string): string {
  const trimmed = time.trim()
  const match = trimmed.match(/^(\d{1,2}):(\d{2})/)
  if (!match) return trimmed
  const hours = match[1].padStart(2, '0')
  const minutes = match[2]
  return `${hours}:${minutes}`
}

export async function getMedicalAttentions(): Promise<MedicalAttention[]> {
  const result = await apiGet<unknown[]>('/medical-attentions')
  const list = Array.isArray(result) ? result : []
  return list.map((item) => mapMedicalAttentionFromApi(item as Record<string, unknown>))
}

export async function getMedicalAttention(id: string): Promise<MedicalAttention> {
  const result = await apiGet<unknown>(`/medical-attentions/${id}`)
  const raw =
    result && typeof result === 'object' && 'data' in (result as object)
      ? (result as { data: unknown }).data
      : result
  return mapMedicalAttentionFromApi(raw as Record<string, unknown>)
}

export async function createMedicalAttention(
  payload: CreateMedicalAttentionPayload,
): Promise<MedicalAttention> {
  const body = {
    patient_id: Number(payload.patientId),
    doctor_id: Number(payload.doctorId),
    study_id: Number(payload.studyId),
    attention_date: payload.attentionDate,
    attention_time: normalizeAttentionTime(payload.attentionTime),
    origin: payload.origin,
    reason: payload.reason ?? null,
    observations: payload.observations ?? null,
    status: payload.status ?? 'pending_study',
    assistant_id: payload.assistantId ? Number(payload.assistantId) : null,
    created_by: payload.createdBy ? Number(payload.createdBy) : null,
  }

  const result = await apiPost<CreateResponse | unknown>('/medical-attentions', body)
  const raw =
    result && typeof result === 'object' && 'data' in (result as object)
      ? (result as CreateResponse).data
      : result

  return mapMedicalAttentionFromApi(raw as Record<string, unknown>)
}
