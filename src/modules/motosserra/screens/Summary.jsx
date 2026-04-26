import { SECTIONS, calcScore } from '../data/penalties'

export default function Summary({ state, reset, goTo, saveEvaluation, savedEvaluations }) {
  const { studentData, checkedItems, criticalErrors, observations, vistoConfirmado, vistoNomeConfirmacao, vistoDataHora, declaracaoCiencia, customError } = state
  const customDiscount = parseFloat(customError?.discount) || 0
  const hasCustomError = customError?.description?.trim() !== '' && customDiscount > 0
  const { totalDiscount, finalScore } = calcScore(checkedItems, customDiscount)
  const isPassing = finalScore >= 7.0 && !criticalErrors

  const penalizedItems = []
  for (const section of SECTIONS) {
    for (const item of section.items) {
      if (checkedItems.has(item.id)) {
        penalizedItems.push({ section, item })
      }
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—'
    const [y, m, d] = dateStr.split('-')
    return `${d}/${m}/${y}`
  }

  async function handleSaveEvaluation() {
    try {
      const dadosAvaliacao = {
        nome_aluno: studentData.nome || '',
        numero_ordem: studentData.ordem || '',
        pelotao: studentData.pelotao || '',
        avaliador: studentData.avaliador || '',
        data_avaliacao: studentData.data || new Date().toISOString().slice(0, 10),
        nota_final: Number(finalScore.toFixed(2)),
        penalidades: Number(totalDiscount.toFixed(2)),
        observacoes: observations || '',
        itens_avaliados: {
          resultado: isPassing ? 'APROVADO' : 'REPROVADO',
          erros_criticos: criticalErrors,
          visto_confirmado: state.vistoConfirmado,
          visto_data_hora: state.vistoDataHora,
          declaracao_ciencia: state.declaracaoCiencia,
          visto_tipo: state.vistoTipo || '',
          visto_pin_confirmado: state.vistoPinConfirmado || false,
          erro_nao_previsto: hasCustomError
            ? {
                descricao: customError.description,
                desconto: Number(customDiscount.toFixed(2)),
              }
            : null,
          itens_penalizados: penalizedItems.map(({ section, item }) => ({
            secao: section.title,
            id: item.id,
            descricao: item.description,
            desconto: Number(item.discount.toFixed(2)),
          })),
        },
      }

      await saveEvaluation(dadosAvaliacao)
      alert('Avaliação salva com sucesso.')
      reset()
      goTo('reports')
    } catch (error) {
      console.error(error)
      alert('Erro ao salvar avaliação.')
    }
  }

  return (
    <div className="screen-container">
      <header className="header no-print">
        <div className="header-emblem">🪚🌲</div>
        <div className="header-titles">
          <span className="header-org">CBMAP</span>
          <span className="header-title">Resultado da Avaliação</span>
          <span className="header-subtitle">Resumo Final – CFSD 2026</span>
        </div>
        <div className="header-spacer" />
        <div className="header-actions">
          <button
            className="btn btn-secondary"
            style={{ fontSize: 13, padding: '10px 18px', minHeight: 44 }}
            onClick={() => {
              reset()
              goTo('form')
            }}
          >
            ← Nova Avaliação
          </button>
          <button
            className="btn btn-secondary"
            style={{ fontSize: 13, padding: '10px 18px', minHeight: 44 }}
            onClick={() => window.print()}
          >
            🖨 Imprimir
          </button>
          <button
            className="btn btn-secondary"
            style={{ fontSize: 13, padding: '10px 18px', minHeight: 44, borderColor: 'var(--gold)', color: 'var(--gold)' }}
            onClick={() => goTo('reports')}
          >
            📋 Relatório ({savedEvaluations.length})
          </button>
          <button
            className="btn btn-gold"
            style={{ fontSize: 13, padding: '10px 18px', minHeight: 44 }}
            onClick={handleSaveEvaluation}
          >
            💾 Salvar e Ver Relatório
          </button>
          <button
            className="btn btn-danger"
            style={{ fontSize: 13, padding: '10px 18px', minHeight: 44 }}
            onClick={reset}
          >
            Nova Avaliação
          </button>
        </div>
      </header>

      <div className="screen-content" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div
          className="result-banner-wrap"
          style={{
            background: isPassing
              ? 'linear-gradient(135deg, #0a1a00 0%, #1a2a00 100%)'
              : 'linear-gradient(135deg, #1a0000 0%, #2a0a0a 100%)',
            border: `2px solid ${isPassing ? '#4CAF50' : 'var(--red)'}`,
            borderRadius: 'var(--radius)',
            padding: '20px 28px',
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ fontSize: 52 }}>{isPassing ? '✅' : '❌'}</div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 2,
                color: isPassing ? '#88cc44' : 'var(--red-light)',
                textTransform: 'uppercase',
                marginBottom: 4,
              }}
            >
              Resultado Final
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 900,
                color: isPassing ? '#aee86a' : '#ff6666',
                lineHeight: 1,
              }}
            >
              {isPassing ? 'APROVADO' : 'REPROVADO'}
            </div>
            {criticalErrors && (
              <div style={{ fontSize: 13, color: '#ff8888', marginTop: 6 }}>
                ⚠ Erros Críticos identificados na Etapa 1
              </div>
            )}
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>
              NOTA FINAL
            </div>
            <div
              style={{
                fontSize: 56,
                fontWeight: 900,
                color: isPassing ? '#FFD700' : '#ff6b6b',
                lineHeight: 1,
                textShadow: isPassing ? '0 0 30px rgba(255,215,0,0.4)' : '0 0 30px rgba(204,0,0,0.4)',
              }}
            >
              {finalScore.toFixed(2).replace('.', ',')}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>
              Descontos: {totalDiscount > 0 ? `–${totalDiscount.toFixed(2).replace('.', ',')}` : '0,00'}
            </div>
          </div>
        </div>

        <div className="summary-layout">
          <div className="summary-main">
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 20px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 12 }}>
                Dados do Aluno
              </div>
              <div className="summary-data-grid">
                <div className="summary-data-item" style={{ gridColumn: '1 / -1' }}>
                  <div className="summary-data-label">Nome Completo</div>
                  <div className="summary-data-value" style={{ fontSize: 17 }}>{studentData.nome || '—'}</div>
                </div>
                <div className="summary-data-item">
                  <div className="summary-data-label">Nº</div>
                  <div className="summary-data-value">{studentData.ordem || '—'}</div>
                </div>
                <div className="summary-data-item">
                  <div className="summary-data-label">Data</div>
                  <div className="summary-data-value">{formatDate(studentData.data)}</div>
                </div>
                <div className="summary-data-item">
                  <div className="summary-data-label">Pelotão</div>
                  <div className="summary-data-value">{studentData.pelotao || '—'}</div>
                </div>
                <div className="summary-data-item" style={{ gridColumn: '1 / -1' }}>
                  <div className="summary-data-label">Avaliador</div>
                  <div className="summary-data-value">{studentData.avaliador || '—'}</div>
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 20px', flex: 1, overflow: 'auto' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 12 }}>
                Itens Penalizados ({penalizedItems.length})
              </div>
              {penalizedItems.length === 0 && !hasCustomError ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 14, fontStyle: 'italic' }}>
                  Nenhum erro registrado.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {penalizedItems.map(({ item }) => (
                    <div key={item.id} className="summary-penalty-row">
                      <span className="summary-penalty-id">{item.id}</span>
                      <span className="summary-penalty-desc">{item.description}</span>
                      <span className="summary-penalty-val">–{item.discount.toFixed(2).replace('.', ',')}</span>
                    </div>
                  ))}
                  {hasCustomError && (
                    <div className="summary-penalty-row" style={{ borderColor: '#cc8800', background: '#1a1200' }}>
                      <span className="summary-penalty-id" style={{ color: '#ffbb44' }}>✎</span>
                      <span className="summary-penalty-desc" style={{ color: '#ffe066' }}>
                        <strong style={{ color: '#ffbb44', fontSize: 11, display: 'block', marginBottom: 2 }}>ERRO NÃO PREVISTO</strong>
                        {customError.description}
                      </span>
                      <span className="summary-penalty-val">–{customDiscount.toFixed(2).replace('.', ',')}</span>
                    </div>
                  )}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      paddingTop: 8,
                      borderTop: '1px solid #2a2a2a',
                      marginTop: 4,
                      fontSize: 14,
                      fontWeight: 700,
                      color: 'var(--red-light)',
                    }}
                  >
                    Total: –{totalDiscount.toFixed(2).replace('.', ',')}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="summary-sidebar">
            {observations && (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 10 }}>
                  Observações do Avaliador
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {observations}
                </p>
              </div>
            )}

            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '16px',
                flex: 1,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 10 }}>
                Visto de Prova
              </div>
              {vistoConfirmado ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22c55e', borderRadius: 6, padding: 12 }}>
                    <div style={{ fontSize: 12, color: '#22c55e', fontWeight: 600, marginBottom: 6 }}>✓ Confirmado</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      <strong>{vistoNomeConfirmacao}</strong>
                    </div>
                  </div>
                  {vistoDataHora && (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', borderTop: '1px solid #2a2a2a', paddingTop: 8 }}>
                      {new Date(vistoDataHora).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
                    </div>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    background: '#1a1a1a',
                    borderRadius: 8,
                    padding: 20,
                    textAlign: 'center',
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: 13,
                    fontStyle: 'italic',
                  }}
                >
                  Sem visto de prova registrado
                </div>
              )}
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 10 }}>
                Pontuação
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  ['Nota Inicial', '10,00', ''],
                  ['Total Descontos', totalDiscount > 0 ? `–${totalDiscount.toFixed(2).replace('.', ',')}` : '0,00', 'var(--red-light)'],
                  ['Erros Marcados', `${checkedItems.size}`, ''],
                ].map(([label, value, color]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                    <span style={{ fontWeight: 700, color: color || 'var(--text-primary)' }}>{value}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid #2a2a2a', paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)' }}>NOTA FINAL</span>
                  <span
                    style={{
                      fontSize: 22,
                      fontWeight: 900,
                      color: isPassing ? 'var(--gold)' : 'var(--red-light)',
                    }}
                  >
                    {finalScore.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
