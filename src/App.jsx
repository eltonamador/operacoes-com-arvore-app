import { useState } from 'react'
import { calcScore } from './data/penalties'
import StudentForm from './screens/StudentForm'
import Evaluation from './screens/Evaluation'
import Signature from './screens/Signature'
import Summary from './screens/Summary'
import Reports from './screens/Reports'

const STORAGE_KEY = 'cfsd2026_avaliacoes'

function loadSaved() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

const initialEval = {
  studentData: { nome: '', ordem: '', data: '', pelotao: '', avaliador: '' },
  checkedItems: new Set(),
  criticalErrors: false,
  observations: '',
  customError: { description: '', discount: '' },
  signatureDataUrl: null,
  screen: 'form',
}

export default function App() {
  const [state, setState] = useState(initialEval)
  const [savedEvaluations, setSavedEvaluations] = useState(loadSaved)

  function updateStudentData(data) {
    setState(s => ({ ...s, studentData: data }))
  }

  function toggleItem(id) {
    setState(s => {
      const next = new Set(s.checkedItems)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return { ...s, checkedItems: next }
    })
  }

  function setCriticalErrors(val) {
    setState(s => ({ ...s, criticalErrors: val }))
  }

  function setObservations(val) {
    setState(s => ({ ...s, observations: val }))
  }

  function setCustomError(val) {
    setState(s => ({ ...s, customError: val }))
  }

  function setSignature(dataUrl) {
    setState(s => ({ ...s, signatureDataUrl: dataUrl }))
  }

  function goTo(screen) {
    setState(s => ({ ...s, screen }))
  }

  function reset() {
    setState(initialEval)
  }

  function saveEvaluation() {
    const customDiscount = parseFloat(state.customError?.discount) || 0
    const { totalDiscount, finalScore } = calcScore(state.checkedItems, customDiscount)
    const record = {
      id: Date.now(),
      savedAt: new Date().toISOString(),
      studentData: { ...state.studentData },
      checkedItems: [...state.checkedItems],
      criticalErrors: state.criticalErrors,
      observations: state.observations,
      customError: { ...state.customError },
      signatureDataUrl: state.signatureDataUrl,
      totalDiscount,
      finalScore,
      isPassing: finalScore >= 7.0 && !state.criticalErrors,
    }
    const next = [...savedEvaluations, record]
    setSavedEvaluations(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setState(s => ({ ...s, screen: 'reports' }))
  }

  function deleteEvaluation(id) {
    const next = savedEvaluations.filter(e => e.id !== id)
    setSavedEvaluations(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  function clearAllEvaluations() {
    setSavedEvaluations([])
    localStorage.removeItem(STORAGE_KEY)
  }

  const props = {
    state,
    updateStudentData, toggleItem, setCriticalErrors,
    setObservations, setCustomError, setSignature,
    goTo, reset, saveEvaluation,
    savedEvaluations, deleteEvaluation, clearAllEvaluations,
  }

  return (
    <div className="app-root">
      {state.screen === 'form' && <StudentForm {...props} />}
      {state.screen === 'evaluation' && <Evaluation {...props} />}
      {state.screen === 'signature' && <Signature {...props} />}
      {state.screen === 'summary' && <Summary {...props} />}
      {state.screen === 'reports' && <Reports {...props} />}
    </div>
  )
}
