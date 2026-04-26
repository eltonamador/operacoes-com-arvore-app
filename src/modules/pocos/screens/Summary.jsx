import { SECTIONS, calcScore } from '../data/penalties'

/**
 * Tela de resumo — Prova Poço (avaliação em grupo).
 *
 * Exibe o resultado consolidado do grupo e persiste um registro por integrante
 * com a mesma nota final e penalidades.
 *
 * O objeto passado a saveEvaluation contém:
 *   base      — campos comuns a todos os registros
 *   grupoNum  — número do grupo
 *   pelotao   — pelotão
 *   integrantes — array com dados de assinatura individual
 */
export default function Summary({ state, reset, goTo, saveEvaluation }) {
  const { groupData, checkedItems, itemQuantities = {}, observations, customError } = state
  const customDiscount = parseFloat(customError?.discount) || 0
  const hasCustomError = customError?.description?.trim() !== '' && customDiscount > 0
  const { totalDiscount, finalScore } = calcScore(checkedItems, customDiscount, itemQuantities)
  const isPassing = finalScore >= 7.0

  const penalizedItems = []
  for (const section of SECTIONS) {
    for (const item of section.items) {
      if (checkedItems.has(item.id)) {
        const qty = item.perUnit ? (itemQuantities[item.id] || 1) : 1
        penalizedItems.push({ section, item, qty })
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
      const itensAvaliados = {
        resultado: isPassing ? 'APROVADO' : 'REPROVADO',
        grupo_num: groupData.grupoNum,
        grupo_pelotao: groupData.pelotao,
        avaliacao_em_grupo: true,
        visto_tipo: 'pin',
        erro_nao_previsto: hasCustomError
          ? { descricao: customError.description, desconto: Number(customDiscount.toFixed(2)) }
          : null,
        itens_penalizados: penalizedItems.map(({ section, item, qty }) => ({
          secao: section.title,
          id: item.id,
          descricao: item.description,
          quantidade: qty,
          desconto: Number((item.discount * qty).toFixed(2)),
        })),
      }

      // Objeto enviado ao PocoApp — que itera por integrante e salva N registros
      await saveEvaluation({
        pelotao: groupData.pelotao,
        grupoNum: groupData.grupoNum,
        avaliador: groupData.avaliador,
        data: groupData.data,
        nota_final: Number(finalScore.toFixed(2)),
        penalidades: Number(totalDiscount.toFixed(2)),
        observacoes: observations || '',
        integrantes: groupData.integrantes,
        itensAvaliados,
      })

      alert('Avaliação salva com sucesso para todos os integrantes.')
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
        <div className="header-emblem">🕳️</div>
        <div className="header-titles">
          <span className="header-org">CBMAP</span>
          <span className="header-title">Resultado da Avaliação</span>
          <span className="header-subtitle">
            {groupData.pelotao} — Grupo {groupData.grupoNum} — {groupData.integrantes?.length ?? 0} integrantes
          </span>
        </div>
        <div className="header-spacer" />
        <div className="header-actions">
          <button
            className="btn btn-secondary"
            style={{ fontSize: 13, padding: '10px 18px', minHeight: 44 }}
            onClick={() => goTo('signature')}
          >
            ← Voltar
          </button>
          <button
            className="btn btn-secondary"
            style={{ fontSize: 13, padding: '10px 18px', minHeight: 44 }}
            onClick={() => window.print()}
          >
            Imprimir
          </button>
          <button
            className="btn btn-gold"
            style={{ fontSize: 13, padding: '10px 18px', minHeight: 44 }}
            onClick={handleSaveEvaluation}
          >
            Salvar e Ver Relatório
          </button>
        </div>
      </header>

      <div className="screen-content" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Banner de resultado */}
        <div
          className="result-banner-wrap"
          style={{
            background: isPassing
              ? 'linear-gradient(135deg, #0a1a00 0%, #1a2a00 100%)'
              : 'linear-gradient(135deg, #1a0000 0%, #2a0a0a 100%)',
            border: `2px solid ${isPassing ? '#4CAF50' : 'var(--red)'}`,
            borderRadius: 'var(--radius)', padding: '20px 28px',
            display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap',
          }}
        >
          <div style={{ fontSize: 52 }}>{isPassing ? '✅' : '❌'}</div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: 2,
              color: isPassing ? '#88cc44' : 'var(--red-light)',
              textTransform: 'uppercase', marginBottom: 4,
            }}>
              Resultado Final do Grupo
            </div>
            <div style={{
              fontSize: 28, fontWeight: 900,
              color: isPassing ? '#aee86a' : '#ff6666', lineHeight: 1,
            }}>
              {isPassing ? 'APROVADO' : 'REPROVADO'}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>
              NOTA FINAL
            </div>
            <div style={{
              fontSize: 56, fontWeight: 900,
              color: isPassing ? '#FFD700' : '#ff6b6b',
              lineHeight: 1,
              textShadow: isPassing ? '0 0 30px rgba(255,215,0,0.4)' : '0 0 30px rgba(204,0,0,0.4)',
            }}>
              {finalScore.toFixed(2).replace('.', ',')}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>
              Descontos: {totalDiscount > 0 ? `–${totalDiscount.toFixed(2).replace('.', ',')}` : '0,00'}
            </div>
          </div>
        </div>

        <div className="summary-layout">
          <div className="summary-main">

            {/* Dados do grupo */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 20px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 12 }}>
                Dados do Grupo
              </div>
              <div className="summary-data-grid">
                <div className="summary-data-item">
                  <div className="summary-data-label">Pelotão</div>
                  <div className="summary-data-value">{groupData.pelotao || '—'}</div>
                </div>
                <div className="summary-data-item">
                  <div className="summary-data-label">Grupo</div>
                  <div className="summary-data-value">{groupData.grupoNum ?? '—'}</div>
                </div>
                <div className="summary-data-item">
                  <div className="summary-data-label">Data</div>
                  <div className="summary-data-value">{formatDate(groupData.data)}</div>
                </div>
                <div className="summary-data-item" style={{ gridColumn: '1 / -1' }}>
                  <div className="summary-data-label">Avaliador</div>
                  <div className="summary-data-value">{groupData.avaliador || '—'}</div>
                </div>
              </div>
            </div>

            {/* Integrantes + status de assinatura */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 20px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 12 }}>
                Integrantes ({groupData.integrantes?.length ?? 0}) — Vistos
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {(groupData.integrantes || []).map((m, i) => (
                  <div key={`${m.id}-${i}`} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '8px 12px', borderRadius: 8,
                    border: m.signed ? '1px solid #22c55e' : '1px solid var(--border)',
                    background: m.signed ? '#0d2e0d' : 'var(--bg-card)',
                  }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: m.signed ? '#FFD700' : 'var(--gold)', minWidth: 36 }}>
                      {String(m.id).padStart(3, '0')}
                    </span>
                    <span style={{ flex: 1, fontSize: 14, color: m.signed ? '#e8e8e8' : 'var(--text-primary)' }}>
                      {m.nome}
                      {m.extra && (
                        <span style={{
                          marginLeft: 8, fontSize: 10, fontWeight: 700, color: '#ffbb44',
                          background: '#2a1a00', border: '1px solid #cc8800',
                          borderRadius: 4, padding: '1px 6px',
                        }}>EXTRA</span>
                      )}
                    </span>
                    {m.signed ? (
                      <span style={{ fontSize: 12, color: '#22c55e', fontWeight: 600 }}>
                        ✓ {m.signedAt ? new Date(m.signedAt).toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    ) : (
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Pendente</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Itens penalizados */}
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
                  {penalizedItems.map(({ item, qty }) => (
                    <div key={item.id} className="summary-penalty-row">
                      <span className="summary-penalty-id">{item.id}</span>
                      <span className="summary-penalty-desc">{item.description}</span>
                      <span className="summary-penalty-val">
                        {qty > 1
                          ? `${qty} × –${item.discount.toFixed(2).replace('.', ',')} = –${(item.discount * qty).toFixed(2).replace('.', ',')}`
                          : `–${item.discount.toFixed(2).replace('.', ',')}`
                        }
                      </span>
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
                  <div style={{
                    display: 'flex', justifyContent: 'flex-end', paddingTop: 8,
                    borderTop: '1px solid #2a2a2a', marginTop: 4,
                    fontSize: 14, fontWeight: 700, color: 'var(--red-light)',
                  }}>
                    Total: –{totalDiscount.toFixed(2).replace('.', ',')}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
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
                  <span style={{ fontSize: 22, fontWeight: 900, color: isPassing ? 'var(--gold)' : 'var(--red-light)' }}>
                    {finalScore.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 10 }}>
                Persistência
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Ao salvar, {groupData.integrantes?.length ?? 0} registros serão criados —
                um por integrante — com a mesma nota e penalidades deste grupo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
