import type { ReactNode } from 'react'

interface SectionCardProps {
  title: string
  children: ReactNode
  action?: ReactNode
}

export default function SectionCard({ title, children, action }: SectionCardProps) {
  return (
    <section className="rounded-xl border border-clinic-sky/50 bg-clinic-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-clinic-deep-blue">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}
