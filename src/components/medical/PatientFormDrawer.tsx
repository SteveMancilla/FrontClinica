import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Save, X } from 'lucide-react'
import type { Patient, PatientOrigin, PatientSex } from '@/types/medical'

export interface PatientFormInput {
  dni: string
  fullName: string
  age: number
  sex: PatientSex
  phone: string
  address: string
  origin: PatientOrigin
  email: string
  emergencyContactName: string
  emergencyContactPhone: string
  notes: string
}

interface PatientFormDrawerProps {
  isOpen: boolean
  mode: 'create' | 'edit'
  initial?: Patient | null
  onClose: () => void
  onSave: (input: PatientFormInput, existingId?: string) => void
}

const originOptions: PatientOrigin[] = [
  'Particular',
  'Emergencia',
  'Consulta externa',
  'Referido',
  'Convenio',
  'Hospitalización',
]

const emptyForm = (): PatientFormInput => ({
  dni: '',
  fullName: '',
  age: 0,
  sex: 'Femenino',
  phone: '',
  address: '',
  origin: 'Particular',
  email: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  notes: '',
})

const inputClass =
  'mt-1 w-full rounded-lg border border-clinic-sky/80 px-3 py-2 text-sm focus:border-clinic-blue focus:outline-none focus:ring-1 focus:ring-clinic-blue'

export default function PatientFormDrawer({
  isOpen,
  mode,
  initial,
  onClose,
  onSave,
}: PatientFormDrawerProps) {
  const [form, setForm] = useState<PatientFormInput>(emptyForm())
  const [savedMessage, setSavedMessage] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setSavedMessage(false)
    if (initial && mode === 'edit') {
      setForm({
        dni: initial.dni,
        fullName: initial.fullName,
        age: initial.age,
        sex: initial.sex,
        phone: initial.phone,
        address: initial.address ?? '',
        origin: initial.origin,
        email: initial.email ?? '',
        emergencyContactName: initial.emergencyContactName ?? '',
        emergencyContactPhone: initial.emergencyContactPhone ?? '',
        notes: initial.notes ?? '',
      })
    } else {
      setForm(emptyForm())
    }
  }, [isOpen, initial, mode])

  if (!isOpen) return null

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!form.dni.trim() || !form.fullName.trim() || !form.phone.trim()) return
    if (!form.age || form.age < 1) return
    onSave(
      {
        ...form,
        dni: form.dni.trim(),
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
      },
      mode === 'edit' ? initial?.id : undefined,
    )
    setSavedMessage(true)
    if (mode === 'create') {
      setForm(emptyForm())
    }
  }

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-clinic-deep-blue/40"
        onClick={onClose}
        aria-label="Cerrar"
      />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col bg-clinic-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-clinic-sky/60 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-clinic-deep-blue">
              {mode === 'create' ? 'Registrar paciente' : 'Editar datos del paciente'}
            </h2>
            <p className="text-xs text-clinic-text/60">
              Registro manual — sin consulta a RENIEC
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-clinic-bg">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="grid flex-1 gap-4 overflow-y-auto p-5 sm:grid-cols-2">
            <Field label="DNI *" className="sm:col-span-1">
              <input
                required
                value={form.dni}
                onChange={(e) => setForm((f) => ({ ...f, dni: e.target.value }))}
                className={inputClass}
                maxLength={8}
              />
            </Field>
            <Field label="Edad *" className="sm:col-span-1">
              <input
                type="number"
                required
                min={1}
                max={120}
                value={form.age || ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, age: Number(e.target.value) || 0 }))
                }
                className={inputClass}
              />
            </Field>
            <Field label="Nombres y apellidos *" className="sm:col-span-2">
              <input
                required
                value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                className={inputClass}
              />
            </Field>
            <Field label="Sexo *">
              <select
                required
                value={form.sex}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sex: e.target.value as PatientSex }))
                }
                className={inputClass}
              >
                <option value="Femenino">Femenino</option>
                <option value="Masculino">Masculino</option>
              </select>
            </Field>
            <Field label="Celular *">
              <input
                required
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className={inputClass}
              />
            </Field>
            <Field label="Dirección" className="sm:col-span-2">
              <input
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                className={inputClass}
              />
            </Field>
            <Field label="Procedencia *" className="sm:col-span-2">
              <select
                required
                value={form.origin}
                onChange={(e) =>
                  setForm((f) => ({ ...f, origin: e.target.value as PatientOrigin }))
                }
                className={inputClass}
              >
                {originOptions.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Correo (opcional)" className="sm:col-span-2">
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className={inputClass}
              />
            </Field>
            <Field label="Contacto de emergencia (opcional)">
              <input
                value={form.emergencyContactName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, emergencyContactName: e.target.value }))
                }
                className={inputClass}
              />
            </Field>
            <Field label="Teléfono de emergencia (opcional)">
              <input
                value={form.emergencyContactPhone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, emergencyContactPhone: e.target.value }))
                }
                className={inputClass}
              />
            </Field>
            <Field label="Observaciones" className="sm:col-span-2">
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                className={`${inputClass} resize-y`}
              />
            </Field>
          </div>

          {savedMessage && (
            <p className="mx-5 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              Paciente {mode === 'create' ? 'registrado' : 'actualizado'} correctamente.
            </p>
          )}

          <div className="flex gap-3 border-t border-clinic-sky/60 p-5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-clinic-sky py-2.5 text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-clinic-blue py-2.5 text-sm font-semibold text-clinic-white hover:bg-clinic-deep-blue"
            >
              <Save className="h-4 w-4" />
              Guardar paciente
            </button>
          </div>
        </form>
      </aside>
    </>
  )
}

function Field({
  label,
  children,
  className = '',
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="font-medium text-clinic-deep-blue">{label}</span>
      {children}
    </label>
  )
}
