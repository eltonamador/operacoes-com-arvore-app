import { useEffect, useState } from 'react'
import ThemeToggle from '../../components/ThemeToggle'
import GroupForm from './screens/GroupForm'
import Evaluation from './screens/Evaluation'
import Signature from './screens/Signature'
import Summary from './screens/Summary'
import Reports from './screens/Reports'
import AdvancedReports from './screens/AdvancedReports'
import {
  fetchAvaliacoesByModulo,
  saveAvaliacoesBatch,
  deleteAvaliacao,
  clearAllAvaliacoes,
} from '../../services/avaliacoesService'
import { usePocoGroupState } from './hooks/usePocoGroupState'

export default function PocoApp() {
  const evaluationState = usePocoGroupState()
  const { state, goTo } = evaluationState

  const [savedEvaluations, setSavedEvaluations] = useState([])
  const [reportsLoading, setReportsLoading] = useState(false)

  useEffect(() => {
    loadEvaluations()
  }, [])

  async function loadEvaluations() {
    try {
      setReportsLoading(true)
      const evaluations = await fetchAvaliacoesByModulo('pocos')
      setSavedEvaluations(evaluations)
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error)
    } finally {
      setReportsLoading(false)
    }
  }

  /**
   * Salva um registro por integrante do grupo.
   * Todos compartilham: nota_final, penalidades, observacoes, itens_avaliados base.
   * Cada registro tem: nome_aluno, numero_ordem e a assinatura individual.
   *
   * @param {Object} dados
   *   .pelotao, .grupoNum, .avaliador, .data
   *   .nota_final, .penalidades, .observacoes
   *   .integrantes   [{ id, nome, extra?, signed, signedAt }]
   *   .itensAvaliados  objeto base dos itens avaliados
   */
  async function saveEvaluation(dados) {
    const records = dados.integrantes.map(m => ({
      nome_aluno: m.nome,
      numero_ordem: String(m.id),
      pelotao: dados.pelotao,
      avaliador: dados.avaliador,
      data_avaliacao: dados.data || new Date().toISOString().slice(0, 10),
      nota_final: dados.nota_final,
      penalidades: dados.penalidades,
      observacoes: dados.observacoes,
      module_id: 'pocos',
      itens_avaliados: {
        ...dados.itensAvaliados,
        assinatura_individual: {
          visto_confirmado: m.signed || false,
          visto_data_hora: m.signedAt || null,
          visto_tipo: 'pin',
        },
        integrante_extra: m.extra || false,
      },
    }))

    const saved = await saveAvaliacoesBatch(records)
    setSavedEvaluations(prev => [...saved, ...prev])
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

  async function clearAllEvaluations() {
    const confirmDelete = window.confirm('Deseja excluir TODAS as avaliações?')
    if (!confirmDelete) return
    try {
      await clearAllAvaliacoes()
      setSavedEvaluations([])
    } catch (error) {
      console.error('Erro ao limpar avaliações:', error)
      alert('Erro ao limpar avaliações.')
    }
  }

  const props = {
    ...evaluationState,
    saveEvaluation,
    savedEvaluations,
    deleteEvaluation,
    clearAllEvaluations,
    loadEvaluations,
    reportsLoading,
  }

  return (
    <div className="app-root">
      <ThemeToggle floating />
      {state.screen === 'form' && (
        <GroupForm
          {...props}
          moduleName="Salvamento em Espaço Confinado — Poço"
          moduleEmoji="🕳️"
        />
      )}
      {state.screen === 'evaluation' && <Evaluation {...props} />}
      {state.screen === 'signature' && <Signature {...props} />}
      {state.screen === 'summary' && <Summary {...props} />}
      {state.screen === 'reports' && <Reports {...props} />}
      {state.screen === 'advanced-reports' && <AdvancedReports {...props} />}
    </div>
  )
}
