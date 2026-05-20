import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { CheckCircle2, FileText, X } from 'lucide-react'
import PatientSearchBox from '@/components/medical/PatientSearchBox'
import QuickPatientForm from '@/components/medical/QuickPatientForm'
import SelectedPatientCard from '@/components/medical/SelectedPatientCard'
import { getFormatTypeLabel } from '@/utils/templateCatalog'
import { getCurrentUser } from '@/services/authService'
import type { ApiUserOption } from '@/services/userService'
import type { QuickPatientFormInput } from '@/components/medical/QuickPatientForm'
import type { AuthUser } from '@/types/auth'
import type {
  NewAppointmentInitialStatus,
  NewAppointmentInput,
  Patient,
  PatientOrigin,
  Study,
} from '@/types/medical'
import {
  getStudyBlock,
  getStudyBlockOptions,
  type StudyBlock,
} from '@/utils/studyGrouping'
import {
  formatResponsibleDoctorOptionLabel,
  resolveDefaultResponsibleDoctorId,
} from '@/utils/responsibleDoctor'

type DrawerMode = 'search_patient' | 'register_patient' | 'create_attention'
type FlowStep = 'patient' | 'appointment' | 'done'

interface NewAppointmentDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (input: NewAppointmentInput) => Promise<{ reportId: string | null }>
  patients: Patient[]
  studies: Study[]
  doctors: ApiUserOption[]
  defaultDoctorUserId: string
  studiesLoading?: boolean
  initialPatientId?: string | null
  onCreatePatient: (input: QuickPatientFormInput) => Promise<Patient>
  onViewPatientChart?: (patient: Patient) => void
}

const originOptions: PatientOrigin[] = [
  'Particular',
  'Emergencia',
  'Consulta externa',
  'Referido',
  'Convenio',
  'Hospitalización',
]

const initialStatusOptions: { value: NewAppointmentInitialStatus; label: string }[] = [
  { value: 'pending_study', label: 'Pendiente de estudio' },
  { value: 'study_done', label: 'Estudio realizado' },
  { value: 'missing_report', label: 'Falta informe' },
]

function sortDoctorsForUser(doctors: ApiUserOption[], user: AuthUser | null) {
  const list = [...doctors]
  const preferredId = resolveDefaultResponsibleDoctorId(user)
  if (!preferredId) return list
  const preferred = list.find((d) => d.id === preferredId)
  if (!preferred) return list
  return [preferred, ...list.filter((d) => d.id !== preferredId)]
}

function StepIndicator({ current }: { current: FlowStep }) {
  const steps = [
    { id: 'patient' as const, label: 'Paciente' },
    { id: 'appointment' as const, label: 'Estudio' },
    { id: 'done' as const, label: 'Confirmación' },
  ]
  const currentIndex = steps.findIndex((s) => s.id === current)

  return (
    <ol className="flex items-center gap-2 text-xs">
      {steps.map((step, index) => {
        const isActive = step.id === current
        const isDone = index < currentIndex
        return (
          <li key={step.id} className="flex flex-1 items-center gap-2">
            <span
              className={clsx(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-semibold',
                isActive && 'bg-clinic-blue text-clinic-white',
                isDone && 'bg-clinic-teal text-clinic-white',
                !isActive && !isDone && 'bg-clinic-bg text-clinic-text/50',
              )}
            >
              {index + 1}
            </span>
            <span
              className={clsx(
                'hidden font-medium sm:inline',
                isActive ? 'text-clinic-deep-blue' : 'text-clinic-text/50',
              )}
            >
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <span className="mx-1 hidden h-px flex-1 bg-clinic-sky/60 sm:block" />
            )}
          </li>
        )
      })}
    </ol>
  )
}

export default function NewAppointmentDrawer({
  isOpen,
  onClose,
  onSubmit,
  patients: patientsProp,
  studies,
  doctors,
  defaultDoctorUserId,
  studiesLoading = false,
  initialPatientId,
  onCreatePatient,
  onViewPatientChart,
}: NewAppointmentDrawerProps) {
  const user = getCurrentUser()
  const userId = user?.id
  const userRole = user?.role
  const today = new Date().toISOString().slice(0, 10)
  const skipPatientSearch = Boolean(initialPatientId)
  const wasOpenRef = useRef(false)

  const [flowStep, setFlowStep] = useState<FlowStep>('patient')
  const [drawerMode, setDrawerMode] = useState<DrawerMode>('search_patient')
  const [registerFormKey, setRegisterFormKey] = useState(0)
  const [registerDniPrefill, setRegisterDniPrefill] = useState('')
  const [localPatients, setLocalPatients] = useState<Patient[]>([])
  const [patientSearch, setPatientSearch] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [studyId, setStudyId] = useState('')
  const [studyBlock, setStudyBlock] = useState<'all' | StudyBlock>('all')
  const [doctorId, setDoctorId] = useState(defaultDoctorUserId)
  const [submitting, setSubmitting] = useState(false)
  const [appointmentDate, setAppointmentDate] = useState(today)
  const [appointmentTime, setAppointmentTime] = useState('09:00')
  const [origin, setOrigin] = useState<PatientOrigin>('Particular')
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')
  const [initialStatus, setInitialStatus] = useState<NewAppointmentInitialStatus>('pending_study')
  const [formError, setFormError] = useState<string | null>(null)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)
  const [createdReportId, setCreatedReportId] = useState<string | null>(null)

  const defaultResponsibleDoctorId = useMemo(
    () => defaultDoctorUserId || resolveDefaultResponsibleDoctorId(user),
    [defaultDoctorUserId, user],
  )
  const sortedDoctors = useMemo(
    () => sortDoctorsForUser(doctors, user),
    [doctors, userId, userRole],
  )

  const patientList = useMemo(() => {
    const ids = new Set(patientsProp.map((p) => p.id))
    const extra = localPatients.filter((p) => !ids.has(p.id))
    return [...extra, ...patientsProp]
  }, [patientsProp, localPatients])

  const selectedStudy = useMemo(
    () => studies.find((s) => s.id === studyId),
    [studies, studyId],
  )
  const studyBlocks = useMemo(() => getStudyBlockOptions(studies), [studies])
  const filteredStudies = useMemo(
    () => (studyBlock === 'all' ? studies : studies.filter((s) => getStudyBlock(s) === studyBlock)),
    [studies, studyBlock],
  )
  const sortedFilteredStudies = useMemo(
    () => [...filteredStudies].sort((a, b) => a.name.localeCompare(b.name, 'es')),
    [filteredStudies],
  )

  useEffect(() => {
    if (!isOpen) {
      wasOpenRef.current = false
      return
    }

    const justOpened = !wasOpenRef.current
    wasOpenRef.current = true
    if (!justOpened) return

    setDrawerMode('search_patient')
    setFormError(null)
    setInfoMessage(null)
    setCreatedReportId(null)
    setRegisterDniPrefill('')
    setDoctorId(defaultResponsibleDoctorId)
    setStudyId('')
    setStudyBlock('all')
    setAppointmentDate(today)
    setAppointmentTime('09:00')
    setReason('')
    setNotes('')
    setInitialStatus('pending_study')

    if (initialPatientId) {
      const patient = patientList.find((p) => p.id === initialPatientId)
      if (patient) {
        setSelectedPatient(patient)
        setPatientSearch('')
        setFlowStep('appointment')
        setDrawerMode('create_attention')
        setOrigin(patient.origin)
      } else {
        setFlowStep('patient')
        setDrawerMode('search_patient')
        setSelectedPatient(null)
        setPatientSearch('')
        setOrigin('Particular')
      }
    } else {
      setFlowStep('patient')
      setDrawerMode('search_patient')
      setSelectedPatient(null)
      setPatientSearch('')
      setOrigin('Particular')
    }
  }, [isOpen, initialPatientId, patientList, userId, userRole, today, defaultResponsibleDoctorId])

  useEffect(() => {
    if (!isOpen || !initialPatientId || selectedPatient?.id === initialPatientId) return
    const patient = patientList.find((p) => p.id === initialPatientId)
    if (!patient) return
    setSelectedPatient(patient)
    setPatientSearch('')
    setFlowStep('appointment')
    setDrawerMode('create_attention')
    setOrigin(patient.origin)
  }, [isOpen, initialPatientId, patientList, selectedPatient?.id])

  useEffect(() => {
    if (!isOpen || !defaultResponsibleDoctorId) return
    setDoctorId((current) => current || defaultResponsibleDoctorId)
  }, [isOpen, defaultResponsibleDoctorId])

  const openRegisterPatient = () => {
    const digits = patientSearch.replace(/\D/g, '')
    setRegisterDniPrefill(digits)
    setRegisterFormKey((k) => k + 1)
    setDrawerMode('register_patient')
    setFormError(null)
  }

  const resetForm = () => {
    setFlowStep(skipPatientSearch ? 'appointment' : 'patient')
    setDrawerMode(skipPatientSearch ? 'create_attention' : 'search_patient')
    setPatientSearch('')
    setSelectedPatient(null)
    setStudyId('')
    setStudyBlock('all')
    setDoctorId(defaultResponsibleDoctorId)
    setAppointmentDate(today)
    setAppointmentTime('09:00')
    setOrigin('Particular')
    setReason('')
    setNotes('')
    setInitialStatus('pending_study')
    setFormError(null)
    setInfoMessage(null)
    setCreatedReportId(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setPatientSearch('')
    setOrigin(patient.origin)
    setFlowStep('appointment')
    setDrawerMode('create_attention')
    setFormError(null)
  }

  const handleChangePatient = () => {
    if (skipPatientSearch) return
    setSelectedPatient(null)
    setPatientSearch('')
    setFlowStep('patient')
    setDrawerMode('search_patient')
  }

  const handlePatientSaved = async (input: QuickPatientFormInput) => {
    const patient = await onCreatePatient(input)
    setLocalPatients((prev) => {
      if (prev.some((p) => p.id === patient.id)) return prev
      return [patient, ...prev]
    })
    setSelectedPatient(patient)
    setPatientSearch('')
    setOrigin(patient.origin)
    setDrawerMode('create_attention')
    setFlowStep('appointment')
    setInfoMessage('Paciente registrado y seleccionado correctamente.')
    setTimeout(() => setInfoMessage(null), 5000)
  }

  const handleSelectExistingFromForm = (patient: Patient) => {
    handleSelectPatient(patient)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)

    if (!selectedPatient) {
      setFormError('Debes seleccionar o registrar un paciente antes de crear la atención.')
      setFlowStep('patient')
      setDrawerMode('search_patient')
      return
    }
    if (!studyId || !doctorId) {
      setFormError('Completa estudio y médico responsable.')
      return
    }
    if (!appointmentDate || !appointmentTime) {
      setFormError('Indica fecha y hora de la atención.')
      return
    }
    if (!origin) {
      setFormError('Selecciona la procedencia de la atención.')
      return
    }
    if (!reason.trim()) {
      setFormError('Ingresa el motivo de consulta.')
      return
    }

    setSubmitting(true)
    try {
      const { reportId } = await onSubmit({
        patientId: selectedPatient.id,
        doctorId,
        specialtyId: selectedStudy?.specialtyId ?? '',
        studyId,
        appointmentDate,
        appointmentTime,
        reason: reason.trim(),
        notes: notes.trim() || undefined,
        origin,
        status: initialStatus,
      })

      setCreatedReportId(reportId)
      setFlowStep('done')
      setInfoMessage('Atención registrada correctamente.')
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : 'No se pudo registrar la atención. Intenta nuevamente.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-clinic-deep-blue/40 backdrop-blur-[1px]"
        onClick={handleClose}
        aria-label="Cerrar panel"
      />

      <aside className="fixed inset-y-0 right-0 z-50 flex h-screen w-full max-w-2xl flex-col overflow-hidden bg-clinic-white shadow-2xl sm:max-w-3xl">
        <header className="shrink-0 border-b border-clinic-sky/60 px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-clinic-deep-blue">Nueva atención</h2>
              <p className="mt-1 text-sm text-clinic-text/60">
                Busca o registra un paciente y asigna el estudio correspondiente.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg p-2 text-clinic-text/60 hover:bg-clinic-bg"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-4">
            <StepIndicator
              current={
                flowStep === 'done'
                  ? 'done'
                  : drawerMode === 'create_attention' || flowStep === 'appointment'
                    ? 'appointment'
                    : 'patient'
              }
            />
          </div>
        </header>

        {flowStep === 'done' ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-8 sm:px-6">
            <div className="mx-auto max-w-md text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-clinic-deep-blue">
                Atención registrada correctamente
              </h3>
              <p className="mt-2 text-sm text-clinic-text/70">
                La atención quedó asociada al paciente y lista para la bandeja de informes.
              </p>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
                {createdReportId ? (
                  <Link
                    to={`/reports/new?reportId=${createdReportId}`}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-clinic-blue px-4 py-2.5 text-sm font-semibold text-clinic-white hover:bg-clinic-deep-blue"
                  >
                    <FileText className="h-4 w-4" />
                    Abrir informe
                  </Link>
                ) : (
                  <Link
                    to="/reports"
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-clinic-sky px-4 py-2.5 text-sm font-medium hover:bg-clinic-bg"
                  >
                    Ver informes
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-lg border border-clinic-sky px-4 py-2.5 text-sm font-medium hover:bg-clinic-bg"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        ) : drawerMode === 'register_patient' ? (
          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-5 py-5 sm:px-6">
            <QuickPatientForm
              key={registerFormKey}
              patients={patientList}
              initialDni={registerDniPrefill}
              onSave={handlePatientSaved}
              onCancel={() => setDrawerMode('search_patient')}
              onSelectExisting={handleSelectExistingFromForm}
            />
          </div>
        ) : drawerMode === 'search_patient' || flowStep === 'patient' ? (
          <div className="relative z-[60] min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-5 py-5 sm:px-6">
            {formError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {formError}
              </div>
            )}
            <PatientSearchBox
              patients={patientList}
              query={patientSearch}
              onQueryChange={setPatientSearch}
              onSelect={handleSelectPatient}
              onRegisterNew={openRegisterPatient}
            />
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg border border-clinic-sky px-4 py-2.5 text-sm font-medium hover:bg-clinic-bg"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overflow-x-hidden px-5 py-5 sm:px-6">
              {formError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {formError}
                </div>
              )}
              {infoMessage && (
                <div className="flex gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  {infoMessage}
                </div>
              )}

              {selectedPatient && (
                <SelectedPatientCard
                  patient={selectedPatient}
                  onChangePatient={handleChangePatient}
                  allowChangePatient={!skipPatientSearch}
                  onViewChart={
                    onViewPatientChart
                      ? (patient) => {
                          onViewPatientChart(patient)
                          handleClose()
                        }
                      : undefined
                  }
                />
              )}

              <section className="rounded-xl border border-clinic-sky/50 bg-clinic-bg/30 p-4">
                <h3 className="text-sm font-semibold text-clinic-deep-blue">Datos de atención</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-clinic-deep-blue">
                      Bloque de estudio
                    </label>
                    <select
                      value={studyBlock}
                      onChange={(e) => {
                        setStudyBlock(e.target.value as 'all' | StudyBlock)
                        setStudyId('')
                      }}
                      className="w-full rounded-lg border border-clinic-sky/80 bg-clinic-white px-3 py-2.5 text-sm outline-none focus:border-clinic-blue"
                    >
                      <option value="all">Todos los bloques</option>
                      {studyBlocks.map((block) => (
                        <option key={block} value={block}>
                          {block}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-clinic-deep-blue">
                      Tipo de estudio
                    </label>
                    <select
                      value={studyId}
                      onChange={(e) => setStudyId(e.target.value)}
                      required
                      disabled={studiesLoading || studies.length === 0}
                      className="w-full rounded-lg border border-clinic-sky/80 bg-clinic-white px-3 py-2.5 text-sm outline-none focus:border-clinic-blue disabled:opacity-60"
                    >
                      <option value="">
                        {studiesLoading ? 'Cargando estudios...' : 'Seleccionar estudio'}
                      </option>
                      {sortedFilteredStudies.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedStudy?.specialtyName ? (
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-sm font-medium text-clinic-deep-blue">
                        Especialidad
                      </label>
                      <p className="rounded-lg border border-clinic-sky/80 bg-clinic-bg/40 px-3 py-2.5 text-sm">
                        {selectedStudy.specialtyName}
                      </p>
                    </div>
                  ) : null}
                </div>
              </section>

              {selectedStudy && (
                <section className="rounded-lg border border-clinic-teal/30 bg-clinic-sky/20 p-4">
                  <div className="flex items-start gap-3">
                    <FileText className="mt-0.5 h-5 w-5 shrink-0 text-clinic-teal" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-clinic-teal">
                        Plantilla asignada automáticamente
                      </p>
                      <p className="mt-1 font-medium text-clinic-deep-blue">{selectedStudy.name}</p>
                      <p className="text-sm text-clinic-text/70">
                        {getFormatTypeLabel(selectedStudy.formatType)}
                      </p>
                      <p className="mt-1 font-mono text-xs text-clinic-blue">
                        {selectedStudy.activeReportTemplate?.name ?? selectedStudy.templateId}
                      </p>
                    </div>
                  </div>
                </section>
              )}

              <section className="rounded-xl border border-clinic-sky/50 bg-clinic-white p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-clinic-deep-blue">
                  Motivo y observaciones
                </h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-clinic-deep-blue">
                      Médico responsable
                    </label>
                    <select
                      value={doctorId}
                      onChange={(e) => setDoctorId(e.target.value)}
                      required
                      className="w-full rounded-lg border border-clinic-sky/80 bg-clinic-bg/50 px-3 py-2.5 text-sm outline-none focus:border-clinic-blue"
                    >
                      <option value="">Seleccionar médico</option>
                      {sortedDoctors.map((d) => (
                        <option key={d.id} value={d.id}>
                          {formatResponsibleDoctorOptionLabel(d)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-clinic-deep-blue">
                      Fecha
                    </label>
                    <input
                      type="date"
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      required
                      className="w-full rounded-lg border border-clinic-sky/80 bg-clinic-bg/50 px-3 py-2.5 text-sm outline-none focus:border-clinic-blue"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-clinic-deep-blue">
                      Hora
                    </label>
                    <input
                      type="time"
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                      required
                      className="w-full rounded-lg border border-clinic-sky/80 bg-clinic-bg/50 px-3 py-2.5 text-sm outline-none focus:border-clinic-blue"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-clinic-deep-blue">
                      Procedencia de la atención
                    </label>
                    <select
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value as PatientOrigin)}
                      required
                      className="w-full rounded-lg border border-clinic-sky/80 bg-clinic-bg/50 px-3 py-2.5 text-sm outline-none focus:border-clinic-blue"
                    >
                      {originOptions.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-clinic-deep-blue">
                      Estado inicial
                    </label>
                    <select
                      value={initialStatus}
                      onChange={(e) =>
                        setInitialStatus(e.target.value as NewAppointmentInitialStatus)
                      }
                      className="w-full rounded-lg border border-clinic-sky/80 bg-clinic-bg/50 px-3 py-2.5 text-sm outline-none focus:border-clinic-blue"
                    >
                      {initialStatusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-clinic-deep-blue">
                      Motivo de consulta
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={3}
                      required
                      placeholder="Describa el motivo de la atención..."
                      className="w-full resize-none rounded-lg border border-clinic-sky/80 bg-clinic-bg/50 px-3 py-2.5 text-sm outline-none focus:border-clinic-blue"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-clinic-deep-blue">
                      Observaciones (opcional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      placeholder="Notas internas u observaciones adicionales..."
                      className="w-full resize-none rounded-lg border border-clinic-sky/80 bg-clinic-bg/50 px-3 py-2.5 text-sm outline-none focus:border-clinic-blue"
                    />
                  </div>
                </div>
              </section>
            </div>

            <footer className="shrink-0 flex gap-3 border-t border-clinic-sky/60 px-5 py-4 sm:px-6">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 rounded-lg border border-clinic-sky px-4 py-2.5 text-sm font-medium text-clinic-text transition hover:bg-clinic-bg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-lg bg-clinic-blue px-4 py-2.5 text-sm font-semibold text-clinic-white transition hover:bg-clinic-deep-blue disabled:opacity-60"
              >
                {submitting ? 'Registrando...' : 'Registrar atención'}
              </button>
            </footer>
          </form>
        )}
      </aside>
    </>
  )
}
