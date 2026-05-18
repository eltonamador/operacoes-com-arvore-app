import { useMemo, useState } from 'react'
import usePendencias from '../../hooks/usePendencias'
import {
  MODULOS_ESCOPO,
  MODULO_LABEL,
  SITUACAO,
  STATUS_MODULO,
  DATA_INICIO_TURMA,
} from '../../services/pendenciasService'
import { exportToCSV, exportToXLSX } from '../../services/exportService'

const SITUACAO_OPTIONS = [
  { value: 'all', label: 'Todas as situações (exceto Fora do curso)' },
  { value: SITUACAO.COMPLETO, label: SITUACAO.COMPLETO },
  { value: SITUACAO.PENDENTE_PARCIAL, label: SITUACAO.PENDENTE_PARCIAL },
  { value: SITUACAO.SEM_NENHUMA, label: SITUACAO.SEM_NENHUMA },
  { value: SITUACAO.POSSIVEL_DUPLICIDADE, label: SITUACAO.POSSIVEL_DUPLICIDADE },
  { value: SITUACAO.PIN_PENDENTE, label: SITUACAO.PIN_PENDENTE },
  { value: SITUACAO.REQUER_ANALISE, label: SITUACAO.REQUER_ANALISE },
  { value: SITUACAO.FORA_DO_CURSO, label: SITUACAO.FORA_DO_CURSO },
]

const MODULO_OPTIONS = [
  { value: 'all', label: 'Todos os módulos' },
  ...MODULOS_ESCOPO.map(m => ({ value: m, label: MODULO_LABEL[m] })),
]

function normalize(str) {
  return (str || '').toString().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function statusBadgeClass(status) {
  switch (status) {
    case STATUS_MODULO.OK: return 'badge-pass'
    case STATUS_MODULO.PENDENTE: return 'badge-fail'
    case STATUS_MODULO.DUPLICADO: return 'badge-neutral'
    case STATUS_MODULO.PIN_PENDENTE: return 'badge-neutral'
    default: return 'badge-neutral'
  }
}

function situacaoBadgeClass(situacao) {
  switch (situacao) {
    case SITUACAO.COMPLETO: return 'badge-pass'
    case SITUACAO.PENDENTE_PARCIAL: return 'badge-neutral'
    case SITUACAO.SEM_NENHUMA: return 'badge-fail'
    case SITUACAO.POSSIVEL_DUPLICIDADE: return 'badge-neutral'
    case SITUACAO.PIN_PENDENTE: return 'badge-neutral'
    case SITUACAO.REQUER_ANALISE: return 'badge-fail'
    case SITUACAO.FORA_DO_CURSO: return 'badge-neutral'
    default: return 'badge-neutral'
  }
}

function KpiCard({ label, value, accent }) {
  return (
    <div className="kpi-card" style={accent ? { '--kpi-accent': accent } : {}}>
      <span className="kpi-value">{value}</span>
      <span className="kpi-label">{label}</span>
    </div>
  )
}

export default function RelatorioPendencias() {
  const { linhas, estatisticas, loading, error, reload } = usePendencias()

  const [filtroPelotao, setFiltroPelotao] = useState('all')
  const [filtroSituacao, setFiltroSituacao] = useState('all')
  const [filtroModuloPendente, setFiltroModuloPendente] = useState('all')
  const [soDuplicidade, setSoDuplicidade] = useState(false)
  const [soPinPendente, setSoPinPendente] = useState(false)
  const [busca, setBusca] = useState('')

  const pelotoes = useMemo(() => {
    const set = new Set(linhas.map(l => l.pelotao).filter(Boolean))
    return ['all', ...Array.from(set).sort()]
  }, [linhas])

  const visiveis = useMemo(() => {
    return linhas.filter(l => {
      // Por padrão, esconde "Fora do curso" — só aparece se o usuário filtrar explicitamente.
      if (filtroSituacao === 'all' && l.situacao === SITUACAO.FORA_DO_CURSO) return false
      if (filtroPelotao !== 'all' && l.pelotao !== filtroPelotao) return false
      if (filtroSituacao !== 'all' && l.situacao !== filtroSituacao) return false
      if (filtroModuloPendente !== 'all' && l.statusPorModulo[filtroModuloPendente] !== STATUS_MODULO.PENDENTE) return false
      if (soDuplicidade && l.qtdDuplicidades === 0) return false
      if (soPinPendente && !Object.values(l.statusPorModulo).includes(STATUS_MODULO.PIN_PENDENTE)) return false
      if (busca.trim()) {
        const q = normalize(busca)
        if (!normalize(l.nome).includes(q) && !normalize(l.numero_ordem).includes(q)) return false
      }
      return true
    })
  }, [linhas, filtroPelotao, filtroSituacao, filtroModuloPendente, soDuplicidade, soPinPendente, busca])

  function clearFilters() {
    setFiltroPelotao('all')
    setFiltroSituacao('all')
    setFiltroModuloPendente('all')
    setSoDuplicidade(false)
    setSoPinPendente(false)
    setBusca('')
  }

  const hasActiveFilter =
    filtroPelotao !== 'all' ||
    filtroSituacao !== 'all' ||
    filtroModuloPendente !== 'all' ||
    soDuplicidade ||
    soPinPendente ||
    busca.trim() !== ''

  // Export
  const exportColumns = [
    { key: 'ordem', label: 'Ordem' },
    { key: 'nome', label: 'Aluno' },
    { key: 'pelotao', label: 'Pelotão' },
    ...MODULOS_ESCOPO.map(m => ({ key: m, label: MODULO_LABEL[m] })),
    { key: 'realizadas', label: 'Realizadas' },
    { key: 'pendentes', label: 'Pendentes' },
    { key: 'duplicidades', label: 'Duplicidades' },
    { key: 'situacao', label: 'Situação' },
    { key: 'observacao', label: 'Observação' },
    { key: 'idsDuplicados', label: 'IDs duplicados' },
  ]

  const exportData = visiveis.map(l => ({
    ordem: l.numero_ordem,
    nome: l.nome,
    pelotao: l.pelotao,
    ...Object.fromEntries(MODULOS_ESCOPO.map(m => [m, l.statusPorModulo[m]])),
    realizadas: l.qtdRealizadas,
    pendentes: l.qtdPendentes,
    duplicidades: l.qtdDuplicidades,
    situacao: l.situacao,
    observacao: l.observacao || '',
    idsDuplicados: Object.entries(l.idsDuplicados)
      .map(([m, ids]) => `${MODULO_LABEL[m]}: ${ids.join(',')}`)
      .join(' | '),
  }))

  const filenameBase = `pendencias_${new Date().toISOString().slice(0, 10)}`

  return (
    <>
      <div className="coord-filters-card">
        <p className="status-muted" style={{ margin: '0 0 12px 0', fontSize: 12 }}>
          Janela: <strong>data_avaliacao ≥ {DATA_INICIO_TURMA}</strong> · Escopo: 4 avaliações práticas (Teórica fora) · Somente leitura.
        </p>

        <div className="coord-filter-row">
          <div className="coord-filter-field coord-filter-field--wide">
            <label className="coord-filter-label">Buscar</label>
            <input
              className="coord-filter-input"
              type="text"
              placeholder="Nome ou ordem..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
          </div>
          <div className="coord-filter-field">
            <label className="coord-filter-label">Pelotão</label>
            <select className="coord-filter-select" value={filtroPelotao} onChange={e => setFiltroPelotao(e.target.value)}>
              {pelotoes.map(p => <option key={p} value={p}>{p === 'all' ? 'Todos os pelotões' : p}</option>)}
            </select>
          </div>
          <div className="coord-filter-field">
            <label className="coord-filter-label">Situação</label>
            <select className="coord-filter-select" value={filtroSituacao} onChange={e => setFiltroSituacao(e.target.value)}>
              {SITUACAO_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="coord-filter-field">
            <label className="coord-filter-label">Pendente em</label>
            <select className="coord-filter-select" value={filtroModuloPendente} onChange={e => setFiltroModuloPendente(e.target.value)}>
              {MODULO_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <div className="coord-filter-row" style={{ marginTop: 8 }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <input type="checkbox" checked={soDuplicidade} onChange={e => setSoDuplicidade(e.target.checked)} />
            Apenas com duplicidade
          </label>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, marginLeft: 16 }}>
            <input type="checkbox" checked={soPinPendente} onChange={e => setSoPinPendente(e.target.checked)} />
            Apenas com assinatura/PIN pendente
          </label>
        </div>

        <div className="coord-filter-actions">
          {hasActiveFilter && <button className="coord-clear-btn" onClick={clearFilters}>✕ Limpar filtros</button>}
          <button className="coord-clear-btn" onClick={reload} disabled={loading} title="Recarregar dados">
            ⟳ Atualizar
          </button>
          <div className="coord-export-group">
            <span className="coord-export-label">Exportar:</span>
            <button
              className="coord-export-btn"
              disabled={loading || exportData.length === 0}
              onClick={() => exportToCSV(exportData, exportColumns, filenameBase)}
            >CSV</button>
            <button
              className="coord-export-btn coord-export-btn--xlsx"
              disabled={loading || exportData.length === 0}
              onClick={() => exportToXLSX(exportData, exportColumns, filenameBase)}
            >XLSX</button>
          </div>
        </div>
      </div>

      {loading && <p className="status-muted">Carregando relatório de pendências...</p>}
      {!loading && error && <p className="status-error">Erro: {error}</p>}

      {!loading && !error && estatisticas && (
        <>
          <div className="kpi-grid">
            <KpiCard label="Alunos cadastrados" value={estatisticas.totalAlunos} accent="var(--gold)" />
            <KpiCard label="Fora do curso" value={estatisticas.foraDoCurso} accent="#7890a8" />
            <KpiCard label="Completos" value={estatisticas.completos} accent="var(--success)" />
            <KpiCard label="Com pendência" value={estatisticas.comPendencias} accent="#E0A800" />
            <KpiCard label="Sem nenhuma avaliação" value={estatisticas.semNenhuma} accent="var(--danger)" />
            <KpiCard label="Com duplicidade" value={estatisticas.comDuplicidade} accent="#E55A1E" />
            <KpiCard label="Registros duplicados" value={estatisticas.totalRegistrosDuplicados} accent="#E55A1E" />
            <KpiCard label="PIN/assinatura pendente" value={estatisticas.comPinPendente} accent="#5b7fff" />
            <KpiCard label="Requer análise" value={estatisticas.requerAnalise} accent="var(--danger)" />
          </div>

          <div className="chart-card" style={{ marginTop: 12 }}>
            <p className="chart-card-title">Pendências por avaliação</p>
            <ul style={{ margin: 0, padding: '4px 0 0 18px', fontSize: 13, lineHeight: 1.7 }}>
              {MODULOS_ESCOPO.map(m => (
                <li key={m}>
                  <strong>{MODULO_LABEL[m]}:</strong> {estatisticas.pendenciasPorModulo[m]} aluno(s) pendente(s)
                </li>
              ))}
            </ul>
          </div>

          <p className="coord-count" style={{ marginTop: 16 }}>
            {visiveis.length} aluno(s) exibido(s)
            {hasActiveFilter && linhas.length !== visiveis.length && (
              <span className="coord-count-hint"> · de {linhas.length} no total</span>
            )}
          </p>

          {visiveis.length === 0 ? (
            <p className="status-muted">Nenhum aluno encontrado para os filtros selecionados.</p>
          ) : (
            <div className="portal-table-wrapper">
              <table className="portal-table">
                <thead>
                  <tr>
                    <th>Ordem</th>
                    <th>Aluno</th>
                    <th>Pelotão</th>
                    {MODULOS_ESCOPO.map(m => (
                      <th key={m} className="center">{MODULO_LABEL[m]}</th>
                    ))}
                    <th className="center" title="Realizadas">Real.</th>
                    <th className="center" title="Pendentes">Pend.</th>
                    <th className="center" title="Possíveis duplicidades">Dup.</th>
                    <th className="center">Situação</th>
                    <th>Observação</th>
                    <th>IDs duplicados</th>
                  </tr>
                </thead>
                <tbody>
                  {visiveis.map(l => (
                    <tr key={`${l.numero_ordem}-${l.nome}`}>
                      <td>{l.numero_ordem}</td>
                      <td>{l.nome}</td>
                      <td>{l.pelotao || '—'}</td>
                      {MODULOS_ESCOPO.map(m => (
                        <td key={m} className="center">
                          <span className={statusBadgeClass(l.statusPorModulo[m])}>
                            {l.statusPorModulo[m]}
                          </span>
                        </td>
                      ))}
                      <td className="center">{l.qtdRealizadas}</td>
                      <td className="center">{l.qtdPendentes}</td>
                      <td className="center">{l.qtdDuplicidades}</td>
                      <td className="center">
                        <span className={situacaoBadgeClass(l.situacao)}>{l.situacao}</span>
                      </td>
                      <td style={{ fontSize: 12 }}>{l.observacao || '—'}</td>
                      <td style={{ fontSize: 11, fontFamily: 'monospace' }}>
                        {Object.entries(l.idsDuplicados).length === 0
                          ? '—'
                          : Object.entries(l.idsDuplicados).map(([m, ids]) => (
                              <div key={m}>{MODULO_LABEL[m]}: {ids.join(', ')}</div>
                            ))
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </>
  )
}
