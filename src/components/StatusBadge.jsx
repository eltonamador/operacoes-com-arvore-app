import {
  describeNotaIndividual,
  describeMediaFinal,
  labelIndividual,
  labelFinal,
  toneIndividual,
  toneFinal,
} from '../utils/statusNota'

const TONE_STYLE = {
  positive:  { bg: 'rgba(76, 175, 80, 0.15)',  color: '#8ddf63', border: 'rgba(76, 175, 80, 0.35)' },
  neutral:   { bg: 'rgba(120, 144, 168, 0.18)', color: '#cfd8dc', border: 'rgba(120, 144, 168, 0.38)' },
  attention: { bg: 'rgba(224, 168, 0, 0.18)',  color: '#ffcc4d', border: 'rgba(224, 168, 0, 0.40)' },
  alert:     { bg: 'rgba(229, 90, 30, 0.18)',  color: '#ff8a5c', border: 'rgba(229, 90, 30, 0.45)' },
}

/**
 * Badge unificado de status.
 *
 * Uso por nota (individual):  <StatusBadge tipo="individual" nota={7.5} />
 * Uso por status pronto:       <StatusBadge tipo="individual" status="ACIMA_DA_MEDIA" />
 * Uso final (consolidação):    <StatusBadge tipo="final" vc1={...} vc2={...} vc3={...} />
 * Uso final por status:        <StatusBadge tipo="final" status="VERIFICACAO_FINAL" />
 */
export default function StatusBadge({
  tipo = 'individual',
  nota,
  vc1,
  vc2,
  vc3,
  status: statusProp,
  style: styleProp,
  className,
}) {
  let label = ''
  let tone = 'neutral'

  if (tipo === 'final') {
    if (statusProp) {
      label = labelFinal(statusProp)
      tone = toneFinal(statusProp)
    } else {
      const d = describeMediaFinal(vc1, vc2, vc3)
      label = d.label
      tone = d.tone
    }
  } else {
    if (statusProp) {
      label = labelIndividual(statusProp)
      tone = toneIndividual(statusProp)
    } else {
      const d = describeNotaIndividual(nota)
      label = d.label
      tone = d.tone
    }
  }

  if (!label) return null

  const t = TONE_STYLE[tone] || TONE_STYLE.neutral

  return (
    <span
      className={className}
      style={{
        display: 'inline-block',
        padding: '4px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 0.4,
        textTransform: 'uppercase',
        background: t.bg,
        color: t.color,
        border: `1px solid ${t.border}`,
        ...styleProp,
      }}
    >
      {label}
    </span>
  )
}
