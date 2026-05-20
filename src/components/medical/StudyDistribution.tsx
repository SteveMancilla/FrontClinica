import type { StudyProductivitySummary } from '@/types/medical'
import ProductivityBars from '@/components/medical/ProductivityBars'

interface StudyDistributionProps {
  items: StudyProductivitySummary[]
  limit?: number
}

export default function StudyDistribution({
  items,
  limit = 5,
}: StudyDistributionProps) {
  const top = items.slice(0, limit)
  const barItems = top.map((s) => ({
    label: s.studyName,
    value: s.total,
    sublabel: `${s.concluded} concl. / ${s.pending} pend.`,
  }))

  return (
    <ProductivityBars
      title="Estudios más realizados"
      items={barItems}
      highlightLabel={top[0]?.studyName}
      emptyMessage="No hay estudios registrados en el periodo."
    />
  )
}
