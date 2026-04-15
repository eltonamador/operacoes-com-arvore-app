import { useState } from 'react'

const TZ = 'America/Sao_Paulo'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) {
    const [y, m, d] = String(dateStr).split('-')
    return d && m && y ? `${d}/${m}/${y}` : dateStr
  }
  return date.toLocaleDateString('pt-BR', { timeZone: TZ })
}

function formatDateTime(dateStr) {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return dateStr
  return date.toLocaleString('pt-BR', { timeZone: TZ })
}

export default function Reports({
  savedEvaluations,
  deleteEvaluation,
  clearAllEvaluations,
  goTo,
  loadEvaluations,
  reportsLoading,
}) {
  const [selectedDate, setSelectedDate] = useState('')

  const filteredByDate = selectedDate
    ? savedEvaluations.filter(item => item.studentData?.data === selectedDate)
    : savedEvaluations

  const total = filteredByDate.length
  const approved = filteredByDate.filter(item => item.isPassing).length
  const failed = total - approved
  const average =
    total > 0
      ? (
          filteredByDate.reduce((sum, item) => sum + Number(item.finalScore || 0), 0) / total
        ).toFixed(2)
      : '0.00'

  const uniqueDates = [...new Set(savedEvaluations.map(e => e.studentData?.data).filter(Boolean))].sort().reverse()

  return (
    <div className="screen-container">
      <header className="header no-print">
        <div className="header-emblem">📋</div>
        <div className="header-titles">
          <span className="header-org">CBMAP</span>
          <span className="header-title">Relatório de Avaliações</span>
          <span className="header-subtitle">Poços • CFSD 2026</span>
        </div>
        <div className="header-spacer" />
        <div className="header-actions">
          <button
            className="btn btn-secondary"
            style={{ fontSize: 13, padding: '10px 18px', minHeight: 44 }}
            onClick={() => goTo('form')}
          >
            ← Nova Avaliação
          </button>

          <button
            className="btn btn-secondary"
            style={{ fontSize: 13, padding: '10px 18px', minHeight: 44 }}
            onClick={loadEvaluations}
          >
            ⟳ Atualizar
          </button>

          <button
            className="btn btn-primary"
            style={{ fontSize: 13, padding: '10px 18px', minHeight: 44 }}
            onClick={() => goTo('advanced-reports')}
          >
            📊 Relatórios Avançados
          </button>

          <button
            className="btn btn-danger"
            style={{ fontSize: 13, padding: '10px 18px', minHeight: 44 }}
            onClick={clearAllEvaluations}
            disabled={savedEvaluations.length === 0}
          >
            🗑 Limpar Tudo
          </button>
        </div>
      </header>

      <div className="screen-content" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Filtro por Data */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '16px 20px',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 12 }}>
            Filtrar por Data
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              style={{
                padding: '10px 12px',
                borderRadius: 6,
                border: '1px solid var(--border)',
                background: 'var(--bg-main)',
                color: 'var(--text-primary)',
                fontSize: 13,
                colorScheme: 'dark',
              }}
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate('')}
                style={{
                  padding: '10px 16px',
                  borderRadius: 6,
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  fontSize: 13,
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                ✕ Limpar Filtro
              </button>
            )}
            {uniqueDates.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flex: 1 }}>
                {uniqueDates.map(date => {
                  const dateObj = new Date(date + 'T00:00:00')
                  const formatted = dateObj.toLocaleDateString('pt-BR')
                  const count = savedEvaluations.filter(e => e.studentData?.data === date).length
                  return (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: selectedDate === date ? '2px solid var(--gold)' : '1px solid var(--border)',
                        background: selectedDate === date ? 'rgba(255, 215, 0, 0.1)' : 'transparent',
                        color: selectedDate === date ? 'var(--gold)' : 'var(--text-secondary)',
                        fontSize: 12,
                        cursor: 'pointer',
                        fontWeight: selectedDate === date ? 700 : 600,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {formatted} ({count})
                    </button>
                  )
                })}
              </div>
            )}
          </div>
          {selectedDate && (
            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
              Mostrando {total} avaliação(ções) de {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR')}
            </div>
          )}
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total</div>
            <div className="stat-value">{total}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Aprovados</div>
            <div className="stat-value" style={{ color: '#8ddf63' }}>{approved}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Reprovados</div>
            <div className="stat-value" style={{ color: '#ff6b6b' }}>{failed}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Média Geral</div>
            <div className="stat-value">{String(average).replace('.', ',')}</div>
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            overflow: 'hidden',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'var(--gold)', textTransform: 'uppercase' }}>
              Avaliações Registradas ({filteredByDate.length}{selectedDate ? ` de ${savedEvaluations.length}` : ''})
            </div>
          </div>

          {reportsLoading ? (
            <div style={{ padding: 24, color: 'var(--text-muted)' }}>Carregando avaliações...</div>
          ) : filteredByDate.length === 0 ? (
            <div style={{ padding: 24, color: 'var(--text-muted)' }}>
              {selectedDate
                ? `Nenhuma avaliação encontrada para ${new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR')}.`
                : 'Nenhuma avaliação encontrada.'}
            </div>
          ) : (
            <div style={{ overflowY: 'auto', overflowX: 'auto', flex: 1, minHeight: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#121212', position: 'sticky', top: 0, zIndex: 1 }}>
                    <th style={thStyle}>Aluno</th>
                    <th style={thStyle}>Nº</th>
                    <th style={thStyle}>Pelotão</th>
                    <th style={thStyle}>Data</th>
                    <th style={thStyle}>Avaliador</th>
                    <th style={thStyle}>Nota</th>
                    <th style={thStyle}>Resultado</th>
                    <th style={thStyle}>Salvo em</th>
                    <th style={thStyle}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredByDate.map(item => (
                    <tr key={item.id} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={tdStyle}>{item.studentData?.nome || '—'}</td>
                      <td style={tdStyle}>{item.studentData?.ordem || '—'}</td>
                      <td style={tdStyle}>{item.studentData?.pelotao || '—'}</td>
                      <td style={tdStyle}>{formatDate(item.studentData?.data)}</td>
                      <td style={tdStyle}>{item.studentData?.avaliador || '—'}</td>
                      <td style={tdStyle}>
                        <strong>{Number(item.finalScore || 0).toFixed(2).replace('.', ',')}</strong>
                      </td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: 700,
                            background: item.isPassing ? 'rgba(76, 175, 80, 0.15)' : 'rgba(204, 0, 0, 0.15)',
                            color: item.isPassing ? '#8ddf63' : '#ff6b6b',
                            border: `1px solid ${item.isPassing ? 'rgba(76, 175, 80, 0.35)' : 'rgba(204, 0, 0, 0.35)'}`,
                          }}
                        >
                          {item.isPassing ? 'APROVADO' : 'REPROVADO'}
                        </span>
                      </td>
                      <td style={tdStyle}>{formatDateTime(item.savedAt)}</td>
                      <td style={tdStyle}>
                        <button
                          className="btn btn-danger"
                          style={{ fontSize: 12, padding: '8px 12px', minHeight: 36 }}
                          onClick={() => deleteEvaluation(item.id)}
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const thStyle = {
  textAlign: 'left',
  padding: '14px 16px',
  fontSize: 12,
  color: 'var(--gold)',
  textTransform: 'uppercase',
  letterSpacing: 1,
}

const tdStyle = {
  padding: '14px 16px',
  fontSize: 14,
  color: 'var(--text-primary)',
  verticalAlign: 'middle',
}
