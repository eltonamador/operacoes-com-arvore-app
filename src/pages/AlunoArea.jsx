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
    <PortalLayout title="Área do Aluno">
    <div style={{ padding: '24px 32px', fontFamily: 'sans-serif' }}>
      {displayName && (
        <p style={{ margin: '0 0 4px', fontSize: '15px', color: '#333' }}>
          Bem-vindo, {displayName}
        </p>
      )}
      <p style={{ margin: '0 0 20px', color: '#888', fontSize: '14px' }}>
        Consulta de avaliacoes — somente leitura
      </p>

      {/* Numero de ordem nao configurado */}
      {!loading && !numeroOrdem && (
        <p
          style={{
            color: '#856404',
            backgroundColor: '#fff3cd',
            border: '1px solid #ffc107',
            padding: '12px 16px',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        >
          Numero de ordem nao configurado no perfil. Contacte o administrador.
        </p>
      )}

      {/* Loading */}
      {loading && (
        <p style={{ color: '#888' }}>Carregando avaliacoes...</p>
      )}

      {/* Error */}
      {!loading && error && (
        <p
          style={{
            color: '#c0392b',
            border: '1px solid #c0392b',
            padding: '12px',
            borderRadius: '4px',
          }}
        >
          Erro ao carregar dados: {error}
        </p>
      )}

      {/* Empty */}
      {!loading && !error && numeroOrdem && avaliacoes.length === 0 && (
        <p style={{ color: '#888' }}>Nenhuma avaliacao encontrada.</p>
      )}

      {/* Table */}
      {!loading && !error && avaliacoes.length > 0 && (
        <>
          <p style={{ color: '#555', fontSize: '14px', marginBottom: '12px' }}>
            {avaliacoes.length} avaliacao(oes) encontrada(s)
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '14px',
                minWidth: '560px',
              }}
            >
              <thead>
                <tr style={{ backgroundColor: '#f0f0f0', textAlign: 'left' }}>
                  <th style={thStyle}>Modulo</th>
                  <th style={thStyle}>Data</th>
                  <th style={thStyle}>Avaliador</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>Nota Final</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>Resultado</th>
                </tr>
              </thead>
              <tbody>
                {avaliacoes.map((av) => (
                  <tr
                    key={av.id}
                    style={{ borderBottom: '1px solid #e0e0e0' }}
                  >
                    <td style={tdStyle}>
                      {MODULE_LABELS[av.moduleId] || av.moduleId || '—'}
                    </td>
                    <td style={tdStyle}>{av.studentData.data || '—'}</td>
                    <td style={tdStyle}>{av.studentData.avaliador || '—'}</td>
                    <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 'bold' }}>
                      {typeof av.finalScore === 'number' ? av.finalScore.toFixed(2) : '—'}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '3px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          backgroundColor: av.isPassing ? '#d4edda' : '#f8d7da',
                          color: av.isPassing ? '#155724' : '#721c24',
                        }}
                      >
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
      <div style={{ marginTop: '32px', paddingTop: '16px', borderTop: '1px solid #ddd' }}>
        <Link to="/" style={{ fontSize: '14px', color: '#1a1a2e' }}>
          &larr; Voltar ao Portal
        </Link>
      </div>
    </div>
    </PortalLayout>
  )
}

const thStyle = {
  padding: '10px 12px',
  fontWeight: 'bold',
  borderBottom: '2px solid #ccc',
  whiteSpace: 'nowrap',
}

const tdStyle = {
  padding: '8px 12px',
  verticalAlign: 'middle',
}
