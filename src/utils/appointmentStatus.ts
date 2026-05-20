import type { AppointmentStatus } from '@/types/medical'

export const appointmentStatusLabels: Record<AppointmentStatus, string> = {
  pending_study: 'Pendiente de estudio',
  study_done: 'Estudio realizado',
  missing_report: 'Falta informe',
  missing_diagnostic_impression: 'Falta impresión',
  in_review: 'En revisión',
  concluded: 'Concluido',
  pdf_generated: 'PDF generado',
}

export type StatusBadgeVariant =
  | 'neutral'
  | 'info'
  | 'warning'
  | 'danger'
  | 'purple'
  | 'success'
  | 'teal'

export const appointmentStatusVariants: Record<
  AppointmentStatus,
  StatusBadgeVariant
> = {
  pending_study: 'neutral',
  study_done: 'info',
  missing_report: 'warning',
  missing_diagnostic_impression: 'danger',
  in_review: 'purple',
  concluded: 'success',
  pdf_generated: 'teal',
}

export function getAppointmentStatusLabel(status: AppointmentStatus): string {
  return appointmentStatusLabels[status]
}

export function getAppointmentStatusVariant(
  status: AppointmentStatus,
): StatusBadgeVariant {
  return appointmentStatusVariants[status]
}

export const appointmentStatusOptions: AppointmentStatus[] = [
  'pending_study',
  'study_done',
  'missing_report',
  'missing_diagnostic_impression',
  'in_review',
  'concluded',
  'pdf_generated',
]
