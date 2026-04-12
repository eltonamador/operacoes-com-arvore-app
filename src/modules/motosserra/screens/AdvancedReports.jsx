import { useMemo, useState } from 'react'
import * as XLSX from 'xlsx'

export default function AdvancedReports({ savedEvaluations, goTo }) {
  const [selectedPelotao, setSelectedPelotao] = useState(null)
  const [ordemSort, setOrdemSort] = useState(null) // null = padrão (nota), 'asc' = Nº crescente, 'desc' = Nº decrescente
  const [exportCols, setExportCols] = useState(new Set(['posicao', 'aluno', 'ordem', 'pelotao', 'nota', 'status']))

  // Extrair pelotões únicos
  const pelotoes = useMemo(() => {
    const unique = new Set(savedEvaluations.map(e => e.studentData?.pelotao).filter(Boolean))
    return Array.from(unique).sort()
  }, [savedEvaluations])

  // Filtrar avaliações por pelotão
  const filteredEvaluations = useMemo(() => {
    if (!selectedPelotao) return savedEvaluations
    return savedEvaluations.filter(e => e.studentData?.pelotao === selectedPelotao)
  }, [savedEvaluations, selectedPelotao])

  // Calcular ranking
  const ranking = useMemo(() => {
    const sorted = [...filteredEvaluations].sort((a, b) => b.finalScore - a.finalScore)
    return sorted.map((item, idx) => ({
      ...item,
      position: idx + 1,
    }))
  }, [filteredEvaluations])

  // Ordenação adicional por "Nº" (sobre o ranking já calculado)
  const displayRanking = useMemo(() => {
    if (!ordemSort) return ranking
    return [...ranking].sort((a, b) => {
      const aOrdem = Number(a.studentData?.ordem) || 0
      const bOrdem = Number(b.studentData?.ordem) || 0
      return ordemSort === 'asc' ? aOrdem - bOrdem : bOrdem - aOrdem
    })
  }, [ranking, ordemSort])

  const cycleOrdemSort = () => {
    setOrdemSort(prev => (prev === null ? 'asc' : prev === 'asc' ? 'desc' : null))
  }

  const toggleExportCol = (key) => {
    setExportCols(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const buildRows = () =>
    displayRanking.map(item =>
      Object.fromEntries(
        EXPORT_COLUMNS.filter(c => exportCols.has(c.key)).map(c => [c.label, getFieldValue(item, c.key)])
      )
    )

  const exportCSV = () => {
    if (exportCols.size === 0) return
    const cols = EXPORT_COLUMNS.filter(c => exportCols.has(c.key))
    const header = cols.map(c => c.label).join(',')
    const rows = displayRanking.map(item =>
      cols.map(c => {
        const val = String(getFieldValue(item, c.key))
        return val.includes(',') || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val
      }).join(',')
    )
    const bom = '\uFEFF'
    const csv = bom + [header, ...rows].join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ranking-desempenho.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportXLSX = () => {
    if (exportCols.size === 0) return
    const rows = buildRows()
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Ranking')
    XLSX.writeFile(wb, 'ranking-desempenho.xlsx')
  }

  // Dashboard de desempenho
  const stats = useMemo(() => {
    const data = filteredEvaluations
    const total = data.length
    const approved = data.filter(e => e.isPassing).length
    const failed = total - approved
    const average = total > 0 ? (data.reduce((sum, e) => sum + e.finalScore, 0) / total).toFixed(2) : '0.00'
    const maxScore = total > 0 ? Math.max(...data.map(e => e.finalScore)) : 0
    const minScore = total > 0 ? Math.min(...data.map(e => e.finalScore)) : 0

    return {
      total,
      approved,
      failed,
      average,
      maxScore: maxScore.toFixed(2),
      minScore: minScore.toFixed(2),
      approvalRate: total > 0 ? ((approved / total) * 100).toFixed(1) : '0.0',
    }
  }, [filteredEvaluations])

  return (
    <div className="screen-container">
      {/* Header */}
      <header className="header">
        <div className="header-emblem">📊</div>
        <div className="header-titles">
          <span className="header-org">CBMAP</span>
          <span className="header-title">Relatórios Avançados</span>
          <span className="header-subtitle">Dashboard de Desempenho – CFSD 2026</span>
        </div>
        <div className="header-spacer" />
        <button
          className="btn btn-secondary"
          style={{ fontSize: 13, padding: '10px 18px', minHeight: 44 }}
          onClick={() => goTo('reports')}
        >
          ← Voltar
        </button>
      </header>

      {/* Content */}
      <div className="screen-content" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Filtro por Pelotão */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '20px',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 12 }}>
            Filtrar por Pelotão
          </div>
          <div className="filter-bar">
            <button
              className={`filter-btn ${selectedPelotao === null ? 'filter-btn--active' : ''}`}
              onClick={() => setSelectedPelotao(null)}
            >
              Todos ({savedEvaluations.length})
            </button>
            {pelotoes.map(pelotao => {
              const count = savedEvaluations.filter(e => e.studentData?.pelotao === pelotao).length
              return (
                <button
                  key={pelotao}
                  className={`filter-btn ${selectedPelotao === pelotao ? 'filter-btn--active' : ''}`}
                  onClick={() => setSelectedPelotao(pelotao)}
                >
                  {pelotao} ({count})
                </button>
              )
            })}
          </div>
        </div>

        {/* Dashboard de Desempenho */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Avaliado</div>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Aprovados</div>
            <div className="stat-value" style={{ color: '#8ddf63' }}>{stats.approved}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              ({stats.approvalRate}% de aprovação)
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Reprovados</div>
            <div className="stat-value" style={{ color: '#ff6b6b' }}>{stats.failed}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Média Geral</div>
            <div className="stat-value">{String(stats.average).replace('.', ',')}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Maior Nota</div>
            <div className="stat-value" style={{ color: 'var(--gold)' }}>{stats.maxScore.replace('.', ',')}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Menor Nota</div>
            <div className="stat-value" style={{ color: '#ff6b6b' }}>{stats.minScore.replace('.', ',')}</div>
          </div>
        </div>

        {/* Ranking */}
        {ranking.length > 0 && (
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 14 }}>
                🏆 Ranking de Desempenho
              </div>

              {/* Exportação */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16 }}>
                {/* Checkboxes de colunas */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', flex: 1 }}>
                  {EXPORT_COLUMNS.map(col => (
                    <label key={col.key} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, color: 'var(--text-primary)', userSelect: 'none' }}>
                      <input
                        type="checkbox"
                        checked={exportCols.has(col.key)}
                        onChange={() => toggleExportCol(col.key)}
                        style={{ accentColor: 'var(--gold)', width: 15, height: 15 }}
                      />
                      {col.label}
                    </label>
                  ))}
                </div>

                {/* Botões */}
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button
                    onClick={exportCSV}
                    disabled={exportCols.size === 0}
                    style={{
                      padding: '8px 14px', fontSize: 13, fontWeight: 700, borderRadius: 6, cursor: exportCols.size === 0 ? 'not-allowed' : 'pointer',
                      background: exportCols.size === 0 ? '#333' : '#1a5c2a', color: exportCols.size === 0 ? '#666' : '#8ddf63',
                      border: '1px solid', borderColor: exportCols.size === 0 ? '#444' : '#2d8a3e',
                    }}
                  >
                    ↓ CSV
                  </button>
                  <button
                    onClick={exportXLSX}
                    disabled={exportCols.size === 0}
                    style={{
                      padding: '8px 14px', fontSize: 13, fontWeight: 700, borderRadius: 6, cursor: exportCols.size === 0 ? 'not-allowed' : 'pointer',
                      background: exportCols.size === 0 ? '#333' : '#1a3a5c', color: exportCols.size === 0 ? '#666' : '#63b3df',
                      border: '1px solid', borderColor: exportCols.size === 0 ? '#444' : '#2a6496',
                    }}
                  >
                    ↓ XLSX
                  </button>
                </div>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#121212', position: 'sticky', top: 0, zIndex: 1 }}>
                    <th style={{ ...thStyle, width: 50, textAlign: 'center' }}>#</th>
                    <th style={thStyle}>Aluno</th>
                    <th
                      style={{ ...thStyle, cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
                      onClick={cycleOrdemSort}
                      title="Ordenar por Nº"
                    >
                      Nº{' '}
                      <span style={{ opacity: ordemSort ? 1 : 0.35, color: ordemSort ? 'var(--gold)' : 'inherit' }}>
                        {ordemSort === 'asc' ? '↑' : ordemSort === 'desc' ? '↓' : '↕'}
                      </span>
                    </th>
                    <th style={thStyle}>Pelotão</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Nota</th>
                    <th style={thStyle}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {displayRanking.map(item => (
                    <tr key={item.id} style={{ borderTop: '1px solid var(--border)' }}>
                      <td
                        style={{
                          ...tdStyle,
                          textAlign: 'center',
                          fontWeight: 900,
                          color: item.position <= 3 ? 'var(--gold)' : 'var(--text-primary)',
                          fontSize: item.position <= 3 ? 18 : 14,
                        }}
                      >
                        {item.position === 1 && '🥇'}
                        {item.position === 2 && '🥈'}
                        {item.position === 3 && '🥉'}
                        {item.position > 3 && item.position}
                      </td>
                      <td style={tdStyle}>{item.studentData?.nome || '—'}</td>
                      <td style={tdStyle}>{item.studentData?.ordem || '—'}</td>
                      <td style={tdStyle}>{item.studentData?.pelotao || '—'}</td>
                      <td
                        style={{
                          ...tdStyle,
                          textAlign: 'right',
                          fontWeight: 700,
                          color: item.isPassing ? '#8ddf63' : '#ff6b6b',
                          fontSize: 15,
                        }}
                      >
                        {item.finalScore.toFixed(2).replace('.', ',')}
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
                          }}
                        >
                          {item.isPassing ? '✓ APROVADO' : '✗ REPROVADO'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const EXPORT_COLUMNS = [
  { key: 'posicao', label: '#' },
  { key: 'aluno', label: 'Aluno' },
  { key: 'ordem', label: 'Nº' },
  { key: 'pelotao', label: 'Pelotão' },
  { key: 'nota', label: 'Nota' },
  { key: 'status', label: 'Status' },
]

function getFieldValue(item, key) {
  switch (key) {
    case 'posicao': return item.position
    case 'aluno': return item.studentData?.nome || ''
    case 'ordem': return item.studentData?.ordem || ''
    case 'pelotao': return item.studentData?.pelotao || ''
    case 'nota': return item.finalScore.toFixed(2).replace('.', ',')
    case 'status': return item.isPassing ? 'APROVADO' : 'REPROVADO'
    default: return ''
  }
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
