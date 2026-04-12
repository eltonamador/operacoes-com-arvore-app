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

function filterButtonStyle(active) {
  return {
    padding: '6px 14px',
    fontSize: '14px',
    cursor: 'pointer',
    border: '1px solid #999',
    borderRadius: '4px',
    backgroundColor: active ? '#333' : '#fff',
    color: active ? '#fff' : '#333',
    fontFamily: 'sans-serif',
  }
}

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
        // Combine and sort by savedAt descending
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
    <PortalLayout title="Área de Coordenação">
    <div style={{ padding: '24px 32px', fontFamily: 'sans-serif' }}>
      <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>
        Consulta consolidada de avaliacoes — somente leitura
      </p>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFiltro(opt.value)}
            style={filterButtonStyle(filtro === opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <p style={{ color: '#888' }}>Carregando avaliacoes...</p>
      )}

      {/* Error */}
      {!loading && error && (
        <p style={{ color: '#c0392b', border: '1px solid #c0392b', padding: '12px', borderRadius: '4px' }}>
          Erro ao carregar dados: {error}
        </p>
      )}

      {/* Empty */}
      {!loading && !error && visíveis.length === 0 && (
        <p style={{ color: '#888' }}>Nenhuma avaliacao encontrada para o filtro selecionado.</p>
      )}

      {/* Table */}
      {!loading && !error && visíveis.length > 0 && (
        <>
          <p style={{ color: '#555', fontSize: '14px', marginBottom: '12px' }}>
            {visíveis.length} avaliacao(oes) exibida(s)
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '14px',
                minWidth: '680px',
              }}
            >
              <thead>
                <tr style={{ backgroundColor: '#f0f0f0', textAlign: 'left' }}>
                  <th style={thStyle}>Aluno</th>
                  <th style={thStyle}>Ordem</th>
                  <th style={thStyle}>Pelotao</th>
                  <th style={thStyle}>Avaliador</th>
                  <th style={thStyle}>Data</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>Nota Final</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>Resultado</th>
                  <th style={thStyle}>Modulo</th>
                </tr>
              </thead>
              <tbody>
                {visíveis.map((av) => (
                  <tr
                    key={av.id}
                    style={{ borderBottom: '1px solid #e0e0e0' }}
                  >
                    <td style={tdStyle}>{av.studentData.nome || '—'}</td>
                    <td style={tdStyle}>{av.studentData.ordem || '—'}</td>
                    <td style={tdStyle}>{av.studentData.pelotao || '—'}</td>
                    <td style={tdStyle}>{av.studentData.avaliador || '—'}</td>
                    <td style={tdStyle}>{av.studentData.data || '—'}</td>
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
                    <td style={tdStyle}>
                      {MODULE_LABELS[av.moduleId] || av.moduleId || '—'}
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
