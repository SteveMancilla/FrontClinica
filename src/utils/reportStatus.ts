import type { ReportStatus } from '@/types/medical'
import type { StatusBadgeVariant } from '@/utils/appointmentStatus'

export const reportStatusLabels: Record<ReportStatus, string> = {
  missing_report: 'Falta informe',
  missing_diagnostic_impression: 'Falta impresión',
  in_review: 'En revisión',
  concluded: 'Concluido',
  pdf_generated: 'PDF generado',
}

export const reportStatusVariants: Record<ReportStatus, StatusBadgeVariant> = {
  missing_report: 'warning',
  missing_diagnostic_impression: 'danger',
  in_review: 'purple',
  concluded: 'success',
  pdf_generated: 'teal',
}

export type ReportChipFilter =
  | 'all'
  | ReportStatus
  | 'concluded_group'

export const reportChipOptions: { value: ReportChipFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'missing_report', label: 'Falta informe' },
  { value: 'missing_diagnostic_impression', label: 'Falta impresión' },
  { value: 'in_review', label: 'En revisión' },
  { value: 'concluded', label: 'Concluidos' },
  { value: 'pdf_generated', label: 'PDF generado' },
]

export function getReportStatusLabel(status: ReportStatus): string {
  return reportStatusLabels[status]
}

export function getReportStatusVariant(status: ReportStatus): StatusBadgeVariant {
  return reportStatusVariants[status]
}

export function getReportActionLabel(status: ReportStatus): string {
  switch (status) {
    case 'missing_report':
      return 'Dictar informe'
    case 'missing_diagnostic_impression':
      return 'Generar impresión'
    case 'in_review':
      return 'Continuar'
    case 'concluded':
      return 'Editar informe'
    case 'pdf_generated':
      return 'Editar informe'
  }
}

export type ReportPriority = 'high' | 'medium' | 'normal'

export function getReportPriority(status: ReportStatus): ReportPriority {
  switch (status) {
    case 'missing_report':
      return 'high'
    case 'missing_diagnostic_impression':
    case 'in_review':
      return 'medium'
    default:
      return 'normal'
  }
}

export function getReportRowClass(status: ReportStatus): string {
  switch (getReportPriority(status)) {
    case 'high':
      return 'bg-red-50/40 border-l-4 border-l-red-300'
    case 'medium':
      return 'bg-amber-50/25 border-l-4 border-l-amber-200'
    default:
      return 'border-l-4 border-l-transparent'
  }
}

export function formatReportUpdatedAt(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
