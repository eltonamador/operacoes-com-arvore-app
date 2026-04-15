import { useState } from 'react'

const initialEval = {
  studentData: { nome: '', ordem: '', data: '', pelotao: '', avaliador: '' },
  checkedItems: new Set(),
  criticalErrors: false,
  observations: '',
  customError: { description: '', discount: '' },
  signatureDataUrl: null,
  vistoConfirmado: false,
  vistoPinConfirmado: false,
  vistoDataHora: null,
  declaracaoCiencia: false,
  vistoTipo: '',
  theoricaScore: null,
  screen: 'form',
}

export function useEvaluationState() {
  const [state, setState] = useState(initialEval)

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

  function setVistoConfirmado(val) {
    setState(s => ({ ...s, vistoConfirmado: val }))
  }

  function setVistoNomeConfirmacao(val) {
    setState(s => ({ ...s, vistoNomeConfirmacao: val }))
  }

  function setDeclaracaoCiencia(val) {
    setState(s => ({ ...s, declaracaoCiencia: val }))
  }

  function confirmarVisto() {
    setState(s => ({
      ...s,
      vistoConfirmado: true,
      vistoDataHora: new Date().toISOString(),
    }))
  }

  function setVistoData(data) {
    setState(s => ({ ...s, ...data }))
  }

  function setTheoricaScore(val) {
    setState(s => ({ ...s, theoricaScore: val }))
  }

  function goTo(screen) {
    setState(s => ({ ...s, screen }))
  }

  function reset() {
    setState(initialEval)
  }

  return {
    state,
    updateStudentData,
    toggleItem,
    setCriticalErrors,
    setObservations,
    setCustomError,
    setVistoConfirmado,
    setVistoNomeConfirmacao,
    setDeclaracaoCiencia,
    confirmarVisto,
    setVistoData,
    setTheoricaScore,
    goTo,
    reset,
  }
}
