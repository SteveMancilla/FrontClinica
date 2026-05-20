import { useMemo, useState } from 'react'
import { UserPlus, X } from 'lucide-react'
import type { SystemUser } from '@/types/auth'
import type { Specialty } from '@/types/medical'

interface AssignDoctorModalProps {
  isOpen: boolean
  specialties: Specialty[]
  doctors: SystemUser[]
  defaultSpecialtyId?: string
  onClose: () => void
  onAssign: (specialtyId: string, doctorId: string, roleLabel: string) => void
}

export default function AssignDoctorModal({
  isOpen,
  specialties,
  doctors,
  defaultSpecialtyId,
  onClose,
  onAssign,
}: AssignDoctorModalProps) {
  const [specialtyId, setSpecialtyId] = useState(defaultSpecialtyId ?? '')
  const [search, setSearch] = useState('')
  const [doctorId, setDoctorId] = useState('')
  const [roleLabel, setRoleLabel] = useState('Responsable')
  const [active, setActive] = useState(true)
  const [notice, setNotice] = useState<string | null>(null)

  const filteredDoctors = useMemo(() => {
    const q = search.trim().toLowerCase()
    return doctors.filter((d) => {
      if (d.role !== 'doctor') return false
      if (!q) return true
      return d.fullName.toLowerCase().includes(q) || d.email.toLowerCase().includes(q)
    })
  }, [doctors, search])

  if (!isOpen) return null

  const selected = doctors.find((d) => d.doctorId === doctorId)

  const handleAssign = () => {
    if (!specialtyId || !doctorId) return
    if (selected?.specialty) {
      setNotice('Este médico ya tiene una especialidad registrada. Puedes actualizarla si corresponde.')
    }
    onAssign(specialtyId, doctorId, roleLabel)
    onClose()
  }

  return (
    <>
      <button type="button" className="fixed inset-0 z-[60] bg-clinic-deep-blue/40" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 z-[60] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl bg-clinic-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-semibold text-clinic-deep-blue">
            <UserPlus className="h-5 w-5" /> Asignar médico
          </h3>
          <button type="button" onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        <div className="mt-4 space-y-3">
          <label className="block text-sm">
            Especialidad
            <select value={specialtyId} onChange={(e) => setSpecialtyId(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm">
              <option value="">Seleccionar</option>
              {specialties.filter((s) => s.isActive !== false).map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Buscar médico
            <input value={search} onChange={(e) => setSearch(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" placeholder="Nombre o correo" />
          </label>
          <label className="block text-sm">
            Médico
            <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm">
              <option value="">Seleccionar médico</option>
              {filteredDoctors.map((d) => (
                <option key={d.id} value={d.doctorId ?? ''}>{d.fullName} — {d.specialty}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Rol en la especialidad
            <select value={roleLabel} onChange={(e) => setRoleLabel(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm">
              <option value="Responsable">Responsable</option>
              <option value="Médico asistencial">Médico asistencial</option>
              <option value="Apoyo">Apoyo</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            Asignación activa
          </label>
          {notice && <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">{notice}</p>}
        </div>
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 rounded-lg border py-2.5 text-sm">Cancelar</button>
          <button type="button" onClick={handleAssign} className="flex-1 rounded-lg bg-clinic-teal py-2.5 text-sm font-semibold text-clinic-white">Asignar médico</button>
        </div>
      </div>
    </>
  )
}
