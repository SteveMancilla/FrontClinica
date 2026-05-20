import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import clsx from 'clsx'
import {
  CheckCircle2,
  ClipboardList,
  Info,
  Plus,
  RotateCcw,
  UserPlus,
  Users,
} from 'lucide-react'
import NewAppointmentDrawer from '@/components/medical/NewAppointmentDrawer'
import PatientDetailDrawer from '@/components/medical/PatientDetailDrawer'
import PatientFormDrawer, {
  type PatientFormInput,
} from '@/components/medical/PatientFormDrawer'
import PatientsTable from '@/components/medical/PatientsTable'
import PageHeader from '@/components/layout/PageHeader'
import SummaryCard from '@/components/ui/SummaryCard'
import { ApiError } from '@/services/apiClient'
import { getCurrentUser } from '@/services/authService'
import {
  createMedicalAttention,
  getMedicalAttentions,
} from '@/services/medicalAttentionService'
import { getMedicalReports } from '@/services/medicalReportService'
import { createPatient, getPatients, updatePatient } from '@/services/patientService'
import { getStudies } from '@/services/studyService'
import { getDoctorsForSelect } from '@/services/userService'
import { resolveDefaultResponsibleDoctorId } from '@/utils/responsibleDoctor'
import type { ApiUserOption } from '@/services/userService'
import type {
  Appointment,
  MedicalReport,
  NewAppointmentInput,
  Patient,
  Study,
} from '@/types/medical'
import {
  mapApiValidationErrors,
  mapMedicalAttentionToAppointment,
} from '@/utils/apiMappers'
import {
  defaultPatientFilters,
  filterPatients,
  getPatientPageSummary,
  type PatientFilters,
} from '@/utils/patientCatalog'
import type { QuickPatientFormInput } from '@/components/medical/QuickPatientForm'

export default function PatientsPage() {
  const user = getCurrentUser()
  const navigate = useNavigate()
  const { patientId: routePatientId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()

  const [patients, setPatients] = useState<Patient[]>([])
  const [loadState, setLoadState] = useState<'loading' | 'error' | 'success'>('loading')
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [, setFormApiErrors] = useState<Record<string, string>>({})
  const [studies, setStudies] = useState<Study[]>([])
  const [doctors, setDoctors] = useState<ApiUserOption[]>([])
  const [defaultDoctorUserId, setDefaultDoctorUserId] = useState('')
  const [studiesLoading, setStudiesLoading] = useState(true)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [reports, setReports] = useState<MedicalReport[]>([])

  const [filters, setFilters] = useState<PatientFilters>(defaultPatientFilters)
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [detailPatient, setDetailPatient] = useState<Patient | null>(null)
  const [appointmentOpen, setAppointmentOpen] = useState(false)
  const [appointmentPatientId, setAppointmentPatientId] = useState<string | null>(
    null,
  )

  const canRegister = user?.role === 'admin' || user?.role === 'doctor' || user?.role === 'assistant'
  const canEdit = user?.role === 'admin' || user?.role === 'doctor'
  const canCreateAppointment =
    user?.role === 'admin' || user?.role === 'doctor' || user?.role === 'assistant'

  const visiblePatients = useMemo(() => {
    if (!user || user.role === 'admin') return patients
    return patients
  }, [user, patients])

  const filteredPatients = useMemo(
    () => filterPatients(visiblePatients, filters),
    [visiblePatients, filters],
  )

  const summary = useMemo(
    () => getPatientPageSummary(visiblePatients, appointments, reports),
    [visiblePatients, appointments, reports],
  )

  const openPatientId = routePatientId ?? searchParams.get('patientId')

  const fetchPatients = async () => {
    setLoadState('loading')
    setLoadError(null)
    try {
      const data = await getPatients()
      setPatients(data)
      setLoadState('success')
    } catch (error) {
      setLoadState('error')
      setLoadError(
        error instanceof Error ? error.message : 'No se pudieron cargar los pacientes.',
      )
    }
  }

  const fetchClinicalData = async () => {
    try {
      const [attentions, reportsData] = await Promise.all([
        getMedicalAttentions(),
        getMedicalReports(),
      ])
      setAppointments(attentions.map(mapMedicalAttentionToAppointment))
      setReports(reportsData)
    } catch {
      setAppointments([])
      setReports([])
    }
  }

  useEffect(() => {
    void fetchPatients()
    void fetchClinicalData()
  }, [])

  useEffect(() => {
    setDefaultDoctorUserId(resolveDefaultResponsibleDoctorId(user))
  }, [user?.id, user?.role, user?.associatedDoctorId])

  useEffect(() => {
    const loadDrawerData = async () => {
      setStudiesLoading(true)
      try {
        const [studiesData, doctorsData] = await Promise.all([
          getStudies(),
          getDoctorsForSelect(),
        ])
        setStudies(studiesData)
        setDoctors(doctorsData)
        setDefaultDoctorUserId(resolveDefaultResponsibleDoctorId(user))
      } catch {
        setStudies([])
        setDoctors([])
      } finally {
        setStudiesLoading(false)
      }
    }
    void loadDrawerData()
  }, [user?.email])

  useEffect(() => {
    if (searchParams.get('register') !== '1' || !canRegister) return
    setFormMode('create')
    setEditingPatient(null)
    setFormOpen(true)
    const next = new URLSearchParams(searchParams)
    next.delete('register')
    setSearchParams(next, { replace: true })
  }, [searchParams, setSearchParams, canRegister])

  useEffect(() => {
    if (searchParams.get('newAppointment') !== '1' || !canCreateAppointment) return
    setDetailPatient(null)
    setAppointmentPatientId(null)
    setAppointmentOpen(true)
    const next = new URLSearchParams(searchParams)
    next.delete('newAppointment')
    setSearchParams(next, { replace: true })
  }, [searchParams, setSearchParams, canCreateAppointment])

  useEffect(() => {
    if (!openPatientId) return
    const patient = patients.find((p) => p.id === openPatientId)
    if (patient && visiblePatients.some((p) => p.id === patient.id)) {
      setDetailPatient(patient)
    }
  }, [openPatientId, patients, visiblePatients])

  const openRegister = () => {
    setFormMode('create')
    setEditingPatient(null)
    setFormOpen(true)
  }

  const openEdit = (patient: Patient) => {
    setFormMode('edit')
    setEditingPatient(patient)
    setFormOpen(true)
  }

  const openDetail = (patient: Patient) => {
    setDetailPatient(patient)
    navigate(`/patients/${patient.id}`)
  }

  const closeDetail = () => {
    setDetailPatient(null)
    navigate('/patients')
  }

  const handleSavePatient = async (input: PatientFormInput, existingId?: string) => {
    setFormApiErrors({})
    setSaveMessage(null)
    try {
      if (existingId) {
        const updated = await updatePatient(existingId, input)
        setPatients((prev) => prev.map((p) => (p.id === existingId ? updated : p)))
        if (detailPatient?.id === existingId) {
          setDetailPatient(updated)
        }
        setSaveMessage('Paciente actualizado correctamente.')
      } else {
        const created = await createPatient(input)
        setPatients((prev) => [created, ...prev])
        setSaveMessage('Paciente registrado correctamente.')
      }
      setFormOpen(false)
    } catch (error) {
      if (error instanceof ApiError && error.validationErrors) {
        setFormApiErrors(mapApiValidationErrors(error.validationErrors))
      } else {
        setFormApiErrors({
          _form:
            error instanceof Error ? error.message : 'No se pudo guardar el paciente.',
        })
      }
    }
  }

  const quickInputToForm = (input: QuickPatientFormInput): PatientFormInput => ({
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
  })

  const handleCreatePatientFromDrawer = async (input: QuickPatientFormInput) => {
    const created = await createPatient(quickInputToForm(input))
    setPatients((prev) => [created, ...prev])
    return created
  }

  const openNewAppointment = (patient?: Patient) => {
    setDetailPatient(null)
    if (routePatientId) navigate('/patients')
    setAppointmentPatientId(patient?.id ?? null)
    setAppointmentOpen(true)
  }

  const handleNewAppointment = (patient: Patient) => {
    openNewAppointment(patient)
  }

  const handleAppointmentSubmit = async (
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

    await fetchClinicalData()

    return {
      reportId: attention.medicalReport?.id ?? null,
    }
  }

  const closeAppointmentDrawer = () => {
    setAppointmentOpen(false)
    setAppointmentPatientId(null)
  }

  const clearFilters = () => setFilters(defaultPatientFilters)

  const updateFilter = <K extends keyof PatientFilters>(
    key: K,
    value: PatientFilters[K],
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      <PageHeader
        description="Centro operativo: busca pacientes, registra nuevos y crea atenciones con estudio e informe asociado."
        meta={
          user ? (
            <p className="text-xs text-clinic-teal">
              {user.role === 'admin' && 'Vista completa — todos los pacientes'}
              {user.role === 'doctor' &&
                'Vista médico — pacientes con atenciones o informes asignados'}
              {user.role === 'assistant' &&
                'Vista asistente — pacientes registrados o en tus atenciones'}
            </p>
          ) : undefined
        }
      >
        {canRegister && (
          <button
            type="button"
            onClick={openRegister}
            className="inline-flex items-center gap-2 rounded-lg bg-clinic-blue px-4 py-2.5 text-sm font-semibold text-clinic-white hover:bg-clinic-deep-blue"
          >
            <UserPlus className="h-4 w-4" />
            Registrar paciente
          </button>
        )}
        {canCreateAppointment && (
          <button
            type="button"
            onClick={() => openNewAppointment()}
            className="inline-flex items-center gap-2 rounded-lg border border-clinic-teal/50 bg-clinic-teal/10 px-4 py-2.5 text-sm font-semibold text-clinic-teal hover:bg-clinic-teal/20"
          >
            <Plus className="h-4 w-4" />
            Nueva atención
          </button>
        )}
      </PageHeader>

      <div className="flex gap-3 rounded-xl border border-clinic-teal/30 bg-clinic-sky/20 px-4 py-3 text-sm text-clinic-deep-blue">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-clinic-teal" />
        <p>
          Busca por DNI, nombre o celular. Si el paciente existe, abre su ficha; si no,
          regístralo y crea la atención con plantilla automática según el estudio.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total de pacientes"
          value={summary.total}
          icon={<Users className="h-5 w-5" />}
        />
        <SummaryCard
          title="Pacientes atendidos hoy"
          value={summary.attendedToday}
          icon={<ClipboardList className="h-5 w-5" />}
          accent="info"
        />
        <SummaryCard
          title="Con informes pendientes"
          value={summary.withPending}
          icon={<ClipboardList className="h-5 w-5" />}
          accent="warning"
        />
        <SummaryCard
          title="Con informes concluidos"
          value={summary.withConcluded}
          icon={<CheckCircle2 className="h-5 w-5" />}
          accent="success"
        />
      </div>

      <div className="rounded-xl border border-clinic-sky/50 bg-clinic-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <input
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            placeholder="DNI, nombre o celular..."
            className="rounded-lg border border-clinic-sky/80 px-3 py-2.5 text-sm lg:col-span-2"
          />
          <select
            value={filters.sex}
            onChange={(e) =>
              updateFilter('sex', e.target.value as PatientFilters['sex'])
            }
            className="rounded-lg border border-clinic-sky/80 px-3 py-2.5 text-sm"
          >
            <option value="all">Todos los sexos</option>
            <option value="Femenino">Femenino</option>
            <option value="Masculino">Masculino</option>
          </select>
          <select
            value={filters.origin}
            onChange={(e) =>
              updateFilter('origin', e.target.value as PatientFilters['origin'])
            }
            className="rounded-lg border border-clinic-sky/80 px-3 py-2.5 text-sm"
          >
            <option value="all">Todas las procedencias</option>
            <option value="Particular">Particular</option>
            <option value="Emergencia">Emergencia</option>
            <option value="Consulta externa">Consulta externa</option>
            <option value="Referido">Referido</option>
            <option value="Convenio">Convenio</option>
            <option value="Hospitalización">Hospitalización</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) =>
              updateFilter('status', e.target.value as PatientFilters['status'])
            }
            className="rounded-lg border border-clinic-sky/80 px-3 py-2.5 text-sm"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </select>
          <input
            type="date"
            value={filters.registeredFrom}
            onChange={(e) => updateFilter('registeredFrom', e.target.value)}
            className="rounded-lg border border-clinic-sky/80 px-3 py-2.5 text-sm"
            title="Registrados desde"
          />
          <button
            type="button"
            onClick={clearFilters}
            className={clsx(
              'inline-flex items-center justify-center gap-1 rounded-lg border border-clinic-sky px-3 py-2.5 text-sm font-medium sm:col-span-2 lg:col-span-1',
            )}
          >
            <RotateCcw className="h-4 w-4" />
            Limpiar filtros
          </button>
        </div>
      </div>

      {saveMessage && (
        <div className="flex gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          {saveMessage}
        </div>
      )}

      {loadState === 'loading' && (
        <div className="rounded-xl border border-clinic-sky/50 bg-clinic-white px-6 py-12 text-center text-sm text-clinic-text/70">
          Cargando pacientes...
        </div>
      )}

      {loadState === 'error' && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center">
          <p className="text-sm text-red-700">{loadError ?? 'No se pudieron cargar los pacientes.'}</p>
          <button
            type="button"
            onClick={() => void fetchPatients()}
            className="mt-4 rounded-lg bg-clinic-blue px-4 py-2 text-sm font-semibold text-clinic-white"
          >
            Reintentar
          </button>
        </div>
      )}

      {loadState === 'success' && filteredPatients.length === 0 && (
        <div className="rounded-xl border border-dashed border-clinic-sky/60 bg-clinic-white px-6 py-14 text-center">
          <p className="text-sm text-clinic-text/70">No hay pacientes registrados.</p>
          {canRegister && (
            <button
              type="button"
              onClick={openRegister}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-clinic-blue px-4 py-2.5 text-sm font-semibold text-clinic-white"
            >
              <UserPlus className="h-4 w-4" />
              Registrar paciente
            </button>
          )}
        </div>
      )}

      {loadState === 'success' && filteredPatients.length > 0 && (
        <PatientsTable
          patients={filteredPatients}
          appointments={appointments}
          reports={reports}
          studies={studies}
          canCreateAppointment={canCreateAppointment}
          onViewChart={openDetail}
          onNewAppointment={handleNewAppointment}
          onViewReports={(patient) => navigate(`/reports?patientId=${patient.id}`)}
        />
      )}

      <PatientFormDrawer
        isOpen={formOpen}
        mode={formMode}
        initial={editingPatient}
        onClose={() => setFormOpen(false)}
        onSave={handleSavePatient}
      />

      <PatientDetailDrawer
        isOpen={Boolean(detailPatient)}
        patient={detailPatient}
        appointments={appointments}
        reports={reports}
        canEdit={canEdit}
        canCreateAppointment={canCreateAppointment}
        onClose={closeDetail}
        onEdit={() => detailPatient && openEdit(detailPatient)}
        onNewAppointment={() => {
          if (detailPatient) {
            const p = detailPatient
            setDetailPatient(null)
            navigate('/patients')
            setAppointmentPatientId(p.id)
            setAppointmentOpen(true)
          }
        }}
      />

      <NewAppointmentDrawer
        isOpen={appointmentOpen}
        patients={patients}
        studies={studies}
        doctors={doctors}
        defaultDoctorUserId={defaultDoctorUserId}
        studiesLoading={studiesLoading}
        initialPatientId={appointmentPatientId}
        onClose={closeAppointmentDrawer}
        onSubmit={handleAppointmentSubmit}
        onCreatePatient={handleCreatePatientFromDrawer}
        onViewPatientChart={(patient) => openDetail(patient)}
      />
    </div>
  )
}
