import { getMedicalReports } from '@/services/medicalReportService'
import { getPatients } from '@/services/patientService'
import { getStudies } from '@/services/studyService'
import { getUsers } from '@/services/userService'
import type { GlobalSearchResult } from '@/types/search'
import type { AuthUser } from '@/types/auth'
import type { MedicalReport, Patient } from '@/types/medical'
import { getReportStatusLabel } from '@/utils/reportStatus'

const MIN_QUERY_LENGTH = 2
const MAX_PER_TYPE = 5

function normalize(value: string): string {
  return value.trim().toLowerCase()
}

function textMatches(query: string, ...parts: (string | undefined)[]): boolean {
  const q = normalize(query)
  if (!q) return false
  const digits = query.replace(/\D/g, '')
  return parts.some((part) => {
    if (!part) return false
    const value = part.toLowerCase()
    if (value.includes(q)) return true
    if (digits.length >= 3 && part.replace(/\D/g, '').includes(digits)) return true
    return false
  })
}

function filterPatientsLocal(patients: Patient[], query: string): Patient[] {
  const search = normalize(query)
  if (!search) return []
  const digitsOnly = query.replace(/\D/g, '')
  return patients.filter((patient) => {
    const nameMatch = patient.fullName.toLowerCase().includes(search)
    const phoneMatch = patient.phone.includes(search)
    const dniMatch =
      patient.dni.includes(search) ||
      (digitsOnly.length > 0 && patient.dni.includes(digitsOnly))
    return nameMatch || phoneMatch || dniMatch
  })
}

function scopeReportsForUser(reports: MedicalReport[], user: AuthUser): MedicalReport[] {
  if (user.role === 'admin') return reports
  if (user.role === 'doctor') {
    return reports.filter((r) => r.doctorId === user.id)
  }
  if (user.associatedDoctorId) {
    return reports.filter((r) => r.doctorId === user.associatedDoctorId)
  }
  return reports
}

export async function searchGlobally(
  query: string,
  user: AuthUser,
): Promise<GlobalSearchResult[]> {
  const trimmed = query.trim()
  if (trimmed.length < MIN_QUERY_LENGTH) return []

  const [patients, reports, studies, users] = await Promise.all([
    getPatients(),
    getMedicalReports(),
    getStudies(),
    user.role === 'admin' ? getUsers({ role: 'doctor' }) : Promise.resolve([]),
  ])

  const patientMap = new Map(patients.map((p) => [p.id, p]))
  const studyMap = new Map(studies.map((s) => [s.id, s]))
  const scopedReports = scopeReportsForUser(reports, user)
  const results: GlobalSearchResult[] = []

  for (const patient of filterPatientsLocal(patients, trimmed).slice(0, MAX_PER_TYPE)) {
    results.push({
      id: `patient-${patient.id}`,
      type: 'patient',
      title: patient.fullName,
      subtitle: `DNI ${patient.dni} · ${patient.phone || 'Sin celular'}`,
      href: `/patients/${patient.id}`,
    })
  }

  for (const report of scopedReports
    .filter((report) => {
      const patient = patientMap.get(report.patientId)
      const study = studyMap.get(report.studyId)
      return textMatches(trimmed, patient?.fullName, patient?.dni, study?.name)
    })
    .slice(0, MAX_PER_TYPE)) {
    const patient = patientMap.get(report.patientId)
    const study = studyMap.get(report.studyId)
    results.push({
      id: `report-${report.id}`,
      type: 'report',
      title: patient?.fullName ?? 'Paciente',
      subtitle: `${study?.name ?? 'Estudio'} · ${getReportStatusLabel(report.status)}`,
      href: `/reports/new?reportId=${report.id}`,
    })
  }

  for (const study of studies
    .filter((study) => textMatches(trimmed, study.name, study.specialtyName, study.code))
    .slice(0, MAX_PER_TYPE)) {
    results.push({
      id: `study-${study.id}`,
      type: 'study',
      title: study.name,
      subtitle: study.specialtyName || 'Estudio médico',
      href: '/templates',
    })
  }

  if (user.role === 'admin') {
    for (const doctor of users
      .filter(
        (doctor) =>
          doctor.role === 'doctor' &&
          doctor.status === 'active' &&
          textMatches(trimmed, doctor.fullName, doctor.email, doctor.dni, doctor.specialty),
      )
      .slice(0, MAX_PER_TYPE)) {
      results.push({
        id: `doctor-${doctor.id}`,
        type: 'doctor',
        title: doctor.fullName,
        subtitle: doctor.specialty || 'Médico',
        href: `/productivity?doctorId=${doctor.id}`,
      })
    }
  }

  return results
}
