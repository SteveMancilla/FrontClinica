/** Etiquetas y títulos de informe (mayúsculas). */
export function toReportLabel(text: string): string {
  return text.trim().toUpperCase()
}

/** Dictado clínico: oración (mayúscula inicial y tras . ! ?). */
export function toSentenceCase(text: string): string {
  const trimmed = text.trim()
  if (!trimmed) return ''

  return trimmed
    .split(/\r?\n/)
    .map((line) => {
      const bulletMatch = line.match(/^([•-]\s*)(.*)$/u)
      const prefix = bulletMatch?.[1] ?? ''
      const body = bulletMatch?.[2] ?? line

      return prefix + sentenceCaseLine(body.trim())
    })
    .join('\n')
}

export function sentenceCaseLine(line: string): string {
  if (!line) return ''

  const lower = line.toLocaleLowerCase('es')

  return lower.replace(/(^|[.!?]\s+)(\p{L})/gu, (_, boundary, letter) => {
    return boundary + letter.toLocaleUpperCase('es')
  })
}
