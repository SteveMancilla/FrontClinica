import type { Appointment, AppointmentStatus } from '@/types/medical'
import {
  findDoctorById,
  findPatientById,
  findStudyById,
} from '@/data/mockMedical'

export interface AppointmentFilters {
  search: string
  status: AppointmentStatus | 'all'
  doctorId: string
  specialtyId: string
  date: string
}

export const defaultAppointmentFilters: AppointmentFilters = {
  search: '',
  status: 'all',
  doctorId: 'all',
  specialtyId: 'all',
  date: '',
}

export function filterAppointments(
  appointments: Appointment[],
  filters: AppointmentFilters,
): Appointment[] {
  const search = filters.search.trim().toLowerCase()

  return appointments.filter((apt) => {
    const patient = findPatientById(apt.patientId)
    const study = findStudyById(apt.studyId)
    const doctor = findDoctorById(apt.doctorId)

    if (filters.status !== 'all' && apt.status !== filters.status) {
      return false
    }
    if (filters.doctorId !== 'all' && apt.doctorId !== filters.doctorId) {
      return false
    }
    if (filters.specialtyId !== 'all' && apt.specialtyId !== filters.specialtyId) {
      return false
    }
    if (filters.date && apt.appointmentDate !== filters.date) {
      return false
    }

    if (search) {
      const haystack = [
        patient?.fullName,
        patient?.dni,
        study?.name,
        doctor?.fullName,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      if (!haystack.includes(search)) return false
    }

    return true
  })
}

export function getAppointmentSummary(appointments: Appointment[]) {
  const today = new Date().toISOString().slice(0, 10)

  return {
    today: appointments.filter((a) => a.appointmentDate === today).length,
    pendingStudy: appointments.filter((a) => a.status === 'pending_study').length,
    missingReport: appointments.filter(
      (a) =>
        a.status === 'missing_report' ||
        a.status === 'missing_diagnostic_impression',
    ).length,
    concluded: appointments.filter(
      (a) => a.status === 'concluded' || a.status === 'pdf_generated',
    ).length,
  }
}
