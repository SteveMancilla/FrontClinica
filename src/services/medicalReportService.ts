import {
  apiDownloadBlob,
  apiGet,
  apiPost,
  apiPut,
  triggerBrowserDownload,
} from '@/services/apiClient'
import type { MedicalReport } from '@/types/medical'
import { mapMedicalReportFromApi } from '@/utils/apiMappers'

export async function getMedicalReports(): Promise<MedicalReport[]> {
  const result = await apiGet<unknown[]>('/medical-reports')
  const list = Array.isArray(result) ? result : []
  return list.map((item) => mapMedicalReportFromApi(item as Record<string, unknown>))
}

export async function getMedicalReport(id: string): Promise<MedicalReport> {
  const result = await apiGet<unknown>(`/medical-reports/${id}`)
  const raw =
    result && typeof result === 'object' && 'data' in (result as object)
      ? (result as { data: unknown }).data
      : result
  return mapMedicalReportFromApi(raw as Record<string, unknown>)
}

export async function updateMedicalReport(
  id: string,
  payload: {
    diagnosticImpression?: string
    status?: string
    sections?: { id: string; content: string }[]
  },
): Promise<MedicalReport> {
  const body: Record<string, unknown> = {}

  if (payload.diagnosticImpression !== undefined) {
    body.diagnostic_impression = payload.diagnosticImpression
  }
  if (payload.status !== undefined) {
    body.status = payload.status
  }
  if (payload.sections) {
    body.sections = payload.sections.map((s) => ({
      id: Number(s.id),
      content: s.content,
    }))
  }

  const result = await apiPut<unknown>(`/medical-reports/${id}`, body)
  const raw =
    result && typeof result === 'object' && 'data' in (result as object)
      ? (result as { data: unknown }).data
      : result
  return mapMedicalReportFromApi(raw as Record<string, unknown>)
}

export type DiagnosticImpressionSource = 'ollama' | 'rules'

export interface GenerateDiagnosticImpressionResult {
  diagnosticImpression: string
  suggestions: string[]
  source: DiagnosticImpressionSource
  model: string | null
  message?: string
}

export async function generateDiagnosticImpression(
  id: string,
  sections?: { id: string; content: string }[],
): Promise<GenerateDiagnosticImpressionResult> {
  const body =
    sections && sections.length > 0
      ? {
          sections: sections.map((s) => ({
            id: Number(s.id),
            content: s.content,
          })),
        }
      : {}

  const result = await apiPost<{
    message?: string
    data: {
      diagnostic_impression: string
      suggestions: string[]
      source?: DiagnosticImpressionSource
      model?: string | null
    }
  }>(`/medical-reports/${id}/generate-diagnostic-impression`, body)

  const envelope =
    result && typeof result === 'object' && 'data' in result
      ? (result as {
          message?: string
          data: {
            diagnostic_impression: string
            suggestions: string[]
            source?: DiagnosticImpressionSource
            model?: string | null
          }
        })
      : null

  const data = envelope?.data ?? (result as {
    diagnostic_impression?: string
    suggestions?: string[]
    source?: DiagnosticImpressionSource
    model?: string | null
  })

  return {
    diagnosticImpression: data.diagnostic_impression ?? '',
    suggestions: data.suggestions ?? [],
    source: data.source ?? 'rules',
    model: data.model ?? null,
    message: envelope?.message,
  }
}

export async function generateMedicalReportPdf(
  id: string,
  regenerate = false,
): Promise<MedicalReport> {
  const query = regenerate ? '?regenerate=1' : ''
  const result = await apiPost<{ report: unknown }>(
    `/medical-reports/${id}/generate-pdf${query}`,
    {},
  )

  const raw =
    result && typeof result === 'object' && 'report' in result
      ? result.report
      : result

  return mapMedicalReportFromApi(raw as Record<string, unknown>)
}

export async function downloadMedicalReportPdf(
  id: string,
  options?: { regenerate?: boolean; suggestedFilename?: string },
): Promise<void> {
  const query = options?.regenerate ? '?regenerate=1' : ''
  const { blob, filename } = await apiDownloadBlob(
    `/medical-reports/${id}/pdf${query}`,
  )

  triggerBrowserDownload(
    blob,
    options?.suggestedFilename ?? filename ?? `informe_${id}.pdf`,
  )
}

export async function concludeMedicalReport(id: string): Promise<MedicalReport> {
  const result = await apiPost<unknown>(`/medical-reports/${id}/conclude`, {})
  const raw =
    result && typeof result === 'object' && 'data' in (result as object)
      ? (result as { data: unknown }).data
      : result
  return mapMedicalReportFromApi(raw as Record<string, unknown>)
}
