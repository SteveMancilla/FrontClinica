import { apiGet } from '@/services/apiClient'

export interface SpecialtyOption {
  id: string
  name: string
}

export async function getSpecialties(): Promise<SpecialtyOption[]> {
  const result = await apiGet<unknown[]>('/specialties')
  const list = Array.isArray(result) ? result : []
  return list.map((item) => {
    const raw = item as Record<string, unknown>
    return {
      id: String(raw.id),
      name: String(raw.name ?? ''),
    }
  })
}
