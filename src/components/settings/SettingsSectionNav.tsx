import clsx from 'clsx'
import type { SettingsSectionId } from '@/types/settings'
import type { SettingsNavItem } from '@/utils/settings'

interface SettingsSectionNavProps {
  sections: SettingsNavItem[]
  active: SettingsSectionId
  onChange: (id: SettingsSectionId) => void
  variant?: 'sidebar' | 'tabs'
}

export default function SettingsSectionNav({
  sections,
  active,
  onChange,
  variant = 'sidebar',
}: SettingsSectionNavProps) {
  if (variant === 'tabs') {
    return (
      <div className="flex gap-2 overflow-x-auto pb-1">
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => onChange(section.id)}
            className={clsx(
              'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors',
              active === section.id
                ? 'bg-clinic-blue text-clinic-white'
                : 'border border-clinic-sky bg-clinic-white text-clinic-text hover:bg-clinic-bg',
            )}
          >
            {section.label}
          </button>
        ))}
      </div>
    )
  }

  return (
    <nav className="space-y-1">
      {sections.map((section) => (
        <button
          key={section.id}
          type="button"
          onClick={() => onChange(section.id)}
          className={clsx(
            'flex w-full flex-col rounded-lg px-3 py-2.5 text-left transition-colors',
            active === section.id
              ? 'bg-clinic-blue text-clinic-white'
              : 'text-clinic-text hover:bg-clinic-bg',
          )}
        >
          <span className="text-sm font-semibold">{section.label}</span>
          <span
            className={clsx(
              'text-xs',
              active === section.id ? 'text-clinic-sky/90' : 'text-clinic-text/50',
            )}
          >
            {section.description}
          </span>
        </button>
      ))}
    </nav>
  )
}
