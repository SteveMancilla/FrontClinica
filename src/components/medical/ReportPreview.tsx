import { Download, Loader2, X } from 'lucide-react'
import { clinicBranding } from '@/constants/clinicBranding'
import type { ReportEditorContext, ReportSection } from '@/types/medical'
import { formatDoctorHonorificName } from '@/utils/doctorDisplay'
import { toReportLabel, toSentenceCase } from '@/utils/textCase'

interface ReportPreviewProps {
  isOpen: boolean
  onClose: () => void
  context: ReportEditorContext
  sections: ReportSection[]
  diagnosticImpression: string
  reportId?: string
  canDownloadPdf?: boolean
  isDownloadingPdf?: boolean
  onDownloadPdf?: () => void
}

export default function ReportPreview({
  isOpen,
  onClose,
  context,
  sections,
  diagnosticImpression,
  reportId,
  canDownloadPdf = false,
  isDownloadingPdf = false,
  onDownloadPdf,
}: ReportPreviewProps) {
  if (!isOpen) return null

  const { patient, doctor, study, appointment, template } = context
  const isStructured = template.formatType === 'structured'
  const physicianName = formatDoctorHonorificName(doctor.fullName).toUpperCase()
  const physicianTitle = doctor.specialty?.trim() || '—'
  const visibleSections = sections.filter((s) => s.content.trim())

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-50 bg-clinic-deep-blue/50"
        onClick={onClose}
        aria-label="Cerrar vista previa"
      />
      <div className="fixed inset-4 z-50 flex flex-col overflow-hidden rounded-xl bg-clinic-bg shadow-2xl md:inset-8 lg:inset-12">
        <div className="flex items-center justify-between border-b border-clinic-sky/60 bg-clinic-white px-4 py-3">
          <h2 className="font-semibold text-clinic-deep-blue">Vista previa del informe</h2>
          <div className="flex items-center gap-2">
            {canDownloadPdf && reportId && onDownloadPdf && (
              <button
                type="button"
                onClick={onDownloadPdf}
                disabled={isDownloadingPdf}
                className="inline-flex items-center gap-1.5 rounded-lg bg-clinic-blue px-3 py-2 text-sm font-semibold text-clinic-white hover:bg-clinic-deep-blue disabled:opacity-60"
              >
                {isDownloadingPdf ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Descargar PDF
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 hover:bg-clinic-bg"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <article className="mx-auto max-w-[210mm] rounded-sm border border-clinic-sky/40 bg-clinic-white p-8 text-black shadow-md md:p-10">
            <header className="border-b-2 border-[#1a4f8a] pb-4 text-center">
              <p className="text-base font-bold uppercase tracking-wide text-[#1a4f8a]">
                {clinicBranding.centerName}
              </p>
              <p className="mt-1 text-xs italic text-black">
                "{clinicBranding.tagline}"
              </p>
            </header>

            <dl className="mt-4 space-y-1 text-[8pt] leading-snug text-black">
              <div className="grid grid-cols-[34%_1fr] gap-x-2">
                <dt className="font-bold uppercase">Apellidos y nombres:</dt>
                <dd className="uppercase">{patient.fullName}</dd>
              </div>
              <div className="grid grid-cols-[34%_1fr] gap-x-2">
                <dt className="font-bold uppercase">Edad:</dt>
                <dd>{patient.age} años</dd>
              </div>
              <div className="grid grid-cols-[34%_1fr] gap-x-2">
                <dt className="font-bold uppercase">Estudio:</dt>
                <dd className="font-bold italic uppercase">{toReportLabel(study.name)}</dd>
              </div>
              <div className="grid grid-cols-[34%_1fr] gap-x-2">
                <dt className="font-bold uppercase">Solicitado por:</dt>
                <dd className="uppercase">{appointment.origin}</dd>
              </div>
              <div className="grid grid-cols-[34%_1fr] gap-x-2">
                <dt className="font-bold uppercase">Fecha y hora:</dt>
                <dd>
                  {appointment.appointmentDate} {appointment.appointmentTime}
                </dd>
              </div>
            </dl>

            <div className="my-3 border-t border-[#1a4f8a]" />

            {isStructured ? (
              <table className="w-full text-[7.5pt] leading-snug text-black">
                <tbody>
                  {visibleSections.map((section) => (
                    <tr key={section.id} className="align-top">
                      <td className="w-[22%] pr-2 font-bold uppercase">
                        {toReportLabel(section.title)}:
                      </td>
                      <td className="text-justify whitespace-pre-wrap">
                        {toSentenceCase(section.content)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-[7.5pt] leading-snug text-black whitespace-pre-wrap">
                {visibleSections.map((section) => (
                  <p key={section.id} className="text-justify">
                    {toSentenceCase(section.content)}
                  </p>
                ))}
              </div>
            )}

            <section className="mt-6">
              <h3 className="text-[8pt] font-bold uppercase underline text-black">
                Impresión diagnóstica:
              </h3>
              <p className="mt-2 whitespace-pre-wrap text-[7.5pt] font-bold leading-snug text-black">
                {toSentenceCase(diagnosticImpression.trim()) || '—'}
              </p>
            </section>

            <footer className="mt-10 border-t border-clinic-sky/40 pt-6 text-center text-[10pt] text-black">
              <p className="font-bold uppercase">{physicianName}</p>
              <p className="mt-1 font-bold uppercase">{physicianTitle}</p>
            </footer>

            <div className="mt-6 border-t-2 border-[#1a4f8a] pt-2 text-[8pt] text-black">
              <p>
                <span className="font-bold">Dirección:</span> {clinicBranding.address}
                {clinicBranding.phone ? (
                  <>
                    {' '}
                    | <span className="font-bold">Tel.:</span> {clinicBranding.phone}
                  </>
                ) : null}
              </p>
              <p className="mt-1 text-right font-bold text-[#1a4f8a]">
                {clinicBranding.name}
              </p>
            </div>
          </article>
        </div>
      </div>
    </>
  )
}
