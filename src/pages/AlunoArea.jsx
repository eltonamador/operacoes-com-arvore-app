import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { fetchAvaliacoesByNumeroOrdem } from '../services/avaliacoesService'
import PortalLayout from '../components/PortalLayout'

const MODULE_LABELS = {
  motosserra: 'Motosserra',
  escadas: 'Escadas',
}

export default function AlunoArea() {
  const { displayName, numeroOrdem } = useAuth()
  const [avaliacoes, setAvaliacoes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!numeroOrdem) {
      setLoading(false)
      return
    }

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchAvaliacoesByNumeroOrdem(numeroOrdem)
        setAvaliacoes(data)
      } catch (err) {
        setError(err.message || 'Erro ao carregar avaliações.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [numeroOrdem])

  return (
    <PortalLayout>
      <p style={{ color: 'var(--text-muted)', marginBottom: '4px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
        Área do Aluno
      </p>
      {displayName && (
        <p style={{ margin: '0 0 4px', fontSize: '15px', color: 'var(--text-primary)' }}>
          {displayName}
        </p>
      )}
      <p style={{ margin: '0 0 20px', color: 'var(--text-secondary)', fontSize: '13px' }}>
        Consulta de avaliações — somente leitura
      </p>

      {!loading && !numeroOrdem && (
        <p className="status-info">
          Número de ordem não configurado no perfil. Contacte o administrador.
        </p>
      )}

      {loading && (
        <p className="status-muted">Carregando avaliações...</p>
      )}

      {!loading && error && (
        <p className="status-error">Erro ao carregar dados: {error}</p>
      )}

      {!loading && !error && numeroOrdem && avaliacoes.length === 0 && (
        <p className="status-muted">Nenhuma avaliação encontrada.</p>
      )}

      {!loading && !error && avaliacoes.length > 0 && (
        <>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '12px' }}>
            {avaliacoes.length} avaliação(ões) encontrada(s)
          </p>
          <div className="portal-table-wrapper">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Módulo</th>
                  <th>Data</th>
                  <th>Avaliador</th>
                  <th className="center">Nota Final</th>
                  <th className="center">Resultado</th>
                </tr>
              </thead>
              <tbody>
                {avaliacoes.map((av) => (
                  <tr key={av.id}>
                    <td>{MODULE_LABELS[av.moduleId] || av.moduleId || '—'}</td>
                    <td>{av.studentData.data || '—'}</td>
                    <td>{av.studentData.avaliador || '—'}</td>
                    <td className="center" style={{ fontWeight: 700 }}>
                      {typeof av.finalScore === 'number' ? av.finalScore.toFixed(2) : '—'}
                    </td>
                    <td className="center">
                      <span className={av.isPassing ? 'badge-pass' : 'badge-fail'}>
                        {av.isPassing ? 'APROVADO' : 'REPROVADO'}
                      </span>
                    </td>
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
