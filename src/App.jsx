import { useEffect, useState } from 'react'
import StudentForm from './screens/StudentForm'
import Evaluation from './screens/Evaluation'
import Signature from './screens/Signature'
import Summary from './screens/Summary'
import Reports from './screens/Reports'
import { supabase } from './lib/supabase'

const initialEval = {
  studentData: { nome: '', ordem: '', data: '', pelotao: '', avaliador: '' },
  checkedItems: new Set(),
  criticalErrors: false,
  observations: '',
  customError: { description: '', discount: '' },
  vistoConfirmado: false,
  vistoNomeConfirmacao: '',
  vistoDataHora: null,
  declaracaoCiencia: false,
  screen: 'form',
}

function mapDbEvaluationToUi(row) {
  return {
    id: row.id,
    savedAt: row.created_at,
    studentData: {
      nome: row.nome_aluno || '',
      ordem: row.numero_ordem || '',
      data: row.data_avaliacao || '',
      pelotao: row.pelotao || '',
      avaliador: row.avaliador || '',
    },
    checkedItems: row.itens_avaliados?.itens_penalizados?.map(item => item.id) || [],
    criticalErrors: row.itens_avaliados?.erros_criticos || false,
    observations: row.observacoes || '',
    customError: row.itens_avaliados?.erro_nao_previsto
      ? {
          description: row.itens_avaliados.erro_nao_previsto.descricao || '',
          discount: row.itens_avaliados.erro_nao_previsto.desconto || '',
        }
      : { description: '', discount: '' },
    vistoConfirmado: row.itens_avaliados?.visto_confirmado || false,
    vistoNomeConfirmacao: row.itens_avaliados?.visto_nome_confirmacao || '',
    vistoDataHora: row.itens_avaliados?.visto_data_hora || null,
    declaracaoCiencia: row.itens_avaliados?.declaracao_ciencia || false,
    totalDiscount: Number(row.penalidades || 0),
    finalScore: Number(row.nota_final || 0),
    isPassing: row.itens_avaliados?.resultado === 'APROVADO',
    raw: row,
  }
}

export default function App() {
  const [state, setState] = useState(initialEval)
  const [savedEvaluations, setSavedEvaluations] = useState([])
  const [reportsLoading, setReportsLoading] = useState(false)

  useEffect(() => {
    loadEvaluations()
  }, [])

  async function loadEvaluations() {
    try {
      setReportsLoading(true)

      const { data, error } = await supabase
        .from('avaliacoes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao carregar avaliações:', error)
        return
      }

      setSavedEvaluations((data || []).map(mapDbEvaluationToUi))
    } catch (error) {
      console.error('Erro inesperado ao carregar avaliações:', error)
    } finally {
      setReportsLoading(false)
    }
  }

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

  function goTo(screen) {
    setState(s => ({ ...s, screen }))
  }

  function reset() {
    setState(initialEval)
  }

  async function saveEvaluation(dadosAvaliacao) {
    const { data, error } = await supabase
      .from('avaliacoes')
      .insert([dadosAvaliacao])
      .select()
      .single()

    if (error) {
      console.error('Erro ao salvar no Supabase:', error)
      throw error
    }

    const mapped = mapDbEvaluationToUi(data)
    setSavedEvaluations(prev => [mapped, ...prev])
    setState(s => ({ ...s, screen: 'reports' }))

    return data
  }

  async function deleteEvaluation(id) {
    const confirmDelete = window.confirm('Deseja excluir esta avaliação?')
    if (!confirmDelete) return

    const { error } = await supabase
      .from('avaliacoes')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao excluir avaliação:', error)
      alert('Erro ao excluir avaliação.')
      return
    }

    setSavedEvaluations(prev => prev.filter(e => e.id !== id))
  }

  async function clearAllEvaluations() {
    const confirmDelete = window.confirm('Deseja excluir TODAS as avaliações?')
    if (!confirmDelete) return

    const { error } = await supabase
      .from('avaliacoes')
      .delete()
      .gt('id', 0)

    if (error) {
      console.error('Erro ao limpar avaliações:', error)
      alert('Erro ao limpar avaliações.')
      return
    }

    setSavedEvaluations([])
  }

  const props = {
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
    goTo,
    reset,
    saveEvaluation,
    savedEvaluations,
    deleteEvaluation,
    clearAllEvaluations,
    loadEvaluations,
    reportsLoading,
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