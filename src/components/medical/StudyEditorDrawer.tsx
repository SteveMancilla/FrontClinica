import { useEffect, useState } from 'react'
import { Save, X } from 'lucide-react'
import type { Study, StudyFormatType } from '@/types/medical'
import type { StudyBlock } from '@/utils/studyGrouping'

export interface StudyFormValues {
  specialtyId: string
  name: string
  block: StudyBlock
  formatType: StudyFormatType
  status: 'active' | 'inactive'
}

interface StudyEditorDrawerProps {
  isOpen: boolean
  study: Study | null
  specialties: { id: string; name: string }[]
  canEdit: boolean
  saving?: boolean
  onClose: () => void
  onSave: (values: StudyFormValues) => void
}

export default function StudyEditorDrawer({
  isOpen,
  study,
  specialties,
  canEdit,
  saving = false,
  onClose,
  onSave,
}: StudyEditorDrawerProps) {
  const [values, setValues] = useState<StudyFormValues>({
    specialtyId: specialties[0]?.id ?? '',
    name: '',
    block: 'Ecografía general',
    formatType: 'structured',
    status: 'active',
  })

  useEffect(() => {
    if (!isOpen) return
    if (study) {
      setValues({
        specialtyId: study.specialtyId,
        name: study.name,
        block: study.block ?? 'Ecografía general',
        formatType: study.formatType,
        status: study.isActive === false ? 'inactive' : 'active',
      })
    } else {
      setValues({
        specialtyId: specialties[0]?.id ?? '',
        name: '',
        block: 'Ecografía general',
        formatType: 'structured',
        status: 'active',
      })
    }
  }, [isOpen, study, specialties])

  if (!isOpen) return null

  const isCreate = !study

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-clinic-deep-blue/40"
        onClick={onClose}
        aria-label="Cerrar"
      />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-clinic-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-clinic-sky/60 px-5 py-4">
          <h2 className="text-lg font-bold text-clinic-deep-blue">
            {isCreate ? 'Nuevo estudio' : 'Editar estudio'}
          </h2>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-clinic-bg">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <label className="block text-sm">
            <span className="font-medium text-clinic-deep-blue">Nombre del estudio</span>
            <input
              value={values.name}
              disabled={!canEdit || saving}
              onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-clinic-sky/80 px-3 py-2 text-sm disabled:bg-clinic-bg"
              placeholder="Ej. Ecografía abdomen superior"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-clinic-deep-blue">Especialidad</span>
            <select
              value={values.specialtyId}
              disabled={!canEdit || saving || specialties.length === 0}
              onChange={(e) => setValues((v) => ({ ...v, specialtyId: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-clinic-sky/80 px-3 py-2 text-sm"
            >
              {specialties.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium text-clinic-deep-blue">Bloque</span>
            <select
              value={values.block}
              disabled={!canEdit || saving}
              onChange={(e) =>
                setValues((v) => ({
                  ...v,
                  block: e.target.value as StudyBlock,
                }))
              }
              className="mt-1 w-full rounded-lg border border-clinic-sky/80 px-3 py-2 text-sm"
            >
              <option value="Ecografía general">Ecografía general</option>
              <option value="Ecografía de partes blandas">Ecografía de partes blandas</option>
              <option value="Ecografía articular">Ecografía articular</option>
              <option value="Ecografía Doppler">Ecografía Doppler</option>
              <option value="Elastografías">Elastografías</option>
              <option value="Procedimientos">Procedimientos</option>
              <option value="Biopsias">Biopsias</option>
              <option value="Radiografías domiciliarias">Radiografías domiciliarias</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium text-clinic-deep-blue">Formato de informe</span>
            <select
              value={values.formatType}
              disabled={!canEdit || saving}
              onChange={(e) =>
                setValues((v) => ({
                  ...v,
                  formatType: e.target.value as StudyFormatType,
                }))
              }
              className="mt-1 w-full rounded-lg border border-clinic-sky/80 px-3 py-2 text-sm"
            >
              <option value="structured">Estructurado por secciones</option>
              <option value="narrative">Narrativo</option>
            </select>
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="font-medium text-clinic-deep-blue">Estado</span>
            <select
              value={values.status}
              disabled={!canEdit || saving}
              onChange={(e) =>
                setValues((v) => ({
                  ...v,
                  status: e.target.value as 'active' | 'inactive',
                }))
              }
              className="mt-1 w-full rounded-lg border border-clinic-sky/80 px-3 py-2 text-sm"
            >
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </label>
          <p className="text-xs text-clinic-text/60">
            Después de crear el estudio, use «Nueva plantilla» para definir las secciones del
            informe. Solo una plantilla activa por estudio se usa en las atenciones.
          </p>
        </div>

        {canEdit && (
          <div className="border-t border-clinic-sky/60 p-5">
            <button
              type="button"
              disabled={saving || !values.name.trim() || !values.specialtyId}
              onClick={() => onSave(values)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-clinic-blue px-4 py-2.5 text-sm font-semibold text-clinic-white hover:bg-clinic-deep-blue disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Guardando…' : isCreate ? 'Crear estudio' : 'Guardar cambios'}
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
