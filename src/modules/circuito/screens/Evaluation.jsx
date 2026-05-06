import { SECTIONS, calcScore } from '../data/penalties'

// ── helpers ──────────────────────────────────────────────────────────────────

function fmtDiscount(val) {
  return `–${val.toFixed(2).replace('.', ',')}`
}

// ── sub-components ────────────────────────────────────────────────────────────

function BlocoHeader({ bloco, subtitle }) {
  return (
    <div style={{
      background: 'var(--navy, #1a2a3a)',
      borderRadius: 'var(--radius-sm)',
      padding: '8px 14px',
      marginTop: 24,
      marginBottom: 4,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
    }}>
      <span style={{
        background: 'var(--gold, #cc8800)',
        color: '#000',
        fontWeight: 800,
        fontSize: 11,
        borderRadius: 4,
        padding: '2px 10px',
        letterSpacing: 1,
        whiteSpace: 'nowrap',
      }}>
        BLOCO {bloco}
      </span>
      <span style={{ fontSize: 12, color: '#a8c8e0', fontWeight: 600 }}>
        {subtitle}
      </span>
    </div>
  )
}

function StationHeader({ section, checkedCount }) {
  return (
    <div style={{
      background: 'linear-gradient(90deg, #1a1200 0%, #2a1e00 100%)',
      border: '1.5px solid #cc8800',
      borderRadius: 'var(--radius-sm)',
      padding: '9px 14px',
      marginTop: 14,
      marginBottom: 6,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
    }}>
      <span style={{
        background: '#cc8800',
        color: '#000',
        fontWeight: 800,
        fontSize: 11,
        borderRadius: 4,
        padding: '2px 8px',
        letterSpacing: 1,
        whiteSpace: 'nowrap',
      }}>
        {section.id}
      </span>
      <span style={{
        fontWeight: 700,
        fontSize: 12,
        color: '#ffcc55',
        letterSpacing: 0.4,
        textTransform: 'uppercase',
        flex: 1,
      }}>
        {section.title}
      </span>
      {section.subtitle && (
        <span style={{ fontSize: 10, color: '#9aacbc', fontWeight: 500, whiteSpace: 'nowrap' }}>
          {section.subtitle}
        </span>
      )}
      <span style={{
        fontSize: 10,
        color: '#cc8800',
        fontWeight: 700,
        whiteSpace: 'nowrap',
        background: '#2a1e00',
        border: '1px solid #553300',
        borderRadius: 3,
        padding: '2px 6px',
      }}>
        Teto {section.teto.toFixed(2).replace('.', ',')} pt
      </span>
      <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>
        {checkedCount}/{section.items.length} erros
      </span>
    </div>
  )
}

function TemporalHeader({ section, checkedCount, cappedDiscount }) {
  return (
    <div style={{
      background: 'linear-gradient(90deg, #1a0800 0%, #2a1000 100%)',
      border: '1.5px solid #c05010',
      borderRadius: 'var(--radius-sm)',
      padding: '9px 14px',
      marginTop: 14,
      marginBottom: 6,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
    }}>
      <span style={{
        background: '#c05010',
        color: '#fff',
        fontWeight: 800,
        fontSize: 11,
        borderRadius: 4,
        padding: '2px 8px',
        letterSpacing: 1,
        whiteSpace: 'nowrap',
      }}>
        ⏱ TEMPO
      </span>
      <span style={{
        fontWeight: 700,
        fontSize: 12,
        color: '#ffaa66',
        letterSpacing: 0.4,
        textTransform: 'uppercase',
        flex: 1,
      }}>
        {section.title}
      </span>
      <span style={{ fontSize: 10, color: '#cc7040', fontWeight: 500 }}>
        {section.subtitle}
      </span>
      {cappedDiscount > 0 && (
        <span style={{
          fontSize: 11,
          color: '#ff7030',
          fontWeight: 700,
          whiteSpace: 'nowrap',
          background: '#2a1000',
          border: '1px solid #c05010',
          borderRadius: 3,
          padding: '2px 6px',
        }}>
          {fmtDiscount(cappedDiscount)}
        </span>
      )}
      <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>
        {checkedCount}/{section.items.length} min
      </span>
    </div>
  )
}

// ── main component ────────────────────────────────────────────────────────────

export default function Evaluation({ state, toggleItem, setObservations, setCustomError, goTo }) {
  const { checkedItems, observations, customError } = state

  const customDiscount = parseFloat(customError.discount) || 0
  const { totalDiscount, temporalDiscount, stationDiscount, finalScore } = calcScore(checkedItems, customDiscount)
  const isPassing = finalScore >= 7.0
  const hasCustomError = customError.description.trim() !== '' && customDiscount > 0

  function handleCustomChange(field, value) {
    setCustomError({ ...customError, [field]: value })
  }

  // compute per-section capped discount (for display in TemporalHeader)
  function sectionCappedDiscount(section) {
    let sum = 0
    for (const item of section.items) {
      if (checkedItems.has(item.id)) sum += item.discount
    }
    return Math.min(sum, section.teto)
  }

  let lastBloco = null

  return (
    <div className="screen-container">
      {/* Header */}
      <header className="header">
        <div className="header-emblem">🔄</div>
        <div className="header-titles">
          <span className="header-org">CBMAP</span>
          <span className="header-title">Avaliação Prática – Circuito Operacional</span>
          <span className="header-subtitle" style={{ color: 'var(--gold)', fontWeight: 600 }}>
            {state.studentData.nome || '—'} &nbsp;|&nbsp; Ord. {state.studentData.ordem || '—'} &nbsp;|&nbsp; {state.studentData.pelotao || '—'}
          </span>
        </div>
        <div className="header-spacer" />
        <button
          className="btn btn-secondary"
          style={{ fontSize: 13, padding: '10px 18px', minHeight: 44 }}
          onClick={() => goTo('form')}
        >
          ← Voltar
        </button>
      </header>

      {/* Main layout */}
      <div className="eval-layout">

        {/* LEFT: scrollable penalty list */}
        <div className="eval-left">
          {SECTIONS.map(section => {
            const checkedCount = section.items.filter(i => checkedItems.has(i.id)).length
            const showBlocoHeader = section.bloco !== lastBloco
            lastBloco = section.bloco

            const blocoSubtitles = {
              'I': 'Estações 1 a 6 · Ref: 16 min · Máx: 25 min',
              'II': 'Estação 7 · Cronometrado em separado · Ref: 1min30s · Máx: 2min',
            }

            return (
              <div key={section.id}>
                {showBlocoHeader && (
                  <BlocoHeader bloco={section.bloco} subtitle={blocoSubtitles[section.bloco]} />
                )}

                {section.isTemporal ? (
                  <TemporalHeader
                    section={section}
                    checkedCount={checkedCount}
                    cappedDiscount={sectionCappedDiscount(section)}
                  />
                ) : (
                  <StationHeader section={section} checkedCount={checkedCount} />
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {section.items.map(item => {
                    const isChecked = checkedItems.has(item.id)
                    const isTemporal = section.isTemporal
                    return (
                      <button
                        key={item.id}
                        className={`penalty-item ${isChecked ? 'checked' : ''}`}
                        onClick={() => toggleItem(item.id)}
                        style={isTemporal && isChecked ? {
                          borderColor: '#c05010',
                          background: 'rgba(192,80,16,0.12)',
                        } : undefined}
                      >
                        <div className="penalty-item-check">
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M2.5 7L5.5 10L11.5 4" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <span className="penalty-item-id" style={isTemporal ? { color: '#cc7040' } : undefined}>
                          {item.id}
                        </span>
                        <span className="penalty-item-desc">{item.description}</span>
                        <span
                          className="penalty-item-discount"
                          style={isTemporal ? { color: '#ff7030' } : undefined}
                        >
                          {fmtDiscount(item.discount)}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}

          <div style={{ height: 8 }} />
        </div>

        {/* RIGHT: fixed panel */}
        <div className="eval-right">

          {/* Score panel */}
          <div>
            <div style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 2,
              color: 'var(--gold)',
              textTransform: 'uppercase',
              marginBottom: 10,
            }}>
              Pontuação em Tempo Real
            </div>
            <div className="score-panel">
              <div className="score-row">
                <span>Nota Inicial</span>
                <span className="score-value">10,00</span>
              </div>
              <div className="score-row">
                <span>Desc. estações</span>
                <span className="score-value discount">
                  {stationDiscount > 0 ? fmtDiscount(stationDiscount) : '0,00'}
                </span>
              </div>
              <div className="score-row">
                <span>Penalidade temporal</span>
                <span className="score-value" style={{ color: temporalDiscount > 0 ? '#ff7030' : undefined }}>
                  {temporalDiscount > 0 ? fmtDiscount(temporalDiscount) : '0,00'}
                </span>
              </div>
              {hasCustomError && (
                <div className="score-row">
                  <span>Erro não previsto</span>
                  <span className="score-value discount">{fmtDiscount(customDiscount)}</span>
                </div>
              )}
              <div className="score-row">
                <span>Total descontos</span>
                <span className="score-value discount">
                  {totalDiscount > 0 ? fmtDiscount(totalDiscount) : '0,00'}
                </span>
              </div>
              <div className="score-row final" style={{ flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <span className="score-final-label">Nota Final</span>
                <span className={`score-final-value ${isPassing ? 'passing' : 'failing'}`}>
                  {finalScore.toFixed(2).replace('.', ',')}
                </span>
                <span style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: isPassing ? 'var(--gold)' : 'var(--red-light)',
                  letterSpacing: 1,
                }}>
                  {isPassing ? '✓ APROVADO' : '✗ REPROVADO'}
                </span>
              </div>
            </div>
          </div>

          {/* Custom / unexpected error */}
          <div>
            <div style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 2,
              color: 'var(--gold)',
              textTransform: 'uppercase',
              marginBottom: 10,
            }}>
              Erro Não Previsto
            </div>
            <div style={{
              background: '#1a1200',
              border: `1.5px solid ${hasCustomError ? '#cc8800' : '#3a2a00'}`,
              borderRadius: 'var(--radius-sm)',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: 10 }}>Descrição do Erro</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Descreva o erro não previsto..."
                  value={customError.description}
                  onChange={e => handleCustomChange('description', e.target.value)}
                  style={{ fontSize: 13, padding: '9px 11px', minHeight: 40 }}
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: 10 }}>Desconto (ex: 0,20)</label>
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  max="10"
                  step="0.05"
                  placeholder="0,00"
                  value={customError.discount}
                  onChange={e => handleCustomChange('discount', e.target.value)}
                  style={{ fontSize: 15, padding: '9px 11px', minHeight: 40, fontWeight: 700 }}
                />
              </div>
              {hasCustomError && (
                <div style={{
                  background: '#2a1500',
                  border: '1px solid #cc8800',
                  borderRadius: 6,
                  padding: '8px 10px',
                  fontSize: 12,
                  color: '#ffbb44',
                  lineHeight: 1.4,
                }}>
                  Desconto de –{customDiscount.toFixed(2).replace('.', ',')} incluído no cálculo.
                </div>
              )}
              {customError.description.trim() !== '' && !hasCustomError && (
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Informe também o desconto para incluir no cálculo.
                </div>
              )}
            </div>
          </div>

          {/* Observations */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 2,
              color: 'var(--gold)',
              textTransform: 'uppercase',
              marginBottom: 10,
            }}>
              Observações
            </div>
            <textarea
              className="form-input"
              style={{ flex: 1, minHeight: 80, resize: 'none' }}
              placeholder="Observações do avaliador sobre o desempenho do aluno..."
              value={observations}
              onChange={e => setObservations(e.target.value)}
            />
          </div>

          {/* Advance button */}
          <button
            className="btn btn-primary"
            style={{ width: '100%', minHeight: 48, fontSize: 16, fontWeight: 700 }}
            onClick={() => goTo('signature')}
          >
            Avançar para Assinatura →
          </button>
        </div>
      </div>
    </div>
  )
}
