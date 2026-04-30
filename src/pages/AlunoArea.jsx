import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchAvaliacoesByModulo } from '../services/avaliacoesService'
import { fetchConsolidacaoTodos } from '../services/consolidacaoService'
import PortalLayout from '../components/PortalLayout'

// ═══════════════════════════════════════════════
//  CONSTANTS
// ═══════════════════════════════════════════════

const MODULE_LABELS = {
  motosserra: 'Corte de Árv.',
  escadas: 'Escadas',
  pocos: 'Poço',
  circuito: 'Circuito',
  teorica: 'Teórica',
}

const MODULE_ORDER = ['motosserra', 'escadas', 'pocos', 'circuito', 'teorica']

const MODULE_OPTIONS = [
  { value: 'all', label: 'Todos os módulos' },
  { value: 'motosserra', label: 'Corte de Árv.' },
  { value: 'escadas', label: 'Escadas' },
  { value: 'pocos', label: 'Poço' },
  { value: 'circuito', label: 'Circuito' },
  { value: 'teorica', label: 'Prova Teórica' },
]

const RESULTADO_OPTIONS = [
  { value: 'all', label: 'Todos os resultados' },
  { value: 'aprovado', label: 'Aprovado' },
  { value: 'reprovado', label: 'Reprovado' },
]

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos os status' },
  { value: 'apto', label: 'Apto' },
  { value: 'naoapto', label: 'Não Apto' },
  { value: 'progresso', label: 'Em Progresso' },
]

// ═══════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════

function fmtNota(val) {
  return val !== null && val !== undefined ? Number(val).toFixed(2) : '—'
}

function normalize(str) {
  return (str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function avg(arr) {
  const valid = arr.filter((v) => v !== null && v !== undefined && !isNaN(v))
  if (valid.length === 0) return null
  return valid.reduce((a, b) => a + b, 0) / valid.length
}

// ═══════════════════════════════════════════════
//  CHART PRIMITIVES
// ═══════════════════════════════════════════════

function DonutChart({ pass, fail, size = 140 }) {
  const total = pass + fail
  if (total === 0) return <div style={{ width: size, height: size }} className="chart-empty-ring" />

  const r = size / 2 - 12
  const cx = size / 2
  const cy = size / 2
  const circ = 2 * Math.PI * r
  const passRatio = pass / total
  const failRatio = fail / total
  const passArc = passRatio * circ
  const failArc = failRatio * circ

  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth={18} />
      {failArc > 0 && (
        <circle cx={cx} cy={cy} r={r} fill="none"
          stroke="var(--danger)" strokeWidth={18} strokeOpacity={0.75}
          strokeDasharray={`${failArc} ${circ - failArc}`}
          strokeDashoffset={circ / 4} strokeLinecap="butt"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      )}
      {passArc > 0 && (
        <circle cx={cx} cy={cy} r={r} fill="none"
          stroke="var(--success)" strokeWidth={18}
          strokeDasharray={`${passArc} ${circ - passArc}`}
          strokeDashoffset={circ / 4} strokeLinecap="butt"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      )}
      <text x={cx} y={cy - 7} textAnchor="middle" dominantBaseline="middle"
        fontSize={20} fontWeight={900} fill="var(--text-primary)">
        {total > 0 ? `${Math.round(passRatio * 100)}%` : '—'}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" dominantBaseline="middle"
        fontSize={10} fontWeight={600} fill="var(--text-muted)" letterSpacing={0.5}>
        APROVAÇÃO
      </text>
    </svg>
  )
}

function HBarChart({ items, maxVal, colorFn, height = 28, gap = 8 }) {
  if (!items || items.length === 0) return <p className="chart-empty-msg">Sem dados</p>
  const cap = maxVal || Math.max(...items.map((i) => i.value), 1)
  return (
    <div className="hbar-chart" style={{ '--hbar-gap': `${gap}px` }}>
      {items.map((item, idx) => {
        const pct = cap > 0 ? (item.value / cap) * 100 : 0
        const color = colorFn ? colorFn(item, idx) : 'var(--gold)'
        return (
          <div key={item.label} className="hbar-row">
            <span className="hbar-label" title={item.label}>{item.label}</span>
            <div className="hbar-track">
              <div className="hbar-fill" style={{ width: `${pct}%`, background: color, height }} />
            </div>
            <span className="hbar-value">{item.sub ?? item.value}</span>
          </div>
        )
      })}
    </div>
  )
}

function VGroupedBar({ groups, series, height = 120 }) {
  if (!groups || groups.length === 0) return <p className="chart-empty-msg">Sem dados</p>

  const allVals = groups.flatMap((g) => g.values.filter((v) => v !== null))
  const maxVal = Math.max(...allVals, 10)
  const barW = 16
  const barGap = 4
  const groupGap = 20
  const groupW = series.length * (barW + barGap) - barGap + groupGap
  const totalW = groups.length * groupW + 40
  const padBottom = 28

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
      <svg width={totalW} height={height + padBottom + 16} style={{ display: 'block', minWidth: 120 }}>
        {[0, 2.5, 5, 7.5, 10].map((v) => {
          const y = height - (v / maxVal) * height + 8
          return (
            <g key={v}>
              <line x1={32} x2={totalW - 8} y1={y} y2={y}
                stroke="var(--border)" strokeWidth={1} strokeDasharray="3 3" />
              <text x={28} y={y + 1} textAnchor="end" fontSize={9} fill="var(--text-muted)"
                dominantBaseline="middle">{v}</text>
            </g>
          )
        })}
        {(() => {
          const y = height - (7 / maxVal) * height + 8
          return <line x1={32} x2={totalW - 8} y1={y} y2={y}
            stroke="var(--danger)" strokeWidth={1} strokeDasharray="4 2" strokeOpacity={0.5} />
        })()}

        {groups.map((group, gi) => {
          const gx = 36 + gi * groupW
          return (
            <g key={group.label}>
              {group.values.map((val, si) => {
                const bh = val !== null ? Math.max((val / maxVal) * height, 2) : 0
                const bx = gx + si * (barW + barGap)
                const by = height - bh + 8
                return (
                  <g key={si}>
                    {val !== null && (
                      <>
                        <rect x={bx} y={by} width={barW} height={bh}
                          fill={series[si].color} rx={3} opacity={0.85} />
                        <text x={bx + barW / 2} y={by - 3} textAnchor="middle"
                          fontSize={8} fill="var(--text-secondary)" fontWeight={600}>
                          {Number(val).toFixed(1)}
                        </text>
                      </>
                    )}
                  </g>
                )
              })}
              <text
                x={gx + (series.length * (barW + barGap)) / 2 - barGap / 2}
                y={height + 16}
                textAnchor="middle" fontSize={10} fill="var(--text-secondary)" fontWeight={600}>
                {group.label}
              </text>
            </g>
          )
        })}
      </svg>

      <div className="vbar-legend">
        {series.map((s) => (
          <div key={s.label} className="vbar-legend-item">
            <span className="vbar-legend-dot" style={{ background: s.color }} />
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function KpiCard({ label, value, sub, accent }) {
  return (
    <div className="kpi-card" style={accent ? { '--kpi-accent': accent } : {}}>
      <span className="kpi-value">{value}</span>
      <span className="kpi-label">{label}</span>
      {sub && <span className="kpi-sub">{sub}</span>}
    </div>
  )
}

function ChartSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="chart-section">
      <button className="chart-section-toggle" onClick={() => setOpen((o) => !o)}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: open ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
        <span className="chart-section-title">{title}</span>
      </button>
      {open && <div className="chart-section-body">{children}</div>}
    </div>
  )
}

// ═══════════════════════════════════════════════
//  CHARTS — Avaliações
// ═══════════════════════════════════════════════

function AvaliacoesCharts({ visiveis }) {
  const pass = visiveis.filter((a) => a.isPassing).length
  const fail = visiveis.filter((a) => !a.isPassing).length
  const total = visiveis.length

  const mediaGeral = useMemo(() => {
    const notas = visiveis.map((a) => a.finalScore).filter((n) => typeof n === 'number')
    return avg(notas)
  }, [visiveis])

  const porModulo = useMemo(() => {
    return MODULE_ORDER.map((mid) => {
      const avs = visiveis.filter((a) => a.moduleId === mid)
      if (avs.length === 0) return null
      const p = avs.filter((a) => a.isPassing).length
      const pct = Math.round((p / avs.length) * 100)
      const mediaM = avg(avs.map((a) => a.finalScore).filter((n) => typeof n === 'number'))
      return { label: MODULE_LABELS[mid], total: avs.length, pass: p, pct, media: mediaM }
    }).filter(Boolean)
  }, [visiveis])

  if (total === 0) return null

  return (
    <ChartSection title="Painel Gerencial — Avaliações">
      <div className="kpi-grid">
        <KpiCard label="Total" value={total} accent="var(--gold)" />
        <KpiCard label="Aprovados" value={pass}
          sub={`${total > 0 ? Math.round((pass / total) * 100) : 0}%`} accent="var(--success)" />
        <KpiCard label="Reprovados" value={fail}
          sub={`${total > 0 ? Math.round((fail / total) * 100) : 0}%`} accent="var(--danger)" />
        <KpiCard label="Média Geral"
          value={mediaGeral !== null ? mediaGeral.toFixed(2) : '—'} accent="var(--gold)" />
      </div>

      <div className="chart-row-2col">
        <div className="chart-card">
          <p className="chart-card-title">Aprovação Geral</p>
          <div className="donut-wrapper">
            <DonutChart pass={pass} fail={fail} size={150} />
            <div className="donut-legend">
              <div className="donut-legend-item">
                <span className="donut-dot" style={{ background: 'var(--success)' }} />
                <span>Aprovados <strong>{pass}</strong></span>
              </div>
              <div className="donut-legend-item">
                <span className="donut-dot" style={{ background: 'var(--danger)', opacity: 0.75 }} />
                <span>Reprovados <strong>{fail}</strong></span>
              </div>
            </div>
          </div>
        </div>

        <div className="chart-card chart-card--grow">
          <p className="chart-card-title">Aprovação por Módulo</p>
          <HBarChart
            items={porModulo.map((m) => ({
              label: m.label,
              value: m.pct,
              sub: `${m.pct}% (${m.pass}/${m.total})`,
            }))}
            maxVal={100}
            colorFn={(item) => {
              if (item.value >= 70) return 'var(--success)'
              if (item.value >= 50) return 'var(--gold)'
              return 'var(--danger)'
            }}
            height={22}
          />
        </div>
      </div>

      <div className="chart-card">
        <p className="chart-card-title">Média Final por Módulo</p>
        <HBarChart
          items={porModulo.map((m) => ({
            label: m.label,
            value: m.media ?? 0,
            sub: m.media !== null ? m.media.toFixed(2) : '—',
          }))}
          maxVal={10}
          colorFn={(item) => {
            if (item.value >= 7) return 'var(--success)'
            if (item.value >= 5) return 'var(--gold)'
            return 'var(--danger)'
          }}
          height={22}
        />
      </div>
    </ChartSection>
  )
}

// ═══════════════════════════════════════════════
//  CHARTS — Consolidação
// ═══════════════════════════════════════════════

function ConsolidacaoCharts({ visiveis }) {
  const total = visiveis.length
  const aptos = visiveis.filter((a) => a.consolidacao.apto === true).length
  const naoAptos = visiveis.filter((a) => a.consolidacao.apto === false).length
  const emProgresso = visiveis.filter((a) => a.consolidacao.apto === null).length

  const mediaFinals = visiveis.map((a) => a.consolidacao.mediaFinal).filter((v) => v !== null)
  const mediaGeral = avg(mediaFinals)

  const pelotoes = useMemo(() => {
    const set = new Set(visiveis.map((a) => a.pelotao).filter(Boolean))
    return Array.from(set).sort()
  }, [visiveis])

  const groupedData = useMemo(() => {
    if (pelotoes.length === 0) {
      const vc1all = avg(visiveis.map((a) => a.consolidacao.vc1).filter((v) => v !== null))
      const vc2all = avg(visiveis.map((a) => a.consolidacao.vc2).filter((v) => v !== null))
      const vc3all = avg(visiveis.map((a) => a.consolidacao.vc3).filter((v) => v !== null))
      return [{ label: 'Todos', values: [vc1all, vc2all, vc3all] }]
    }
    return pelotoes.map((pel) => {
      const grp = visiveis.filter((a) => a.pelotao === pel)
      const vc1 = avg(grp.map((a) => a.consolidacao.vc1).filter((v) => v !== null))
      const vc2 = avg(grp.map((a) => a.consolidacao.vc2).filter((v) => v !== null))
      const vc3 = avg(grp.map((a) => a.consolidacao.vc3).filter((v) => v !== null))
      return { label: pel, values: [vc1, vc2, vc3] }
    })
  }, [visiveis, pelotoes])

  const statusPorPelotao = useMemo(() => {
    if (pelotoes.length === 0) return []
    return pelotoes.map((pel) => {
      const grp = visiveis.filter((a) => a.pelotao === pel)
      const apt = grp.filter((a) => a.consolidacao.apto === true).length
      const pct = grp.length > 0 ? Math.round((apt / grp.length) * 100) : 0
      return { label: pel, value: pct, sub: `${pct}% (${apt}/${grp.length})` }
    })
  }, [visiveis, pelotoes])

  const VC_SERIES = [
    { label: 'VC1 (Escadas+Poço)', color: 'var(--gold)' },
    { label: 'VC2 (Corte de Árv.+Circuito)', color: 'var(--red)' },
    { label: 'VC3 (Teórica)', color: '#5b7fff' },
  ]

  if (total === 0) return null

  return (
    <ChartSection title="Painel Gerencial — Consolidação">
      <div className="kpi-grid">
        <KpiCard label="Total" value={total} accent="var(--gold)" />
        <KpiCard label="Aptos" value={aptos}
          sub={`${total > 0 ? Math.round((aptos / total) * 100) : 0}%`} accent="var(--success)" />
        <KpiCard label="Não Aptos" value={naoAptos}
          sub={`${total > 0 ? Math.round((naoAptos / total) * 100) : 0}%`} accent="var(--danger)" />
        <KpiCard label="Em Progresso" value={emProgresso} accent="#5b7fff" />
        <KpiCard label="Média Final"
          value={mediaGeral !== null ? mediaGeral.toFixed(2) : '—'} accent="var(--gold)" />
      </div>

      <div className="chart-row-2col">
        <div className="chart-card">
          <p className="chart-card-title">Aptidão Geral</p>
          <div className="donut-wrapper">
            <DonutChart pass={aptos} fail={naoAptos} size={150} />
            <div className="donut-legend">
              <div className="donut-legend-item">
                <span className="donut-dot" style={{ background: 'var(--success)' }} />
                <span>Aptos <strong>{aptos}</strong></span>
              </div>
              <div className="donut-legend-item">
                <span className="donut-dot" style={{ background: 'var(--danger)', opacity: 0.75 }} />
                <span>Não Aptos <strong>{naoAptos}</strong></span>
              </div>
              {emProgresso > 0 && (
                <div className="donut-legend-item">
                  <span className="donut-dot" style={{ background: '#5b7fff' }} />
                  <span>Em Progresso <strong>{emProgresso}</strong></span>
                </div>
              )}
            </div>
          </div>
        </div>

        {statusPorPelotao.length > 0 && (
          <div className="chart-card chart-card--grow">
            <p className="chart-card-title">Aptidão por Pelotão</p>
            <HBarChart
              items={statusPorPelotao}
              maxVal={100}
              colorFn={(item) => {
                if (item.value >= 70) return 'var(--success)'
                if (item.value >= 50) return 'var(--gold)'
                return 'var(--danger)'
              }}
              height={22}
            />
          </div>
        )}
      </div>

      <div className="chart-card">
        <p className="chart-card-title">Média por Eixo de Avaliação e Pelotão</p>
        <VGroupedBar groups={groupedData} series={VC_SERIES} height={110} />
      </div>
    </ChartSection>
  )
}

// ═══════════════════════════════════════════════
//  UI HELPERS
// ═══════════════════════════════════════════════

function FilterRow({ children }) {
  return <div className="coord-filter-row">{children}</div>
}

// ═══════════════════════════════════════════════
//  TAB: AVALIAÇÕES
// ═══════════════════════════════════════════════

function AvaliacoesTab({ avaliacoes, loading, error }) {
  const [filtroModulo, setFiltroModulo] = useState('all')
  const [filtroBusca, setFiltroBusca] = useState('')
  const [filtroPelotao, setFiltroPelotao] = useState('all')
  const [filtroResultado, setFiltroResultado] = useState('all')

  const pelotoes = useMemo(() => {
    const set = new Set(avaliacoes.map((a) => a.studentData.pelotao).filter(Boolean))
    return ['all', ...Array.from(set).sort()]
  }, [avaliacoes])

  const visiveis = useMemo(() => {
    return avaliacoes.filter((av) => {
      if (filtroModulo !== 'all' && av.moduleId !== filtroModulo) return false
      if (filtroPelotao !== 'all' && av.studentData.pelotao !== filtroPelotao) return false
      if (filtroResultado !== 'all') {
        if (filtroResultado === 'aprovado' && !av.isPassing) return false
        if (filtroResultado === 'reprovado' && av.isPassing) return false
      }
      if (filtroBusca.trim()) {
        const q = normalize(filtroBusca)
        const nome = normalize(av.studentData.nome)
        const avaliador = normalize(av.studentData.avaliador)
        const ordem = normalize(av.studentData.ordem)
        if (!nome.includes(q) && !avaliador.includes(q) && !ordem.includes(q)) return false
      }
      return true
    })
  }, [avaliacoes, filtroModulo, filtroPelotao, filtroResultado, filtroBusca])

  const hasActiveFilter =
    filtroModulo !== 'all' ||
    filtroPelotao !== 'all' ||
    filtroResultado !== 'all' ||
    filtroBusca.trim() !== ''

  function clearFilters() {
    setFiltroModulo('all')
    setFiltroPelotao('all')
    setFiltroResultado('all')
    setFiltroBusca('')
  }

  return (
    <>
      {/* Filtros */}
      <div className="coord-filters-card">
        <FilterRow>
          <div className="coord-filter-field coord-filter-field--wide">
            <label className="coord-filter-label">Buscar</label>
            <input
              className="coord-filter-input"
              type="text"
              placeholder="Nome, ordem ou avaliador..."
              value={filtroBusca}
              onChange={(e) => setFiltroBusca(e.target.value)}
            />
          </div>
          <div className="coord-filter-field">
            <label className="coord-filter-label">Módulo</label>
            <select className="coord-filter-select" value={filtroModulo}
              onChange={(e) => setFiltroModulo(e.target.value)}>
              {MODULE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="coord-filter-field">
            <label className="coord-filter-label">Pelotão</label>
            <select className="coord-filter-select" value={filtroPelotao}
              onChange={(e) => setFiltroPelotao(e.target.value)}>
              {pelotoes.map((p) => (
                <option key={p} value={p}>{p === 'all' ? 'Todos os pelotões' : p}</option>
              ))}
            </select>
          </div>
          <div className="coord-filter-field">
            <label className="coord-filter-label">Resultado</label>
            <select className="coord-filter-select" value={filtroResultado}
              onChange={(e) => setFiltroResultado(e.target.value)}>
              {RESULTADO_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </FilterRow>
        {hasActiveFilter && (
          <div className="coord-filter-actions">
            <button className="coord-clear-btn" onClick={clearFilters}>✕ Limpar filtros</button>
          </div>
        )}
      </div>

      {loading && <p className="status-muted">Carregando avaliações...</p>}
      {!loading && error && <p className="status-error">Erro ao carregar dados: {error}</p>}

      {!loading && !error && (
        <>
          <AvaliacoesCharts visiveis={visiveis} />

          <p className="coord-count">
            {visiveis.length} avaliação(ões) exibida(s)
            {hasActiveFilter && avaliacoes.length !== visiveis.length && (
              <span className="coord-count-hint"> · de {avaliacoes.length} no total</span>
            )}
          </p>

          {visiveis.length === 0 ? (
            <p className="status-muted">Nenhuma avaliação encontrada para os filtros selecionados.</p>
          ) : (
            <div className="portal-table-wrapper">
              <table className="portal-table">
                <thead>
                  <tr>
                    <th>Aluno</th>
                    <th>Ordem</th>
                    <th>Pelotão</th>
                    <th>Avaliador</th>
                    <th>Data</th>
                    <th className="center">Nota Final</th>
                    <th className="center">Resultado</th>
                    <th>Módulo</th>
                  </tr>
                </thead>
                <tbody>
                  {visiveis.map((av) => (
                    <tr key={av.id}>
                      <td>{av.studentData.nome || '—'}</td>
                      <td>{av.studentData.ordem || '—'}</td>
                      <td>{av.studentData.pelotao || '—'}</td>
                      <td>{av.studentData.avaliador || '—'}</td>
                      <td>{av.studentData.data || '—'}</td>
                      <td className="center" style={{ fontWeight: 700 }}>
                        {typeof av.finalScore === 'number' ? av.finalScore.toFixed(2) : '—'}
                      </td>
                      <td className="center">
                        <span className={av.isPassing ? 'badge-pass' : 'badge-fail'}>
                          {av.isPassing ? 'APROVADO' : 'REPROVADO'}
                        </span>
                      </td>
                      <td>{MODULE_LABELS[av.moduleId] || av.moduleId || '—'}</td>
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

// ═══════════════════════════════════════════════
//  TAB: CONSOLIDAÇÃO
// ═══════════════════════════════════════════════

function ConsolidacaoTab({ consolidacoes, loading, error }) {
  const [filtroBusca, setFiltroBusca] = useState('')
  const [filtroPelotao, setFiltroPelotao] = useState('all')
  const [filtroStatus, setFiltroStatus] = useState('all')

  const pelotoes = useMemo(() => {
    const set = new Set(consolidacoes.map((a) => a.pelotao).filter(Boolean))
    return ['all', ...Array.from(set).sort()]
  }, [consolidacoes])

  const visiveis = useMemo(() => {
    return consolidacoes.filter((aluno) => {
      if (filtroPelotao !== 'all' && aluno.pelotao !== filtroPelotao) return false
      if (filtroStatus !== 'all') {
        const { apto } = aluno.consolidacao
        if (filtroStatus === 'apto' && apto !== true) return false
        if (filtroStatus === 'naoapto' && apto !== false) return false
        if (filtroStatus === 'progresso' && apto !== null) return false
      }
      if (filtroBusca.trim()) {
        const q = normalize(filtroBusca)
        if (!normalize(aluno.nome).includes(q) && !normalize(aluno.ordem).includes(q)) return false
      }
      return true
    })
  }, [consolidacoes, filtroPelotao, filtroStatus, filtroBusca])

  const hasActiveFilter = filtroPelotao !== 'all' || filtroStatus !== 'all' || filtroBusca.trim() !== ''

  function clearFilters() {
    setFiltroPelotao('all')
    setFiltroStatus('all')
    setFiltroBusca('')
  }

  return (
    <>
      {/* Filtros */}
      <div className="coord-filters-card">
        <FilterRow>
          <div className="coord-filter-field coord-filter-field--wide">
            <label className="coord-filter-label">Buscar</label>
            <input
              className="coord-filter-input"
              type="text"
              placeholder="Nome ou ordem..."
              value={filtroBusca}
              onChange={(e) => setFiltroBusca(e.target.value)}
            />
          </div>
          <div className="coord-filter-field">
            <label className="coord-filter-label">Pelotão</label>
            <select className="coord-filter-select" value={filtroPelotao}
              onChange={(e) => setFiltroPelotao(e.target.value)}>
              {pelotoes.map((p) => (
                <option key={p} value={p}>{p === 'all' ? 'Todos os pelotões' : p}</option>
              ))}
            </select>
          </div>
          <div className="coord-filter-field">
            <label className="coord-filter-label">Status</label>
            <select className="coord-filter-select" value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}>
              {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </FilterRow>
        {hasActiveFilter && (
          <div className="coord-filter-actions">
            <button className="coord-clear-btn" onClick={clearFilters}>✕ Limpar filtros</button>
          </div>
        )}
      </div>

      {loading && <p className="status-muted">Carregando consolidação...</p>}
      {!loading && error && <p className="status-error">Erro: {error}</p>}

      {!loading && !error && (
        <>
          <ConsolidacaoCharts visiveis={visiveis} />

          <p className="coord-count">
            {visiveis.length} aluno(s) exibido(s)
            {hasActiveFilter && consolidacoes.length !== visiveis.length && (
              <span className="coord-count-hint"> · de {consolidacoes.length} no total</span>
            )}
          </p>

          {visiveis.length === 0 ? (
            <p className="status-muted">Nenhum dado encontrado para os filtros selecionados.</p>
          ) : (
            <div className="portal-table-wrapper">
              <table className="portal-table">
                <thead>
                  <tr>
                    <th>Aluno</th>
                    <th>Ordem</th>
                    <th>Pelotão</th>
                    <th className="center">VC1</th>
                    <th className="center">VC2</th>
                    <th className="center">VC3</th>
                    <th className="center">Média Final</th>
                    <th className="center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visiveis.map((aluno) => {
                    const { vc1, vc2, vc3, mediaFinal, apto } = aluno.consolidacao
                    const badgeClass = apto === true ? 'badge-pass' : apto === false ? 'badge-fail' : 'badge-neutral'
                    const badgeText = apto === true ? 'APTO' : apto === false ? 'NÃO APTO' : 'EM PROGRESSO'

                    const fmtMod = (modId, modName) => {
                      const score = aluno.modulos?.[modId]?.finalScore
                      return `${modName}: ${typeof score === 'number' ? score.toFixed(2).replace('.', ',') : 'Sem nota lançada'}`
                    }

                    const hintVC1 = `VC1:\n${fmtMod('escadas', 'Escadas')}\n${fmtMod('pocos', 'Poço')}`
                    const hintVC2 = `VC2:\n${fmtMod('motosserra', 'Motosserra')}\n${fmtMod('circuito', 'Circuito')}`
                    const hintVC3 = `VC3:\n${fmtMod('teorica', 'Prova Teórica')}`

                    return (
                      <tr key={aluno.ordem}>
                        <td>{aluno.nome || '—'}</td>
                        <td>{aluno.ordem || '—'}</td>
                        <td>{aluno.pelotao || '—'}</td>
                        <td className="center" title={hintVC1} style={{ cursor: 'help' }}>{fmtNota(vc1)}</td>
                        <td className="center" title={hintVC2} style={{ cursor: 'help' }}>{fmtNota(vc2)}</td>
                        <td className="center" title={hintVC3} style={{ cursor: 'help' }}>{fmtNota(vc3)}</td>
                        <td className="center" style={{ fontWeight: 700 }}>{fmtNota(mediaFinal)}</td>
                        <td className="center"><span className={badgeClass}>{badgeText}</span></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </>
  )
}

// ═══════════════════════════════════════════════
//  TAB: RANKING
// ═══════════════════════════════════════════════

const ESTAGIO_LABELS = {
  vc1: 'Parcial — VC1',
  vc1vc2: 'Parcial — VC1 + VC2',
  final: 'Final',
}

const TIEBREAK_INFO = {
  vc1: [
    'Ordenação: maior média VC1 (Poços + Escadas)',
    'Desempate 1º: maior nota em Poço',
    'Desempate 2º: menor número de ordem',
  ],
  vc1vc2: [
    'Ordenação: maior média VC1 + VC2',
    'Desempate 1º: maior nota em VC2',
    'Desempate 2º: menor número de ordem',
  ],
  final: [
    'Ordenação: maior Média Final',
    'Desempate 1º: maior VC2',
    'Desempate 2º: maior Circuito',
    'Desempate 3º: maior Prova Teórica',
    'Desempate 4º: maior VC1',
    'Desempate 5º: maior Poço',
    'Desempate 6º: maior Escadas',
    'Empate total: posição mantida',
  ],
}

function TiebreakInfo({ estagio }) {
  const [mode, setMode] = useState(null)
  const open = mode !== null
  const linhas = TIEBREAK_INFO[estagio] || []

  const handleMouseEnter = () => { if (mode !== 'click') setMode('hover') }
  const handleMouseLeave = () => { if (mode === 'hover') setMode(null) }
  const handleClick = (e) => {
    e.stopPropagation()
    setMode(mode === 'click' ? null : 'click')
  }

  return (
    <span style={{ position: 'relative', display: 'inline-block', marginLeft: '6px', verticalAlign: 'middle' }}>
      <button
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        aria-label="Ver critérios de desempate"
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: '14px', color: 'var(--text-muted)',
          padding: '0 2px', lineHeight: 1, userSelect: 'none',
        }}
      >
        ⓘ
      </button>
      {mode === 'click' && (
        <div onClick={() => setMode(null)} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />
      )}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#1c1c1e',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '10px',
          padding: '12px 16px',
          zIndex: 100,
          width: '270px',
          maxWidth: 'calc(100vw - 32px)',
          boxShadow: '0 8px 28px rgba(0,0,0,0.45)',
          pointerEvents: mode === 'click' ? 'auto' : 'none',
        }}>
          <p style={{ margin: '0 0 8px', fontWeight: 700, fontSize: '12px', color: '#ffffff', letterSpacing: '0.02em' }}>
            Critérios — Ranking {ESTAGIO_LABELS[estagio]}
          </p>
          <ul style={{ margin: 0, padding: '0 0 0 14px', fontSize: '12px', color: '#d1d1d6', lineHeight: 1.8 }}>
            {linhas.map((l, i) => <li key={i}>{l}</li>)}
          </ul>
          {mode === 'click' && (
            <button
              onClick={(e) => { e.stopPropagation(); setMode(null) }}
              style={{
                marginTop: '10px', background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '5px', fontSize: '11px', color: '#aeaeb2',
                cursor: 'pointer', padding: '3px 10px', display: 'block',
              }}
            >
              ✕ fechar
            </button>
          )}
        </div>
      )}
    </span>
  )
}

function RankingTab({ consolidacoes, loading, error }) {
  const [filtroBusca, setFiltroBusca] = useState('')
  const [filtroPelotao, setFiltroPelotao] = useState('all')
  const [estagioManual, setEstagioManual] = useState(null)

  const pelotoes = useMemo(() => {
    const set = new Set(consolidacoes.map((a) => a.pelotao).filter(Boolean))
    return ['all', ...Array.from(set).sort()]
  }, [consolidacoes])

  const estagiosComDados = useMemo(() => {
    const temVC1 = consolidacoes.some((a) => a.consolidacao.vc1 !== null)
    const temVC2 = consolidacoes.some((a) => a.consolidacao.vc2 !== null)
    const temFinal = consolidacoes.some((a) => a.consolidacao.mediaFinal !== null)
    return { vc1: temVC1, vc1vc2: temVC1 || temVC2, final: temFinal }
  }, [consolidacoes])

  const estagioDefault = useMemo(() => {
    if (estagiosComDados.final) return 'final'
    if (estagiosComDados.vc1vc2) return 'vc1vc2'
    return 'vc1'
  }, [estagiosComDados])

  const estagio = (estagioManual && estagiosComDados[estagioManual]) ? estagioManual : estagioDefault

  const ranking = useMemo(() => {
    const n = (val) => (typeof val === 'number' ? val : -1)

    if (estagio === 'final') {
      const comNotas = consolidacoes.filter((aluno) => aluno.consolidacao.mediaFinal !== null)
      const ordenados = [...comNotas].sort((a, b) => {
        const ca = a.consolidacao
        const cb = b.consolidacao
        const ma = a.modulos
        const mb = b.modulos

        if (ca.mediaFinal !== cb.mediaFinal) return cb.mediaFinal - ca.mediaFinal
        if (ca.vc2 !== cb.vc2) return n(cb.vc2) - n(ca.vc2)

        const aCirc = ma?.circuito?.finalScore
        const bCirc = mb?.circuito?.finalScore
        if (n(aCirc) !== n(bCirc)) return n(bCirc) - n(aCirc)

        const aTeor = ma?.teorica?.finalScore
        const bTeor = mb?.teorica?.finalScore
        if (n(aTeor) !== n(bTeor)) return n(bTeor) - n(aTeor)

        if (ca.vc1 !== cb.vc1) return n(cb.vc1) - n(ca.vc1)

        const aPoco = ma?.pocos?.finalScore
        const bPoco = mb?.pocos?.finalScore
        if (n(aPoco) !== n(bPoco)) return n(bPoco) - n(aPoco)

        const aEsca = ma?.escadas?.finalScore
        const bEsca = mb?.escadas?.finalScore
        if (n(aEsca) !== n(bEsca)) return n(bEsca) - n(aEsca)

        return 0
      })

      let pos = 1
      return ordenados.map((aluno, index) => {
        let desempate = '—'
        if (index > 0) {
          const prev = ordenados[index - 1]
          if (prev.consolidacao.mediaFinal === aluno.consolidacao.mediaFinal) {
            const ca = prev.consolidacao
            const cb = aluno.consolidacao
            const ma = prev.modulos
            const mb = aluno.modulos

            const pCirc = ma?.circuito?.finalScore
            const aCirc = mb?.circuito?.finalScore
            const pTeor = ma?.teorica?.finalScore
            const aTeor = mb?.teorica?.finalScore
            const pPoco = ma?.pocos?.finalScore
            const aPoco = mb?.pocos?.finalScore
            const pEsca = ma?.escadas?.finalScore
            const aEsca = mb?.escadas?.finalScore

            if (ca.vc2 !== cb.vc2) desempate = 'Desempate por VC2'
            else if (n(pCirc) !== n(aCirc)) desempate = 'Desempate por Circuito'
            else if (n(pTeor) !== n(aTeor)) desempate = 'Desempate por Prova Teórica'
            else if (ca.vc1 !== cb.vc1) desempate = 'Desempate por VC1'
            else if (n(pPoco) !== n(aPoco)) desempate = 'Desempate por Poço'
            else if (n(pEsca) !== n(aEsca)) desempate = 'Desempate por Escadas'
            else desempate = 'Empate mantido'

            const isTie = desempate === 'Empate mantido'
            if (!isTie) pos = index + 1
          } else {
            pos = index + 1
          }
        }
        return { ...aluno, posicao: pos, scoreParcial: aluno.consolidacao.mediaFinal, desempate }
      })
    }

    // Estágios parciais
    let candidatos
    let getScore

    if (estagio === 'vc1vc2') {
      candidatos = consolidacoes.filter((a) => a.consolidacao.vc1 !== null || a.consolidacao.vc2 !== null)
      getScore = (a) => {
        const { vc1, vc2 } = a.consolidacao
        const vals = [vc1, vc2].filter((v) => v !== null)
        return vals.reduce((s, v) => s + v, 0) / vals.length
      }
    } else {
      candidatos = consolidacoes.filter((a) => a.consolidacao.vc1 !== null)
      getScore = (a) => a.consolidacao.vc1
    }

    const ordenados = [...candidatos].sort((a, b) => {
      const sa = getScore(a)
      const sb = getScore(b)
      if (sb !== sa) return sb - sa

      if (estagio === 'vc1') {
        const pocoa = a.modulos?.pocos?.finalScore ?? -1
        const pocob = b.modulos?.pocos?.finalScore ?? -1
        if (pocoa !== pocob) return pocob - pocoa
      }

      if (estagio === 'vc1vc2') {
        const vc2a = a.consolidacao.vc2 ?? -1
        const vc2b = b.consolidacao.vc2 ?? -1
        if (vc2a !== vc2b) return vc2b - vc2a
      }

      return Number(a.ordem || 0) - Number(b.ordem || 0)
    })

    let pos = 1
    return ordenados.map((aluno, idx) => {
      let desempate = '—'
      if (idx > 0) {
        const prev = ordenados[idx - 1]
        const sa = getScore(aluno)
        const sb = getScore(prev)
        if (sa === sb) {
          if (estagio === 'vc1') {
            const pocoa = aluno.modulos?.pocos?.finalScore
            const pocob = prev.modulos?.pocos?.finalScore
            if (pocoa !== pocob) {
              desempate = 'Desempate por Poço'
              pos = idx + 1
            }
          } else if (estagio === 'vc1vc2') {
            const vc2a = aluno.consolidacao.vc2
            const vc2b = prev.consolidacao.vc2
            if (vc2a !== vc2b) {
              desempate = 'Desempate por VC2'
              pos = idx + 1
            }
          }
          if (desempate === '—') {
            desempate = 'Desempate por nº ordem'
            const aOrdem = Number(aluno.ordem || 0)
            const bOrdem = Number(prev.ordem || 0)
            if (aOrdem !== bOrdem) pos = idx + 1
          }
        } else {
          pos = idx + 1
        }
      }
      return { ...aluno, posicao: pos, scoreParcial: getScore(aluno), desempate }
    })
  }, [consolidacoes, estagio])

  const visiveis = useMemo(() => {
    return ranking.filter((aluno) => {
      if (filtroPelotao !== 'all' && aluno.pelotao !== filtroPelotao) return false
      if (filtroBusca.trim()) {
        const q = normalize(filtroBusca)
        if (!normalize(aluno.nome).includes(q) && !normalize(aluno.ordem).includes(q)) return false
      }
      return true
    })
  }, [ranking, filtroPelotao, filtroBusca])

  const hasActiveFilter = filtroPelotao !== 'all' || filtroBusca.trim() !== ''

  function clearFilters() {
    setFiltroPelotao('all')
    setFiltroBusca('')
  }

  const isFinal = estagio === 'final'

  return (
    <>
      <div className="filter-bar" style={{ marginBottom: '16px' }}>
        {['vc1', 'vc1vc2', 'final'].map((e) => (
          <button
            key={e}
            onClick={() => setEstagioManual(e)}
            disabled={!estagiosComDados[e]}
            className={`filter-btn${estagio === e ? ' filter-btn--active' : ''}`}
            title={!estagiosComDados[e] ? 'Sem dados para este estágio' : ''}
          >
            {ESTAGIO_LABELS[e]}
          </button>
        ))}
      </div>

      <div className="coord-filters-card">
        <FilterRow>
          <div className="coord-filter-field coord-filter-field--wide">
            <label className="coord-filter-label">Buscar</label>
            <input
              className="coord-filter-input"
              type="text"
              placeholder="Nome ou ordem..."
              value={filtroBusca}
              onChange={(e) => setFiltroBusca(e.target.value)}
            />
          </div>
          <div className="coord-filter-field">
            <label className="coord-filter-label">Pelotão</label>
            <select className="coord-filter-select" value={filtroPelotao}
              onChange={(e) => setFiltroPelotao(e.target.value)}>
              {pelotoes.map((p) => (
                <option key={p} value={p}>{p === 'all' ? 'Todos os pelotões' : p}</option>
              ))}
            </select>
          </div>
        </FilterRow>
        {hasActiveFilter && (
          <div className="coord-filter-actions">
            <button className="coord-clear-btn" onClick={clearFilters}>✕ Limpar filtros</button>
          </div>
        )}
      </div>

      {loading && <p className="status-muted">Carregando ranking...</p>}
      {!loading && error && <p className="status-error">Erro: {error}</p>}

      {!loading && !error && (
        <>
          <p className="coord-count">
            {visiveis.length} aluno(s) no ranking —{' '}
            <strong>Ranking {ESTAGIO_LABELS[estagio]}</strong>
            <TiebreakInfo estagio={estagio} />
          </p>

          {visiveis.length === 0 ? (
            <p className="status-muted">Nenhum aluno com notas para este estágio encontrado.</p>
          ) : (
            <div className="portal-table-wrapper">
              <table className="portal-table">
                <thead>
                  <tr>
                    <th className="center">Posição</th>
                    <th>Aluno</th>
                    <th>Ordem</th>
                    <th>Pelotão</th>
                    <th className="center">VC1</th>
                    <th className="center">VC2</th>
                    {isFinal && <th className="center">VC3</th>}
                    <th className="center">{isFinal ? 'Média Final' : 'Média Parcial'}</th>
                    <th>Critério</th>
                  </tr>
                </thead>
                <tbody>
                  {visiveis.map((aluno) => {
                    const { vc1, vc2, vc3 } = aluno.consolidacao
                    return (
                      <tr key={aluno.ordem}>
                        <td className="center">
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '13px',
                            fontWeight: 'bold',
                            ...(aluno.posicao === 1 ? { background: 'var(--gold)', color: '#000' } :
                                aluno.posicao === 2 ? { background: '#C0C0C0', color: '#000' } :
                                aluno.posicao === 3 ? { background: '#CD7F32', color: '#fff' } :
                                { color: 'var(--text-secondary)' })
                          }}>
                            {aluno.posicao}º
                          </span>
                        </td>
                        <td style={{ fontWeight: aluno.posicao <= 3 ? 700 : 400 }}>{aluno.nome || '—'}</td>
                        <td>{aluno.ordem || '—'}</td>
                        <td>{aluno.pelotao || '—'}</td>
                        <td className="center">{fmtNota(vc1)}</td>
                        <td className="center">{fmtNota(vc2)}</td>
                        {isFinal && <td className="center">{fmtNota(vc3)}</td>}
                        <td className="center" style={{ fontWeight: 700, color: 'var(--gold)' }}>
                          {fmtNota(aluno.scoreParcial)}
                        </td>
                        <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{aluno.desempate}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </>
  )
}


// ═══════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════

export default function AlunoArea() {
  const [aba, setAba] = useState('avaliacoes')

  const [avaliacoes, setAvaliacoes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [consolidacoes, setConsolidacoes] = useState([])
  const [loadingConsolidacao, setLoadingConsolidacao] = useState(false)
  const [errorConsolidacao, setErrorConsolidacao] = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [motosserra, escadas, pocos, circuito, teorica] = await Promise.all([
          fetchAvaliacoesByModulo('motosserra'),
          fetchAvaliacoesByModulo('escadas'),
          fetchAvaliacoesByModulo('pocos'),
          fetchAvaliacoesByModulo('circuito'),
          fetchAvaliacoesByModulo('teorica'),
        ])
        const combined = [...motosserra, ...escadas, ...pocos, ...circuito, ...teorica].sort(
          (a, b) => new Date(b.savedAt) - new Date(a.savedAt)
        )
        setAvaliacoes(combined)
      } catch (err) {
        setError(err.message || 'Erro ao carregar avaliações.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  function handleAbaChange(novaAba) {
    setAba(novaAba)
    if ((novaAba === 'consolidacao' || novaAba === 'ranking') && consolidacoes.length === 0 && !loadingConsolidacao) {
      setLoadingConsolidacao(true)
      setErrorConsolidacao(null)
      fetchConsolidacaoTodos()
        .then(setConsolidacoes)
        .catch((err) => setErrorConsolidacao(err.message || 'Erro ao carregar dados.'))
        .finally(() => setLoadingConsolidacao(false))
    }
  }

  return (
    <PortalLayout>
      <div style={{ marginBottom: '24px' }}>
        <p className="page-section-label">Área do Aluno</p>
        <h1 className="page-section-title">Avaliações e Consolidação</h1>
        <p className="page-section-desc">Consulta consolidada — somente leitura.</p>
      </div>

      <div className="filter-bar" style={{ marginBottom: '24px' }}>
        <button
          onClick={() => handleAbaChange('avaliacoes')}
          className={`filter-btn${aba === 'avaliacoes' ? ' filter-btn--active' : ''}`}
        >
          Avaliações
        </button>
        <button
          onClick={() => handleAbaChange('consolidacao')}
          className={`filter-btn${aba === 'consolidacao' ? ' filter-btn--active' : ''}`}
        >
          Consolidação
        </button>
        <button
          onClick={() => handleAbaChange('ranking')}
          className={`filter-btn${aba === 'ranking' ? ' filter-btn--active' : ''}`}
        >
          Ranking
        </button>
      </div>

      {aba === 'avaliacoes' && (
        <AvaliacoesTab avaliacoes={avaliacoes} loading={loading} error={error} />
      )}

      {aba === 'consolidacao' && (
        <ConsolidacaoTab
          consolidacoes={consolidacoes}
          loading={loadingConsolidacao}
          error={errorConsolidacao}
        />
      )}

      {aba === 'ranking' && (
        <RankingTab
          consolidacoes={consolidacoes}
          loading={loadingConsolidacao}
          error={errorConsolidacao}
        />
      )}

      <Link to="/" className="portal-back-link">
        ← Voltar ao Portal
      </Link>
    </PortalLayout>
  )
}
