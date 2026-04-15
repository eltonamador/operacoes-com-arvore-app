import { supabase } from '../lib/supabase'
import { mapDbToUi } from './avaliacoesService'

const NOTA_MINIMA_APTO = 7

/**
 * Calcula VC1, VC2, VC3 e Média Final a partir das últimas avaliações por módulo.
 * @param {Object} modulos - { escadas, pocos, motosserra, circuito, teorica } — objeto UI ou undefined
 * @returns {{ vc1, vc2, vc3, mediaFinal, apto }} — valores null quando módulo não foi avaliado
 */
export function calcularConsolidacao(modulos) {
  const n = (mod) => (mod?.finalScore ?? null)

  const vc1 =
    n(modulos.escadas) !== null && n(modulos.pocos) !== null
      ? (n(modulos.escadas) + n(modulos.pocos)) / 2
      : null

  const vc2 =
    n(modulos.motosserra) !== null && n(modulos.circuito) !== null
      ? (n(modulos.motosserra) + n(modulos.circuito)) / 2
      : null

  const vc3 = n(modulos.teorica)

  const mediaFinal =
    vc1 !== null && vc2 !== null && vc3 !== null
      ? (vc1 + vc2 + vc3) / 3
      : null

  const apto = mediaFinal !== null ? mediaFinal >= NOTA_MINIMA_APTO : null

  return { vc1, vc2, vc3, mediaFinal, apto }
}

/**
 * Busca todas as avaliações relevantes e retorna consolidação por aluno.
 * Usa a última avaliação registrada por oficina (ordenação DESC por created_at).
 * @returns {Promise<Array>} Array de { nome, ordem, pelotao, modulos, consolidacao }
 */
export async function fetchConsolidacaoTodos() {
  const { data, error } = await supabase
    .from('avaliacoes')
    .select('*')
    .in('module_id', ['escadas', 'pocos', 'motosserra', 'circuito', 'teorica'])
    .order('created_at', { ascending: false })

  if (error) throw error

  const avaliacoes = (data || []).map(mapDbToUi)

  const porAluno = {}
  for (const av of avaliacoes) {
    const ordem = av.studentData.ordem
    if (!ordem) continue

    if (!porAluno[ordem]) {
      porAluno[ordem] = {
        nome: av.studentData.nome,
        ordem: av.studentData.ordem,
        pelotao: av.studentData.pelotao,
        modulos: {},
      }
    }

    // Como a query está ordenada por created_at DESC, o primeiro registro encontrado é o mais recente
    if (!porAluno[ordem].modulos[av.moduleId]) {
      porAluno[ordem].modulos[av.moduleId] = av
    }
  }

  return Object.values(porAluno)
    .map((aluno) => ({
      ...aluno,
      consolidacao: calcularConsolidacao(aluno.modulos),
    }))
    .sort((a, b) => Number(a.ordem) - Number(b.ordem))
}

/**
 * Busca consolidação de um aluno específico pelo numero_ordem.
 * @param {string} numero_ordem
 * @returns {Promise<{nome, ordem, pelotao, modulos, consolidacao}|null>} null se sem avaliações
 */
export async function fetchConsolidacaoPorAluno(numero_ordem) {
  const { data, error } = await supabase
    .from('avaliacoes')
    .select('*')
    .eq('numero_ordem', numero_ordem)
    .in('module_id', ['escadas', 'pocos', 'motosserra', 'circuito', 'teorica'])
    .order('created_at', { ascending: false })

  if (error) throw error

  const avaliacoes = (data || []).map(mapDbToUi)
  if (avaliacoes.length === 0) return null

  const modulos = {}
  for (const av of avaliacoes) {
    // Primeiro encontrado por módulo é o mais recente (DESC por created_at)
    if (!modulos[av.moduleId]) modulos[av.moduleId] = av
  }

  const primeira = avaliacoes[0]
  return {
    nome: primeira.studentData.nome,
    ordem: primeira.studentData.ordem,
    pelotao: primeira.studentData.pelotao,
    modulos,
    consolidacao: calcularConsolidacao(modulos),
  }
}
