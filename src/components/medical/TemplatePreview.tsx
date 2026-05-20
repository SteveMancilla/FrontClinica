import { useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import ReportDocumentLayout from '@/components/medical/ReportDocumentLayout'
import { getCurrentUser } from '@/services/authService'
import { getUsers } from '@/services/userService'
import type { ReportTemplate, Study } from '@/types/medical'
import type { SystemUser } from '@/types/auth'
import {
  formatPhysicianHonorificName,
  formatPhysicianTitle,
  resolveReportingPhysicianFromUsers,
} from '@/utils/reportingPhysician'

interface TemplatePreviewProps {
  isOpen: boolean
  onClose: () => void
  template: ReportTemplate | null
  study?: Study | null
}

const SAMPLE = {
  patientName: 'Paciente de ejemplo',
  age: 35,
  origin: 'Particular',
}

function formatPreviewDateTime(): string {
  const now = new Date()
  const date = now.toLocaleDateString('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const time = now.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
  })
  return `${date} ${time} Horas`
}

export default function TemplatePreview({
  isOpen,
  onClose,
  template,
  study,
}: TemplatePreviewProps) {
  const sessionUser = getCurrentUser()
  const [physician, setPhysician] = useState<SystemUser | null>(null)

  useEffect(() => {
    if (!isOpen || !sessionUser?.id) return

    let cancelled = false
    getUsers()
      .then((users) => {
        if (cancelled) return
        setPhysician(resolveReportingPhysicianFromUsers(users, sessionUser.id))
      })
      .catch(() => {
        if (!cancelled) setPhysician(null)
      })

    return () => {
      cancelled = true
    }
  }, [isOpen, sessionUser?.id])

  const sections = useMemo(() => {
    if (!template) return []
    return [...template.sections]
      .sort((a, b) => a.order - b.order)
      .map((section) => ({
        id: section.id,
        title: section.title,
        content: section.baseText?.trim() || 'Texto base de la sección (se completa al dictar el informe).',
      }))
  }, [template])

  if (!isOpen || !template) return null

  const physicianName = formatPhysicianHonorificName(
    physician?.fullName ?? sessionUser?.fullName ?? 'Médico responsable',
  )
  const physicianSpecialty = formatPhysicianTitle(physician ?? undefined)

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-50 bg-clinic-deep-blue/50"
        onClick={onClose}
        aria-label="Cerrar"
      />
      <div className="fixed inset-4 z-50 flex flex-col overflow-hidden rounded-xl bg-clinic-bg shadow-2xl md:inset-8">
        <PreviewHeader onClose={onClose} template={template} />
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <ReportDocumentLayout
            patientName={SAMPLE.patientName}
            patientAge={SAMPLE.age}
            studyName={study?.name ?? template.name}
            origin={SAMPLE.origin}
            dateTime={formatPreviewDateTime()}
            physicianName={physicianName}
            physicianSpecialty={physicianSpecialty}
            formatType={template.formatType}
            sections={sections}
            diagnosticImpression="Impresión diagnóstica de ejemplo (se genera al concluir el informe)."
            sampleNote="Vista previa con datos de demostración. El informe real usará los datos del paciente y el médico responsable de la atención."
          />
        </div>
      </div>
    </>
  )
}

function PreviewHeader({
  onClose,
  template,
}: {
  onClose: () => void
  template: ReportTemplate
}) {
  return (
    <div className="flex items-center justify-between border-b border-clinic-sky/60 bg-clinic-white px-4 py-3">
      <div>
        <h2 className="font-semibold text-clinic-deep-blue">Vista previa de plantilla</h2>
        <p className="text-xs text-clinic-text/60">{template.name}</p>
      </div>
      <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-clinic-bg">
        <X className="h-5 w-5" />
      </button>
    </div>
  )
}
