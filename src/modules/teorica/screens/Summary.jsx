import { useNavigate } from 'react-router-dom'

export default function Summary({ state, reset, goTo, saveEvaluation }) {
  const navigate = useNavigate()
  const {
    studentData,
    theoricaScore,
    observations,
    vistoConfirmado,
    vistoNomeConfirmacao,
    vistoDataHora,
    declaracaoCiencia,
  } = state

  const notaNum = parseFloat(theoricaScore)
  const isValidNota = !isNaN(notaNum) && notaNum >= 0 && notaNum <= 10
  const finalScore = isValidNota ? notaNum : 0
  const isPassing = finalScore >= 7.0

  function formatDate(dateStr) {
    if (!dateStr) return '—'
    const [y, m, d] = dateStr.split('-')
    return `${d}/${m}/${y}`
  }

  function formatDateTime(dateStr) {
    if (!dateStr) return '—'
    const date = new Date(dateStr)
    return date.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
  }

  async function handleSaveEvaluation() {
    try {
      const dadosAvaliacao = {
        nome_aluno: studentData.nome || '',
        numero_ordem: studentData.ordem || '',
        pelotao: studentData.pelotao || '',
        avaliador: studentData.avaliador || '',
        data_avaliacao: studentData.data || new Date().toISOString().slice(0, 10),
        nota_final: Number(finalScore.toFixed(2)),
        penalidades: 0,
        observacoes: observations || '',
        itens_avaliados: {
          resultado: isPassing ? 'APROVADO' : 'REPROVADO',
          tipo_prova: 'teorica',
          nota_teorica: Number(finalScore.toFixed(2)),
          visto_confirmado: vistoConfirmado || false,
          visto_data_hora: vistoDataHora || null,
          visto_nome_confirmacao: vistoNomeConfirmacao || '',
          declaracao_ciencia: declaracaoCiencia || false,
          visto_tipo: state.vistoTipo || '',
          visto_pin_confirmado: state.vistoPinConfirmado || false,
        },
      }

      await saveEvaluation(dadosAvaliacao)
      alert('Avaliação salva com sucesso.')
      reset()
      goTo('reports')
    } catch (error) {
      console.error(error)
      alert('Erro ao salvar avaliação.')
    }
  }

  return (
    <div className="screen-container">
      <header className="header no-print">
        <div className="header-emblem">📝</div>
        <div className="header-titles">
          <span className="header-org">CBMAP — CFSD-26</span>
          <span className="header-title">Resultado — Prova Teórica</span>
          <span className="header-subtitle">Resumo Final — CFSD 2026</span>
        </div>
        <div className="header-spacer" />
        <div className="header-actions">
          <button
            className="btn btn-secondary"
            style={{ fontSize: 13, padding: '10px 18px', minHeight: 44 }}
            onClick={() => navigate('/avaliador')}
          >
            Voltar ao Portal
          </button>
          <button
            className="btn btn-secondary"
            style={{ fontSize: 13, padding: '10px 18px', minHeight: 44 }}
            onClick={() => goTo('evaluation')}
          >
            Voltar
          </button>
        </div>
      </header>

      <div className="eval-layout">
        <div className="eval-left" style={{ maxWidth: 600, margin: '0 auto', width: '100%' }}>
          <div className="card" style={{ borderRadius: 12 }}>
            {/* Dados do aluno */}
            <div style={{ marginBottom: '20px' }}>
              <p className="card-label">Dados do Aluno</p>
              <div className="summary-data-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="summary-data-item">
                  <div className="summary-data-label">Nome</div>
                  <div className="summary-data-value">{studentData.nome || '—'}</div>
                </div>
                <div className="summary-data-item">
                  <div className="summary-data-label">Ordem</div>
                  <div className="summary-data-value">{studentData.ordem || '—'}</div>
                </div>
                <div className="summary-data-item">
                  <div className="summary-data-label">Pelotão</div>
                  <div className="summary-data-value">{studentData.pelotao || '—'}</div>
                </div>
                <div className="summary-data-item">
                  <div className="summary-data-label">Data</div>
                  <div className="summary-data-value">{formatDate(studentData.data)}</div>
                </div>
                <div className="summary-data-item" style={{ gridColumn: '1 / -1' }}>
                  <div className="summary-data-label">Avaliador</div>
                  <div className="summary-data-value">{studentData.avaliador || '—'}</div>
                </div>
              </div>
            </div>

            {/* Resultado */}
            <div
              className="result-banner"
              style={{
                background: isPassing ? 'var(--success-bg)' : 'var(--danger-bg)',
                border: `1px solid ${isPassing ? 'var(--success-border)' : 'var(--danger-border)'}`,
                marginBottom: '20px',
              }}
            >
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
                Nota Final
              </div>
              <div
                className="score-final-value"
                style={{ color: isPassing ? 'var(--success)' : 'var(--danger)' }}
              >
                {finalScore.toFixed(2).replace('.', ',')}
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: isPassing ? 'var(--success)' : 'var(--danger)',
                  marginTop: 6,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                {isPassing ? 'APROVADO' : 'REPROVADO'}
              </div>
            </div>

            {/* Observações */}
            {observations && (
              <div style={{ marginBottom: '20px' }}>
                <p className="card-label">Observações</p>
                <p style={{ margin: 0, fontSize: 14, color: 'var(--text-primary)' }}>
                  {observations}
                </p>
              </div>
            )}

            {/* Ciência */}
            {vistoConfirmado && (
              <div
                className="status-info"
                style={{ marginBottom: '20px' }}
              >
                <div><strong>Ciência confirmada por:</strong> {vistoNomeConfirmacao || '—'}</div>
                <div><strong>Data/Hora:</strong> {formatDateTime(vistoDataHora)}</div>
              </div>
            )}

            <button
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              onClick={handleSaveEvaluation}
            >
              Salvar Avaliação
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
