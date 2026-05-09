import { useState, useRef } from 'react'
import studentsData from '../../shared/data/students.json'

const students = studentsData?.students || []

export default function PinEntry({ onValidated }) {
  const [step, setStep] = useState('id')
  const [numeroOrdem, setNumeroOrdem] = useState('')
  const [foundStudent, setFoundStudent] = useState(null)
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [locked, setLocked] = useState(false)
  const lockTimerRef = useRef(null)

  function handleIdSubmit(e) {
    e.preventDefault()
    const trimmed = numeroOrdem.trim()
    const found = students.find(s => String(s.numero) === trimmed)
    if (!found) {
      setError('Nº de Ordem não encontrado. Verifique e tente novamente.')
      return
    }
    setError('')
    setFoundStudent(found)
    setStep('pin')
  }

  function handlePinSubmit(e) {
    e.preventDefault()
    if (locked) return

    if (pin !== String(foundStudent.pin)) {
      const next = attempts + 1
      setAttempts(next)
      if (next >= 3) {
        setLocked(true)
        setError('Muitas tentativas incorretas. Aguarde 60 segundos.')
        lockTimerRef.current = setTimeout(() => {
          setLocked(false)
          setAttempts(0)
          setError('')
        }, 60000)
      } else {
        setError(`PIN inválido. Tentativa ${next}/3.`)
      }
      setPin('')
      return
    }

    setError('')
    onValidated({
      nome: foundStudent.nome,
      numero_ordem: foundStudent.numero,
      pelotao: foundStudent.pelotao,
    })
  }

  function handleBackToId() {
    setStep('id')
    setFoundStudent(null)
    setPin('')
    setError('')
    setAttempts(0)
    setLocked(false)
    clearTimeout(lockTimerRef.current)
  }

  return (
    <div className="quiz-container">
      <div className="quiz-card">
        <h2 className="quiz-card-title">Quiz Teórico</h2>
        <p className="quiz-card-subtitle">Salvamento Terrestre — CFSD-26</p>

        {step === 'id' && (
          <form onSubmit={handleIdSubmit}>
            <label className="quiz-label">Nº de Ordem / ID</label>
            <input
              type="text"
              inputMode="numeric"
              className="quiz-pin-input"
              value={numeroOrdem}
              onChange={e => setNumeroOrdem(e.target.value.replace(/\D/g, ''))}
              placeholder="Ex: 42"
              autoFocus
            />
            {error && <p className="quiz-error">{error}</p>}
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={!numeroOrdem.trim()}
            >
              Continuar
            </button>
          </form>
        )}

        {step === 'pin' && foundStudent && (
          <form onSubmit={handlePinSubmit}>
            <div className="quiz-welcome" style={{ marginBottom: 16 }}>
              <p className="quiz-welcome-label">Aluno identificado</p>
              <h3 className="quiz-welcome-name">{foundStudent.nome}</h3>
              <p className="quiz-welcome-info">
                {foundStudent.pelotao} &middot; Nº {foundStudent.numero}
              </p>
            </div>
            <label className="quiz-label">Insira seu PIN</label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              className="quiz-pin-input"
              value={pin}
              onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="****"
              disabled={locked}
              autoFocus
            />
            {error && <p className="quiz-error">{error}</p>}
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={pin.length !== 4 || locked}
            >
              Entrar
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              style={{ marginTop: 8, width: '100%' }}
              onClick={handleBackToId}
            >
              Voltar
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
