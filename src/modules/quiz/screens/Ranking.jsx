import { useEffect, useState } from 'react'
import { fetchQuizRanking } from '../services/quizService'

const LEVEL_OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: 'basico', label: 'Básico' },
  { value: 'intermediario', label: 'Intermediário' },
  { value: 'avancado', label: 'Avançado' },
  { value: 'misturado', label: 'Misturado' },
]

export default function Ranking({ onBack }) {
  const [ranking, setRanking] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroNivel, setFiltroNivel] = useState('todos')

  useEffect(() => {
    loadRanking()
  }, [filtroNivel])

  async function loadRanking() {
    setLoading(true)
    try {
      const opts = filtroNivel !== 'todos' ? { nivel: filtroNivel } : {}
      const data = await fetchQuizRanking(opts)
      setRanking(data)
    } catch (err) {
      console.error('Erro ao carregar ranking:', err)
    } finally {
      setLoading(false)
    }
  }

  function fmtDate(iso) {
    if (!iso) return '—'
    const d = new Date(iso)
    return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="quiz-container">
      <div className="quiz-card quiz-card--wide">
        <h2 className="quiz-card-title">Ranking</h2>

        <div className="quiz-option-group" style={{ marginBottom: 16 }}>
          {LEVEL_OPTIONS.map(l => (
            <button
              key={l.value}
              className={`quiz-option-btn${filtroNivel === l.value ? ' quiz-option-btn--active' : ''}`}
              onClick={() => setFiltroNivel(l.value)}
            >
              {l.label}
            </button>
          ))}
        </div>

        {loading && <p className="status-muted">Carregando ranking...</p>}

        {!loading && ranking.length === 0 && (
          <p className="status-muted">Nenhuma tentativa registrada.</p>
        )}

        {!loading && ranking.length > 0 && (
          <div className="portal-table-wrapper">
            <table className="portal-table">
              <thead>
                <tr>
                  <th className="center">#</th>
                  <th>Nome</th>
                  <th className="center">Pontuação</th>
                  <th className="center">Acertos</th>
                  <th className="center">%</th>
                  <th className="center">Tempo</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((r, i) => (
                  <tr key={r.id}>
                    <td className="center" style={{ fontWeight: i < 3 ? 700 : 400 }}>
                      {i + 1}º
                    </td>
                    <td style={{ fontWeight: i < 3 ? 700 : 400 }}>{r.nome_aluno}</td>
                    <td className="center" style={{ fontWeight: 700, color: 'var(--gold)' }}>
                      {r.pontuacao}
                    </td>
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

        <button className="btn btn-ghost" onClick={onBack} style={{ marginTop: 16 }}>
          Voltar
        </button>
      </div>
    </div>
  )
}
