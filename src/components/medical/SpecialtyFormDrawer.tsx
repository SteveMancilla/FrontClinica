import { useEffect, useState, type FormEvent } from 'react'
import { Save, X } from 'lucide-react'
import type { Specialty } from '@/types/medical'

export interface SpecialtyFormInput {
  name: string
  description: string
  isActive: boolean
  iconLabel: string
  notes: string
}

interface SpecialtyFormDrawerProps {
  isOpen: boolean
  mode: 'create' | 'edit'
  initial?: Specialty | null
  onClose: () => void
  onSave: (input: SpecialtyFormInput, existingId?: string) => void
}

const inputClass =
  'mt-1 w-full rounded-lg border border-clinic-sky/80 px-3 py-2 text-sm focus:border-clinic-blue focus:outline-none focus:ring-1 focus:ring-clinic-blue'

export default function SpecialtyFormDrawer({
  isOpen,
  mode,
  initial,
  onClose,
  onSave,
}: SpecialtyFormDrawerProps) {
  const [form, setForm] = useState<SpecialtyFormInput>({
    name: '',
    description: '',
    isActive: true,
    iconLabel: '',
    notes: '',
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setSaved(false)
    if (initial && mode === 'edit') {
      setForm({
        name: initial.name,
        description: initial.description ?? '',
        isActive: initial.isActive !== false,
        iconLabel: initial.iconLabel ?? '',
        notes: initial.notes ?? '',
      })
    } else {
      setForm({ name: '', description: '', isActive: true, iconLabel: '', notes: '' })
    }
  }, [isOpen, initial, mode])

  if (!isOpen) return null

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    onSave(form, mode === 'edit' ? initial?.id : undefined)
    setSaved(true)
    if (mode === 'create') setTimeout(onClose, 1000)
  }

  return (
    <>
      <button type="button" className="fixed inset-0 z-40 bg-clinic-deep-blue/40" onClick={onClose} />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-clinic-white shadow-2xl">
        <header className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-lg font-bold text-clinic-deep-blue">
            {mode === 'create' ? 'Nueva especialidad' : 'Editar especialidad'}
          </h2>
          <button type="button" onClick={onClose}><X className="h-5 w-5" /></button>
        </header>
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden p-5">
          <div className="space-y-4 overflow-y-auto">
            <label className="block text-sm">
              <span className="font-medium">Nombre *</span>
              <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputClass} />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Descripción</span>
              <textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className={`${inputClass} resize-y`} />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Estado</span>
              <select value={form.isActive ? 'active' : 'inactive'} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.value === 'active' }))} className={inputClass}>
                <option value="active">Activa</option>
                <option value="inactive">Inactiva</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="font-medium">Etiqueta / icono (opcional)</span>
              <input value={form.iconLabel} onChange={(e) => setForm((f) => ({ ...f, iconLabel: e.target.value }))} className={inputClass} placeholder="Ej: ECO" />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Observaciones internas</span>
              <textarea rows={2} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} className={`${inputClass} resize-y`} />
            </label>
          </div>
          {saved && <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">Especialidad registrada correctamente.</p>}
          <footer className="mt-auto flex gap-3 pt-6">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border py-2.5 text-sm">Cancelar</button>
            <button type="submit" className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-clinic-blue py-2.5 text-sm font-semibold text-clinic-white">
              <Save className="h-4 w-4" /> Guardar especialidad
            </button>
          </footer>
        </form>
      </aside>
    </>
  )
}
