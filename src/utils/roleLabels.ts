import type { UserRole } from '@/types/auth'

const roleLabels: Record<UserRole, string> = {
  admin: 'Administrador',
  doctor: 'Médico',
  assistant: 'Asistente',
}

export function getRoleLabel(role: UserRole): string {
  return roleLabels[role]
}
