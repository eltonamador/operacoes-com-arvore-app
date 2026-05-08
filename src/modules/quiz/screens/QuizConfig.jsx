import { useState } from 'react'
import allQuestions from '../data/questions.json'

const QUESTION_COUNTS = [10, 20, 30, 'todas']
const LEVELS = [
  { value: 'misturado', label: 'Misturado' },
  { value: 'basico', label: 'Básico' },
  { value: 'intermediario', label: 'Intermediário' },
  { value: 'avancado', label: 'Avançado' },
]
const TIMES = [30, 45, 60]

export default function QuizConfig({ studentData, onStart, onBack }) {
  const [totalQuestoes, setTotalQuestoes] = useState(10)
  const [nivel, setNivel] = useState('misturado')
  const [tempoPorQuestao, setTempoPorQuestao] = useState(45)

  const availableCount = nivel === 'misturado'
    ? allQuestions.length
    : allQuestions.filter(q => q.nivel === nivel).length

  function handleStart() {
    onStart({
      totalQuestoes: totalQuestoes === 'todas' ? availableCount : totalQuestoes,
      nivel,
      tempoPorQuestao,
    })
  }

  return (
    <div className="quiz-container">
      <div className="quiz-card">
        <h2 className="quiz-card-title">Configurar Quiz</h2>
        <p className="quiz-card-subtitle">
          {studentData.nome}
        </p>

        <div className="quiz-config-section">
          <label className="quiz-label">Quantidade de questões</label>
          <div className="quiz-option-group">
            {QUESTION_COUNTS.map(count => {
              const label = count === 'todas' ? `Todas (${availableCount})` : count
              const disabled = count !== 'todas' && count > availableCount
              return (
                <button
                  key={count}
                  className={`quiz-option-btn${totalQuestoes === count ? ' quiz-option-btn--active' : ''}`}
                  onClick={() => setTotalQuestoes(count)}
                  disabled={disabled}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="quiz-config-section">
          <label className="quiz-label">Nível</label>
          <div className="quiz-option-group">
            {LEVELS.map(l => (
              <button
                key={l.value}
                className={`quiz-option-btn${nivel === l.value ? ' quiz-option-btn--active' : ''}`}
                onClick={() => setNivel(l.value)}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <div className="quiz-config-section">
          <label className="quiz-label">Tempo por questão</label>
          <div className="quiz-option-group">
            {TIMES.map(t => (
              <button
                key={t}
                className={`quiz-option-btn${tempoPorQuestao === t ? ' quiz-option-btn--active' : ''}`}
                onClick={() => setTempoPorQuestao(t)}
              >
                {t}s
              </button>
            ))}
          </div>
        </div>

        <button className="btn btn-primary btn-lg" onClick={handleStart}>
          Começar
        </button>
        <button className="btn btn-ghost" style={{ marginTop: 8, width: '100%' }} onClick={onBack}>
          Voltar
        </button>
      </div>
    </div>
  )
}
