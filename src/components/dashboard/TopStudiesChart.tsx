import type { TopStudyItem } from '@/utils/dashboard'

interface TopStudiesChartProps {
  items: TopStudyItem[]
  emptyMessage?: string
}

export default function TopStudiesChart({
  items,
  emptyMessage = 'No hay estudios registrados en este periodo.',
}: TopStudiesChartProps) {
  if (items.length === 0) {
    return <p className="text-sm text-clinic-text/60">{emptyMessage}</p>
  }

  const max = Math.max(...items.map((i) => i.count), 1)

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.studyId}>
          <div className="mb-1 flex justify-between text-sm">
            <span className="font-medium text-clinic-text">{item.studyName}</span>
            <span className="text-clinic-text/60">{item.count} · {item.percentage}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-clinic-bg">
            <div
              className="h-full rounded-full bg-clinic-blue transition-all"
              style={{ width: `${(item.count / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
