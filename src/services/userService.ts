import { apiGet, apiPost, apiPut } from '@/services/apiClient'
import { usersToResponsibleDoctorOptions } from '@/utils/responsibleDoctor'
import type { AuthUser, SystemUser, UserRole } from '@/types/auth'
import type { UserFormInput } from '@/components/users/UserFormDrawer'

export interface ApiUserOption {
  id: string
  dni?: string
  fullName: string
  email: string
  role: string
  specialty?: string
  position?: string
  status: string
}

export function mapSystemUserFromApi(raw: Record<string, unknown>): SystemUser {
  return {
    id: String(raw.id),
    dni: String(raw.dni ?? ''),
    fullName: String(raw.full_name ?? raw.fullName ?? ''),
    email: String(raw.email ?? ''),
    phone: String(raw.phone ?? ''),
    address: raw.address ? String(raw.address) : undefined,
    role: String(raw.role ?? 'assistant') as UserRole,
    status: (raw.status === 'inactive' ? 'inactive' : 'active') as SystemUser['status'],
    specialty: raw.specialty ? String(raw.specialty) : undefined,
    cmp: raw.cmp ? String(raw.cmp) : undefined,
    rne: raw.rne ? String(raw.rne) : undefined,
    position: raw.position ? String(raw.position) : undefined,
    originCity: raw.origin_city
      ? String(raw.origin_city)
      : raw.originCity
        ? String(raw.originCity)
        : undefined,
    supportArea: raw.support_area
      ? String(raw.support_area)
      : raw.supportArea
        ? String(raw.supportArea)
        : undefined,
    notes: raw.notes ? String(raw.notes) : undefined,
    associatedDoctorId: raw.associated_doctor_id
      ? String(raw.associated_doctor_id)
      : undefined,
    associatedDoctorName: raw.associated_doctor_name
      ? String(raw.associated_doctor_name)
      : undefined,
    createdAt: String(raw.created_at ?? new Date().toISOString()),
  }
}

export function mapAuthUserFromApi(raw: Record<string, unknown>): AuthUser {
  return {
    id: String(raw.id),
    fullName: String(raw.full_name ?? raw.fullName ?? ''),
    email: String(raw.email ?? ''),
    role: String(raw.role ?? '') as AuthUser['role'],
    specialty: raw.specialty ? String(raw.specialty) : undefined,
    associatedDoctorId: raw.associated_doctor_id
      ? String(raw.associated_doctor_id)
      : undefined,
  }
}

export async function getUsers(params?: {
  role?: string
  associatedDoctorId?: string
}): Promise<SystemUser[]> {
  const search = new URLSearchParams()
  if (params?.role) search.set('role', params.role)
  if (params?.associatedDoctorId) {
    search.set('associated_doctor_id', params.associatedDoctorId)
  }
  const query = search.toString() ? `?${search.toString()}` : ''
  const result = await apiGet<unknown[]>(`/users${query}`)
  const list = Array.isArray(result) ? result : []
  return list.map((item) => mapSystemUserFromApi(item as Record<string, unknown>))
}

export async function createUser(input: UserFormInput): Promise<SystemUser> {
  const body: Record<string, unknown> = {
    dni: input.dni || null,
    full_name: input.fullName,
    email: input.email,
    password: input.password,
    phone: input.phone || null,
    address: input.address || null,
    origin_city: input.originCity || null,
    role: input.role,
    status: input.status,
    specialty: input.specialty || null,
    position: input.position || null,
    support_area: input.supportArea || null,
    notes: input.notes || null,
    associated_doctor_id: input.associatedDoctorId
      ? Number(input.associatedDoctorId)
      : null,
  }

  const result = await apiPost<unknown>('/users', body)
  const raw =
    result && typeof result === 'object' && 'data' in (result as object)
      ? (result as { data: unknown }).data
      : result
  return mapSystemUserFromApi(raw as Record<string, unknown>)
}

export async function updateUser(
  id: string,
  input: Partial<UserFormInput> & { status?: 'active' | 'inactive' },
): Promise<SystemUser> {
  const body: Record<string, unknown> = {}

  if (input.dni !== undefined) body.dni = input.dni || null
  if (input.fullName !== undefined) body.full_name = input.fullName
  if (input.email !== undefined) body.email = input.email
  if (input.password) body.password = input.password
  if (input.phone !== undefined) body.phone = input.phone || null
  if (input.address !== undefined) body.address = input.address || null
  if (input.originCity !== undefined) body.origin_city = input.originCity || null
  if (input.status !== undefined) body.status = input.status
  if (input.specialty !== undefined) body.specialty = input.specialty || null
  if (input.position !== undefined) body.position = input.position || null
  if (input.supportArea !== undefined) body.support_area = input.supportArea || null
  if (input.notes !== undefined) body.notes = input.notes || null
  if (input.associatedDoctorId !== undefined) {
    body.associated_doctor_id = input.associatedDoctorId
      ? Number(input.associatedDoctorId)
      : null
  }

  const result = await apiPut<unknown>(`/users/${id}`, body)
  const raw =
    result && typeof result === 'object' && 'data' in (result as object)
      ? (result as { data: unknown }).data
      : result
  return mapSystemUserFromApi(raw as Record<string, unknown>)
}

export async function getDoctorsForSelect(): Promise<ApiUserOption[]> {
  const users = await getUsers()
  return usersToResponsibleDoctorOptions(users)
}

export async function resolveApiUserIdForAuth(user: AuthUser | null): Promise<string> {
  return user?.id ?? ''
}
