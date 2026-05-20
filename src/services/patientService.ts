import { apiGet, apiPost, apiPut } from '@/services/apiClient'
import type { Patient } from '@/types/medical'
import { mapPatientFromApi, mapPatientToApi } from '@/utils/apiMappers'
import type { PatientFormInput } from '@/components/medical/PatientFormDrawer'

type PatientListResponse = { data: unknown[] }
type PatientItemResponse = { data: unknown }

export async function getPatients(search?: string): Promise<Patient[]> {
  const query = search?.trim() ? `?search=${encodeURIComponent(search.trim())}` : ''
  const result = await apiGet<Patient[] | PatientListResponse>(`/patients${query}`)
  const list = Array.isArray(result) ? result : (result.data ?? [])
  return list.map((item) => mapPatientFromApi(item as Record<string, unknown>))
}

export async function getPatient(id: string): Promise<Patient> {
  const result = await apiGet<unknown>(`/patients/${id}`)
  const raw =
    result && typeof result === 'object' && 'data' in (result as object)
      ? (result as PatientItemResponse).data
      : result
  return mapPatientFromApi(raw as Record<string, unknown>)
}

export async function createPatient(input: PatientFormInput): Promise<Patient> {
  const result = await apiPost<unknown>('/patients', mapPatientToApi(input))
  const raw =
    result && typeof result === 'object' && 'data' in (result as object)
      ? (result as PatientItemResponse).data
      : result
  return mapPatientFromApi(raw as Record<string, unknown>)
}

export async function updatePatient(id: string, input: PatientFormInput): Promise<Patient> {
  const result = await apiPut<unknown>(`/patients/${id}`, mapPatientToApi(input))
  const raw =
    result && typeof result === 'object' && 'data' in (result as object)
      ? (result as PatientItemResponse).data
      : result
  return mapPatientFromApi(raw as Record<string, unknown>)
}
