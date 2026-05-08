import '../styles/quiz-game.css'

export default function QuizGame({
  currentQuestion,
  currentIndex,
  totalQuestions,
  timeLeft,
  answered,
  selectedAnswer,
  config,
  answers,
  onAnswer,
  onNext,
}) {
  const timerClass = timeLeft <= 5
    ? 'qg-timer qg-timer--danger'
    : timeLeft <= 10
      ? 'qg-timer qg-timer--warning'
      : 'qg-timer'

  const totalPoints = answers.reduce((sum, a) => sum + a.pontos, 0)

  const isCorrect = answered && selectedAnswer === currentQuestion.gabarito
  const isTimeout = answered && !selectedAnswer

  function getAltClass(alt, index) {
    const base = `qg-alt-btn qg-alt-btn--${index}`
    if (!answered) return base
    if (alt.letra === currentQuestion.gabarito) return `${base} qg-alt-btn--correct`
    if (alt.letra === selectedAnswer && alt.letra !== currentQuestion.gabarito) return `${base} qg-alt-btn--wrong`
    return `${base} qg-alt-btn--dimmed`
  }

  const lastAnswer = answered ? answers[answers.length - 1] : null

  return (
    <div className="qg-wrapper">
      <div className="qg-header">
        <span className="qg-progress">{currentIndex + 1}/{totalQuestions}</span>
        <span className={`qg-level-badge qg-level-badge--${currentQuestion.nivel}`}>
          {currentQuestion.nivel}
        </span>
        <div className={timerClass}>{timeLeft}</div>
      </div>

      <div className="qg-score-bar">
        {totalPoints} pontos
      </div>

      <div className="qg-question">
        <p className="qg-enunciado">{currentQuestion.enunciado}</p>
      </div>

      <div className="qg-alternatives">
        {currentQuestion.alternativas.map((alt, i) => (
          <button
            key={alt.letra}
            className={getAltClass(alt, i)}
            onClick={() => onAnswer(alt.letra)}
            disabled={answered}
          >
            <span className="qg-alt-letra">{alt.letra}</span>
            <span>{alt.texto}</span>
          </button>
        ))}
      </div>

      {answered && (
        <div className="qg-feedback">
          <div className={`qg-feedback-card qg-feedback-card--${isCorrect ? 'correct' : isTimeout ? 'timeout' : 'wrong'}`}>
            <p className="qg-feedback-title">
              {isCorrect ? 'Correto!' : isTimeout ? 'Tempo esgotado!' : 'Incorreto!'}
              {!isCorrect && ` Resposta: ${currentQuestion.gabarito}`}
            </p>
            <p className="qg-feedback-justificativa">{currentQuestion.justificativa}</p>
            {lastAnswer && lastAnswer.pontos > 0 && (
              <p className="qg-feedback-points">+{lastAnswer.pontos} pontos</p>
            )}
          </div>
        </div>
      )}

      {answered && (
        <div className="qg-next-bar">
          <button className="qg-next-btn" onClick={onNext}>
            {currentIndex + 1 >= totalQuestions ? 'Ver Resultado' : 'Próxima'}
          </button>
        </div>
      )}
    </div>
  )
}
