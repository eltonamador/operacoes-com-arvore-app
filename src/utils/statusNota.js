// Status de desempenho — substitui a lógica antiga de APROVADO/REPROVADO.
// Individual: posição em relação à média 7.00.
// Final: análise da média (VC1 + VC2 + VC3) / 3.

export const STATUS_INDIVIDUAL = {
  ABAIXO: 'ABAIXO_DA_MEDIA',
  NA:     'NA_MEDIA',
  ACIMA:  'ACIMA_DA_MEDIA',
}

export const STATUS_FINAL = {
  VERIFICACAO: 'VERIFICACAO_FINAL',
  NA:          'NA_MEDIA_FINAL',
  ACIMA:       'ACIMA_DA_MEDIA_FINAL',
}

export const MEDIA = 7

export const round2 = (n) => Math.round(Number(n) * 100) / 100

export function getStatusNotaIndividual(nota) {
  if (nota === null || nota === undefined || Number.isNaN(Number(nota))) return null
  const v = round2(nota)
  if (v < MEDIA) return STATUS_INDIVIDUAL.ABAIXO
  if (v === MEDIA) return STATUS_INDIVIDUAL.NA
  return STATUS_INDIVIDUAL.ACIMA
}

export function getStatusMediaFinal(vc1, vc2, vc3) {
  if ([vc1, vc2, vc3].some((v) => v === null || v === undefined || Number.isNaN(Number(v)))) {
    return { media: null, status: null }
  }
  const media = round2((Number(vc1) + Number(vc2) + Number(vc3)) / 3)
  if (media < MEDIA) return { media, status: STATUS_FINAL.VERIFICACAO }
  if (media === MEDIA) return { media, status: STATUS_FINAL.NA }
  return { media, status: STATUS_FINAL.ACIMA }
}

const LABEL_INDIVIDUAL = {
  [STATUS_INDIVIDUAL.ABAIXO]: 'Abaixo da média',
  [STATUS_INDIVIDUAL.NA]:     'Na média',
  [STATUS_INDIVIDUAL.ACIMA]:  'Acima da média',
}

const LABEL_FINAL = {
  [STATUS_FINAL.VERIFICACAO]: 'Verificação Final',
  [STATUS_FINAL.NA]:          'Na Média Final',
  [STATUS_FINAL.ACIMA]:       'Acima da Média Final',
}

const TONE_INDIVIDUAL = {
  [STATUS_INDIVIDUAL.ABAIXO]: 'attention',
  [STATUS_INDIVIDUAL.NA]:     'neutral',
  [STATUS_INDIVIDUAL.ACIMA]:  'positive',
}

const TONE_FINAL = {
  [STATUS_FINAL.VERIFICACAO]: 'alert',
  [STATUS_FINAL.NA]:          'neutral',
  [STATUS_FINAL.ACIMA]:       'positive',
}

export const labelIndividual = (s) => LABEL_INDIVIDUAL[s] || ''
export const labelFinal = (s) => LABEL_FINAL[s] || ''
export const toneIndividual = (s) => TONE_INDIVIDUAL[s] || 'neutral'
export const toneFinal = (s) => TONE_FINAL[s] || 'neutral'

// Conveniência: a partir da nota, devolve { status, label, tone } para uso em UI.
export function describeNotaIndividual(nota) {
  const status = getStatusNotaIndividual(nota)
  return {
    status,
    label: labelIndividual(status),
    tone: toneIndividual(status),
  }
}

export function describeMediaFinal(vc1, vc2, vc3) {
  const { media, status } = getStatusMediaFinal(vc1, vc2, vc3)
  return {
    media,
    status,
    label: labelFinal(status),
    tone: toneFinal(status),
  }
}

// Tema visual por tom — usado por banners/Summary/Signature.
// Cores escolhidas para coerência com o tema escuro existente.
export const TONE_VISUAL = {
  positive: {
    bgGradient: 'linear-gradient(135deg, #0a1a00 0%, #1a2a00 100%)',
    border: '#4CAF50',
    accent: '#88cc44',
    label: '#aee86a',
    note: '#FFD700',
    noteGlow: '0 0 30px rgba(255,215,0,0.4)',
    icon: '✅',
  },
  neutral: {
    bgGradient: 'linear-gradient(135deg, #0a1422 0%, #14202e 100%)',
    border: '#7890a8',
    accent: '#9fb4cc',
    label: '#cfd8dc',
    note: '#cfd8dc',
    noteGlow: '0 0 30px rgba(159,180,204,0.25)',
    icon: '•',
  },
  attention: {
    bgGradient: 'linear-gradient(135deg, #1a1200 0%, #2a1d00 100%)',
    border: '#E0A800',
    accent: '#ffcc4d',
    label: '#ffd87a',
    note: '#ffcc4d',
    noteGlow: '0 0 30px rgba(224,168,0,0.35)',
    icon: '⚠️',
  },
  alert: {
    bgGradient: 'linear-gradient(135deg, #1a0a00 0%, #2a1408 100%)',
    border: '#E55A1E',
    accent: '#ff8a5c',
    label: '#ffae87',
    note: '#ff8a5c',
    noteGlow: '0 0 30px rgba(229,90,30,0.40)',
    icon: '⚠️',
  },
}

export function getVisualIndividual(nota) {
  const { status, label, tone } = describeNotaIndividual(nota)
  return { status, label, tone, visual: TONE_VISUAL[tone] || TONE_VISUAL.neutral }
}

export function getVisualFinal(vc1, vc2, vc3) {
  const d = describeMediaFinal(vc1, vc2, vc3)
  return { ...d, visual: TONE_VISUAL[d.tone] || TONE_VISUAL.neutral }
}
