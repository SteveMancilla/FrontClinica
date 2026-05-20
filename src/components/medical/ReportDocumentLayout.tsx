import { clinicBranding } from '@/constants/clinicBranding'
import type { StudyFormatType } from '@/types/medical'
import { toReportLabel, toSentenceCase } from '@/utils/textCase'

export interface ReportDocumentSection {
  id: string
  title: string
  content: string
}

export interface ReportDocumentLayoutProps {
  patientName: string
  patientAge: number | string
  studyName: string
  origin: string
  dateTime: string
  physicianName: string
  physicianSpecialty?: string
  formatType: StudyFormatType
  sections: ReportDocumentSection[]
  diagnosticImpression?: string
  sampleNote?: string
}

export default function ReportDocumentLayout({
  patientName,
  patientAge,
  studyName,
  origin,
  dateTime,
  physicianName,
  physicianSpecialty = '—',
  formatType,
  sections,
  diagnosticImpression = '',
  sampleNote,
}: ReportDocumentLayoutProps) {
  const isStructured = formatType === 'structured'
  const visibleSections = sections.filter((s) => s.content.trim())

  return (
    <article className="mx-auto max-w-[210mm] rounded-sm border border-clinic-sky/40 bg-clinic-white p-8 text-black shadow-md md:p-10">
      {sampleNote && (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          {sampleNote}
        </p>
      )}

      <header className="border-b-2 border-[#1a4f8a] pb-4 text-center">
        <p className="text-base font-bold uppercase tracking-wide text-[#1a4f8a]">
          {clinicBranding.centerName}
        </p>
        <p className="mt-1 text-xs italic text-black">&quot;{clinicBranding.tagline}&quot;</p>
      </header>

      <dl className="mt-4 space-y-1 text-[8pt] leading-snug text-black">
        <div className="grid grid-cols-[34%_1fr] gap-x-2">
          <dt className="font-bold uppercase">Apellidos y nombres:</dt>
          <dd className="uppercase">{patientName}</dd>
        </div>
        <div className="grid grid-cols-[34%_1fr] gap-x-2">
          <dt className="font-bold uppercase">Edad:</dt>
          <dd>{patientAge} años</dd>
        </div>
        <div className="grid grid-cols-[34%_1fr] gap-x-2">
          <dt className="font-bold uppercase">Estudio:</dt>
          <dd className="font-bold italic uppercase">{toReportLabel(studyName)}</dd>
        </div>
        <div className="grid grid-cols-[34%_1fr] gap-x-2">
          <dt className="font-bold uppercase">Solicitado por:</dt>
          <dd className="uppercase">{origin}</dd>
        </div>
        <div className="grid grid-cols-[34%_1fr] gap-x-2">
          <dt className="font-bold uppercase">Fecha y hora:</dt>
          <dd>{dateTime}</dd>
        </div>
      </dl>

      <div className="my-3 border-t border-[#1a4f8a]" />

      {visibleSections.length === 0 ? (
        <p className="text-[7.5pt] text-clinic-text/60">
          Sin contenido de hallazgos en esta vista.
        </p>
      ) : isStructured ? (
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
          {diagnosticImpression.trim()
            ? toSentenceCase(diagnosticImpression.trim())
            : '—'}
        </p>
      </section>

      <footer className="mt-10 border-t border-clinic-sky/40 pt-6 text-center text-[10pt] text-black">
        <p className="font-bold uppercase">{physicianName}</p>
        <p className="mt-1 font-bold uppercase">{physicianSpecialty}</p>
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
        <p className="mt-1 text-right font-bold text-[#1a4f8a]">{clinicBranding.name}</p>
      </div>
    </article>
  )
}
