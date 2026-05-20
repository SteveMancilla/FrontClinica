import { useCallback, useEffect, useMemo, useState } from 'react'
import { getMedicalAttentions } from '@/services/medicalAttentionService'
import { getMedicalReports } from '@/services/medicalReportService'
import { getReportTemplates } from '@/services/reportTemplateService'
import { getStudies } from '@/services/studyService'
import { getUsers } from '@/services/userService'
import type { SystemUser } from '@/types/auth'
import type {
  Appointment,
  MedicalReport,
  ReportTemplate,
  Specialty,
  Study,
} from '@/types/medical'
import { mapMedicalAttentionToAppointment } from '@/utils/apiMappers'

function buildSpecialtiesFromStudies(studies: Study[]): Specialty[] {
  const map = new Map<string, Specialty>()

  for (const study of studies) {
    if (!study.specialtyId) continue
    if (!map.has(study.specialtyId)) {
      map.set(study.specialtyId, {
        id: study.specialtyId,
        name: study.specialtyName ?? `Especialidad ${study.specialtyId}`,
        description: 'Especialidad derivada del catálogo de estudios en base de datos.',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        iconLabel: study.specialtyName?.slice(0, 3).toUpperCase() ?? 'ESP',
      })
    }
  }

  return [...map.values()]
}

export function useSpecialtiesCatalogData() {
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [studies, setStudies] = useState<Study[]>([])
  const [templates, setTemplates] = useState<ReportTemplate[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [reports, setReports] = useState<MedicalReport[]>([])
  const [users, setUsers] = useState<SystemUser[]>([])
  const [loadState, setLoadState] = useState<'loading' | 'error' | 'success'>('loading')
  const [loadError, setLoadError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoadState('loading')
    setLoadError(null)

    try {
      const [studiesData, templatesData, attentions, reportsData, usersData] =
        await Promise.all([
          getStudies(),
          getReportTemplates(),
          getMedicalAttentions(),
          getMedicalReports(),
          getUsers(),
        ])

      setStudies(studiesData)
      setTemplates(templatesData)
      setAppointments(attentions.map(mapMedicalAttentionToAppointment))
      setReports(reportsData)
      setUsers(usersData)
      setSpecialties(buildSpecialtiesFromStudies(studiesData))
      setLoadState('success')
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : 'No se pudieron cargar las especialidades.',
      )
      setLoadState('error')
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const dataset = useMemo(
    () => ({
      specialties,
      studies,
      templates,
      appointments,
      reports,
      users,
    }),
    [specialties, studies, templates, appointments, reports, users],
  )

  return { ...dataset, loadState, loadError, refetch: load }
}
