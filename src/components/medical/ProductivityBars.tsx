interface BarItem {
  label: string
  value: number
  sublabel?: string
}

interface ProductivityBarsProps {
  title: string
  items: BarItem[]
  emptyMessage?: string
  highlightLabel?: string
}

export default function ProductivityBars({
  title,
  items,
  emptyMessage = 'Sin datos para mostrar.',
  highlightLabel,
}: ProductivityBarsProps) {
  const max = Math.max(...items.map((i) => i.value), 1)

  return (
    <section className="rounded-xl border border-clinic-sky/50 bg-clinic-white p-5 shadow-sm">
      <h3 className="font-semibold text-clinic-deep-blue">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-clinic-text/60">{emptyMessage}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((item) => {
            const pct = Math.round((item.value / max) * 100)
            const isHighlight = highlightLabel === item.label
            return (
              <li key={item.label}>
                <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                  <span
                    className={
                      isHighlight
                        ? 'font-semibold text-clinic-teal'
                        : 'text-clinic-text'
                    }
                  >
                    {item.label}
                  </span>
                  <span className="font-medium text-clinic-deep-blue">
                    {item.value}
                    {item.sublabel ? (
                      <span className="ml-1 text-xs font-normal text-clinic-text/50">
                        {item.sublabel}
                      </span>
                    ) : null}
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-clinic-bg">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isHighlight ? 'bg-clinic-teal' : 'bg-clinic-blue'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
