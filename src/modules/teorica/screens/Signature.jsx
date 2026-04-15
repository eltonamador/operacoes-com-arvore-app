import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import studentsData from '../../shared/data/students.json'

export default function Signature({ state, goTo, setVistoData }) {
  const navigate = useNavigate()
  const [pinDigitado, setPinDigitado] = useState('')
  const [ciencia, setCiencia] = useState(state.declaracaoCiencia || false)
  const [erroPin, setErroPin] = useState('')
  const [tentativas, setTentativas] = useState(0)
  const [bloqueadoAte, setBloqueadoAte] = useState(null)

  const { studentData, theoricaScore, observations } = state
  const notaNum = parseFloat(theoricaScore)
  const isValidNota = !isNaN(notaNum) && notaNum >= 0 && notaNum <= 10
  const isPassing = isValidNota && notaNum >= 7.0

  const students = studentsData?.students || []
  const alunoAtual = students.find(
    student => String(student.numero) === String(studentData.ordem)
  )
  const pinEsperado = alunoAtual
    ? String(alunoAtual.pin || String(alunoAtual.numero).padStart(4, '0'))
    : String(studentData.ordem || '').padStart(4, '0')

  const bloqueado = bloqueadoAte && Date.now() < bloqueadoAte

  const canConfirm =
    ciencia &&
    pinDigitado.trim().length === 4 &&
    /^\d{4}$/.test(pinDigitado) &&
    !bloqueado

  function confirmarVisto() {
    if (bloqueado) {
      setErroPin('Muitas tentativas inválidas. Aguarde 30 segundos.')
      return
    }
    if (!canConfirm) return

    if (pinDigitado !== pinEsperado) {
      const novasTentativas = tentativas + 1
      setTentativas(novasTentativas)
      setErroPin('PIN inválido.')
      if (novasTentativas >= 3) {
        setBloqueadoAte(Date.now() + 30000)
        setErroPin('Muitas tentativas inválidas. Aguarde 30 segundos.')
        setTentativas(0)
      }
      return
    }

    setErroPin('')
    setVistoData({
      vistoConfirmado: true,
      vistoPinConfirmado: true,
      vistoNomeConfirmacao: studentData.nome,
      vistoDataHora: new Date().toISOString(),
      declaracaoCiencia: ciencia,
      vistoTipo: 'pin',
    })
    goTo('summary')
  }

  return (
    <div className="screen-container">
      <header className="header">
        <div className="header-emblem">📝</div>
        <div className="header-titles">
          <span className="header-org">CBMAP — CFSD-26</span>
          <span className="header-title">Ciência do Aluno — Prova Teórica</span>
          <span className="header-subtitle" style={{ color: 'var(--gold)', fontWeight: 600 }}>
            {studentData.nome || '—'} &nbsp;|&nbsp; Ord. {studentData.ordem || '—'}
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
            onClick={() => goTo('evaluation')}
          >
            Voltar
          </button>
        </div>
      </header>

      <div className="eval-layout">
        <div className="eval-left" style={{ maxWidth: 600, margin: '0 auto', width: '100%' }}>
          <div className="card" style={{ borderRadius: 12 }}>
            {/* Resultado */}
            <div
              className="result-banner"
              style={{
                background: isPassing ? 'var(--success-bg)' : 'var(--danger-bg)',
                border: `1px solid ${isPassing ? 'var(--success-border)' : 'var(--danger-border)'}`,
                marginBottom: '20px',
              }}
            >
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Nota</div>
              <div
                className="score-final-value"
                style={{ color: isPassing ? 'var(--success)' : 'var(--danger)' }}
              >
                {isValidNota ? notaNum.toFixed(2).replace('.', ',') : '—'}
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

            {/* Declaração de ciência */}
            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                marginBottom: '20px',
                cursor: 'pointer',
                fontSize: 14,
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
              }}
            >
              <input
                type="checkbox"
                checked={ciencia}
                onChange={e => setCiencia(e.target.checked)}
                style={{ marginTop: 3, flexShrink: 0, width: 18, height: 18, cursor: 'pointer' }}
              />
              <span>
                Declaro que tomei ciência do resultado da Prova Teórica e confirmo ser o(a)
                aluno(a) identificado(a) acima.
              </span>
            </label>

            {/* PIN */}
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">Digite seu PIN (4 dígitos)</label>
              <input
                type="password"
                maxLength={4}
                value={pinDigitado}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 4)
                  setPinDigitado(val)
                  setErroPin('')
                }}
                placeholder="••••"
                disabled={bloqueado}
                className="form-input"
                style={{ fontSize: 20, fontWeight: 700, textAlign: 'center', letterSpacing: 8 }}
              />
              {erroPin && (
                <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 6 }}>
                  {erroPin}
                </p>
              )}
            </div>

            <button
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              disabled={!canConfirm}
              onClick={confirmarVisto}
            >
              Confirmar Ciência e Prosseguir
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
