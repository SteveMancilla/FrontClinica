import { Link } from 'react-router-dom'
import type { DoctorRankingRow } from '@/utils/dashboard'

interface DoctorRankingTableProps {
  rows: DoctorRankingRow[]
  title?: string
}

export default function DoctorRankingTable({
  rows,
  title = 'Productividad médica rápida',
}: DoctorRankingTableProps) {
  return (
    <section className="rounded-xl border border-clinic-sky/50 bg-clinic-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-clinic-deep-blue">{title}</h2>
        <Link to="/productivity" className="text-sm font-medium text-clinic-blue hover:underline">
          Ver productividad
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-clinic-sky/50 text-xs uppercase text-clinic-text/50">
              <th className="px-3 py-2">Médico</th>
              <th className="px-3 py-2">Especialidad</th>
              <th className="px-3 py-2">Concluidos</th>
              <th className="px-3 py-2">Pendientes</th>
              <th className="px-3 py-2">Falta impresión</th>
              <th className="px-3 py-2">PDF</th>
              <th className="px-3 py-2">Acción</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.doctorId} className="border-b border-clinic-sky/30 last:border-0 hover:bg-clinic-bg/30">
                <td className="px-3 py-2.5 font-medium">{row.doctorName}</td>
                <td className="px-3 py-2.5 text-clinic-text/70">{row.specialty}</td>
                <td className="px-3 py-2.5 text-emerald-700">{row.concluded}</td>
                <td className="px-3 py-2.5 text-amber-700">{row.pending}</td>
                <td className="px-3 py-2.5 text-red-600">{row.missingImpression}</td>
                <td className="px-3 py-2.5">{row.pdfGenerated}</td>
                <td className="px-3 py-2.5">
                  <Link
                    to={`/productivity?doctorId=${row.doctorId}`}
                    className="text-sm font-medium text-clinic-blue hover:underline"
                  >
                    Ver detalle
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
