/**
 * Paleta visual global — Clínica
 *
 * Usar estas constantes en lógica JS/TS o estilos inline.
 * En componentes, preferir las clases de Tailwind definidas en `index.css`
 * (por ejemplo: `text-clinic-deep-blue`, `bg-clinic-bg`).
 */
export const colors = {
  /** Azul profundo */
  deepBlue: '#16486B',
  /** Azul clínico */
  clinicBlue: '#1F5D85',
  /** Verde aguamarina médico */
  medicalTeal: '#2F8F86',
  /** Celeste suave */
  softSky: '#BFE7E5',
  /** Fondo claro */
  lightBackground: '#F4F7FA',
  /** Texto principal */
  primaryText: '#263746',
  /** Blanco */
  white: '#FFFFFF',
} as const

export type ClinicColorKey = keyof typeof colors
