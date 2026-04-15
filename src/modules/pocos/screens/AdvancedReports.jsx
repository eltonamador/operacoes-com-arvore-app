import { useState, useMemo } from 'react'
import * as XLSX from 'xlsx'

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

export default function AdvancedReports({
  savedEvaluations,
  deleteEvaluation,
  clearAllEvaluations,
  goTo,
  loadEvaluations,
  reportsLoading,
}) {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedPelotao, setSelectedPelotao] = useState('')
  const [sortBy, setSortBy] = useState('score') // 'score', 'name', 'number'
  const [sortOrder, setSortOrder] = useState('desc') // 'asc', 'desc'
  const [exportColumns, setExportColumns] = useState({
    nome: true,
    ordem: true,
    pelotao: true,
    data: true,
    avaliador: true,
    finalScore: true,
    isPassing: true,
    savedAt: true,
  })

  // Extrair pelotões únicos
  const uniquePelotoes = useMemo(() => {
    const pelotoes = [...new Set(savedEvaluations.map(e => e.studentData?.pelotao).filter(Boolean))]
    return pelotoes.sort()
  }, [savedEvaluations])

  // Filtrar por data e pelotão
  const filteredEvaluations = useMemo(() => {
    let filtered = savedEvaluations

    if (selectedDate) {
      filtered = filtered.filter(item => item.studentData?.data === selectedDate)
    }

    if (selectedPelotao) {
      filtered = filtered.filter(item => item.studentData?.pelotao === selectedPelotao)
    }

    return filtered
  }, [savedEvaluations, selectedDate, selectedPelotao])

  // Ordenar avaliações
  const sortedEvaluations = useMemo(() => {
    const sorted = [...filteredEvaluations]

    sorted.sort((a, b) => {
      let aValue, bValue

      switch (sortBy) {
        case 'name':
          aValue = a.studentData?.nome || ''
          bValue = b.studentData?.nome || ''
          break
        case 'number':
          aValue = parseInt(a.studentData?.ordem || 0)
          bValue = parseInt(b.studentData?.ordem || 0)
          break
        case 'score':
        default:
          aValue = Number(a.finalScore || 0)
          bValue = Number(b.finalScore || 0)
          break
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    return sorted
  }, [filteredEvaluations, sortBy, sortOrder])

  // Estatísticas
  const stats = useMemo(() => {
    const total = filteredEvaluations.length
    const approved = filteredEvaluations.filter(item => item.isPassing).length
    const failed = total - approved
    const average = total > 0
      ? (filteredEvaluations.reduce((sum, item) => sum + Number(item.finalScore || 0), 0) / total).toFixed(2)
      : '0.00'
    
    // Ranking por pelotão
    const pelotaoStats = {}
    filteredEvaluations.forEach(item => {
      const pelotao = item.studentData?.pelotao || 'Sem Pelotão'
      if (!pelotaoStats[pelotao]) {
        pelotaoStats[pelotao] = { total: 0, approved: 0, sum: 0 }
      }
      pelotaoStats[pelotao].total++
      if (item.isPassing) pelotaoStats[pelotao].approved++
      pelotaoStats[pelotao].sum += Number(item.finalScore || 0)
    })

    const pelotaoRanking = Object.entries(pelotaoStats).map(([pelotao, data]) => ({
      pelotao,
      total: data.total,
      approved: data.approved,
      approvalRate: data.total > 0 ? ((data.approved / data.total) * 100).toFixed(1) : '0.0',
      average: data.total > 0 ? (data.sum / data.total).toFixed(2) : '0.00',
    })).sort((a, b) => b.approvalRate - a.approvalRate)

    return { total, approved, failed, average, pelotaoRanking }
  }, [filteredEvaluations])

  // Datas únicas
  const uniqueDates = useMemo(() => {
    const dates = [...new Set(savedEvaluations.map(e => e.studentData?.data).filter(Boolean))]
    return dates.sort().reverse()
  }, [savedEvaluations])

  // Exportar para CSV
  const exportToCSV = () => {
    const headers = []
    const headerKeys = []
    
    if (exportColumns.nome) { headers.push('Aluno'); headerKeys.push('nome') }
    if (exportColumns.ordem) { headers.push('Nº'); headerKeys.push('ordem') }
    if (exportColumns.pelotao) { headers.push('Pelotão'); headerKeys.push('pelotao') }
    if (exportColumns.data) { headers.push('Data'); headerKeys.push('data') }
    if (exportColumns.avaliador) { headers.push('Avaliador'); headerKeys.push('avaliador') }
    if (exportColumns.finalScore) { headers.push('Nota'); headerKeys.push('finalScore') }
    if (exportColumns.isPassing) { headers.push('Resultado'); headerKeys.push('isPassing') }
    if (exportColumns.savedAt) { headers.push('Salvo em'); headerKeys.push('savedAt') }

    const rows = sortedEvaluations.map(item => {
      const row = []
      if (exportColumns.nome) row.push(item.studentData?.nome || '—')
      if (exportColumns.ordem) row.push(item.studentData?.ordem || '—')
      if (exportColumns.pelotao) row.push(item.studentData?.pelotao || '—')
      if (exportColumns.data) row.push(formatDate(item.studentData?.data))
      if (exportColumns.avaliador) row.push(item.studentData?.avaliador || '—')
      if (exportColumns.finalScore) row.push(Number(item.finalScore || 0).toFixed(2).replace('.', ','))
      if (exportColumns.isPassing) row.push(item.isPassing ? 'APROVADO' : 'REPROVADO')
      if (exportColumns.savedAt) row.push(formatDateTime(item.savedAt))
      return row
    })

    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.join(';'))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `relatorio_avancado_pocos_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Exportar para Excel
  const exportToExcel = () => {
    const data = sortedEvaluations.map(item => ({
      Aluno: item.studentData?.nome || '—',
      'Nº': item.studentData?.ordem || '—',
      Pelotão: item.studentData?.pelotao || '—',
      Data: formatDate(item.studentData?.data),
      Avaliador: item.studentData?.avaliador || '—',
      Nota: Number(item.finalScore || 0).toFixed(2).replace('.', ','),
      Resultado: item.isPassing ? 'APROVADO' : 'REPROVADO',
      'Salvo em': formatDateTime(item.savedAt),
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Relatório Poços')
    
    // Auto ajustar largura das colunas
    const maxWidth = data.reduce((acc, row) => {
      Object.keys(row).forEach(k => {
        const length = String(row[k]).length
        if (!acc[k] || length > acc[k]) acc[k] = length
      })
      return acc
    }, {})
    
    ws['!cols'] = Object.keys(maxWidth).map(k => ({ wch: Math.min(maxWidth[k] + 2, 50) }))
    
    XLSX.writeFile(wb, `relatorio_avancado_pocos_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  // Alternar ordenação
  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  // Limpar todos os filtros
  const clearFilters = () => {
    setSelectedDate('')
    setSelectedPelotao('')
  }

  return (
    <div className="screen-container">
      <header className="header no-print">
        <div className="header-emblem">📊</div>
        <div className="header-titles">
          <span className="header-org">CBMAP</span>
          <span className="header-title">Relatório Avançado</span>
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
            className="btn btn-secondary"
            style={{ fontSize: 13, padding: '10px 18px', minHeight: 44 }}
            onClick={() => goTo('reports')}
          >
            ← Relatórios Básicos
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
        {/* Filtros */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '16px 20px',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 12 }}>
            Filtros Avançados
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Filtro por Data */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>Data</label>
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
            </div>

            {/* Filtro por Pelotão */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>Pelotão</label>
              <select
                value={selectedPelotao}
                onChange={e => setSelectedPelotao(e.target.value)}
                style={{
                  padding: '10px 12px',
                  borderRadius: 6,
                  border: '1px solid var(--border)',
                  background: 'var(--bg-main)',
                  color: 'var(--text-primary)',
                  fontSize: 13,
                  minWidth: 120,
                }}
              >
                <option value="">Todos</option>
                {uniquePelotoes.map(pelotao => (
                  <option key={pelotao} value={pelotao}>{pelotao}</option>
                ))}
              </select>
            </div>

            {/* Botões de ação dos filtros */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flex: 1 }}>
              {(selectedDate || selectedPelotao) && (
                <button
                  onClick={clearFilters}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 6,
                    border: '1px solid var(--border)',
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    fontSize: 13,
                    cursor: 'pointer',
                    fontWeight: 600,
                    height: 42,
                  }}
                >
                  ✕ Limpar Filtros
                </button>
              )}
            </div>

            {/* Datas rápidas */}
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
          {(selectedDate || selectedPelotao) && (
            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
              Mostrando {stats.total} avaliação(ções)
              {selectedDate && ` da data ${new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR')}`}
              {selectedPelotao && ` do pelotão ${selectedPelotao}`}
            </div>
          )}
        </div>

        {/* Dashboard de Estatísticas */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total</div>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Aprovados</div>
            <div className="stat-value" style={{ color: '#8ddf63' }}>{stats.approved}</div>
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
            <div className="stat-label">Taxa Aprovação</div>
            <div className="stat-value" style={{ color: stats.total > 0 ? '#8ddf63' : 'var(--text-secondary)' }}>
              {stats.total > 0 ? `${((stats.approved / stats.total) * 100).toFixed(1)}%` : '0.0%'}
            </div>
          </div>
        </div>

        {/* Ranking por Pelotão */}
        {stats.pelotaoRanking.length > 0 && (
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '16px 20px',
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 12 }}>
              Ranking por Pelotão
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {stats.pelotaoRanking.map((pelotao, index) => (
                <div
                  key={pelotao.pelotao}
                  style={{
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    padding: 12,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {index + 1}. {pelotao.pelotao}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold)' }}>
                      {pelotao.approvalRate}%
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)' }}>
                    <span>{pelotao.approved}/{pelotao.total} aprov.</span>
                    <span>Média: {pelotao.average.replace('.', ',')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Controles de Exportação */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '16px 20px',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 12 }}>
            Exportação de Dados
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flex: 1 }}>
              {Object.keys(exportColumns).map(key => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                  <input
                    type="checkbox"
                    checked={exportColumns[key]}
                    onChange={() => setExportColumns(prev => ({ ...prev, [key]: !prev[key] }))}
                    style={{ accentColor: 'var(--gold)' }}
                  />
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {key === 'nome' ? 'Aluno' :
                     key === 'ordem' ? 'Nº' :
                     key === 'pelotao' ? 'Pelotão' :
                     key === 'data' ? 'Data' :
                     key === 'avaliador' ? 'Avaliador' :
                     key === 'finalScore' ? 'Nota' :
                     key === 'isPassing' ? 'Resultado' :
                     key === 'savedAt' ? 'Salvo em' : key}
                  </span>
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn btn-secondary"
                style={{ fontSize: 13, padding: '10px 18px', minHeight: 44 }}
                onClick={exportToCSV}
                disabled={sortedEvaluations.length === 0}
              >
                📥 Exportar CSV
              </button>
              <button
                className="btn btn-secondary"
                style={{ fontSize: 13, padding: '10px 18px', minHeight: 44 }}
                onClick={exportToExcel}
                disabled={sortedEvaluations.length === 0}
              >
                📊 Exportar Excel
              </button>
            </div>
          </div>
        </div>

        {/* Tabela de Avaliações */}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'var(--gold)', textTransform: 'uppercase' }}>
                Avaliações ({sortedEvaluations.length})
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => toggleSort('score')}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid var(--border)',
                    background: sortBy === 'score' ? 'rgba(255, 215, 0, 0.1)' : 'transparent',
                    color: sortBy === 'score' ? 'var(--gold)' : 'var(--text-secondary)',
                    fontSize: 12,
                    cursor: 'pointer',
                    fontWeight: sortBy === 'score' ? 700 : 600,
                  }}
                >
                  Nota {sortBy === 'score' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
                <button
                  onClick={() => toggleSort('name')}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid var(--border)',
                    background: sortBy === 'name' ? 'rgba(255, 215, 0, 0.1)' : 'transparent',
                    color: sortBy === 'name' ? 'var(--gold)' : 'var(--text-secondary)',
                    fontSize: 12,
                    cursor: 'pointer',
                    fontWeight: sortBy === 'name' ? 700 : 600,
                  }}
                >
                  Nome {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
                <button
                  onClick={() => toggleSort('number')}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid var(--border)',
                    background: sortBy === 'number' ? 'rgba(255, 215, 0, 0.1)' : 'transparent',
                    color: sortBy === 'number' ? 'var(--gold)' : 'var(--text-secondary)',
                    fontSize: 12,
                    cursor: 'pointer',
                    fontWeight: sortBy === 'number' ? 700 : 600,
                  }}
                >
                  Nº {sortBy === 'number' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
              </div>
            </div>
          </div>

          {reportsLoading ? (
            <div style={{ padding: 24, color: 'var(--text-muted)' }}>Carregando avaliações...</div>
          ) : sortedEvaluations.length === 0 ? (
            <div style={{ padding: 24, color: 'var(--text-muted)' }}>
              {selectedDate || selectedPelotao
                ? 'Nenhuma avaliação encontrada com os filtros atuais.'
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
                  {sortedEvaluations.map(item => (
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