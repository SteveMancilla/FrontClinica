import type { ReportSection, ReportTemplate } from '@/types/medical'

export const mockReportTemplates: ReportTemplate[] = [
  {
    id: 'tpl_eco_abdomen_superior',
    studyId: 'ECO-ABD-SUP',
    name: 'Ecografía de abdomen superior',
    formatType: 'structured',
    description: 'Plantilla por órganos — abdomen superior',
    isActive: true,
    isComplete: true,
    updatedAt: '2026-05-10T10:00:00Z',
    sections: [
      {
        id: 'sec-higado',
        title: 'Hígado',
        order: 1,
        baseText:
          'Hígado de morfología conservada, bordes regulares, parénquima homogéneo. Lóbulo hepático derecho ___ mm. Lóbulo hepático izquierdo ___ mm. No se evidencian lesiones focales.',
        isRequired: true,
        voiceEnabled: true,
      },
      {
        id: 'sec-vesicula',
        title: 'Vesícula biliar',
        order: 2,
        baseText:
          'Vesícula biliar de forma conservada, paredes de ___ mm, contenido anecogénico. No se evidencian imágenes litiásicas.',
        isRequired: true,
        voiceEnabled: true,
      },
      {
        id: 'sec-coledoco',
        title: 'Colédoco',
        order: 3,
        baseText:
          'Colédoco de calibre conservado, mide ___ mm en segmento proximal.',
        isRequired: true,
        voiceEnabled: true,
      },
      {
        id: 'sec-bazo',
        title: 'Bazo',
        order: 4,
        baseText:
          'Bazo de tamaño y ecogenicidad conservados, sin lesiones focales evidentes.',
        isRequired: true,
        voiceEnabled: true,
      },
      {
        id: 'sec-pancreas',
        title: 'Páncreas',
        order: 5,
        baseText:
          'Páncreas de morfología y ecogenicidad conservadas en los segmentos visualizados.',
        isRequired: false,
        voiceEnabled: true,
      },
      {
        id: 'sec-antro',
        title: 'Antro gástrico',
        order: 6,
        baseText:
          'Antro gástrico de paredes ___ mm, sin engrosamiento evidente al momento del estudio.',
        isRequired: false,
        voiceEnabled: true,
      },
      {
        id: 'sec-intestino',
        title: 'Asas intestinales',
        order: 7,
        baseText:
          'Asas intestinales con peristalsis presente, sin dilatación significativa.',
        isRequired: false,
        voiceEnabled: true,
      },
      {
        id: 'sec-otros-abd',
        title: 'Otros',
        order: 8,
        baseText:
          'No se evidencian masas ni colecciones patológicas al momento del estudio.',
        isRequired: false,
        voiceEnabled: true,
      },
    ],
  },
  {
    id: 'tpl_rx_torax',
    studyId: 'RX-TORAX',
    name: 'Radiografía de tórax',
    formatType: 'narrative',
    description: 'Plantilla narrativa — tórax',
    isActive: true,
    isComplete: true,
    updatedAt: '2026-05-08T14:30:00Z',
    sections: [
      {
        id: 'sec-hallazgos-torax',
        title: 'Hallazgos radiográficos',
        order: 1,
        baseText:
          'Radiografía de tórax en proyección frontal. Campos pulmonares con adecuada transparencia. No se evidencian lesiones focales activas. Silueta cardiomediastínica de tamaño conservado. Senos costofrénicos libres. Estructuras óseas visibles sin alteraciones evidentes.',
        isRequired: true,
        voiceEnabled: true,
      },
    ],
  },
  {
    id: 'tpl_eco_renal',
    studyId: 'ECO-RENAL',
    name: 'Ecografía renal',
    formatType: 'structured',
    description: 'Plantilla por órganos — vía urinaria',
    isActive: true,
    isComplete: true,
    updatedAt: '2026-05-12T09:00:00Z',
    sections: [
      {
        id: 'sec-rinon-d',
        title: 'Riñón derecho',
        order: 1,
        baseText:
          'Riñón derecho de morfología y tamaño conservados. Parénquima de ecogenicidad habitual. No se evidencia dilatación pielocalicial.',
        isRequired: true,
        voiceEnabled: true,
      },
      {
        id: 'sec-rinon-i',
        title: 'Riñón izquierdo',
        order: 2,
        baseText:
          'Riñón izquierdo de morfología y tamaño conservados. Parénquima de ecogenicidad habitual. No se evidencia dilatación pielocalicial.',
        isRequired: true,
        voiceEnabled: true,
      },
      {
        id: 'sec-vejiga',
        title: 'Vejiga',
        order: 3,
        baseText:
          'Vejiga urinaria con paredes regulares, contenido anecogénico. Volumen acorde al grado de llenado.',
        isRequired: true,
        voiceEnabled: true,
      },
      {
        id: 'sec-otros-renal',
        title: 'Otros',
        order: 4,
        baseText:
          'No se evidencian masas ni colecciones patológicas en la región estudiada.',
        isRequired: false,
        voiceEnabled: true,
      },
    ],
  },
  {
    id: 'tpl_rx_columna',
    studyId: 'RX-COL',
    name: 'Radiografía de columna',
    formatType: 'narrative',
    description: 'Plantilla narrativa — columna',
    isActive: true,
    isComplete: true,
    updatedAt: '2026-05-11T16:00:00Z',
    sections: [
      {
        id: 'sec-hallazgos-col',
        title: 'Hallazgos radiográficos',
        order: 1,
        baseText:
          'Radiografía de columna en proyecciones solicitadas. Alineación vertebral conservada. Espacios intervertebrales de altura preservada. No se evidencian fracturas ni luxaciones en las estructuras visualizadas.',
        isRequired: true,
        voiceEnabled: true,
      },
    ],
  },
  {
    id: 'tpl_eco_pelvica',
    studyId: 'ECO-PELV',
    name: 'Ecografía pélvica',
    formatType: 'structured',
    description: 'Pendiente de ampliar secciones clínicas',
    isActive: true,
    isComplete: false,
    updatedAt: '2026-05-14T11:00:00Z',
    sections: [
      {
        id: 'sec-utero',
        title: 'Útero',
        order: 1,
        baseText:
          'Útero en anteversoflexión, de morfología y tamaño conservados. Endometrio homogéneo.',
        isRequired: true,
        voiceEnabled: true,
      },
      {
        id: 'sec-ovarios',
        title: 'Ovarios',
        order: 2,
        baseText:
          'Ovarios de morfología y ecogenicidad conservadas, sin masas anexiales evidentes.',
        isRequired: true,
        voiceEnabled: true,
      },
      {
        id: 'sec-otros-pelv',
        title: 'Otros',
        order: 3,
        baseText: 'Fondo de saco de Douglas libre. No se evidencian colecciones.',
        isRequired: false,
        voiceEnabled: true,
      },
    ],
  },
  {
    id: 'tpl_eco_obstetrica',
    studyId: 'ECO-OBST',
    name: 'Ecografía obstétrica',
    formatType: 'structured',
    description: 'Pendiente de configuración completa',
    isActive: false,
    isComplete: false,
    updatedAt: '2026-05-15T08:00:00Z',
    sections: [
      {
        id: 'sec-embarazo',
        title: 'Evaluación obstétrica',
        order: 1,
        baseText:
          'Feto único intrauterino vivo. Biometría acorde a edad gestacional reportada. Líquido amniótico en cantidad normal.',
        isRequired: true,
        voiceEnabled: true,
      },
      {
        id: 'sec-placenta',
        title: 'Placenta',
        order: 2,
        baseText: 'Placenta de inserción y grado acordes al periodo gestacional.',
        isRequired: true,
        voiceEnabled: true,
      },
      {
        id: 'sec-otros-obst',
        title: 'Otros',
        order: 3,
        baseText: 'Cervix de longitud conservada. No se evidencian signos de amenaza.',
        isRequired: false,
        voiceEnabled: true,
      },
    ],
  },
]

export function findReportTemplateById(id: string): ReportTemplate | undefined {
  return mockReportTemplates.find((t) => t.id === id)
}

export function findReportTemplateByStudyId(
  studyId: string,
): ReportTemplate | undefined {
  return mockReportTemplates.find((t) => t.studyId === studyId)
}

export function cloneTemplateSections(
  template: ReportTemplate,
  initialContent?: Partial<Record<string, string>>,
): ReportSection[] {
  return template.sections
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((section) => ({
      ...section,
      content: initialContent?.[section.id] ?? section.baseText,
    }))
}
