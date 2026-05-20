/** Prefijo honorífico neutro para médicos en informes (PDF y vista previa). */
export function formatDoctorHonorificName(fullName: string): string {
  const clean = fullName
    .replace(/^(Dr\.?|Dra\.?|Dr\(a\)\.?|DR\.?|DRA\.?)\s+/i, '')
    .trim()

  if (!clean) return '—'

  return `Dr(a). ${clean}`
}
