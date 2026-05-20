/**
 * Normalización básica y segura de texto dictado médico.
 * No altera contenido clínico complejo ni convierte números en palabras.
 */
export function normalizeMedicalDictationText(text: string): string {
  let result = text.trim()
  if (!result) return ''

  const replacements: [RegExp, string][] = [
    [/\bmilímetros\b/gi, 'mm'],
    [/\bmilimetros\b/gi, 'mm'],
    [/\bcentímetros\b/gi, 'cm'],
    [/\bcentimetros\b/gi, 'cm'],
    [/\bpor\b/gi, 'x'],
    [/\bpunto\b/gi, '.'],
    [/\bcoma\b/gi, '.'],
    [/\s+/g, ' '],
  ]

  for (const [pattern, replacement] of replacements) {
    result = result.replace(pattern, replacement)
  }

  // "4 . 4 mm" → "4.4 mm"
  result = result.replace(/(\d)\s*\.\s*(\d)/g, '$1.$2')
  // "6 . 1 x 2 . 9 cm" → "6.1 x 2.9 cm"
  result = result.replace(/(\d)\s*\.\s*(\d)/g, '$1.$2')

  result = result.replace(/\s+([.,])/g, '$1')
  result = result.replace(/([.,])(?!\s|$)/g, '$1 ')
  result = result.replace(/\s+/g, ' ').trim()

  if (result.length > 0) {
    result = result.charAt(0).toUpperCase() + result.slice(1)
  }

  return result
}

export function appendDictationText(
  current: string,
  dictated: string,
): string {
  const normalized = normalizeMedicalDictationText(dictated)
  if (!normalized) return current
  if (!current.trim()) return normalized
  const separator = /[.!?]$/.test(current.trim()) ? ' ' : '. '
  return `${current.trim()}${separator}${normalized}`
}
