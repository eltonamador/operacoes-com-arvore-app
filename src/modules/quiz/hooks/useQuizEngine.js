import { useState, useCallback, useRef, useEffect } from 'react'
import allQuestions from '../data/questions.json'

const POINTS = {
  basico: { base: 100, bonus: 50 },
  intermediario: { base: 150, bonus: 75 },
  avancado: { base: 200, bonus: 100 },
}

function shuffle(arr) {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function prepareQuestions(config) {
  let pool = [...allQuestions]

  if (config.nivel !== 'misturado') {
    pool = pool.filter(q => q.nivel === config.nivel)
  }

  pool = shuffle(pool)

  if (config.totalQuestoes !== 'todas' && config.totalQuestoes < pool.length) {
    pool = pool.slice(0, config.totalQuestoes)
  }

  return pool.map(q => ({
    ...q,
    alternativas: shuffle(q.alternativas),
  }))
}

export function useQuizEngine() {
  const [phase, setPhase] = useState('idle')
  const [config, setConfig] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState([])
  const [timeLeft, setTimeLeft] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const timerRef = useRef(null)
  const questionStartRef = useRef(null)

  const currentQuestion = questions[currentIndex] || null
  const totalQuestions = questions.length

  function startQuiz(quizConfig) {
    const prepared = prepareQuestions(quizConfig)
    setConfig(quizConfig)
    setQuestions(prepared)
    setCurrentIndex(0)
    setAnswers([])
    setAnswered(false)
    setSelectedAnswer(null)
    setTimeLeft(quizConfig.tempoPorQuestao)
    questionStartRef.current = Date.now()
    setPhase('playing')
  }

  useEffect(() => {
    if (phase !== 'playing' || answered) {
      clearInterval(timerRef.current)
      return
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          handleTimeout()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timerRef.current)
  }, [phase, currentIndex, answered])

  function handleTimeout() {
    const elapsed = config.tempoPorQuestao
    setAnswered(true)
    setSelectedAnswer(null)
    setAnswers(prev => [...prev, {
      questao_id: currentQuestion.id,
      nivel: currentQuestion.nivel,
      resposta_marcada: null,
      resposta_correta: currentQuestion.gabarito,
      acertou: false,
      tempo_gasto: elapsed,
      pontos: 0,
    }])
  }

  const answerQuestion = useCallback((letra) => {
    if (answered || !currentQuestion) return

    clearInterval(timerRef.current)
    const elapsed = Math.round((Date.now() - questionStartRef.current) / 1000)
    const isCorrect = letra === currentQuestion.gabarito
    let pontos = 0

    if (isCorrect) {
      const pts = POINTS[currentQuestion.nivel] || POINTS.basico
      pontos = pts.base
      if (elapsed < config.tempoPorQuestao / 2) {
        pontos += pts.bonus
      }
    }

    setAnswered(true)
    setSelectedAnswer(letra)
    setAnswers(prev => [...prev, {
      questao_id: currentQuestion.id,
      nivel: currentQuestion.nivel,
      resposta_marcada: letra,
      resposta_correta: currentQuestion.gabarito,
      acertou: isCorrect,
      tempo_gasto: elapsed,
      pontos,
    }])
  }, [answered, currentQuestion, config])

  function nextQuestion() {
    if (currentIndex + 1 >= totalQuestions) {
      setPhase('finished')
      return
    }
    setCurrentIndex(prev => prev + 1)
    setAnswered(false)
    setSelectedAnswer(null)
    setTimeLeft(config.tempoPorQuestao)
    questionStartRef.current = Date.now()
  }

  function resetQuiz() {
    clearInterval(timerRef.current)
    setPhase('idle')
    setConfig(null)
    setQuestions([])
    setCurrentIndex(0)
    setAnswers([])
    setAnswered(false)
    setSelectedAnswer(null)
    setTimeLeft(0)
  }

  const results = phase === 'finished' ? {
    totalQuestoes: totalQuestions,
    acertos: answers.filter(a => a.acertou).length,
    erros: answers.filter(a => !a.acertou).length,
    pontuacao: answers.reduce((sum, a) => sum + a.pontos, 0),
    percentual: Math.round((answers.filter(a => a.acertou).length / totalQuestions) * 100 * 100) / 100,
    tempoTotal: answers.reduce((sum, a) => sum + a.tempo_gasto, 0),
    respostas: answers,
  } : null

  return {
    phase,
    config,
    currentQuestion,
    currentIndex,
    totalQuestions,
    timeLeft,
    answered,
    selectedAnswer,
    answers,
    results,
    startQuiz,
    answerQuestion,
    nextQuestion,
    resetQuiz,
  }
}
