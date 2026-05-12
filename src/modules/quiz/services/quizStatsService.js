/**
 * quizStatsService.js
 *
 * Funções puras de cálculo estatístico sobre tentativas de quiz.
 * Não depende de React. Recebe sempre o array bruto de `attempts`
 * (conforme retornado por fetchAllQuizAttempts) e o array de `questions`
 * (de questions.json) quando necessário.
 *
 * Convenções:
 *  - attempt.respostas[i] tem: questao_id, nivel, resposta_marcada,
 *    resposta_correta, acertou, tempo_gasto, pontos.
 *  - Para registros antigos sem alguns campos, há fallbacks para o
 *    catálogo `questions`.
 */

const NIVEIS = ['basico', 'intermediario', 'avancado']

function safePct(num, den) {
  if (!den) return 0
  return Math.round((num / den) * 10000) / 100
}

function lookupQuestion(questions, id) {
  return questions.find(q => q.id === id) || null
}

// ----------------------------------------------------------------------
// Ranking por aluno (agregado)
// ----------------------------------------------------------------------

/**
 * Constrói o ranking agregado por aluno.
 * Retorna lista ordenada com posição já aplicada.
 */
export function buildStudentRanking(attempts) {
  const byStudent = new Map()
  for (const a of attempts) {
    const key = a.numero_ordem || a.nome_aluno
    if (!byStudent.has(key)) {
      byStudent.set(key, {
        numero_ordem: a.numero_ordem,
        nome: a.nome_aluno,
        pelotao: a.pelotao,
        tentativas: [],
      })
    }
    byStudent.get(key).tentativas.push(a)
  }

  const list = []
  for (const s of byStudent.values()) {
    const tents = s.tentativas
    const totalQuestoes = tents.reduce((sum, t) => sum + (t.total_questoes || 0), 0)
    const acertos = tents.reduce((sum, t) => sum + (t.acertos || 0), 0)
    const erros = totalQuestoes - acertos
    const percentualGeral = safePct(acertos, totalQuestoes)
    const melhorPercentual = tents.reduce((max, t) => Math.max(max, Number(t.percentual) || 0), 0)
    const melhorPontuacao = tents.reduce((max, t) => Math.max(max, Number(t.pontuacao) || 0), 0)
    const mediaPercentual = tents.length
      ? Math.round((tents.reduce((sum, t) => sum + (Number(t.percentual) || 0), 0) / tents.length) * 100) / 100
      : 0
    const ordenadasPorData = [...tents].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    const ultima = ordenadasPorData[0]
    const ultimaData = ultima?.created_at || null
    const ultimaPercentual = Number(ultima?.percentual) || 0

    list.push({
      numero_ordem: s.numero_ordem,
      nome: s.nome,
      pelotao: s.pelotao,
      tentativas: tents.length,
      totalQuestoes,
      acertos,
      erros,
      percentualGeral,
      melhorPercentual,
      melhorPontuacao,
      mediaPercentual,
      ultimaData,
      ultimaPercentual,
    })
  }

  // Desempate:
  // 1) maior % geral, 2) maior nº de acertos, 3) menor nº de tentativas,
  // 4) maior % na tentativa mais recente, 5) ordem alfabética do nome.
  list.sort((a, b) => {
    if (b.percentualGeral !== a.percentualGeral) return b.percentualGeral - a.percentualGeral
    if (b.acertos !== a.acertos) return b.acertos - a.acertos
    if (a.tentativas !== b.tentativas) return a.tentativas - b.tentativas
    if (b.ultimaPercentual !== a.ultimaPercentual) return b.ultimaPercentual - a.ultimaPercentual
    return (a.nome || '').localeCompare(b.nome || '')
  })

  return list.map((s, i) => ({ ...s, posicao: i + 1 }))
}

// ----------------------------------------------------------------------
// Detalhe de um aluno
// ----------------------------------------------------------------------

export function buildStudentDetail(attempts, numero_ordem, questions = []) {
  const tents = attempts
    .filter(a => a.numero_ordem === numero_ordem)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))

  if (!tents.length) return null

  const nome = tents[0].nome_aluno
  const pelotao = tents[0].pelotao

  const totalQuestoes = tents.reduce((s, t) => s + (t.total_questoes || 0), 0)
  const acertos = tents.reduce((s, t) => s + (t.acertos || 0), 0)
  const erros = totalQuestoes - acertos
  const percentualGeral = safePct(acertos, totalQuestoes)
  const melhorPercentual = tents.reduce((m, t) => Math.max(m, Number(t.percentual) || 0), 0)
  const mediaPercentual = tents.length
    ? Math.round((tents.reduce((s, t) => s + (Number(t.percentual) || 0), 0) / tents.length) * 100) / 100
    : 0

  // Evolução por tentativa (ordem cronológica)
  const evolucao = tents.map((t, idx) => ({
    ordem: idx + 1,
    data: t.created_at,
    nivel: t.nivel,
    percentual: Number(t.percentual) || 0,
    acertos: t.acertos,
    total: t.total_questoes,
    pontuacao: t.pontuacao,
  }))

  // Estatísticas por questão respondida por este aluno
  const perQuestion = new Map()
  for (const t of tents) {
    for (const r of (t.respostas || [])) {
      if (!perQuestion.has(r.questao_id)) {
        perQuestion.set(r.questao_id, { id: r.questao_id, nivel: r.nivel, total: 0, acertos: 0 })
      }
      const s = perQuestion.get(r.questao_id)
      s.total++
      if (r.acertou) s.acertos++
    }
  }
  const questoesRespondidas = Array.from(perQuestion.values()).map(s => {
    const q = lookupQuestion(questions, s.id)
    return {
      ...s,
      nivel: s.nivel || q?.nivel || null,
      enunciado: q?.enunciado || `Questão ${s.id}`,
      taxa: safePct(s.acertos, s.total),
    }
  })

  const maisErradas = [...questoesRespondidas]
    .filter(q => q.acertos < q.total)
    .sort((a, b) => (a.taxa - b.taxa) || (b.total - a.total))
    .slice(0, 5)

  const maisAcertadas = [...questoesRespondidas]
    .filter(q => q.acertos > 0)
    .sort((a, b) => (b.taxa - a.taxa) || (b.total - a.total))
    .slice(0, 5)

  // Desempenho por nível (somando respostas em todas as tentativas)
  const porNivel = {}
  for (const t of tents) {
    for (const r of (t.respostas || [])) {
      const lvl = r.nivel || lookupQuestion(questions, r.questao_id)?.nivel || 'desconhecido'
      if (!porNivel[lvl]) porNivel[lvl] = { nivel: lvl, total: 0, acertos: 0 }
      porNivel[lvl].total++
      if (r.acertou) porNivel[lvl].acertos++
    }
  }
  const porNivelArr = Object.values(porNivel).map(n => ({
    ...n,
    taxa: safePct(n.acertos, n.total),
  }))

  const melhorNivel = porNivelArr.length
    ? porNivelArr.reduce((best, n) => (n.taxa > (best?.taxa ?? -1) ? n : best), null)
    : null
  const piorNivel = porNivelArr.length
    ? porNivelArr.reduce((worst, n) => (n.taxa < (worst?.taxa ?? 101) ? n : worst), null)
    : null

  // Lista detalhada (uma linha por resposta)
  const respostasDetalhadas = []
  for (const t of tents) {
    for (const r of (t.respostas || [])) {
      const q = lookupQuestion(questions, r.questao_id)
      respostasDetalhadas.push({
        tentativa_id: t.id,
        data: t.created_at,
        questao_id: r.questao_id,
        enunciado: q?.enunciado || `Questão ${r.questao_id}`,
        nivel: r.nivel || q?.nivel || null,
        resposta_marcada: r.resposta_marcada,
        resposta_correta: r.resposta_correta || q?.gabarito || null,
        acertou: !!r.acertou,
        tempo_gasto: r.tempo_gasto,
      })
    }
  }
  respostasDetalhadas.sort((a, b) => new Date(b.data) - new Date(a.data))

  return {
    numero_ordem,
    nome,
    pelotao,
    tentativas: tents.length,
    totalQuestoes,
    acertos,
    erros,
    percentualGeral,
    melhorPercentual,
    mediaPercentual,
    ultimaData: tents[tents.length - 1].created_at,
    evolucao,
    maisErradas,
    maisAcertadas,
    porNivel: porNivelArr,
    melhorNivel,
    piorNivel,
    respostasDetalhadas,
  }
}

// ----------------------------------------------------------------------
// Estatísticas por questão
// ----------------------------------------------------------------------

/**
 * Classifica uma questão pela taxa de acerto.
 */
export function classifyQuestion(taxa, total, minRespostas = 5) {
  if (total < minRespostas) return 'amostra-insuficiente'
  if (taxa > 85) return 'muito-facil'
  if (taxa >= 40) return 'equilibrada'
  if (taxa >= 20) return 'dificil'
  return 'critica'
}

export function buildQuestionStats(attempts, questions, opts = {}) {
  const minRespostas = opts.minRespostas ?? 5

  // Agrega respostas por questão
  const stats = new Map()
  for (const a of attempts) {
    for (const r of (a.respostas || [])) {
      if (!stats.has(r.questao_id)) {
        stats.set(r.questao_id, {
          total: 0,
          acertos: 0,
          alternativas: { A: 0, B: 0, C: 0, D: 0, E: 0, NULL: 0 },
          alunosAcertaram: new Set(),
          alunosErraram: new Set(),
        })
      }
      const s = stats.get(r.questao_id)
      s.total++
      if (r.acertou) {
        s.acertos++
        if (a.nome_aluno) s.alunosAcertaram.add(a.nome_aluno)
      } else {
        if (a.nome_aluno) s.alunosErraram.add(a.nome_aluno)
      }
      const marcada = r.resposta_marcada
      if (marcada && Object.prototype.hasOwnProperty.call(s.alternativas, marcada)) {
        s.alternativas[marcada]++
      } else {
        s.alternativas.NULL++
      }
    }
  }

  const discriminationMap = computeDiscriminationIndex(attempts)

  return questions.map(q => {
    const s = stats.get(q.id)
    if (!s) {
      return {
        ...q,
        total: 0,
        acertos: 0,
        erros: 0,
        taxa: null,
        erroPct: null,
        alternativas: { A: 0, B: 0, C: 0, D: 0, E: 0, NULL: 0 },
        alunosAcertaram: [],
        alunosErraram: [],
        classificacao: 'amostra-insuficiente',
        discriminacao: null,
      }
    }
    const erros = s.total - s.acertos
    const taxa = safePct(s.acertos, s.total)
    return {
      ...q,
      total: s.total,
      acertos: s.acertos,
      erros,
      taxa,
      erroPct: safePct(erros, s.total),
      alternativas: s.alternativas,
      alunosAcertaram: Array.from(s.alunosAcertaram).sort(),
      alunosErraram: Array.from(s.alunosErraram).sort(),
      classificacao: classifyQuestion(taxa, s.total, minRespostas),
      discriminacao: discriminationMap.get(q.id) ?? null,
    }
  })
}

// ----------------------------------------------------------------------
// Índice de discriminação (D)
// ----------------------------------------------------------------------

/**
 * D = (acerto% no grupo superior) - (acerto% no grupo inferior).
 * Usa top/bottom 27% das TENTATIVAS, ordenadas por percentual.
 * Retorna Map<questao_id, number> com D entre -1 e 1.
 */
export function computeDiscriminationIndex(attempts, opts = {}) {
  const fraction = opts.fraction ?? 0.27
  const result = new Map()
  if (!attempts.length) return result

  const ordered = [...attempts].sort(
    (a, b) => (Number(b.percentual) || 0) - (Number(a.percentual) || 0)
  )
  const groupSize = Math.max(1, Math.floor(ordered.length * fraction))
  const top = ordered.slice(0, groupSize)
  const bottom = ordered.slice(-groupSize)

  function statsPorQuestao(list) {
    const m = new Map()
    for (const a of list) {
      for (const r of (a.respostas || [])) {
        if (!m.has(r.questao_id)) m.set(r.questao_id, { total: 0, acertos: 0 })
        const s = m.get(r.questao_id)
        s.total++
        if (r.acertou) s.acertos++
      }
    }
    return m
  }

  const topStats = statsPorQuestao(top)
  const botStats = statsPorQuestao(bottom)

  const ids = new Set([...topStats.keys(), ...botStats.keys()])
  for (const id of ids) {
    const t = topStats.get(id)
    const b = botStats.get(id)
    if (!t || !b || t.total === 0 || b.total === 0) {
      result.set(id, null)
      continue
    }
    const D = (t.acertos / t.total) - (b.acertos / b.total)
    result.set(id, Math.round(D * 100) / 100)
  }
  return result
}

export function describeDiscrimination(D) {
  if (D == null) return 'indisponível'
  if (D < 0) return 'problemática'
  if (D < 0.2) return 'fraca'
  if (D < 0.3) return 'aceitável'
  if (D < 0.4) return 'boa'
  return 'excelente'
}

// ----------------------------------------------------------------------
// Sugestão de prova (10 questões)
// ----------------------------------------------------------------------

/**
 * Recebe a saída de buildQuestionStats e devolve as melhores questões
 * para compor uma prova, com cota por nível.
 *
 * opts.minRespostas — N mínimo para a questão ser elegível (default 10).
 * opts.tamanho — total de questões (default 10).
 * opts.cotas — { basico, intermediario, avancado } (default 4/4/2).
 * opts.permitirExtremos — se true, considera 0% e 100% (default false).
 */
export function suggestExamQuestions(questionStats, opts = {}) {
  const tamanho = opts.tamanho ?? 10
  const cotasPadrao = { basico: 4, intermediario: 4, avancado: 2 }
  const cotas = { ...cotasPadrao, ...(opts.cotas || {}) }
  const permitirExtremos = !!opts.permitirExtremos
  let minRespostas = opts.minRespostas ?? 10

  // Se a base for pequena, relaxa o N_min para o quartil superior.
  const totais = questionStats.map(q => q.total).sort((a, b) => b - a)
  if (totais.length && totais[Math.floor(totais.length / 4)] < minRespostas) {
    minRespostas = Math.max(3, totais[Math.floor(totais.length / 4)])
  }

  function scoreOf(q) {
    const taxaFrac = (q.taxa ?? 0) / 100
    const distancia = Math.abs(taxaFrac - 0.6) / 0.6 // 0 = ideal, 1 = extremo
    const scoreDificuldade = Math.max(0, 1 - distancia)
    const D = q.discriminacao
    const scoreDisc = D == null ? 0 : Math.max(0, Math.min(1, (D + 0.2) / 0.8))
    return 0.4 * scoreDificuldade + 0.6 * scoreDisc
  }

  const elegiveis = questionStats
    .filter(q => q.total >= minRespostas)
    .filter(q => permitirExtremos || (q.taxa > 0 && q.taxa < 100))
    .map(q => ({ ...q, score: scoreOf(q) }))

  // Seleção por cota
  const selecionadas = []
  const usados = new Set()
  for (const nivel of NIVEIS) {
    const cota = cotas[nivel] || 0
    const candidatos = elegiveis
      .filter(q => q.nivel === nivel)
      .sort((a, b) => b.score - a.score)
    for (const q of candidatos.slice(0, cota)) {
      selecionadas.push(q)
      usados.add(q.id)
    }
  }

  // Se não fechou a cota total (pouca amostra em algum nível),
  // completa com os melhores remanescentes de qualquer nível.
  if (selecionadas.length < tamanho) {
    const restantes = elegiveis
      .filter(q => !usados.has(q.id))
      .sort((a, b) => b.score - a.score)
    for (const q of restantes) {
      if (selecionadas.length >= tamanho) break
      selecionadas.push(q)
      usados.add(q.id)
    }
  }

  // Próximos da fila por nível, para suportar "substituir".
  const substitutos = {}
  for (const nivel of NIVEIS) {
    substitutos[nivel] = elegiveis
      .filter(q => q.nivel === nivel && !usados.has(q.id))
      .sort((a, b) => b.score - a.score)
      .map(q => q.id)
  }

  return {
    selecionadas: selecionadas.sort((a, b) => b.score - a.score),
    substitutos,
    parametros: { tamanho, cotas, minRespostas, permitirExtremos },
  }
}

// ----------------------------------------------------------------------
// Resumo agregado (cards de topo)
// ----------------------------------------------------------------------

export function buildOverview(attempts, questions) {
  const totalTentativas = attempts.length
  const alunosDistintos = new Set(attempts.map(a => a.numero_ordem || a.nome_aluno)).size
  const mediaPct = totalTentativas
    ? Math.round((attempts.reduce((s, a) => s + (Number(a.percentual) || 0), 0) / totalTentativas) * 100) / 100
    : 0
  const qStats = buildQuestionStats(attempts, questions)
  const criticas = qStats.filter(q => q.classificacao === 'critica').length
  const equilibradas = qStats.filter(q => q.classificacao === 'equilibrada').length
  return {
    totalTentativas,
    alunosDistintos,
    mediaPct,
    questoesCriticas: criticas,
    questoesEquilibradas: equilibradas,
  }
}
