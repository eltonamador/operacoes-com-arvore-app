import { supabase } from '../lib/supabase'
import { getStudentByOrdem } from '../modules/shared/utils/studentResolver'

/**
 * Transforma uma linha do banco de dados no formato de objeto UI.
 * Função centralizada — usada por App.jsx e utilitários de relatório.
 * nome e pelotao são sempre resolvidos canonicamente via numero_ordem → students.json.
 */
export function mapDbToUi(row) {
  const canonical = getStudentByOrdem(row.numero_ordem)
  return {
    id: row.id,
    moduleId: row.module_id || null,
    savedAt: row.created_at,
    studentData: {
      nome: canonical?.nome || row.nome_aluno || '',
      ordem: row.numero_ordem || '',
      data: row.data_avaliacao || '',
      pelotao: canonical?.pelotao || row.pelotao || '',
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

/**
 * Busca todas as avaliações do banco, ordenadas por data de criação (mais recentes primeiro).
 * Retorna array de objetos no formato UI.
 */
export async function fetchAvaliacoes() {
  const { data, error } = await supabase
    .from('avaliacoes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data || []).map(mapDbToUi)
}

/**
 * Busca avaliações ordenadas por número de ordem.
 * Se `data` for informado, filtra pelo campo data_avaliacao.
 * Retorna array de objetos no formato UI.
 */
export async function fetchAvaliacoesByData(data) {
  let query = supabase
    .from('avaliacoes')
    .select('*')
    .order('numero_ordem', { ascending: true })

  if (data) {
    query = query.eq('data_avaliacao', data)
  }

  const { data: rows, error } = await query

  if (error) throw error

  return (rows || []).map(mapDbToUi)
}

/**
 * Busca avaliações de um módulo específico, ordenadas por data de criação.
 * Retorna array de objetos no formato UI.
 */
export async function fetchAvaliacoesByModulo(module_id) {
  const { data, error } = await supabase
    .from('avaliacoes')
    .select('*')
    .eq('module_id', module_id)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data || []).map(mapDbToUi)
}

/**
 * Busca avaliações de um módulo específico, filtradas por data, ordenadas por número de ordem.
 * Retorna array de objetos no formato UI.
 */
export async function fetchAvaliacoesByDataAndModulo(data, module_id) {
  let query = supabase
    .from('avaliacoes')
    .select('*')
    .eq('module_id', module_id)
    .order('numero_ordem', { ascending: true })

  if (data) {
    query = query.eq('data_avaliacao', data)
  }

  const { data: rows, error } = await query

  if (error) throw error

  return (rows || []).map(mapDbToUi)
}

/**
 * Busca avaliações de um aluno pelo número de ordem, ordenadas por data de criação (mais recentes primeiro).
 * Retorna array de objetos no formato UI.
 */
export async function fetchAvaliacoesByNumeroOrdem(numero_ordem) {
  const { data, error } = await supabase
    .from('avaliacoes')
    .select('*')
    .eq('numero_ordem', numero_ordem)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data || []).map(mapDbToUi)
}

/**
 * Insere múltiplas avaliações de uma vez (avaliação em grupo).
 * Retorna array de objetos no formato UI.
 */
export async function saveAvaliacoesBatch(registros) {
  const { data, error } = await supabase
    .from('avaliacoes')
    .insert(registros)
    .select()

  if (error) throw error

  return (data || []).map(mapDbToUi)
}

/**
 * Insere uma nova avaliação no banco.
 * Retorna o objeto salvo no formato UI.
 */
export async function saveAvaliacao(dadosAvaliacao) {
  const { data, error } = await supabase
    .from('avaliacoes')
    .insert([dadosAvaliacao])
    .select()
    .single()

  if (error) throw error

  return mapDbToUi(data)
}

/**
 * Exclui uma avaliação pelo id.
 * Lança erro se a operação falhar.
 */
export async function deleteAvaliacao(id) {
  const { error } = await supabase
    .from('avaliacoes')
    .delete()
    .eq('id', id)

  if (error) throw error
}

/**
 * Exclui todas as avaliações da tabela.
 * Lança erro se a operação falhar.
 */
export async function clearAllAvaliacoes() {
  const { error } = await supabase
    .from('avaliacoes')
    .delete()
    .gt('id', 0)

  if (error) throw error
}
