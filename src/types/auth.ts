export type UserRole = 'admin' | 'doctor' | 'assistant'

export type UserStatus = 'active' | 'inactive'

export interface AuthUser {
  id: string
  fullName: string
  email: string
  role: UserRole
  specialty?: string
  /** ID del médico en catálogo clínico (DOC-xxx) */
  doctorId?: string
  /** Médico responsable para asistentes */
  associatedDoctorId?: string
  avatarUrl?: string
}

/** Usuario completo para gestión administrativa */
export interface SystemUser {
  id: string
  dni: string
  fullName: string
  email: string
  phone: string
  address?: string
  originCity?: string
  role: UserRole
  specialty?: string
  cmp?: string
  rne?: string
  doctorId?: string
  associatedDoctorId?: string
  associatedDoctorName?: string
  position?: string
  status: UserStatus
  createdAt: string
  lastLogin?: string
  createdByUserId?: string
  notes?: string
  avatarUrl?: string
  /** Horario o firma — campos opcionales para médicos */
  scheduleNotes?: string
  signatureLabel?: string
  supportArea?: string
}

export interface MockUser extends SystemUser {
  password: string
}
