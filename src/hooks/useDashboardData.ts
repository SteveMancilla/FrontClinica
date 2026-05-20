import { useCallback, useEffect, useMemo, useState } from 'react'
import { getMedicalAttentions } from '@/services/medicalAttentionService'
import { getMedicalReports } from '@/services/medicalReportService'
import { getPatients } from '@/services/patientService'
import { getStudies } from '@/services/studyService'
import { getUsers } from '@/services/userService'
import type { AuthUser } from '@/types/auth'
import type {
  Appointment,
  Doctor,
  MedicalReport,
  Patient,
  Study,
} from '@/types/medical'
import { mapMedicalAttentionToAppointment } from '@/utils/apiMappers'
import { canSignMedicalReports, usersToDoctorLookup } from '@/utils/responsibleDoctor'

export function useDashboardData() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [reports, setReports] = useState<MedicalReport[]>([])
  const [studies, setStudies] = useState<Study[]>([])
  const [users, setUsers] = useState<Awaited<ReturnType<typeof getUsers>>>([])
  const [loadState, setLoadState] = useState<'loading' | 'error' | 'success'>('loading')
  const [loadError, setLoadError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    setLoadState('loading')
    setLoadError(null)
    try {
      const [patientsData, attentions, reportsData, studiesData, usersData] =
        await Promise.all([
          getPatients(),
          getMedicalAttentions(),
          getMedicalReports(),
          getStudies(),
          getUsers(),
        ])
      setPatients(patientsData)
      setAppointments(attentions.map(mapMedicalAttentionToAppointment))
      setReports(reportsData)
      setStudies(studiesData)
      setUsers(usersData)
      setLoadState('success')
    } catch (error) {
      setLoadState('error')
      setLoadError(
        error instanceof Error ? error.message : 'No se pudieron cargar los datos.',
      )
    }
  }, [])

  useEffect(() => {
    void fetchAll()
  }, [fetchAll])

  const doctors: Doctor[] = useMemo(() => usersToDoctorLookup(users), [users])

  const activeDoctorsCount = users.filter(
    (u) => u.status === 'active' && canSignMedicalReports(u.role),
  ).length
  const activeAssistantsCount = users.filter(
    (u) => u.role === 'assistant' && u.status === 'active',
  ).length

  return {
    patients,
    appointments,
    reports,
    studies,
    users,
    doctors,
    activeDoctorsCount,
    activeAssistantsCount,
    loadState,
    loadError,
    refetch: fetchAll,
  }
}

export function resolveDoctorIdForUser(user: AuthUser): string {
  return user.id
}
