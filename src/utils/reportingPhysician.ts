import type { SystemUser, UserRole } from '@/types/auth'
import type { Doctor } from '@/types/medical'
import { formatDoctorHonorificName } from '@/utils/doctorDisplay'

/** Usuario con datos mínimos para firma en informe */
export interface ReportingPhysicianSource {
  id?: string
  fullName: string
  role?: UserRole
  specialty?: string
  position?: string
  associatedDoctorId?: string
}

export function formatPhysicianTitle(source: ReportingPhysicianSource | null | undefined): string {
  if (!source) return '—'

  const position = source.position?.trim()
  if (source.role === 'admin' && position) {
    return position.toUpperCase()
  }

  const specialty = source.specialty?.trim()
  if (specialty) return specialty.toUpperCase()

  if (position && source.role === 'doctor') {
    return position.toUpperCase()
  }

  return '—'
}

export function formatPhysicianHonorificName(fullName: string): string {
  return formatDoctorHonorificName(fullName).toUpperCase()
}

export function resolveReportingPhysicianFromUsers(
  users: SystemUser[],
  sessionUserId: string,
): SystemUser | null {
  const self = users.find((u) => u.id === sessionUserId)
  if (!self) return null

  if (self.role === 'assistant') {
    if (self.associatedDoctorId) {
      const doctor = users.find((u) => u.id === self.associatedDoctorId)
      if (doctor && (doctor.role === 'doctor' || doctor.role === 'admin')) {
        return doctor
      }
    }
    return null
  }

  if (self.role === 'doctor' || self.role === 'admin') {
    return self
  }

  return users.find((u) => u.role === 'doctor' && u.status === 'active') ?? null
}

export function toDoctorFromReportingSource(source: ReportingPhysicianSource): Doctor {
  return {
    id: source.id ?? '',
    fullName: source.fullName,
    specialty: formatPhysicianTitle(source),
    position: source.position,
    role: source.role,
  }
}

export function mapReportingPhysicianFromApi(raw: Record<string, unknown>): Doctor {
  return {
    id: String(raw.id ?? ''),
    fullName: String(raw.full_name ?? raw.fullName ?? ''),
    specialty: String(raw.title ?? raw.specialty ?? ''),
    position: raw.position ? String(raw.position) : undefined,
    role: raw.role as UserRole | undefined,
  }
}
