interface SettingsSwitchProps {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export default function SettingsSwitch({
  label,
  description,
  checked,
  onChange,
  disabled,
}: SettingsSwitchProps) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-lg border border-clinic-sky/40 bg-clinic-bg/40 px-4 py-3">
      <div>
        <span className="text-sm font-medium text-clinic-text">{label}</span>
        {description && (
          <p className="mt-0.5 text-xs text-clinic-text/60">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-clinic-teal' : 'bg-clinic-sky'
        } ${disabled ? 'opacity-50' : ''}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-clinic-white shadow transition-transform ${
            checked ? 'translate-x-5' : ''
          }`}
        />
      </button>
    </label>
  )
}
