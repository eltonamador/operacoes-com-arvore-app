import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchAllQuizAttempts } from '../services/quizService'
import {
  buildStudentRanking,
  buildStudentDetail,
  buildQuestionStats,
  suggestExamQuestions,
  buildOverview,
  describeDiscrimination,
} from '../services/quizStatsService'
import allQuestions from '../data/questions.json'
import PortalLayout from '../../../components/PortalLayout'
import QuizAlunoDetalhe from './QuizAlunoDetalhe'
import QuizExamSuggestion from './QuizExamSuggestion'

function normalize(str) {
  return (str || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function fmtDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

const CLASS_BADGE = {
  'muito-facil': { label: 'Muito fácil', color: 'var(--info, #3b82f6)' },
  'equilibrada': { label: 'Equilibrada', color: 'var(--success, #10b981)' },
  'dificil': { label: 'Difícil', color: 'var(--gold, #f59e0b)' },
  'critica': { label: 'Crítica', color: 'var(--danger, #ef4444)' },
  'amostra-insuficiente': { label: 'Sem amostra', color: 'var(--text-muted, #9ca3af)' },
}

export default function QuizDashboard() {
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(true)
  const [aba, setAba] = useState('ranking')
  const [filtroBusca, setFiltroBusca] = useState('')
  const [filtroNivel, setFiltroNivel] = useState('todos')
  const [filtroFaixa, setFiltroFaixa] = useState('todas')
  const [sortRanking, setSortRanking] = useState({ key: 'posicao', dir: 'asc' })
  const [sortQuestoes, setSortQuestoes] = useState({ key: 'taxa', dir: 'asc' })
  const [alunoSelecionado, setAlunoSelecionado] = useState(null)

  useEffect(() => {
    fetchAllQuizAttempts()
      .then(setAttempts)
      .catch(err => console.error('Erro:', err))
      .finally(() => setLoading(false))
  }, [])

  const overview = useMemo(() => buildOverview(attempts, allQuestions), [attempts])

  const ranking = useMemo(() => {
    let list = buildStudentRanking(attempts)
    if (filtroBusca.trim()) {
      const q = normalize(filtroBusca)
      list = list.filter(s => normalize(s.nome).includes(q))
    }
    const { key, dir } = sortRanking
    const mult = dir === 'asc' ? 1 : -1
    list = [...list].sort((a, b) => {
      const av = a[key]
      const bv = b[key]
      if (typeof av === 'string') return av.localeCompare(bv) * mult
      return ((av ?? 0) - (bv ?? 0)) * mult
    })
    return list
  }, [attempts, filtroBusca, sortRanking])

  const questionStats = useMemo(
    () => buildQuestionStats(attempts, allQuestions),
    [attempts]
  )

  const questionStatsFiltradas = useMemo(() => {
    let list = questionStats
    if (filtroNivel !== 'todos') list = list.filter(q => q.nivel === filtroNivel)
    if (filtroFaixa !== 'todas') {
      list = list.filter(q => {
        if (q.taxa == null) return filtroFaixa === 'sem-amostra'
        if (filtroFaixa === 'muito-facil') return q.taxa > 85
        if (filtroFaixa === 'equilibrada') return q.taxa >= 40 && q.taxa <= 85
        if (filtroFaixa === 'dificil') return q.taxa >= 20 && q.taxa < 40
        if (filtroFaixa === 'critica') return q.taxa < 20
        return true
      })
    }
    const { key, dir } = sortQuestoes
    const mult = dir === 'asc' ? 1 : -1
    return [...list].sort((a, b) => {
      const av = a[key]
      const bv = b[key]
      if (av == null && bv == null) return 0
      if (av == null) return 1
      if (bv == null) return -1
      if (typeof av === 'string') return av.localeCompare(bv) * mult
      return (av - bv) * mult
    })
  }, [questionStats, filtroNivel, filtroFaixa, sortQuestoes])

  const studentDetail = useMemo(() => {
    if (!alunoSelecionado) return null
    return buildStudentDetail(attempts, alunoSelecionado, allQuestions)
  }, [attempts, alunoSelecionado])

  function toggleSort(state, setState, key) {
    if (state.key === key) {
      setState({ key, dir: state.dir === 'asc' ? 'desc' : 'asc' })
    } else {
      setState({ key, dir: 'asc' })
    }
  }

  function sortArrow(state, key) {
    if (state.key !== key) return ''
    return state.dir === 'asc' ? ' ▲' : ' ▼'
  }

  return (
    <PortalLayout>
      <div style={{ marginBottom: 24 }}>
        <p className="page-section-label">Coordenação</p>
        <h1 className="page-section-title">Quiz Teórico — Painel</h1>
        <p className="page-section-desc">
          {overview.totalTentativas} tentativa(s) · {overview.alunosDistintos} aluno(s) · média {overview.mediaPct}%
        </p>
      </div>

      {/* Cards de resumo */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <SummaryCard label="Tentativas" value={overview.totalTentativas} />
        <SummaryCard label="Alunos" value={overview.alunosDistintos} />
        <SummaryCard label="Média geral" value={`${overview.mediaPct}%`} />
        <SummaryCard label="Equilibradas" value={overview.questoesEquilibradas} color="var(--success)" />
        <SummaryCard label="Críticas" value={overview.questoesCriticas} color="var(--danger)" />
      </div>

      <div className="filter-bar" style={{ marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          { key: 'ranking', label: 'Ranking' },
          { key: 'alunos', label: 'Por Aluno' },
          { key: 'questoes', label: 'Por Questão' },
          { key: 'prova', label: 'Sugestão de Prova' },
        ].map(t => (
          <button
            key={t.key}
            className={`filter-btn${aba === t.key ? ' filter-btn--active' : ''}`}
            onClick={() => setAba(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="coord-filters-card">
        <div className="coord-filter-row">
          {(aba === 'ranking' || aba === 'alunos') && (
            <div className="coord-filter-field coord-filter-field--wide">
              <label className="coord-filter-label">Buscar</label>
              <input
                className="coord-filter-input"
                type="text"
                placeholder="Nome do aluno..."
                value={filtroBusca}
                onChange={e => setFiltroBusca(e.target.value)}
              />
            </div>
          )}
          {(aba === 'questoes' || aba === 'prova') && (
            <div className="coord-filter-field">
              <label className="coord-filter-label">Nível</label>
              <select
                className="coord-filter-select"
                value={filtroNivel}
                onChange={e => setFiltroNivel(e.target.value)}
              >
                <option value="todos">Todos</option>
                <option value="basico">Básico</option>
                <option value="intermediario">Intermediário</option>
                <option value="avancado">Avançado</option>
              </select>
            </div>
          )}
          {aba === 'questoes' && (
            <div className="coord-filter-field">
              <label className="coord-filter-label">Faixa</label>
              <select
                className="coord-filter-select"
                value={filtroFaixa}
                onChange={e => setFiltroFaixa(e.target.value)}
              >
                <option value="todas">Todas</option>
                <option value="muito-facil">Muito fácil (&gt;85%)</option>
                <option value="equilibrada">Equilibrada (40–85%)</option>
                <option value="dificil">Difícil (20–40%)</option>
                <option value="critica">Crítica (&lt;20%)</option>
                <option value="sem-amostra">Sem amostra</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {loading && <p className="status-muted">Carregando...</p>}

      {!loading && aba === 'ranking' && (
        <div className="portal-table-wrapper">
          <table className="portal-table">
            <thead>
              <tr>
                <th className="center clickable" onClick={() => toggleSort(sortRanking, setSortRanking, 'posicao')}>#{sortArrow(sortRanking, 'posicao')}</th>
                <th className="clickable" onClick={() => toggleSort(sortRanking, setSortRanking, 'nome')}>Nome{sortArrow(sortRanking, 'nome')}</th>
                <th>Pelotão</th>
                <th className="center clickable" onClick={() => toggleSort(sortRanking, setSortRanking, 'tentativas')}>Tent.{sortArrow(sortRanking, 'tentativas')}</th>
                <th className="center clickable" onClick={() => toggleSort(sortRanking, setSortRanking, 'totalQuestoes')}>Questões{sortArrow(sortRanking, 'totalQuestoes')}</th>
                <th className="center clickable" onClick={() => toggleSort(sortRanking, setSortRanking, 'acertos')}>Acertos{sortArrow(sortRanking, 'acertos')}</th>
                <th className="center">Erros</th>
                <th className="center clickable" onClick={() => toggleSort(sortRanking, setSortRanking, 'percentualGeral')}>% Geral{sortArrow(sortRanking, 'percentualGeral')}</th>
                <th className="center clickable" onClick={() => toggleSort(sortRanking, setSortRanking, 'melhorPercentual')}>Melhor{sortArrow(sortRanking, 'melhorPercentual')}</th>
                <th className="center clickable" onClick={() => toggleSort(sortRanking, setSortRanking, 'mediaPercentual')}>Média{sortArrow(sortRanking, 'mediaPercentual')}</th>
                <th className="clickable" onClick={() => toggleSort(sortRanking, setSortRanking, 'ultimaData')}>Última{sortArrow(sortRanking, 'ultimaData')}</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map(s => (
                <tr key={s.numero_ordem || s.nome}
                    style={{ cursor: 'pointer' }}
                    onClick={() => { setAlunoSelecionado(s.numero_ordem); setAba('alunos') }}>
                  <td className="center" style={{ fontWeight: s.posicao <= 3 ? 700 : 400 }}>{s.posicao}º</td>
                  <td style={{ fontWeight: s.posicao <= 3 ? 700 : 400 }}>{s.nome}</td>
                  <td>{s.pelotao}</td>
                  <td className="center">{s.tentativas}</td>
                  <td className="center">{s.totalQuestoes}</td>
                  <td className="center" style={{ color: 'var(--success)' }}>{s.acertos}</td>
                  <td className="center" style={{ color: 'var(--danger)' }}>{s.erros}</td>
                  <td className="center" style={{ fontWeight: 700 }}>{s.percentualGeral}%</td>
                  <td className="center">{s.melhorPercentual}%</td>
                  <td className="center">{s.mediaPercentual}%</td>
                  <td>{fmtDate(s.ultimaData)}</td>
                </tr>
              ))}
              {!ranking.length && (
                <tr><td colSpan={11} className="center status-muted">Nenhum aluno encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {!loading && aba === 'alunos' && (
        <QuizAlunoDetalhe
          ranking={ranking}
          detail={studentDetail}
          selectedKey={alunoSelecionado}
          onSelect={setAlunoSelecionado}
          filtroBusca={filtroBusca}
        />
      )}

      {!loading && aba === 'questoes' && (
        <div className="portal-table-wrapper">
          <table className="portal-table">
            <thead>
              <tr>
                <th className="center clickable" onClick={() => toggleSort(sortQuestoes, setSortQuestoes, 'id')}>ID{sortArrow(sortQuestoes, 'id')}</th>
                <th className="center">Nível</th>
                <th>Enunciado</th>
                <th className="center clickable" onClick={() => toggleSort(sortQuestoes, setSortQuestoes, 'total')}>Resp.{sortArrow(sortQuestoes, 'total')}</th>
                <th className="center clickable" onClick={() => toggleSort(sortQuestoes, setSortQuestoes, 'acertos')}>Acertos{sortArrow(sortQuestoes, 'acertos')}</th>
                <th className="center">Erros</th>
                <th className="center clickable" onClick={() => toggleSort(sortQuestoes, setSortQuestoes, 'taxa')}>Taxa{sortArrow(sortQuestoes, 'taxa')}</th>
                <th className="center">Distribuição A/B/C/D/E</th>
                <th className="center clickable" onClick={() => toggleSort(sortQuestoes, setSortQuestoes, 'discriminacao')}>D{sortArrow(sortQuestoes, 'discriminacao')}</th>
                <th className="center">Classif.</th>
              </tr>
            </thead>
            <tbody>
              {questionStatsFiltradas.map(q => {
                const badge = CLASS_BADGE[q.classificacao] || CLASS_BADGE['amostra-insuficiente']
                const totalAlt = ['A','B','C','D','E'].reduce((s, l) => s + (q.alternativas?.[l] || 0), 0)
                return (
                  <tr key={q.id}>
                    <td className="center">{q.id}</td>
                    <td className="center">
                      <span className={`qg-level-badge qg-level-badge--${q.nivel}`} style={{ fontSize: 10, padding: '2px 6px' }}>
                        {q.nivel}
                      </span>
                    </td>
                    <td title={q.enunciado}>
                      {q.enunciado.length > 90 ? q.enunciado.slice(0, 90) + '...' : q.enunciado}
                    </td>
                    <td className="center">{q.total}</td>
                    <td className="center" style={{ color: 'var(--success)' }}>{q.acertos}</td>
                    <td className="center" style={{ color: 'var(--danger)' }}>{q.erros}</td>
                    <td className="center" style={{
                      fontWeight: 700,
                      color: q.taxa === null ? 'var(--text-muted)'
                        : q.taxa >= 70 ? 'var(--success)'
                        : q.taxa >= 40 ? 'var(--gold)' : 'var(--danger)',
                    }}>
                      {q.taxa !== null ? `${q.taxa}%` : '—'}
                    </td>
                    <td className="center" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>
                      {['A','B','C','D','E'].map(l => {
                        const n = q.alternativas?.[l] || 0
                        const pct = totalAlt ? Math.round((n / totalAlt) * 100) : 0
                        const isCorrect = q.gabarito === l
                        return (
                          <span key={l}
                                title={`${l}: ${n} (${pct}%)${isCorrect ? ' — gabarito' : ''}`}
                                style={{
                                  display: 'inline-block',
                                  padding: '1px 4px',
                                  margin: '0 1px',
                                  borderRadius: 3,
                                  fontWeight: isCorrect ? 700 : 400,
                                  color: isCorrect ? 'var(--success)' : 'inherit',
                                }}>
                            {l}:{pct}%
                          </span>
                        )
                      })}
                    </td>
                    <td className="center" title={describeDiscrimination(q.discriminacao)}>
                      {q.discriminacao == null ? '—' : q.discriminacao.toFixed(2)}
                    </td>
                    <td className="center">
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: 10,
                        fontSize: 11,
                        fontWeight: 600,
                        background: badge.color + '22',
                        color: badge.color,
                      }}>{badge.label}</span>
                    </td>
                  </tr>
                )
              })}
              {!questionStatsFiltradas.length && (
                <tr><td colSpan={10} className="center status-muted">Nenhuma questão encontrada.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {!loading && aba === 'prova' && (
        <QuizExamSuggestion
          questionStats={questionStats}
          filtroNivel={filtroNivel}
        />
      )}

      <Link to="/coordenacao" className="portal-back-link" style={{ marginTop: 24, display: 'inline-block' }}>
        ← Voltar à Coordenação
      </Link>
    </PortalLayout>
  )
}

function SummaryCard({ label, value, color }) {
  return (
    <div style={{
      flex: '1 1 140px',
      minWidth: 120,
      padding: '12px 14px',
      borderRadius: 8,
      background: 'var(--surface-2, rgba(255,255,255,0.04))',
      border: '1px solid var(--border, rgba(255,255,255,0.08))',
    }}>
      <div style={{ fontSize: 11, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: color || 'inherit' }}>{value}</div>
    </div>
  )
}
