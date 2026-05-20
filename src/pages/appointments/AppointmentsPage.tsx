import { useEffect, useMemo, useState } from 'react'
import { CalendarCheck, CheckCircle2, ClipboardList, Info, Loader2, Plus, Stethoscope } from 'lucide-react'
import AppointmentTable from '@/components/medical/AppointmentTable'
import NewAppointmentDrawer from '@/components/medical/NewAppointmentDrawer'
import SummaryCard from '@/components/ui/SummaryCard'
import { getCurrentUser } from '@/services/authService'
import { createMedicalAttention, getMedicalAttentions } from '@/services/medicalAttentionService'
import { createPatient, getPatients } from '@/services/patientService'
import { getStudies } from '@/services/studyService'
import { getDoctorsForSelect } from '@/services/userService'
import { resolveDefaultResponsibleDoctorId } from '@/utils/responsibleDoctor'
import type { ApiUserOption } from '@/services/userService'
import type { QuickPatientFormInput } from '@/components/medical/QuickPatientForm'
import type { PatientFormInput } from '@/components/medical/PatientFormDrawer'
import type { Appointment, NewAppointmentInput, Patient, Study } from '@/types/medical'
import { mapMedicalAttentionToAppointment } from '@/utils/apiMappers'
import {
  defaultAppointmentFilters,
  filterAppointments,
  getAppointmentSummary,
  type AppointmentFilters,
} from '@/utils/appointmentFilters'

export default function AppointmentsPage() {
  const user = getCurrentUser()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [studies, setStudies] = useState<Study[]>([])
  const [doctors, setDoctors] = useState<ApiUserOption[]>([])
  const [defaultDoctorUserId, setDefaultDoctorUserId] = useState('')
  const [loadState, setLoadState] = useState<'loading' | 'error' | 'success'>('loading')
  const [loadError, setLoadError] = useState<string | null>(null)
  const [filters] = useState<AppointmentFilters>(defaultAppointmentFilters)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [detailAppointment, setDetailAppointment] = useState<Appointment | null>(null)

  const fetchData = async () => {
    setLoadState('loading')
    setLoadError(null)
    try {
      const [attentions, patientsData, studiesData, doctorsData] =
        await Promise.all([
          getMedicalAttentions(),
          getPatients(),
          getStudies(),
          getDoctorsForSelect(),
        ])
      setAppointments(attentions.map(mapMedicalAttentionToAppointment))
      setPatients(patientsData)
      setStudies(studiesData)
      setDoctors(doctorsData)
      setDefaultDoctorUserId(resolveDefaultResponsibleDoctorId(user))
      setLoadState('success')
    } catch (error) {
      setLoadState('error')
      setLoadError(
        error instanceof Error ? error.message : 'No se pudieron cargar las atenciones.',
      )
    }
  }

  useEffect(() => {
    void fetchData()
  }, [])

  const filtered = useMemo(
    () => filterAppointments(appointments, filters),
    [appointments, filters],
  )

  const summary = useMemo(
    () => getAppointmentSummary(appointments),
    [appointments],
  )

  const handleCreateAppointment = async (
    input: NewAppointmentInput,
  ): Promise<{ reportId: string | null }> => {
    const attention = await createMedicalAttention({
      patientId: input.patientId,
      doctorId: input.doctorId,
      studyId: input.studyId,
      attentionDate: input.appointmentDate,
      attentionTime: input.appointmentTime,
      origin: input.origin,
      reason: input.reason,
      observations: input.notes,
      status: input.status,
      createdBy: user?.id || undefined,
    })
    await fetchData()
    return { reportId: attention.medicalReport?.id ?? null }
  }

  const handleStatusChange = (id: string, status: Appointment['status']) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status } : apt)),
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-clinic-deep-blue">
            Atenciones y estudios
          </h1>
          <p className="mt-1 text-sm text-clinic-text/70">
            Registra atenciones, asigna estudios y prepara informes médicos.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-clinic-blue px-4 py-2.5 text-sm font-semibold text-clinic-white shadow-sm transition hover:bg-clinic-deep-blue"
        >
          <Plus className="h-4 w-4" />
          Nueva atención
        </button>
      </div>

      {loadState === 'loading' && (
        <div className="flex items-center justify-center gap-2 py-12 text-sm text-clinic-text/70">
          <Loader2 className="h-5 w-5 animate-spin text-clinic-blue" />
          Cargando atenciones…
        </div>
      )}

      {loadError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </p>
      )}

      {loadState === 'success' && (
        <>
          <div className="rounded-xl border border-clinic-teal/30 bg-clinic-sky/25 p-4 sm:p-5">
            <div className="flex gap-3">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-clinic-teal" aria-hidden />
              <p className="text-sm font-medium text-clinic-deep-blue">
                Cada atención carga automáticamente la plantilla del estudio seleccionado.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard title="Atenciones de hoy" value={summary.today} icon={<CalendarCheck className="h-5 w-5" />} accent="info" />
            <SummaryCard title="Pendiente de estudio" value={summary.pendingStudy} icon={<Stethoscope className="h-5 w-5" />} />
            <SummaryCard title="Falta informe" value={summary.missingReport} icon={<ClipboardList className="h-5 w-5" />} accent="warning" />
            <SummaryCard title="Concluidos" value={summary.concluded} icon={<CheckCircle2 className="h-5 w-5" />} accent="success" />
          </div>

          <AppointmentTable
            appointments={filtered}
            patients={patients}
            onStatusChange={handleStatusChange}
            onViewDetail={setDetailAppointment}
          />
        </>
      )}

      <NewAppointmentDrawer
        isOpen={drawerOpen}
        patients={patients}
        studies={studies}
        doctors={doctors}
        defaultDoctorUserId={defaultDoctorUserId}
        studiesLoading={false}
        onClose={() => setDrawerOpen(false)}
        onSubmit={handleCreateAppointment}
        onCreatePatient={async (input: QuickPatientFormInput) => {
          const form: PatientFormInput = {
            dni: input.dni.trim(),
            fullName: input.fullName.trim(),
            age: Number(input.age),
            sex: input.sex as PatientFormInput['sex'],
            phone: input.phone.trim(),
            address: input.address.trim(),
            origin: input.origin as PatientFormInput['origin'],
            email: input.email.trim(),
            emergencyContactName: input.emergencyContactName.trim(),
            emergencyContactPhone: input.emergencyContactPhone.trim(),
            notes: input.notes.trim(),
          }
          const created = await createPatient(form)
          setPatients((prev) => [created, ...prev])
          return created
        }}
        onViewPatientChart={() => {}}
      />

      {detailAppointment && (
        <DetailModal
          appointment={detailAppointment}
          patients={patients}
          onClose={() => setDetailAppointment(null)}
        />
      )}
    </div>
  )
}

function DetailModal({
  appointment,
  patients,
  onClose,
}: {
  appointment: Appointment
  patients: Patient[]
  onClose: () => void
}) {
  const patient = patients.find((p) => p.id === appointment.patientId)

  return (
    <>
      <button type="button" className="fixed inset-0 z-40 bg-black/40" onClick={onClose} aria-label="Cerrar" />
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-clinic-white shadow-xl">
        <div className="border-b border-clinic-sky/60 px-5 py-4">
          <h2 className="font-semibold text-clinic-deep-blue">Detalle de atención</h2>
          <p className="text-sm text-clinic-text/70">{patient?.fullName ?? 'Paciente'}</p>
        </div>
        <div className="flex-1 overflow-y-auto p-5 text-sm space-y-3">
          <p><span className="text-clinic-text/50">Fecha:</span> {appointment.appointmentDate} {appointment.appointmentTime}</p>
          <p><span className="text-clinic-text/50">Estado:</span> {appointment.status}</p>
          <p><span className="text-clinic-text/50">Procedencia:</span> {appointment.origin}</p>
          {appointment.reason && <p><span className="text-clinic-text/50">Motivo:</span> {appointment.reason}</p>}
        </div>
      </div>
    </>
  )
}
