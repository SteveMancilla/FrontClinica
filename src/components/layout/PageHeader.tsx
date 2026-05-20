import type { ReactNode } from 'react'

interface PageHeaderProps {
  description: string
  meta?: ReactNode
  children?: ReactNode
}

/** Encabezado de página sin título: el módulo ya aparece en la barra superior. */
export default function PageHeader({ description, meta, children }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0 flex-1">
        <p className="text-sm text-clinic-text/80 sm:text-base">{description}</p>
        {meta ? <div className="mt-2">{meta}</div> : null}
      </div>
      {children ? <div className="flex shrink-0 flex-wrap gap-2">{children}</div> : null}
    </header>
  )
}
