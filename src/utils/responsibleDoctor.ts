import type { AuthUser, SystemUser, UserRole } from '@/types/auth'
import type { Doctor } from '@/types/medical'
import type { ApiUserOption } from '@/services/userService'

/** Texto de especialidad o cargo para listados y combos */
export function formatResponsibleDoctorTitle(
  user: Pick<SystemUser | ApiUserOption, 'specialty' | 'position' | 'role'>,
): string {
  const specialty = 'specialty' in user ? user.specialty?.trim() : undefined
  const position = 'position' in user ? user.position?.trim() : undefined
  const role = user.role as UserRole | undefined

  if (specialty) return specialty
  if (position) return position
  if (role === 'admin') return 'Administrador'
  return ''
}

export function formatResponsibleDoctorOptionLabel(
  user: Pick<ApiUserOption, 'fullName' | 'specialty' | 'position' | 'role'>,
): string {
  const title = formatResponsibleDoctorTitle(user)
  return title ? `${user.fullName} — ${title}` : user.fullName
}

/** ID de usuario que debe figurar como médico responsable al crear una atención */
export function resolveDefaultResponsibleDoctorId(user: AuthUser | null): string {
  if (!user) return ''

  if (user.role === 'assistant') {
    return user.associatedDoctorId ?? ''
  }

  if (user.role === 'doctor' || user.role === 'admin') {
    return user.id
  }

  return ''
}

export function canSignMedicalReports(role: UserRole): boolean {
  return role === 'doctor' || role === 'admin'
}

export function usersToResponsibleDoctorOptions(users: SystemUser[]): ApiUserOption[] {
  return users
    .filter((u) => u.status === 'active' && canSignMedicalReports(u.role))
    .map((u) => ({
      id: u.id,
      dni: u.dni,
      fullName: u.fullName,
      email: u.email,
      role: u.role,
      specialty: u.specialty,
      position: u.position,
      status: u.status,
    }))
}

export function usersToDoctorLookup(users: SystemUser[]): Doctor[] {
  return users
    .filter((u) => u.status === 'active' && canSignMedicalReports(u.role))
    .map((u) => ({
      id: u.id,
      fullName: u.fullName,
      specialty: formatResponsibleDoctorTitle(u) || u.specialty || '',
      position: u.position,
      role: u.role,
    }))
}

export function findResponsibleDoctorByUserId(
  users: SystemUser[],
  userId: string,
): Doctor | undefined {
  const user = users.find((u) => u.id === userId)
  if (!user || !canSignMedicalReports(user.role)) return undefined
  return {
    id: user.id,
    fullName: user.fullName,
    specialty: formatResponsibleDoctorTitle(user) || user.specialty || '',
    position: user.position,
    role: user.role,
  }
}

export function getResponsibleDoctorDisplayName(
  users: SystemUser[],
  userId: string,
): string {
  const user = users.find((u) => u.id === userId)
  if (!user) return '—'
  return formatResponsibleDoctorOptionLabel({
    fullName: user.fullName,
    role: user.role,
    specialty: user.specialty,
    position: user.position,
  })
}
