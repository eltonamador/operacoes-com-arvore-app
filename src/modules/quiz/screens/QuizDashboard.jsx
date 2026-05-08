import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchAllQuizAttempts } from '../services/quizService'
import allQuestions from '../data/questions.json'
import PortalLayout from '../../../components/PortalLayout'

function normalize(str) {
  return (str || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function fmtDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export default function QuizDashboard() {
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(true)
  const [aba, setAba] = useState('ranking')
  const [filtroBusca, setFiltroBusca] = useState('')
  const [filtroNivel, setFiltroNivel] = useState('todos')

  useEffect(() => {
    fetchAllQuizAttempts()
      .then(setAttempts)
      .catch(err => console.error('Erro:', err))
      .finally(() => setLoading(false))
  }, [])

  const rankingSorted = useMemo(() => {
    let filtered = [...attempts]
    if (filtroNivel !== 'todos') {
      filtered = filtered.filter(a => a.nivel === filtroNivel)
    }
    if (filtroBusca.trim()) {
      const q = normalize(filtroBusca)
      filtered = filtered.filter(a => normalize(a.nome_aluno).includes(q))
    }
    return filtered.sort((a, b) => b.pontuacao - a.pontuacao)
  }, [attempts, filtroNivel, filtroBusca])

  const studentStats = useMemo(() => {
    const map = {}
    for (const a of attempts) {
      const key = a.numero_ordem
      if (!map[key]) {
        map[key] = { nome: a.nome_aluno, pelotao: a.pelotao, numero_ordem: a.numero_ordem, tentativas: [] }
      }
      map[key].tentativas.push(a)
    }
    let list = Object.values(map)
    if (filtroBusca.trim()) {
      const q = normalize(filtroBusca)
      list = list.filter(s => normalize(s.nome).includes(q))
    }
    return list.sort((a, b) => a.nome.localeCompare(b.nome))
  }, [attempts, filtroBusca])

  const questionStats = useMemo(() => {
    const stats = {}
    for (const a of attempts) {
      const respostas = a.respostas || []
      for (const r of respostas) {
        if (!stats[r.questao_id]) {
          stats[r.questao_id] = { total: 0, acertos: 0 }
        }
        stats[r.questao_id].total++
        if (r.acertou) stats[r.questao_id].acertos++
      }
    }
    return allQuestions.map(q => {
      const s = stats[q.id] || { total: 0, acertos: 0 }
      const taxa = s.total > 0 ? Math.round((s.acertos / s.total) * 100) : null
      return { ...q, total: s.total, acertos: s.acertos, taxa }
    }).filter(q => {
      if (filtroNivel !== 'todos' && q.nivel !== filtroNivel) return false
      return true
    }).sort((a, b) => (a.taxa ?? 999) - (b.taxa ?? 999))
  }, [attempts, filtroNivel])

  return (
    <PortalLayout>
      <div style={{ marginBottom: '24px' }}>
        <p className="page-section-label">Coordenação</p>
        <h1 className="page-section-title">Quiz Teórico — Painel</h1>
        <p className="page-section-desc">{attempts.length} tentativa(s) registrada(s)</p>
      </div>

      <div className="filter-bar" style={{ marginBottom: 16 }}>
        {[
          { key: 'ranking', label: 'Ranking' },
          { key: 'alunos', label: 'Por Aluno' },
          { key: 'questoes', label: 'Por Questão' },
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
          {aba !== 'alunos' && (
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
                <option value="misturado">Misturado</option>
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
                <th className="center">#</th>
                <th>Nome</th>
                <th>Pelotão</th>
                <th className="center">Pontuação</th>
                <th className="center">Acertos</th>
                <th className="center">%</th>
                <th className="center">Tempo</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {rankingSorted.map((r, i) => (
                <tr key={r.id}>
                  <td className="center" style={{ fontWeight: i < 3 ? 700 : 400 }}>{i + 1}º</td>
                  <td style={{ fontWeight: i < 3 ? 700 : 400 }}>{r.nome_aluno}</td>
                  <td>{r.pelotao}</td>
                  <td className="center" style={{ fontWeight: 700, color: 'var(--gold)' }}>{r.pontuacao}</td>
                  <td className="center">{r.acertos}/{r.total_questoes}</td>
                  <td className="center">{Number(r.percentual).toFixed(0)}%</td>
                  <td className="center">{r.tempo_total}s</td>
                  <td>{fmtDate(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && aba === 'alunos' && (
        <div className="portal-table-wrapper">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Pelotão</th>
                <th className="center">Tentativas</th>
                <th className="center">Melhor Pontuação</th>
                <th className="center">Melhor %</th>
                <th>Última</th>
              </tr>
            </thead>
            <tbody>
              {studentStats.map(s => {
                const best = s.tentativas.reduce((a, b) => a.pontuacao > b.pontuacao ? a : b)
                const bestPct = s.tentativas.reduce((a, b) => Number(a.percentual) > Number(b.percentual) ? a : b)
                const last = s.tentativas[0]
                return (
                  <tr key={s.numero_ordem}>
                    <td>{s.nome}</td>
                    <td>{s.pelotao}</td>
                    <td className="center">{s.tentativas.length}</td>
                    <td className="center" style={{ fontWeight: 700, color: 'var(--gold)' }}>{best.pontuacao}</td>
                    <td className="center">{Number(bestPct.percentual).toFixed(0)}%</td>
                    <td>{fmtDate(last?.created_at)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {!loading && aba === 'questoes' && (
        <div className="portal-table-wrapper">
          <table className="portal-table">
            <thead>
              <tr>
                <th className="center">ID</th>
                <th className="center">Nível</th>
                <th>Enunciado</th>
                <th className="center">Respostas</th>
                <th className="center">Taxa Acerto</th>
              </tr>
            </thead>
            <tbody>
              {questionStats.map(q => (
                <tr key={q.id}>
                  <td className="center">{q.id}</td>
                  <td className="center">
                    <span className={`qg-level-badge qg-level-badge--${q.nivel}`} style={{ fontSize: 10, padding: '2px 6px' }}>
                      {q.nivel}
                    </span>
                  </td>
                  <td title={q.enunciado}>
                    {q.enunciado.length > 100 ? q.enunciado.slice(0, 100) + '...' : q.enunciado}
                  </td>
                  <td className="center">{q.total}</td>
                  <td className="center" style={{
                    fontWeight: 700,
                    color: q.taxa === null ? 'var(--text-muted)' : q.taxa >= 70 ? 'var(--success)' : q.taxa >= 40 ? 'var(--gold)' : 'var(--danger)',
                  }}>
                    {q.taxa !== null ? `${q.taxa}%` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Link to="/coordenacao" className="portal-back-link" style={{ marginTop: 24, display: 'inline-block' }}>
        ← Voltar à Coordenação
      </Link>
    </PortalLayout>
  )
}
