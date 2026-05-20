/** Normaliza ids de filtros select: vacío → "all". */
export function normalizeFilterId(value: string | undefined | null): string {
  const trimmed = value?.trim()
  return trimmed && trimmed !== 'all' ? trimmed : 'all'
}
