import { supabase } from '../lib/supabase'
import studentsData from '../modules/shared/data/students.json'

// Escopo da Turma CFSD-26 — 4 avaliações práticas (Teórica fora).
export const MODULOS_ESCOPO = ['escadas', 'pocos', 'motosserra', 'circuito']

export const MODULO_LABEL = {
  escadas: 'Escada',
  pocos: 'Poço',
  motosserra: 'Motosserra',
  circuito: 'Circuito',
}

export const DATA_INICIO_TURMA = '2026-01-01'

export const STATUS_MODULO = {
  OK: 'OK',
  PENDENTE: 'PENDENTE',
  DUPLICADO: 'DUPLICADO',
  PIN_PENDENTE: 'PIN_PENDENTE',
}

export const SITUACAO = {
  COMPLETO: 'COMPLETO',
  PENDENTE_PARCIAL: 'PENDENTE PARCIAL',
  SEM_NENHUMA: 'SEM NENHUMA AVALIAÇÃO',
  POSSIVEL_DUPLICIDADE: 'POSSÍVEL DUPLICIDADE',
  PIN_PENDENTE: 'ASSINATURA/PIN PENDENTE',
  REQUER_ANALISE: 'REQUER ANÁLISE DA COORDENAÇÃO',
  FORA_DO_CURSO: 'FORA DO CURSO',
}

// Alunos desligados/transferidos — não devem ser contados como pendência.
export const ALUNOS_FORA_DO_CURSO = new Set(['5', '31', '57', '107'])

// Módulos onde a verificação de assinatura/PIN é dispensada (regra operacional).
const MODULOS_SEM_CHECAGEM_PIN = new Set(['escadas'])

const ALUNOS = studentsData?.students || []

// ---------- helpers puros ----------

export function temNotaValida(row) {
  return row && row.nota_final !== null && row.nota_final !== undefined
}

/**
 * Verifica assinatura/PIN do registro.
 * - Poço: itens_avaliados.assinatura_individual.visto_confirmado
 * - Demais módulos: itens_avaliados.visto_confirmado
 * Retorna true se assinado, false caso contrário.
 */
export function temAssinatura(row) {
  const itens = row?.itens_avaliados || {}
  if (row?.module_id === 'pocos') {
    const ind = itens.assinatura_individual
    if (ind && typeof ind === 'object') return ind.visto_confirmado === true
    return itens.visto_confirmado === true
  }
  return itens.visto_confirmado === true
}

function dentroDaTurma(row, dataInicio) {
  if (!row?.data_avaliacao) return false
  return row.data_avaliacao >= dataInicio
}

// ---------- análise por aluno ----------

/**
 * Analisa um aluno contra os registros filtrados (já no escopo de data e módulos).
 * `rowsDoAluno` = todas as linhas de avaliacoes com numero_ordem == aluno.numero.
 */
export function analisarAluno(aluno, rowsDoAluno) {
  const porModulo = {}
  const idsDuplicados = {}
  let qtdDuplicidades = 0

  for (const modId of MODULOS_ESCOPO) {
    const rows = rowsDoAluno.filter(r => r.module_id === modId)
    const valid = rows.filter(temNotaValida)

    let status
    if (valid.length === 0) {
      status = STATUS_MODULO.PENDENTE
    } else if (valid.length > 1) {
      // Para Poço, dois registros com mesmo numero_ordem também contam (regra confirmada).
      status = STATUS_MODULO.DUPLICADO
      idsDuplicados[modId] = valid.map(r => r.id)
      qtdDuplicidades += valid.length - 1
    } else {
      // exatamente 1 registro válido — em módulos sem checagem de PIN, sempre OK.
      if (MODULOS_SEM_CHECAGEM_PIN.has(modId)) {
        status = STATUS_MODULO.OK
      } else {
        status = temAssinatura(valid[0]) ? STATUS_MODULO.OK : STATUS_MODULO.PIN_PENDENTE
      }
    }

    porModulo[modId] = status
  }

  const statusList = Object.values(porModulo)
  const qtdRealizadas = statusList.filter(
    s => s === STATUS_MODULO.OK || s === STATUS_MODULO.PIN_PENDENTE || s === STATUS_MODULO.DUPLICADO,
  ).length
  const qtdPendentes = statusList.filter(s => s === STATUS_MODULO.PENDENTE).length
  const temDuplicidade = statusList.includes(STATUS_MODULO.DUPLICADO)
  const temPinPendente = statusList.includes(STATUS_MODULO.PIN_PENDENTE)

  // Situação geral (ordem de precedência)
  let situacao
  const observacoes = []

  if (qtdRealizadas === 0) {
    situacao = SITUACAO.SEM_NENHUMA
  } else if (temDuplicidade && (qtdPendentes > 0 || temPinPendente)) {
    situacao = SITUACAO.REQUER_ANALISE
    observacoes.push('Combina duplicidade com pendência/PIN — conferir manualmente.')
  } else if (temDuplicidade) {
    situacao = SITUACAO.POSSIVEL_DUPLICIDADE
  } else if (qtdPendentes === 0 && !temPinPendente) {
    situacao = SITUACAO.COMPLETO
  } else if (qtdPendentes === 0 && temPinPendente) {
    situacao = SITUACAO.PIN_PENDENTE
  } else {
    situacao = SITUACAO.PENDENTE_PARCIAL
    if (temPinPendente) observacoes.push('Há também avaliação com PIN pendente.')
  }

  if (aluno?._orfao) {
    // numero_ordem aparece em avaliacoes mas não existe em students.json
    return {
      numero_ordem: aluno.numero,
      nome: aluno.nome || '(sem cadastro)',
      pelotao: aluno.pelotao || '',
      grupo: null,
      statusPorModulo: porModulo,
      qtdRealizadas,
      qtdPendentes,
      qtdDuplicidades,
      idsDuplicados,
      situacao: SITUACAO.REQUER_ANALISE,
      observacao: 'Registro órfão: numero_ordem sem cadastro em students.json.',
    }
  }

  if (ALUNOS_FORA_DO_CURSO.has(String(aluno.numero))) {
    // Aluno desligado/transferido — exibe registros mas não conta como pendência.
    return {
      numero_ordem: String(aluno.numero),
      nome: aluno.nome,
      pelotao: aluno.pelotao || '',
      grupo: aluno.grupo || null,
      statusPorModulo: porModulo,
      qtdRealizadas,
      qtdPendentes,
      qtdDuplicidades,
      idsDuplicados,
      situacao: SITUACAO.FORA_DO_CURSO,
      observacao: 'Aluno fora do curso (desligado/transferido) — não contabilizar como pendência.',
    }
  }

  return {
    numero_ordem: String(aluno.numero),
    nome: aluno.nome,
    pelotao: aluno.pelotao || '',
    grupo: aluno.grupo || null,
    statusPorModulo: porModulo,
    qtdRealizadas,
    qtdPendentes,
    qtdDuplicidades,
    idsDuplicados,
    situacao,
    observacao: observacoes.join(' '),
  }
}

// ---------- montagem do relatório ----------

/**
 * Constrói o relatório a partir das listas brutas.
 * `rows` = linhas cruas vindas do Supabase (já filtradas por data e módulos).
 * `alunos` = lista canônica de students.json.
 * Retorna { linhas, estatisticas }.
 */
export function construirRelatorio(alunos, rows) {
  // Agrupa rows por numero_ordem (string)
  const porOrdem = new Map()
  for (const r of rows) {
    const key = String(r.numero_ordem ?? '')
    if (!key) continue
    if (!porOrdem.has(key)) porOrdem.set(key, [])
    porOrdem.get(key).push(r)
  }

  const linhas = []

  // 1. Alunos cadastrados
  for (const a of alunos) {
    const key = String(a.numero)
    const rowsAluno = porOrdem.get(key) || []
    linhas.push(analisarAluno(a, rowsAluno))
    porOrdem.delete(key)
  }

  // 2. Órfãos: numero_ordem presente em avaliacoes mas ausente em students.json
  for (const [ordem, rowsAluno] of porOrdem.entries()) {
    const exemplo = rowsAluno[0] || {}
    const orfao = {
      numero: ordem,
      nome: exemplo.nome_aluno || '(não cadastrado)',
      pelotao: exemplo.pelotao || '',
      _orfao: true,
    }
    linhas.push(analisarAluno(orfao, rowsAluno))
  }

  // 3. Estatísticas
  const estatisticas = montarEstatisticas(linhas)

  return { linhas, estatisticas }
}

export function montarEstatisticas(linhas) {
  const totalAlunos = linhas.length
  let foraDoCurso = 0
  let completos = 0
  let comPendencias = 0
  let semNenhuma = 0
  let comDuplicidade = 0
  let totalRegistrosDuplicados = 0
  let comPinPendente = 0
  let requerAnalise = 0
  const pendenciasPorModulo = Object.fromEntries(MODULOS_ESCOPO.map(m => [m, 0]))

  for (const l of linhas) {
    if (l.situacao === SITUACAO.FORA_DO_CURSO) {
      foraDoCurso++
      continue // não conta em nenhum contador de pendência
    }
    if (l.situacao === SITUACAO.COMPLETO) completos++
    if (l.situacao === SITUACAO.SEM_NENHUMA) semNenhuma++
    if (
      l.situacao === SITUACAO.PENDENTE_PARCIAL ||
      l.situacao === SITUACAO.SEM_NENHUMA ||
      l.situacao === SITUACAO.PIN_PENDENTE ||
      l.situacao === SITUACAO.POSSIVEL_DUPLICIDADE ||
      l.situacao === SITUACAO.REQUER_ANALISE
    ) {
      comPendencias++
    }
    if (l.qtdDuplicidades > 0) {
      comDuplicidade++
      totalRegistrosDuplicados += l.qtdDuplicidades
    }
    if (
      l.situacao === SITUACAO.PIN_PENDENTE ||
      Object.values(l.statusPorModulo).includes(STATUS_MODULO.PIN_PENDENTE)
    ) {
      comPinPendente++
    }
    if (l.situacao === SITUACAO.REQUER_ANALISE) requerAnalise++

    for (const m of MODULOS_ESCOPO) {
      if (l.statusPorModulo[m] === STATUS_MODULO.PENDENTE) pendenciasPorModulo[m]++
    }
  }

  return {
    totalAlunos,
    foraDoCurso,
    completos,
    comPendencias,
    semNenhuma,
    comDuplicidade,
    totalRegistrosDuplicados,
    comPinPendente,
    requerAnalise,
    pendenciasPorModulo,
  }
}

// ---------- acesso ao banco ----------

/**
 * Busca todas as avaliações no escopo (módulos práticos, turma 2026) e devolve o relatório.
 * READ-ONLY. Não altera dados.
 */
export async function fetchRelatorioPendencias({ dataInicio = DATA_INICIO_TURMA } = {}) {
  const { data, error } = await supabase
    .from('avaliacoes')
    .select('id, numero_ordem, nome_aluno, pelotao, module_id, nota_final, data_avaliacao, itens_avaliados, created_at')
    .in('module_id', MODULOS_ESCOPO)
    .gte('data_avaliacao', dataInicio)

  if (error) throw error

  const rows = data || []
  return construirRelatorio(ALUNOS, rows)
}
