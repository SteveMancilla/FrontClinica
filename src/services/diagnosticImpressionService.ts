import type { ReportSection, TemplateFormatType } from '@/types/medical'

export interface GenerateDiagnosticImpressionInput {
  studyName: string
  templateFormatType: TemplateFormatType
  sections: ReportSection[]
}

/**
 * Simula la generación de impresión diagnóstica (Ollama / backend futuro).
 * Reemplazar por llamada HTTP a Laravel + Ollama cuando esté disponible.
 */
export async function generateDiagnosticImpressionMock(
  input: GenerateDiagnosticImpressionInput,
): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 900))

  const fullText = input.sections
    .map((s) => `${s.title}: ${s.content}`)
    .join('\n')
    .toLowerCase()

  const impressions: string[] = []

  if (
    /litiasis|cálculo|calculo|imagen litiásica|imagen litiasica/.test(fullText)
  ) {
    impressions.push('Colecistopatía litiásica.')
  }
  if (/barro biliar/.test(fullText)) {
    impressions.push('Barro biliar.')
  }
  if (/ecogenicidad aumentada|esteatosis/.test(fullText)) {
    impressions.push('Signos ecográficos de esteatosis hepática.')
  }
  if (/antro gástrico engrosado|engrosamiento de antro|engrosamiento.*antro/.test(
    fullText,
  )) {
    impressions.push(
      'Engrosamiento de antro gástrico, a correlacionar clínicamente.',
    )
  }
  if (/meteorismo/.test(fullText)) {
    impressions.push('Meteorismo incrementado a nivel de marco colónico.')
  }
  if (/dilatación|dilatacion|dilatado/.test(fullText) && /colédoco|coledoco/.test(fullText)) {
    impressions.push(
      'Dilatación de colédoco, a correlacionar con estudios complementarios.',
    )
  }
  if (/fractura/.test(fullText)) {
    impressions.push(
      'Hallazgos compatibles con fractura, correlacionar con evaluación clínica.',
    )
  }
  if (/cardiomegalia/.test(fullText)) {
    impressions.push('Cardiomegalia.')
  }
  if (/derrame/.test(fullText)) {
    impressions.push('Derrame pleural.')
  }

  if (impressions.length === 0) {
    impressions.push(
      'Estudio sin hallazgos patológicos evidentes al momento de la evaluación.',
    )
  }

  void input.studyName
  void input.templateFormatType

  return impressions
    .map((line, index) => `${index + 1}. ${line}`)
    .join('\n')
}
