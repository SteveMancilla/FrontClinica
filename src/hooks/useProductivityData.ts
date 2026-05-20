import { useCallback, useEffect, useMemo, useState } from 'react'
import { getProductivityDataset } from '@/services/productivityService'
import type {
  Appointment,
  Doctor,
  MedicalReport,
  Patient,
  Specialty,
  Study,
} from '@/types/medical'

export interface ProductivityDataset {
  doctors: Doctor[]
  appointments: Appointment[]
  reports: MedicalReport[]
  studies: Study[]
  specialties: Specialty[]
  patients: Patient[]
}

export function useProductivityData() {
  const [data, setData] = useState<ProductivityDataset | null>(null)
  const [loadState, setLoadState] = useState<'loading' | 'error' | 'success'>('loading')
  const [loadError, setLoadError] = useState<string | null>(null)

  const load = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setLoadState('loading')
    }
    setLoadError(null)

    try {
      const dataset = await getProductivityDataset()
      setData(dataset)
      setLoadState('success')
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : 'No se pudieron cargar los datos de productividad.',
      )
      if (!options?.silent) {
        setLoadState('error')
      }
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const empty = useMemo<ProductivityDataset>(
    () => ({
      doctors: [],
      appointments: [],
      reports: [],
      studies: [],
      specialties: [],
      patients: [],
    }),
    [],
  )

  return {
    data: data ?? empty,
    loadState,
    loadError,
    refetch: load,
  }
}
