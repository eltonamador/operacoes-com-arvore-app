import { useState } from 'react'
import ThemeToggle from '../../components/ThemeToggle'
import { useAuth } from '../../contexts/AuthContext'
import { useQuizEngine } from './hooks/useQuizEngine'
import { saveQuizAttempt } from './services/quizService'
import PinEntry from './screens/PinEntry'
import QuizConfig from './screens/QuizConfig'
import QuizGame from './screens/QuizGame'
import QuizResults from './screens/QuizResults'
import Ranking from './screens/Ranking'

export default function QuizApp() {
  const { user } = useAuth()
  const engine = useQuizEngine()
  const [screen, setScreen] = useState('pin')
  const [studentData, setStudentData] = useState(null)
  const [savedResults, setSavedResults] = useState(null)

  function handlePinValidated(data) {
    setStudentData(data)
    setScreen('config')
  }

  function handleStartQuiz(config) {
    engine.startQuiz(config)
    setScreen('game')
  }

  async function handleQuizFinished() {
    const answers = engine.answers
    const total = engine.totalQuestions
    const acertos = answers.filter(a => a.acertou).length

    const r = {
      totalQuestoes: total,
      acertos,
      erros: answers.filter(a => !a.acertou).length,
      pontuacao: answers.reduce((sum, a) => sum + a.pontos, 0),
      percentual: Math.round((acertos / total) * 10000) / 100,
      tempoTotal: answers.reduce((sum, a) => sum + a.tempo_gasto, 0),
      respostas: answers,
    }

    try {
      await saveQuizAttempt({
        nome_aluno: studentData.nome,
        numero_ordem: studentData.numero_ordem,
        pelotao: studentData.pelotao,
        user_id: user?.id || null,
        nivel: engine.config.nivel,
        total_questoes: r.totalQuestoes,
        tempo_por_questao: engine.config.tempoPorQuestao,
        acertos: r.acertos,
        erros: r.erros,
        pontuacao: r.pontuacao,
        percentual: r.percentual,
        tempo_total: r.tempoTotal,
        respostas: r.respostas,
      })
    } catch (err) {
      console.error('Erro ao salvar tentativa:', err)
    }

    setSavedResults(r)
    setScreen('results')
  }

  function handlePlayAgain() {
    engine.resetQuiz()
    setSavedResults(null)
    setScreen('config')
  }

  function handleNextInGame() {
    if (engine.currentIndex + 1 >= engine.totalQuestions) {
      handleQuizFinished()
    } else {
      engine.nextQuestion()
    }
  }

  if (screen === 'game') {
    return (
      <QuizGame
        currentQuestion={engine.currentQuestion}
        currentIndex={engine.currentIndex}
        totalQuestions={engine.totalQuestions}
        timeLeft={engine.timeLeft}
        answered={engine.answered}
        selectedAnswer={engine.selectedAnswer}
        config={engine.config}
        answers={engine.answers}
        onAnswer={engine.answerQuestion}
        onNext={handleNextInGame}
      />
    )
  }

  return (
    <div className="app-root">
      <ThemeToggle floating />
      {screen === 'pin' && (
        <PinEntry onValidated={handlePinValidated} />
      )}
      {screen === 'config' && (
        <QuizConfig
          studentData={studentData}
          onStart={handleStartQuiz}
          onBack={() => setScreen('pin')}
        />
      )}
      {screen === 'results' && savedResults && (
        <QuizResults
          studentData={studentData}
          results={savedResults}
          onPlayAgain={handlePlayAgain}
          onRanking={() => setScreen('ranking')}
          onBack={() => setScreen('config')}
        />
      )}
      {screen === 'ranking' && (
        <Ranking onBack={() => setScreen('results')} />
      )}
    </div>
  )
}
