import { apiGet } from '@/services/apiClient'
import type { ProductivityDataset } from '@/hooks/useProductivityData'
import type { Patient, Specialty } from '@/types/medical'
import {
  mapMedicalAttentionFromApi,
  mapMedicalAttentionToAppointment,
  mapMedicalReportFromApi,
  mapPatientFromApi,
  mapStudyFromApi,
} from '@/utils/apiMappers'
import { formatDoctorHonorificName } from '@/utils/doctorDisplay'
import { formatResponsibleDoctorTitle } from '@/utils/responsibleDoctor'
import type { UserRole } from '@/types/auth'

type ProductivityApiPayload = {
  doctors: Record<string, unknown>[]
  appointments: Record<string, unknown>[]
  reports: Record<string, unknown>[]
  studies: Record<string, unknown>[]
  specialties: Record<string, unknown>[]
  patients: Record<string, unknown>[]
}

function mapSpecialtyFromApi(raw: Record<string, unknown>): Specialty {
  return {
    id: String(raw.id),
    name: String(raw.name ?? ''),
    description: String(raw.description ?? ''),
    isActive: (raw.status ?? raw.is_active) !== 'inactive',
    createdAt: String(raw.created_at ?? new Date().toISOString()),
    updatedAt: String(raw.updated_at ?? new Date().toISOString()),
  }
}

export async function getProductivityDataset(): Promise<ProductivityDataset> {
  const result = await apiGet<ProductivityApiPayload | { data: ProductivityApiPayload }>(
    '/productivity',
  )

  const payload =
    result && typeof result === 'object' && 'data' in result
      ? (result as { data: ProductivityApiPayload }).data
      : (result as ProductivityApiPayload)

  const attentions = (payload.appointments ?? []).map((row) =>
    mapMedicalAttentionFromApi(row),
  )

  return {
    doctors: (payload.doctors ?? []).map((row) => {
      const role = String(row.role ?? 'doctor') as UserRole
      const rawName = String(row.full_name ?? row.fullName ?? '')
      const specialty = formatResponsibleDoctorTitle({
        role,
        specialty: row.specialty ? String(row.specialty) : undefined,
        position: row.position ? String(row.position) : undefined,
      })

      return {
        id: String(row.id),
        fullName:
          role === 'admin' ? rawName : formatDoctorHonorificName(rawName),
        specialty: specialty || 'Médico radiólogo',
        role,
        position: row.position ? String(row.position) : undefined,
      }
    }),
    appointments: attentions.map(mapMedicalAttentionToAppointment),
    reports: (payload.reports ?? []).map((row) => {
      const raw = row as Record<string, unknown>
      const report = mapMedicalReportFromApi(raw)
      const attention = raw.medical_attention ?? raw.medicalAttention
      if (attention && typeof attention === 'object') {
        const attentionDate = (attention as Record<string, unknown>).attention_date
          ?? (attention as Record<string, unknown>).attentionDate
        if (attentionDate) {
          report.reportDate = String(attentionDate).slice(0, 10)
        }
      }
      return report
    }),
    studies: (payload.studies ?? []).map((row) => mapStudyFromApi(row as Record<string, unknown>)),
    specialties: (payload.specialties ?? []).map((row) =>
      mapSpecialtyFromApi(row as Record<string, unknown>),
    ),
    patients: (payload.patients ?? []).map((row) => {
      const patient = mapPatientFromApi(row as Record<string, unknown>)
      return {
        ...patient,
        fullName: patient.fullName || `Paciente ${patient.id}`,
        dni: patient.dni || '',
        phone: patient.phone || '',
      } satisfies Patient
    }),
  }
}
