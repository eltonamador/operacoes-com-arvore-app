import { useState, useRef } from 'react'
import studentsData from '../../shared/data/students.json'

const students = studentsData?.students || []

export default function PinEntry({ onValidated }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [student, setStudent] = useState(null)
  const [attempts, setAttempts] = useState(0)
  const [locked, setLocked] = useState(false)
  const lockTimerRef = useRef(null)

  function handleSubmit(e) {
    e.preventDefault()
    if (locked) return

    const found = students.find(s => s.pin === pin)
    if (!found) {
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
      return
    }

    setError('')
    setStudent(found)
  }

  function handleStart() {
    if (student) {
      onValidated({
        nome: student.nome,
        numero_ordem: student.numero,
        pelotao: student.pelotao,
        pin,
      })
    }
  }

  if (student) {
    return (
      <div className="quiz-container">
        <div className="quiz-card">
          <div className="quiz-welcome">
            <p className="quiz-welcome-label">Bem-vindo(a)!</p>
            <h2 className="quiz-welcome-name">{student.nome}</h2>
            <p className="quiz-welcome-info">{student.pelotao} &middot; Nº {student.numero}</p>
          </div>
          <button className="btn btn-primary btn-lg" onClick={handleStart}>
            Iniciar Quiz
          </button>
          <button
            className="btn btn-ghost"
            style={{ marginTop: 8, width: '100%' }}
            onClick={() => { setStudent(null); setPin('') }}
          >
            Trocar PIN
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="quiz-container">
      <div className="quiz-card">
        <h2 className="quiz-card-title">Quiz Teórico</h2>
        <p className="quiz-card-subtitle">
          Salvamento Terrestre — CFSD-26
        </p>
        <form onSubmit={handleSubmit}>
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
            Validar
          </button>
        </form>
      </div>
    </div>
  )
}
