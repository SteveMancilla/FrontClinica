import { useState, type FormEvent } from 'react'
import { AlertTriangle, ArrowLeft, Save } from 'lucide-react'
import type { Patient, PatientOrigin, PatientSex } from '@/types/medical'
import { findPatientByDni } from '@/utils/patientCatalog'

export interface QuickPatientFormInput {
  dni: string
  fullName: string
  age: string
  sex: PatientSex | ''
  phone: string
  origin: PatientOrigin | ''
  address: string
  email: string
  emergencyContactName: string
  emergencyContactPhone: string
  notes: string
}

interface QuickPatientFormProps {
  patients: Patient[]
  initialDni?: string
  onSave: (input: QuickPatientFormInput) => Promise<void>
  onCancel: () => void
  onSelectExisting: (patient: Patient) => void
}

const originOptions: PatientOrigin[] = [
  'Particular',
  'Emergencia',
  'Consulta externa',
  'Referido',
  'Convenio',
  'Hospitalización',
]

const emptyForm = (): QuickPatientFormInput => ({
  dni: '',
  fullName: '',
  age: '',
  sex: '',
  phone: '',
  origin: '',
  address: '',
  email: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  notes: '',
})

const inputClass =
  'mt-1 w-full rounded-lg border border-clinic-sky/80 bg-clinic-white px-3 py-2 text-sm focus:border-clinic-blue focus:outline-none focus:ring-1 focus:ring-clinic-blue'

type FieldErrors = Partial<Record<keyof QuickPatientFormInput, string>>

export default function QuickPatientForm({
  patients,
  initialDni = '',
  onSave,
  onCancel,
  onSelectExisting,
}: QuickPatientFormProps) {
  const [form, setForm] = useState<QuickPatientFormInput>(() => ({
    ...emptyForm(),
    dni: initialDni.replace(/\D/g, ''),
  }))
  const [errors, setErrors] = useState<FieldErrors>({})
  const [duplicatePatient, setDuplicatePatient] = useState<Patient | null>(null)
  const [saving, setSaving] = useState(false)

  const set = <K extends keyof QuickPatientFormInput>(key: K, value: QuickPatientFormInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
    if (key === 'dni') setDuplicatePatient(null)
  }

  const validate = (): boolean => {
    const next: FieldErrors = {}
    const dni = form.dni.trim()

    if (!dni) next.dni = 'Este campo es obligatorio.'
    else if (!/^\d+$/.test(dni)) next.dni = 'El DNI debe contener solo números.'
    else if (dni.length < 8) next.dni = 'El DNI debe tener al menos 8 dígitos.'

    if (!form.fullName.trim()) next.fullName = 'Este campo es obligatorio.'

    const ageNum = Number(form.age)
    if (!form.age.trim()) next.age = 'Este campo es obligatorio.'
    else if (!Number.isFinite(ageNum) || ageNum <= 0) next.age = 'Ingresa una edad válida mayor a 0.'

    if (!form.sex) next.sex = 'Este campo es obligatorio.'
    if (!form.phone.trim()) next.phone = 'Este campo es obligatorio.'
    if (!form.origin) next.origin = 'Este campo es obligatorio.'

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const existing = findPatientByDni(patients, form.dni.trim())
    if (existing) {
      setDuplicatePatient(existing)
      return
    }

    setSaving(true)
    try {
      await onSave(form)
      setForm(emptyForm())
      setDuplicatePatient(null)
    } catch {
      setErrors((prev) => ({
        ...prev,
        fullName: 'No se pudo guardar el paciente. Verifica los datos e intenta de nuevo.',
      }))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5 rounded-xl border border-clinic-sky/50 bg-clinic-white p-4 shadow-sm sm:p-5">
      <div>
        <h3 className="text-lg font-bold text-clinic-deep-blue">Registrar nuevo paciente</h3>
        <p className="mt-1 text-sm text-clinic-text/70">
          Completa los datos básicos del paciente para asociarlo a esta atención.
        </p>
        <p className="mt-1 text-sm text-clinic-teal">
          Este paciente quedará seleccionado para crear la atención.
        </p>
      </div>

      {duplicatePatient && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <div className="flex gap-2">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-medium">Ya existe un paciente registrado con este DNI.</p>
              <p className="mt-1 text-amber-800/90">{duplicatePatient.fullName}</p>
              <button
                type="button"
                onClick={() => {
                  onSelectExisting(duplicatePatient)
                  setDuplicatePatient(null)
                }}
                className="mt-2 font-semibold text-clinic-blue hover:underline"
              >
                Seleccionar paciente existente
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="font-medium text-clinic-text">DNI *</span>
            <input
              value={form.dni}
              onChange={(e) => set('dni', e.target.value.replace(/\D/g, ''))}
              inputMode="numeric"
              maxLength={12}
              className={inputClass}
            />
            {errors.dni && <span className="mt-1 block text-xs text-red-600">{errors.dni}</span>}
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="font-medium text-clinic-text">Nombres y apellidos *</span>
            <input value={form.fullName} onChange={(e) => set('fullName', e.target.value)} className={inputClass} />
            {errors.fullName && (
              <span className="mt-1 block text-xs text-red-600">{errors.fullName}</span>
            )}
          </label>
          <label className="block text-sm">
            <span className="font-medium text-clinic-text">Edad *</span>
            <input
              type="number"
              min={1}
              value={form.age}
              onChange={(e) => set('age', e.target.value)}
              className={inputClass}
            />
            {errors.age && <span className="mt-1 block text-xs text-red-600">{errors.age}</span>}
          </label>
          <label className="block text-sm">
            <span className="font-medium text-clinic-text">Sexo *</span>
            <select
              value={form.sex}
              onChange={(e) => set('sex', e.target.value as PatientSex | '')}
              className={inputClass}
            >
              <option value="">Seleccionar</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
            </select>
            {errors.sex && <span className="mt-1 block text-xs text-red-600">{errors.sex}</span>}
          </label>
          <label className="block text-sm">
            <span className="font-medium text-clinic-text">Celular *</span>
            <input value={form.phone} onChange={(e) => set('phone', e.target.value)} className={inputClass} />
            {errors.phone && <span className="mt-1 block text-xs text-red-600">{errors.phone}</span>}
          </label>
          <label className="block text-sm">
            <span className="font-medium text-clinic-text">Procedencia *</span>
            <select
              value={form.origin}
              onChange={(e) => set('origin', e.target.value as PatientOrigin | '')}
              className={inputClass}
            >
              <option value="">Seleccionar</option>
              {originOptions.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
            {errors.origin && (
              <span className="mt-1 block text-xs text-red-600">{errors.origin}</span>
            )}
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="font-medium text-clinic-text">Dirección</span>
            <input value={form.address} onChange={(e) => set('address', e.target.value)} className={inputClass} />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-clinic-text">Correo</span>
            <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={inputClass} />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-clinic-text">Contacto de emergencia</span>
            <input
              value={form.emergencyContactName}
              onChange={(e) => set('emergencyContactName', e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-clinic-text">Teléfono de emergencia</span>
            <input
              value={form.emergencyContactPhone}
              onChange={(e) => set('emergencyContactPhone', e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="font-medium text-clinic-text">Observaciones</span>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              className={inputClass}
            />
          </label>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-clinic-sky/60 pt-4 sm:flex-row">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-clinic-sky bg-clinic-white px-4 py-2.5 text-sm font-medium hover:bg-clinic-bg"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a búsqueda
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-clinic-blue px-4 py-2.5 text-sm font-semibold text-clinic-white hover:bg-clinic-deep-blue disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Guardando...' : 'Guardar paciente'}
          </button>
        </div>
      </form>
    </div>
  )
}
