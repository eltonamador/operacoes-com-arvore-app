import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Evaluation({ state, goTo, setTheoricaScore, setObservations }) {
  const navigate = useNavigate()
  const [nota, setNota] = useState(state.theoricaScore ?? '')
  const [obs, setObs] = useState(state.observations || '')

  const notaNum = parseFloat(nota)
  const isValidNota = !isNaN(notaNum) && notaNum >= 0 && notaNum <= 10
  const isPassing = isValidNota && notaNum >= 7.0

  function handleNotaChange(e) {
    const val = e.target.value
    setNota(val)
    if (setTheoricaScore) {
      const num = parseFloat(val)
      setTheoricaScore(isNaN(num) ? null : num)
    }
  }

  function handleObsChange(e) {
    setObs(e.target.value)
    if (setObservations) setObservations(e.target.value)
  }

  function handleContinue() {
    if (!isValidNota) return
    goTo('signature')
  }

  return (
    <div className="screen-container">
      <header className="header">
        <div className="header-emblem">📝</div>
        <div className="header-titles">
          <span className="header-org">CBMAP — CFSD-26</span>
          <span className="header-title">Prova Teórica — Lançamento de Nota</span>
          <span className="header-subtitle" style={{ color: 'var(--gold)', fontWeight: 600 }}>
            {state.studentData.nome || '—'} &nbsp;|&nbsp; Ord. {state.studentData.ordem || '—'} &nbsp;|&nbsp; {state.studentData.pelotao || '—'}
          </span>
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
            onClick={() => goTo('form')}
          >
            Nova Ficha
          </button>
        </div>
      </header>

      <div className="eval-layout">
        <div className="eval-left" style={{ maxWidth: 600, margin: '0 auto', width: '100%' }}>
          <div className="card" style={{ borderRadius: 12 }}>
            <div className="card-label">Prova Teórica</div>
            <h2 className="card-title" style={{ marginBottom: '20px' }}>
              Nota da Prova Teórica
            </h2>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">Nota (0 a 10)</label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.01"
                value={nota}
                onChange={handleNotaChange}
                placeholder="Ex: 8.50"
                className="form-input"
                style={{ fontSize: 20, fontWeight: 700, textAlign: 'center' }}
              />
              {nota !== '' && !isValidNota && (
                <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 6 }}>
                  Informe um valor entre 0 e 10.
                </p>
              )}
            </div>

            {isValidNota && (
              <div
                className="result-banner"
                style={{
                  background: isPassing ? 'var(--success-bg)' : 'var(--danger-bg)',
                  border: `1px solid ${isPassing ? 'var(--success-border)' : 'var(--danger-border)'}`,
                  marginBottom: '20px',
                }}
              >
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Resultado
                </div>
                <div
                  className="score-final-value"
                  style={{ color: isPassing ? 'var(--success)' : 'var(--danger)' }}
                >
                  {notaNum.toFixed(2).replace('.', ',')}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: isPassing ? 'var(--success)' : 'var(--danger)',
                    marginTop: 4,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                >
                  {isPassing ? 'APROVADO' : 'REPROVADO'}
                </div>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">Observações (opcional)</label>
              <textarea
                value={obs}
                onChange={handleObsChange}
                placeholder="Observações sobre a prova..."
                rows={3}
                className="form-input"
                style={{ resize: 'vertical' }}
              />
            </div>

            <button
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              disabled={!isValidNota}
              onClick={handleContinue}
            >
              Prosseguir para Ciência do Aluno
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
