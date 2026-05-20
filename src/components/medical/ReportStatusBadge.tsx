import StatusBadge from '@/components/ui/StatusBadge'
import type { ReportStatus } from '@/types/medical'
import {
  getReportStatusLabel,
  getReportStatusVariant,
} from '@/utils/reportStatus'

interface ReportStatusBadgeProps {
  status: ReportStatus
}

export default function ReportStatusBadge({ status }: ReportStatusBadgeProps) {
  return (
    <StatusBadge
      label={getReportStatusLabel(status)}
      variant={getReportStatusVariant(status)}
    />
  )
}
