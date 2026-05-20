import type { ReportSection } from '@/types/medical'

export interface ReportAnalysisResult {
  detectedValues: string[]
  detectedFindings: string[]
}

const FINDING_KEYWORDS = [
  'litiasis',
  'cálculo',
  'calculo',
  'barro biliar',
  'engrosamiento',
  'dilatación',
  'dilatacion',
  'dilatado',
  'esteatosis',
  'meteorismo',
  'lesión',
  'lesion',
  'masa',
  'colección',
  'coleccion',
  'derrame',
  'fractura',
  'consolidación',
  'consolidacion',
  'cardiomegalia',
  'litiásica',
  'litiásico',
  'imagen litiásica',
] as const

const MEASURE_REGEX = /\d+(?:[.,]\d+)?\s*(?:mm|cm)\b/gi
const MEASURE_DIMENSION_REGEX =
  /\d+(?:[.,]\d+)?\s*x\s*\d+(?:[.,]\d+)?\s*(?:mm|cm)\b/gi

export function analyzeReportSections(
  sections: ReportSection[],
): ReportAnalysisResult {
  const fullText = sections.map((s) => s.content).join('\n').toLowerCase()
  const detectedValues = new Set<string>()
  const detectedFindings = new Set<string>()

  const dimensionMatches = sections
    .map((s) => s.content)
    .join(' ')
    .match(MEASURE_DIMENSION_REGEX)
  dimensionMatches?.forEach((m) => detectedValues.add(m.trim()))

  const measureMatches = sections
    .map((s) => s.content)
    .join(' ')
    .match(MEASURE_REGEX)
  measureMatches?.forEach((m) => {
    const trimmed = m.trim()
    if (![...detectedValues].some((v) => v.includes(trimmed))) {
      detectedValues.add(trimmed)
    }
  })

  for (const keyword of FINDING_KEYWORDS) {
    if (fullText.includes(keyword.toLowerCase())) {
      detectedFindings.add(formatFindingLabel(keyword))
    }
  }

  return {
    detectedValues: [...detectedValues].slice(0, 12),
    detectedFindings: [...detectedFindings].slice(0, 10),
  }
}

function formatFindingLabel(keyword: string): string {
  const labels: Record<string, string> = {
    litiasis: 'Litiasis',
    cálculo: 'Cálculo',
    calculo: 'Cálculo',
    'barro biliar': 'Barro biliar',
    engrosamiento: 'Engrosamiento',
    dilatación: 'Dilatación',
    dilatacion: 'Dilatación',
    dilatado: 'Dilatación',
    esteatosis: 'Esteatosis',
    meteorismo: 'Meteorismo',
    lesión: 'Lesión',
    lesion: 'Lesión',
    masa: 'Masa',
    colección: 'Colección',
    coleccion: 'Colección',
    derrame: 'Derrame',
    fractura: 'Fractura',
    consolidación: 'Consolidación',
    consolidacion: 'Consolidación',
    cardiomegalia: 'Cardiomegalia',
    litiásica: 'Imagen litiásica',
    litiásico: 'Imagen litiásica',
    'imagen litiásica': 'Imagen litiásica',
  }
  return labels[keyword] ?? keyword
}
