import type { AuthUser, SystemUser, UserRole } from '@/types/auth'
import { mockUsers } from '@/data/mockUsers'
import { mockAppointments, mockMedicalReports } from '@/data/mockMedical'

export interface UserFilters {
  search: string
  role: UserRole | 'all'
  specialty: string
  status: 'all' | 'active' | 'inactive'
  associatedDoctorId: string
  position: string
}

export const defaultUserFilters: UserFilters = {
  search: '',
  role: 'all',
  specialty: 'all',
  status: 'all',
  associatedDoctorId: 'all',
  position: 'all',
}

export function getUserInitials(fullName: string): string {
  const cleaned = fullName.replace(/^(Dr\.|Dra\.)\s*/i, '').trim()
  const parts = cleaned.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

export function resolveDoctorDisplayName(
  doctorId: string | undefined,
  users: SystemUser[] = [],
): string {
  if (!doctorId) return 'Sin médico asociado'
  const doctor = users.find(
    (u) => u.id === doctorId || u.doctorId === doctorId,
  )
  return doctor?.fullName ?? doctorId
}

export function enrichUser(
  user: SystemUser | null | undefined,
  allUsers: SystemUser[] = [],
): SystemUser | null {
  if (!user) return null

  const associatedDoctorName =
    user.associatedDoctorName ??
    (user.associatedDoctorId
      ? resolveDoctorDisplayName(user.associatedDoctorId, allUsers)
      : undefined)

  return { ...user, associatedDoctorName }
}

export function getUsersForCurrentUser(
  currentUser: AuthUser | null,
  users: SystemUser[],
): SystemUser[] {
  if (!currentUser) return []

  const enriched = users
    .map((u) => enrichUser(u, users))
    .filter((u): u is SystemUser => u !== null)

  if (currentUser.role === 'admin') return enriched

  if (currentUser.role === 'doctor') {
    return enriched.filter(
      (u) =>
        u.id === currentUser.id ||
        (u.role === 'assistant' && u.associatedDoctorId === currentUser.id),
    )
  }

  if (currentUser.role === 'assistant') {
    const self = enriched.find((u) => u.id === currentUser.id)
    return self ? [self] : []
  }

  return []
}

export function filterUsers(users: SystemUser[], filters: UserFilters): SystemUser[] {
  const q = filters.search.trim().toLowerCase()

  return users.filter((user) => {
    if (filters.role !== 'all' && user.role !== filters.role) return false
    if (filters.status !== 'all' && user.status !== filters.status) return false
    if (
      filters.associatedDoctorId !== 'all' &&
      user.associatedDoctorId !== filters.associatedDoctorId
    ) {
      return false
    }
    if (filters.specialty !== 'all') {
      const spec = user.specialty ?? ''
      if (!spec.toLowerCase().includes(filters.specialty.toLowerCase())) return false
    }
    if (filters.position !== 'all' && user.position !== filters.position) {
      return false
    }
    if (q) {
      const haystack = [user.fullName, user.dni, user.email, user.phone]
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })
}

export function getAdminUserSummary(users: SystemUser[]) {
  const assistants = users.filter((u) => u.role === 'assistant')
  const doctors = users.filter((u) => u.role === 'doctor')
  const lastAssistant = [...assistants].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  )[0]

  return {
    total: users.length,
    activeDoctors: doctors.filter((d) => d.status === 'active').length,
    activeAssistants: assistants.filter((a) => a.status === 'active').length,
    inactive: users.filter((u) => u.status === 'inactive').length,
    lastAssistantName: lastAssistant?.fullName,
  }
}

export function getDoctorUserSummary(users: SystemUser[]) {
  const assistants = users.filter((u) => u.role === 'assistant')
  const last = [...assistants].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]

  return {
    totalAssistants: assistants.length,
    activeAssistants: assistants.filter((a) => a.status === 'active').length,
    inactiveAssistants: assistants.filter((a) => a.status === 'inactive').length,
    lastAssistantName: last?.fullName ?? '—',
  }
}

export function getAssistantsForDoctor(
  doctorId: string,
  users: SystemUser[],
): SystemUser[] {
  return users
    .filter((u) => u.role === 'assistant' && u.associatedDoctorId === doctorId)
    .map((u) => enrichUser(u, users))
    .filter((u): u is SystemUser => u !== null)
}

export function getDoctorStats(user: SystemUser) {
  if (!user.doctorId) {
    return { reports: 0, studies: 0, assistants: 0 }
  }
  const reports = mockMedicalReports.filter((r) => r.doctorId === user.doctorId).length
  const studies = mockAppointments.filter((a) => a.doctorId === user.doctorId).length
  const assistants = mockUsers.filter(
    (u) => u.role === 'assistant' && u.associatedDoctorId === user.doctorId,
  ).length
  return { reports, studies, assistants }
}

export function getAssistantStats(_user: SystemUser) {
  const patientsRegistered = mockAppointments.filter(
    (a) => a.createdByRole === 'assistant' && a.patientId,
  ).length
  const appointmentsCreated = mockAppointments.filter(
    (a) => a.createdByRole === 'assistant',
  ).length
  return { patientsRegistered, appointmentsCreated }
}

export const roleLabels: Record<UserRole, string> = {
  admin: 'Administrador',
  doctor: 'Médico',
  assistant: 'Asistente',
}

export const rolePermissions: Record<UserRole, string[]> = {
  admin: [
    'Gestión completa del sistema',
    'Gestión de médicos y asistentes',
    'Ver productividad global',
    'Configurar plantillas',
    'Ver todos los informes',
  ],
  doctor: [
    'Registrar pacientes',
    'Crear atenciones',
    'Dictar informes',
    'Generar impresión diagnóstica',
    'Ver su productividad',
    'Crear asistentes',
  ],
  assistant: [
    'Registrar pacientes',
    'Crear atenciones',
    'Preparar estudios',
    'Ver pacientes asociados',
    'No validar informes médicos',
  ],
}

export function getSpecialtyOptions(users: SystemUser[]): string[] {
  const set = new Set<string>()
  users.forEach((u) => {
    if (u.specialty) set.add(u.specialty)
  })
  return [...set].sort()
}

export function getPositionOptions(users: SystemUser[]): string[] {
  const set = new Set<string>()
  users.forEach((u) => {
    if (u.position) set.add(u.position)
  })
  return [...set].sort()
}

export function getDoctorOptionsForSelect(users: SystemUser[]) {
  return users
    .filter((u) => u.role === 'doctor' && u.status === 'active')
    .map((u) => ({
      id: u.id,
      name: u.fullName,
    }))
}
