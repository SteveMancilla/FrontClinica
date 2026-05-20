import { apiGet } from '@/services/apiClient'
import type { AppNotification } from '@/types/search'
import { getReportStatusLabel } from '@/utils/reportStatus'
import type { ReportStatus } from '@/types/medical'

type NotificationApiItem = {
  id: number | string
  patient_name?: string | null
  study_name?: string | null
  doctor_name?: string | null
  status: ReportStatus
  updated_at: string
}

type NotificationApiPayload = {
  items: NotificationApiItem[]
  unread_count: number
}

function priorityForStatus(status: ReportStatus): AppNotification['priority'] {
  if (status === 'missing_report' || status === 'missing_diagnostic_impression') {
    return 'high'
  }
  return 'medium'
}

export async function getNotifications(): Promise<{
  items: AppNotification[]
  unreadCount: number
}> {
  const result = await apiGet<NotificationApiPayload | { data: NotificationApiPayload }>(
    '/notifications',
  )

  const payload =
    result && typeof result === 'object' && 'data' in result
      ? (result as { data: NotificationApiPayload }).data
      : (result as NotificationApiPayload)

  const items = (payload.items ?? []).map((row) => {
    const statusLabel = getReportStatusLabel(row.status)
    const id = String(row.id)

    return {
      id: `report-${id}`,
      title: row.patient_name ?? 'Informe pendiente',
      message: `${row.study_name ?? 'Estudio'} · ${statusLabel}${
        row.doctor_name ? ` · ${row.doctor_name}` : ''
      }`,
      href: `/reports/new?reportId=${id}`,
      priority: priorityForStatus(row.status),
      createdAt: row.updated_at,
    }
  })

  return {
    items,
    unreadCount: payload.unread_count ?? items.length,
  }
}
