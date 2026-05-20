interface ModulePageProps {
  subtitle: string
  description: string
}

export default function ModulePage({ subtitle, description }: ModulePageProps) {
  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-clinic-text/80 sm:text-base">{subtitle}</p>
      </div>

      <div className="rounded-xl border border-clinic-sky/50 bg-clinic-white p-6 shadow-sm">
        <p className="leading-relaxed text-clinic-text">{description}</p>
      </div>
    </div>
  )
}
