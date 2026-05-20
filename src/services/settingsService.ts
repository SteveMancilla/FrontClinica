import { apiGet, apiPut } from '@/services/apiClient'
import type { SystemSettings } from '@/types/settings'

export async function getSystemSettings(): Promise<SystemSettings> {
  const result = await apiGet<unknown>('/settings')
  const raw =
    result && typeof result === 'object' && 'data' in (result as object)
      ? (result as { data: unknown }).data
      : result
  return raw as SystemSettings
}

export async function saveSystemSettings(settings: SystemSettings): Promise<SystemSettings> {
  const result = await apiPut<unknown>('/settings', { data: settings })
  const raw =
    result && typeof result === 'object' && 'data' in (result as object)
      ? (result as { data: unknown }).data
      : result
  return raw as SystemSettings
}
