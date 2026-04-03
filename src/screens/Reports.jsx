import { generateCollectiveSignatureSheet } from '../utils/collectiveSignatureSheet'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) {
    const [y, m, d] = String(dateStr).split('-')
    return d && m && y ? `${d}/${m}/${y}` : dateStr
  }
  return date.toLocaleDateString('pt-BR')
}

function formatDateTime(dateStr) {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return dateStr
  return date.toLocaleString('pt-BR')
}

export default function Reports({
  savedEvaluations,
  deleteEvaluation,
  clearAllEvaluations,
  goTo,
  loadEvaluations,
  reportsLoading,
}) {
  const total = savedEvaluations.length
  const approved = savedEvaluations.filter(item => item.isPassing).length
  const failed = total - approved
  const average =
    total > 0
      ? (
          savedEvaluations.reduce((sum, item) => sum + Number(item.finalScore || 0), 0) / total
        ).toFixed(2)
      : '0.00'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-main)' }}>
      <header className="header no-print">
        <div className="header-emblem">📋</div>
        <div className="header-titles">
          <span className="header-org">CBMAP</span>
          <span className="header-title">Relatório de Avaliações</span>
          <span className="header-subtitle">Supabase • CFSD 2026</span>
        </div>
        <div className="header-spacer" />
        <div style={{ display: 'flex', gap: 10 }}>
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
            className="btn btn-danger"
            style={{ fontSize: 13, padding: '10px 18px', minHeight: 44 }}
            onClick={clearAllEvaluations}
            disabled={savedEvaluations.length === 0}
          >
            🗑 Limpar Tudo
          </button>
        </div>
      </header>

      <div style={{ padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(180px, 1fr))', gap: 16 }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 16 }}>
            <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 700 }}>
              Total
            </div>
            <div style={{ fontSize: 30, fontWeight: 900, marginTop: 8 }}>{total}</div>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 16 }}>
            <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 700 }}>
              Aprovados
            </div>
            <div style={{ fontSize: 30, fontWeight: 900, marginTop: 8, color: '#8ddf63' }}>{approved}</div>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 16 }}>
            <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 700 }}>
              Reprovados
            </div>
            <div style={{ fontSize: 30, fontWeight: 900, marginTop: 8, color: '#ff6b6b' }}>{failed}</div>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 16 }}>
            <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 700 }}>
              Média Geral
            </div>
            <div style={{ fontSize: 30, fontWeight: 900, marginTop: 8 }}>{String(average).replace('.', ',')}</div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'var(--gold)', textTransform: 'uppercase' }}>
              Avaliações Registradas ({total})
            </div>
            <button
              className="btn btn-secondary"
              style={{
                fontSize: 12,
                padding: '8px 16px',
                minHeight: 36,
                display: savedEvaluations.length === 0 ? 'none' : 'flex',
              }}
              onClick={() => generateCollectiveSignatureSheet(savedEvaluations)}
              title="Gera ficha coletiva com todos os alunos para colher assinatura manuscrita"
            >
              📄 Ficha Coletiva de Assinaturas
            </button>
          </div>

          {reportsLoading ? (
            <div style={{ padding: 24, color: 'var(--text-muted)' }}>Carregando avaliações...</div>
          ) : savedEvaluations.length === 0 ? (
            <div style={{ padding: 24, color: 'var(--text-muted)' }}>Nenhuma avaliação encontrada.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#121212' }}>
                    <th style={thStyle}>Aluno</th>
                    <th style={thStyle}>Ordem</th>
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
                  {savedEvaluations.map(item => (
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