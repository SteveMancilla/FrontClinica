import { apiPost, apiPut } from '@/services/apiClient'
import { mapAuthUserFromApi, mapSystemUserFromApi } from '@/services/userService'
import type { AuthUser, SystemUser } from '@/types/auth'
import {
  clearAuthSession,
  patchAuthSession,
  readAuthSessionRaw,
  writeAuthSession,
} from '@/utils/authStorage'

export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}

export async function login(
  email: string,
  password: string,
  remember = true,
): Promise<AuthUser> {
  const normalizedEmail = email.trim().toLowerCase()

  try {
    const result = await apiPost<unknown>('/auth/login', {
      email: normalizedEmail,
      password,
    })
    const raw =
      result && typeof result === 'object' && 'data' in (result as object)
        ? (result as { data: unknown }).data
        : result

    const authUser = mapAuthUserFromApi(raw as Record<string, unknown>)
    writeAuthSession(JSON.stringify(authUser), remember)

    return authUser
  } catch (error) {
    if (error instanceof Error) {
      throw new AuthError(error.message)
    }
    throw new AuthError('No se pudo iniciar sesión.')
  }
}

export function logout(): void {
  clearAuthSession()
}

export interface ChangePasswordInput {
  currentPassword: string
  password: string
  passwordConfirmation: string
}

export interface ProfileUpdateInput {
  fullName: string
  email: string
  dni: string
  phone: string
  address: string
  specialty: string
  position: string
  supportArea: string
  notes: string
}

export async function updateProfile(input: ProfileUpdateInput): Promise<SystemUser> {
  const result = await apiPut<unknown>('/auth/profile', {
    full_name: input.fullName.trim(),
    email: input.email.trim().toLowerCase(),
    dni: input.dni.trim() || null,
    phone: input.phone.trim() || null,
    address: input.address.trim() || null,
    specialty: input.specialty.trim() || null,
    position: input.position.trim() || null,
    support_area: input.supportArea.trim() || null,
    notes: input.notes.trim() || null,
  })

  const raw =
    result && typeof result === 'object' && 'data' in (result as object)
      ? (result as { data: unknown }).data
      : result

  const profile = mapSystemUserFromApi(raw as Record<string, unknown>)

  updateStoredAuthUser({
    fullName: profile.fullName,
    email: profile.email,
    specialty: profile.specialty,
  })

  return profile
}

export async function changePassword(input: ChangePasswordInput): Promise<void> {
  await apiPut('/auth/password', {
    current_password: input.currentPassword,
    password: input.password,
    password_confirmation: input.passwordConfirmation,
  })
}

export function updateStoredAuthUser(patch: Partial<AuthUser>): void {
  patchAuthSession(patch as Record<string, unknown>)
}

export function getCurrentUser(): AuthUser | null {
  const stored = readAuthSessionRaw()

  if (!stored) return null

  try {
    return JSON.parse(stored) as AuthUser
  } catch {
    logout()
    return null
  }
}
