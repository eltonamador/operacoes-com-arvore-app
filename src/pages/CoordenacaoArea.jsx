import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchAvaliacoesByModulo } from '../services/avaliacoesService'
import PortalLayout from '../components/PortalLayout'

const MODULE_LABELS = {
  motosserra: 'Motosserra',
  escadas: 'Escadas',
}

const FILTER_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'motosserra', label: 'Motosserra' },
  { value: 'escadas', label: 'Escadas' },
]

export default function CoordenacaoArea() {
  const [avaliacoes, setAvaliacoes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filtro, setFiltro] = useState('all')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [motosserra, escadas] = await Promise.all([
          fetchAvaliacoesByModulo('motosserra'),
          fetchAvaliacoesByModulo('escadas'),
        ])
        const combined = [...motosserra, ...escadas].sort(
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

  const visíveis =
    filtro === 'all'
      ? avaliacoes
      : avaliacoes.filter((a) => a.moduleId === filtro)

  return (
    <PortalLayout>
      <p style={{ color: 'var(--text-muted)', marginBottom: '4px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
        Área de Coordenação
      </p>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '13px' }}>
        Consulta consolidada de avaliações — somente leitura
      </p>

      <div className="filter-bar" style={{ marginBottom: '20px' }}>
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFiltro(opt.value)}
            className={`filter-btn${filtro === opt.value ? ' filter-btn--active' : ''}`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {loading && (
        <p className="status-muted">Carregando avaliações...</p>
      )}

      {!loading && error && (
        <p className="status-error">Erro ao carregar dados: {error}</p>
      )}

      {!loading && !error && visíveis.length === 0 && (
        <p className="status-muted">Nenhuma avaliação encontrada para o filtro selecionado.</p>
      )}

      {!loading && !error && visíveis.length > 0 && (
        <>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '12px' }}>
            {visíveis.length} avaliação(ões) exibida(s)
          </p>
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
                {visíveis.map((av) => (
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
        </>
      )}

      <Link to="/" className="portal-back-link">
        ← Voltar ao Portal
      </Link>
    </PortalLayout>
  )
}
