import StatusBadge from '@/components/ui/StatusBadge'
import {
  patientReportsStatusLabels,
  patientReportsStatusVariants,
  type PatientReportsSummaryStatus,
} from '@/utils/patientCatalog'

interface PatientStatusBadgeProps {
  status: PatientReportsSummaryStatus
}

export default function PatientStatusBadge({ status }: PatientStatusBadgeProps) {
  return (
    <StatusBadge
      label={patientReportsStatusLabels[status]}
      variant={patientReportsStatusVariants[status]}
    />
  )
}
