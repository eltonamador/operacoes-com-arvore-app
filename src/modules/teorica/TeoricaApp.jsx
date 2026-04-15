import { useEffect, useState } from 'react'
import ThemeToggle from '../../components/ThemeToggle'
import StudentForm from '../shared/screens/StudentForm'
import Evaluation from './screens/Evaluation'
import Signature from './screens/Signature'
import Summary from './screens/Summary'
import Reports from './screens/Reports'
import {
  fetchAvaliacoesByModulo,
  saveAvaliacao,
  deleteAvaliacao,
} from '../../services/avaliacoesService'
import { useEvaluationState } from '../shared/hooks/useEvaluationState'

export default function TeoricaApp() {
  const evaluationState = useEvaluationState()
  const { state, goTo, reset } = evaluationState

  const [savedEvaluations, setSavedEvaluations] = useState([])
  const [reportsLoading, setReportsLoading] = useState(false)

  useEffect(() => {
    loadEvaluations()
  }, [])

  async function loadEvaluations() {
    try {
      setReportsLoading(true)
      const evaluations = await fetchAvaliacoesByModulo('teorica')
      setSavedEvaluations(evaluations)
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error)
    } finally {
      setReportsLoading(false)
    }
  }

  async function saveEvaluation(dadosAvaliacao) {
    const saved = await saveAvaliacao({ ...dadosAvaliacao, module_id: 'teorica' })
    setSavedEvaluations(prev => [saved, ...prev])
    goTo('reports')
    return saved
  }

  async function deleteEvaluation(id) {
    const confirmDelete = window.confirm('Deseja excluir esta avaliação?')
    if (!confirmDelete) return

    try {
      await deleteAvaliacao(id)
      setSavedEvaluations(prev => prev.filter(e => e.id !== id))
    } catch (error) {
      console.error('Erro ao excluir avaliação:', error)
      alert('Erro ao excluir avaliação no banco de dados.')
    }
  }

  const props = {
    ...evaluationState,
    saveEvaluation,
    savedEvaluations,
    deleteEvaluation,
    loadEvaluations,
    reportsLoading,
  }

  return (
    <div className="app-root">
      <ThemeToggle floating />
      {state.screen === 'form' && <StudentForm {...props} moduleName="Prova Teórica" moduleEmoji="📝" />}
      {state.screen === 'evaluation' && <Evaluation {...props} />}
      {state.screen === 'signature' && <Signature {...props} />}
      {state.screen === 'summary' && <Summary {...props} />}
      {state.screen === 'reports' && <Reports {...props} />}
    </div>
  )
}
