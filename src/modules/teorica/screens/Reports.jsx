import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

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

export default function Reports({
  savedEvaluations,
  deleteEvaluation,
  goTo,
  loadEvaluations,
  reportsLoading,
}) {
  const navigate = useNavigate()
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

  const uniqueDates = [
    ...new Set(savedEvaluations.map(e => e.studentData?.data).filter(Boolean)),
  ]
    .sort()
    .reverse()

  return (
    <div className="screen-container">
      <header className="header no-print">
        <div className="header-emblem">📋</div>
        <div className="header-titles">
          <span className="header-org">CBMAP — CFSD-26</span>
          <span className="header-title">Relatório — Prova Teórica</span>
          <span className="header-subtitle">Supabase · CFSD 2026</span>
        </div>
        <div className="header-spacer" />
        <div className="header-actions">
          <button
            className="btn btn-secondary"
            style={{ fontSize: 13, padding: '10px 18px', minHeight: 44 }}
            onClick={() => navigate('/avaliador')}
          >
            Voltar ao Portal
          </button>
          <button
            className="btn btn-secondary"
            style={{ fontSize: 13, padding: '10px 18px', minHeight: 44 }}
            onClick={() => goTo('form')}
          >
            Nova Avaliação
          </button>
          <button
            className="btn btn-secondary"
            style={{ fontSize: 13, padding: '10px 18px', minHeight: 44 }}
            onClick={loadEvaluations}
            disabled={reportsLoading}
          >
            {reportsLoading ? 'Carregando...' : 'Atualizar'}
          </button>
        </div>
      </header>

      <div className="screen-content">
        {/* Stats */}
        <div className="stats-grid" style={{ marginBottom: '20px' }}>
          <div className="stat-card">
            <div className="stat-label">Total</div>
            <div className="stat-value" style={{ color: 'var(--text-primary)' }}>{total}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Aprovados</div>
            <div className="stat-value" style={{ color: 'var(--success)' }}>{approved}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Reprovados</div>
            <div className="stat-value" style={{ color: 'var(--danger)' }}>{failed}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Média</div>
            <div className="stat-value" style={{ color: 'var(--text-primary)' }}>
              {average.replace('.', ',')}
            </div>
          </div>
        </div>

        {/* Date filter */}
        {uniqueDates.length > 0 && (
          <div className="filter-bar" style={{ marginBottom: '16px' }}>
            <button
              className={`filter-btn${selectedDate === '' ? ' filter-btn--active' : ''}`}
              onClick={() => setSelectedDate('')}
            >
              Todas as datas
            </button>
            {uniqueDates.map(d => (
              <button
                key={d}
                className={`filter-btn${selectedDate === d ? ' filter-btn--active' : ''}`}
                onClick={() => setSelectedDate(d)}
              >
                {formatDate(d)}
              </button>
            ))}
          </div>
        )}

        {/* Table */}
        {reportsLoading && <p className="status-muted">Carregando avaliações...</p>}

        {!reportsLoading && filteredByDate.length === 0 && (
          <p className="status-muted">Nenhuma avaliação encontrada.</p>
        )}

        {!reportsLoading && filteredByDate.length > 0 && (
          <>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 12 }}>
              {filteredByDate.length} avaliação(ões) exibida(s)
            </p>
            <div className="portal-table-wrapper">
              <table className="portal-table">
                <thead>
                  <tr>
                    <th>Aluno</th>
                    <th>Ordem</th>
                    <th>Pelotão</th>
                    <th>Data</th>
                    <th className="center">Nota</th>
                    <th className="center">Resultado</th>
                    <th>Avaliador</th>
                    <th className="center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredByDate.map(item => (
                    <tr key={item.id}>
                      <td>{item.studentData?.nome || '—'}</td>
                      <td>{item.studentData?.ordem || '—'}</td>
                      <td>{item.studentData?.pelotao || '—'}</td>
                      <td>{formatDate(item.studentData?.data)}</td>
                      <td className="center" style={{ fontWeight: 700 }}>
                        {Number(item.finalScore || 0).toFixed(2).replace('.', ',')}
                      </td>
                      <td className="center">
                        <span className={item.isPassing ? 'badge-pass' : 'badge-fail'}>
                          {item.isPassing ? 'APROVADO' : 'REPROVADO'}
                        </span>
                      </td>
                      <td>{item.studentData?.avaliador || '—'}</td>
                      <td className="center">
                        <button
                          className="btn btn-danger btn-sm"
                          style={{ fontSize: 11, padding: '4px 10px', minHeight: 28 }}
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
          </>
        )}
      </div>
    </div>
  )
}
