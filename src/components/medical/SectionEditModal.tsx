import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { X } from 'lucide-react'

const inputClass =
  'mt-1 w-full rounded-lg border border-clinic-sky/80 px-3 py-2 text-sm focus:border-clinic-blue focus:outline-none focus:ring-1 focus:ring-clinic-blue'

export interface SectionFormData {
  id: string
  title: string
  order: number
  baseText: string
  isRequired: boolean
  voiceEnabled: boolean
  notes?: string
}

interface SectionEditModalProps {
  isOpen: boolean
  initial?: SectionFormData | null
  nextOrder: number
  onClose: () => void
  onSave: (section: SectionFormData) => void
}

const emptySection = (order: number): SectionFormData => ({
  id: `sec-${Date.now()}`,
  title: '',
  order,
  baseText: '',
  isRequired: true,
  voiceEnabled: true,
  notes: '',
})

export default function SectionEditModal({
  isOpen,
  initial,
  nextOrder,
  onClose,
  onSave,
}: SectionEditModalProps) {
  const [form, setForm] = useState<SectionFormData>(emptySection(nextOrder))

  useEffect(() => {
    if (isOpen) {
      setForm(initial ?? emptySection(nextOrder))
    }
  }, [isOpen, initial, nextOrder])

  if (!isOpen) return null

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return
    onSave({ ...form, title: form.title.trim(), baseText: form.baseText.trim() })
  }

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[60] bg-clinic-deep-blue/40"
        onClick={onClose}
        aria-label="Cerrar"
      />
      <div className="fixed top-1/2 left-1/2 z-[60] flex max-h-[90vh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl bg-clinic-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-clinic-sky/60 px-5 py-4">
          <h3 className="font-semibold text-clinic-deep-blue">
            {initial ? 'Editar sección' : 'Agregar sección'}
          </h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1 hover:bg-clinic-bg">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="space-y-4 overflow-y-auto p-5">
            <Field label="Título de sección">
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
                placeholder="Ej: Hígado"
                className={inputClass}
              />
            </Field>
            <Field label="Orden">
              <input
                type="number"
                min={1}
                value={form.order}
                onChange={(e) =>
                  setForm((f) => ({ ...f, order: Number(e.target.value) || 1 }))
                }
                className={inputClass}
              />
            </Field>
            <Field label="Texto base">
              <textarea
                value={form.baseText}
                onChange={(e) => setForm((f) => ({ ...f, baseText: e.target.value }))}
                rows={6}
                placeholder="Texto clínico base para dictado y edición..."
                className={`${inputClass} resize-y`}
              />
            </Field>
            <Field label="Observaciones (opcional)">
              <input
                value={form.notes ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                className={inputClass}
              />
            </Field>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isRequired}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, isRequired: e.target.checked }))
                  }
                />
                Sección requerida
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.voiceEnabled}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, voiceEnabled: e.target.checked }))
                  }
                />
                Dictado por voz habilitado
              </label>
            </div>
          </div>
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
              className="flex-1 rounded-lg bg-clinic-blue py-2.5 text-sm font-semibold text-clinic-white"
            >
              Guardar sección
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-clinic-deep-blue">{label}</span>
      {children}
    </label>
  )
}
