import type { Study } from '@/types/medical'

export type StudyBlock =
  | 'Ecografía general'
  | 'Ecografía de partes blandas'
  | 'Ecografía articular'
  | 'Ecografía Doppler'
  | 'Elastografías'
  | 'Procedimientos'
  | 'Biopsias'
  | 'Radiografías domiciliarias'

export function getStudyBlock(study: Study): StudyBlock {
  if (study.block && isStudyGroup(study.block)) return study.block
  const code = (study.code ?? '').toUpperCase()
  const name = study.name.toLowerCase()
  if (name.includes('doppler')) return 'Ecografía Doppler'
  if (name.includes('elastografía') || name.includes('elastografia')) return 'Elastografías'
  if (
    name.includes('biopsia')
    || name.includes('punción')
    || name.includes('puncion')
    || name.includes('baaf')
    || name.includes('paaf')
    || name.includes('consulta radiológica')
    || name.includes('consulta radiologica')
  ) {
    return 'Biopsias'
  }
  if (
    name.includes('toracocentesis')
    || name.includes('paracentesis')
    || name.includes('drenajes')
  ) {
    return 'Procedimientos'
  }
  if (code.startsWith('RX_') || name.includes('radiografía') || name.includes('radiografia')) {
    return 'Radiografías domiciliarias'
  }
  if (
    name.includes('rodilla')
    || name.includes('hombro')
    || name.includes('codo')
    || name.includes('tobillo')
    || name.includes('muñeca')
    || name.includes('muneca')
    || name.includes('mano')
    || name.includes('pie')
    || name.includes('cadera')
    || name.includes('tendones')
    || name.includes('ligamentos')
    || name.includes('dedo')
  ) {
    return 'Ecografía articular'
  }
  if (
    name.includes('partes blandas')
    || name.includes('mamas')
    || name.includes('tiroides')
    || name.includes('parótidas')
    || name.includes('parotidas')
    || name.includes('cabeza')
    || name.includes('cara')
    || name.includes('cuello')
    || name.includes('cervical')
    || name.includes('pared abdominal')
    || name.includes('testicular')
    || name.includes('lesiones superficiales')
    || name.includes('inguinal')
    || name.includes('umbilical')
    || name.includes('glándulas salivales')
    || name.includes('glandulas salivales')
    || name.includes('transfontanelar')
    || name.includes('ocular')
    || name.includes('pene')
  ) {
    return 'Ecografía de partes blandas'
  }
  return 'Ecografía general'
}

export function getStudyBlockOptions(studies: Study[]): StudyBlock[] {
  const present = new Set<StudyBlock>(studies.map(getStudyBlock))
  return orderedGroups().filter((b) => present.has(b))
}

export function orderedGroups(): StudyBlock[] {
  return [
    'Ecografía general',
    'Ecografía de partes blandas',
    'Ecografía articular',
    'Ecografía Doppler',
    'Elastografías',
    'Procedimientos',
    'Biopsias',
    'Radiografías domiciliarias',
  ]
}

function isStudyGroup(value: string): value is StudyBlock {
  return orderedGroups().includes(value as StudyBlock)
}
