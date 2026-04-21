import { SECTIONS, calcScore } from '../data/penalties'

const PHASE_SECTION_IDS = ['3.0', '4.0', '5.0']

function SectionHeader({ section }) {
  const isPhase = PHASE_SECTION_IDS.includes(section.id)

  if (isPhase) {
    return (
      <div style={{
        background: 'linear-gradient(90deg, #1a1200 0%, #2a1e00 100%)',
        border: '1.5px solid #cc8800',
        borderRadius: 'var(--radius-sm)',
        padding: '10px 14px',
        marginTop: 20,
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
          fontSize: 13,
          color: '#ffcc55',
          letterSpacing: 0.5,
          textTransform: 'uppercase',
        }}>
          {section.title}
        </span>
        <span style={{
          marginLeft: 'auto',
          fontSize: 11,
          color: 'var(--text-muted)',
          fontWeight: 600,
          whiteSpace: 'nowrap',
        }}>
          — / {section.items.length} erros
        </span>
      </div>
    )
  }

  return (
    <div className="section-header">
      <span className="section-id">{section.id}</span>
      <span className="section-title">{section.title}</span>
      <span style={{
        marginLeft: 'auto',
        fontSize: 12,
        color: 'var(--text-muted)',
        fontWeight: 600,
      }}>
        — / {section.items.length} erros
      </span>
    </div>
  )
}

export default function Evaluation({ state, toggleItem, setObservations, setCustomError, goTo }) {
  const { checkedItems, observations, customError } = state

  const customDiscount = parseFloat(customError.discount) || 0
  const { totalDiscount, finalScore } = calcScore(checkedItems, customDiscount)
  const isPassing = finalScore >= 7.0

  function formatDiscount(val) {
    return `–${val.toFixed(2).replace('.', ',')}`
  }

  function handleCustomChange(field, value) {
    setCustomError({ ...customError, [field]: value })
  }

  const hasCustomError = customError.description.trim() !== '' && customDiscount > 0

  return (
    <div className="screen-container">
      {/* Header */}
      <header className="header">
        <div className="header-emblem">🕳️</div>
        <div className="header-titles">
          <span className="header-org">CBMAP</span>
          <span className="header-title">Avaliação Prática – Espaço Confinado (Poço)</span>
          <span className="header-subtitle" style={{ color: 'var(--gold)', fontWeight: 600 }}>
            {state.groupData?.pelotao || '—'} &nbsp;|&nbsp; Grupo {state.groupData?.grupoNum || '—'} &nbsp;|&nbsp; {state.groupData?.integrantes?.length ?? 0} integrantes
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
            const isPhase = PHASE_SECTION_IDS.includes(section.id)
            const checkedCount = section.items.filter(i => checkedItems.has(i.id)).length

            return (
              <div key={section.id}>
                {isPhase ? (
                  <div style={{
                    background: 'linear-gradient(90deg, #1a1200 0%, #2a1e00 100%)',
                    border: '1.5px solid #cc8800',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 14px',
                    marginTop: 20,
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
                      fontSize: 13,
                      color: '#ffcc55',
                      letterSpacing: 0.5,
                      textTransform: 'uppercase',
                    }}>
                      {section.title}
                    </span>
                    <span style={{
                      marginLeft: 'auto',
                      fontSize: 11,
                      color: 'var(--text-muted)',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                    }}>
                      {checkedCount}/{section.items.length} erros
                    </span>
                  </div>
                ) : (
                  <div className="section-header">
                    <span className="section-id">{section.id}</span>
                    <span className="section-title">{section.title}</span>
                    <span style={{
                      marginLeft: 'auto',
                      fontSize: 12,
                      color: 'var(--text-muted)',
                      fontWeight: 600,
                    }}>
                      {checkedCount}/{section.items.length} erros
                    </span>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {section.items.map(item => {
                    const isChecked = checkedItems.has(item.id)
                    return (
                      <button
                        key={item.id}
                        className={`penalty-item ${isChecked ? 'checked' : ''}`}
                        onClick={() => toggleItem(item.id)}
                      >
                        <div className="penalty-item-check">
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M2.5 7L5.5 10L11.5 4" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <span className="penalty-item-id">{item.id}</span>
                        <span className="penalty-item-desc">{item.description}</span>
                        <span className="penalty-item-discount">{formatDiscount(item.discount)}</span>
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
                <span>Total de Descontos</span>
                <span className="score-value discount">
                  {totalDiscount > 0 ? `–${totalDiscount.toFixed(2).replace('.', ',')}` : '0,00'}
                </span>
              </div>
              <div className="score-row">
                <span>Erros marcados</span>
                <span className="score-value">{checkedItems.size}{hasCustomError ? ' +1' : ''}</span>
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
              placeholder="Observações do avaliador sobre o desempenho da equipe..."
              value={observations}
              onChange={e => setObservations(e.target.value)}
            />
          </div>

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
