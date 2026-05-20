import type { SettingsSectionId } from '@/types/settings'
import type { UserRole } from '@/types/auth'

export interface SettingsNavItem {
  id: SettingsSectionId
  label: string
  description: string
}

export const allSettingsSections: SettingsNavItem[] = [
  { id: 'clinic', label: 'Clínica', description: 'Datos institucionales' },
  { id: 'reports', label: 'Informes', description: 'Encabezado y pie' },
  { id: 'pdf', label: 'PDF', description: 'Generación de documentos' },
  { id: 'voice', label: 'Dictado', description: 'Voz a texto' },
  { id: 'ai', label: 'IA diagnóstica', description: 'Impresión sugerida' },
  { id: 'statuses', label: 'Estados', description: 'Flujo de informes' },
  { id: 'security', label: 'Seguridad', description: 'Sesiones y acceso' },
  { id: 'appearance', label: 'Apariencia', description: 'Tema visual' },
  { id: 'maintenance', label: 'Mantenimiento', description: 'Respaldo y sistema' },
]

const doctorSections: SettingsSectionId[] = ['voice', 'ai', 'appearance']
const adminSections: SettingsSectionId[] = allSettingsSections.map((s) => s.id)

export function getSectionsForRole(role: UserRole): SettingsSectionId[] {
  if (role === 'admin') return adminSections
  if (role === 'doctor') return doctorSections
  return []
}

export function canEditSettings(role: UserRole): boolean {
  return role === 'admin'
}

export function canEditSection(role: UserRole, section: SettingsSectionId): boolean {
  if (role === 'admin') return true
  if (role === 'doctor') return section === 'voice' || section === 'appearance'
  return false
}

export const inputClass =
  'mt-1 w-full rounded-lg border border-clinic-sky/80 bg-clinic-white px-3 py-2 text-sm text-clinic-text focus:border-clinic-blue focus:outline-none focus:ring-1 focus:ring-clinic-blue disabled:bg-clinic-bg disabled:text-clinic-text/60'

export const labelClass = 'block text-sm font-medium text-clinic-text'

export const sectionCardClass =
  'rounded-xl border border-clinic-sky/50 bg-clinic-white p-5 shadow-sm'
