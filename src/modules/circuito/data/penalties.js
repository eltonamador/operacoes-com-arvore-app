// Ficha fonte: Prova Prática VC-3 (2ª parte) — Circuito Operacional
// Contexto portal: circuito compõe o VC2 com motosserra (não VC3 como indica a ficha).
//
// Modelo de pontuação invertido:
// A ficha original é de pontuação POSITIVA por estação (soma até 10).
// O portal usa modelo de PENALIDADES (começa em 10, subtrai erros).
// Cada item marcado = aluno NÃO executou o critério corretamente = desconto aplicado.
//
// Discrepâncias da ficha original registradas em comentário inline.

export const SECTIONS = [
  {
    id: '1.0',
    title: 'TEMPO DE EXECUÇÃO (Estações 1 a 5 — máximo 20 min)',
    items: [
      { id: '1.1', description: 'Excede 20:00 — 1ª faixa (>20:01 até 21:00).', discount: 0.20 },
      { id: '1.2', description: 'Excede 21:00 — 2ª faixa (>21:01 até 22:00).', discount: 0.20 },
      { id: '1.3', description: 'Excede 22:00 — 3ª faixa (>22:01 até 23:00).', discount: 0.20 },
      { id: '1.4', description: 'Excede 23:00 — 4ª faixa (>23:01 até 24:00).', discount: 0.20 },
      { id: '1.5', description: 'Excede 24:00 — 5ª faixa (>24:01 até 25:00).', discount: 0.20 },
      { id: '1.6', description: 'Excede 25:00 — 6ª faixa (>25:01 até 26:00).', discount: 0.20 },
      { id: '1.7', description: 'Excede 26:00 — 7ª faixa (>26:01 até 27:00).', discount: 0.20 },
      { id: '1.8', description: 'Excede 27:00 — 8ª faixa (>27:01 até 28:00 — limite máximo).', discount: 0.20 },
    ],
  },
  {
    // Estação 1 — Nós e Amarração (1,0 ponto total, 0,20 cada)
    // 5 nós × 0,20 = 1,00. Sem discrepância.
    id: '2.0',
    title: 'ESTAÇÃO 1 — Nós e Amarração (1,0 pt)',
    items: [
      { id: '2.1', description: 'Cadeirinha Rápida Nilson — não executada corretamente.', discount: 0.20 },
      { id: '2.2', description: 'Prussic (horizontal) — não executado corretamente.', discount: 0.20 },
      { id: '2.3', description: 'Laiz de Guia — não executado corretamente.', discount: 0.20 },
      { id: '2.4', description: 'Escota — não executado corretamente.', discount: 0.20 },
      { id: '2.5', description: 'Duplo Nó de Fita — não executado corretamente.', discount: 0.20 },
    ],
  },
  {
    // Estação 2 — Escada e Maca Cesto (2,5 pontos total)
    // Itens documentados somam 1,00 + 0,50 + 0,50 + 0,50 = 2,50. Sem discrepância.
    id: '3.0',
    title: 'ESTAÇÃO 2 — Escada e Maca Cesto (2,5 pts)',
    items: [
      { id: '3.1', description: 'Amarração Diamante na Maca Cesto — não executada corretamente.', discount: 1.00 },
      { id: '3.2', description: 'Balso Americano (Chicote) na Maca — não executado corretamente.', discount: 0.50 },
      { id: '3.3', description: 'Arvoramento da escada + Nó fiel no 2º degrau — não executado corretamente.', discount: 0.50 },
      { id: '3.4', description: 'Nó fiel Banzo/Degrau — não executado corretamente.', discount: 0.50 },
    ],
  },
  {
    // Estação 3 — Nós e Amarrações (1,0 ponto total, 0,20 cada)
    // DISCREPÂNCIA: a ficha lista 4 nós × 0,20 = 0,80, mas declara total de 1,0 pt.
    // Os 0,20 restantes não estão documentados na ficha.
    // Modelados apenas os 4 nós conforme explicitado no documento.
    // Soma máxima desta seção = 0,80 (não 1,00 como declarado na ficha).
    id: '4.0',
    title: 'ESTAÇÃO 3 — Nós e Amarrações (1,0 pt — ver nota de discrepância)',
    items: [
      { id: '4.1', description: 'Cadeirinha Japonesa — não executada corretamente.', discount: 0.20 },
      { id: '4.2', description: 'Nó Sete (Bi-direcional) — não executado corretamente.', discount: 0.20 },
      { id: '4.3', description: 'Balso Americano (Seio) — não executado corretamente.', discount: 0.20 },
      { id: '4.4', description: 'Volta da Ribeira — não executada corretamente.', discount: 0.20 },
      // Nota: a ficha declara total de 1,0 pt para esta estação, mas lista apenas 4 critérios
      // de 0,20 cada (soma = 0,80). Os 0,20 restantes não estão descritos no documento.
      // Modelados somente os critérios explicitamente documentados.
    ],
  },
  {
    // Estação 4 — Sistema de Vantagem Mecânica Reduzido (2,5 pontos total)
    // DISCREPÂNCIA: os itens documentados somam apenas 1,00 + 0,50 = 1,50.
    // 1,00 ponto não está descrito em nenhum critério da ficha.
    // Modelados apenas os critérios explicitamente documentados.
    // Soma máxima desta seção = 1,50 (não 2,50 como declarado na ficha).
    id: '5.0',
    title: 'ESTAÇÃO 4 — Sistema de Vantagem Mecânica Reduzido (2,5 pts — ver nota de discrepância)',
    items: [
      { id: '5.1', description: 'Montagem e operação do sistema 5x1 reduzido com SCP — não executado corretamente.', discount: 1.00 },
      { id: '5.2', description: 'Ancoragem equilibrável — não executada corretamente.', discount: 0.50 },
      // Nota: a ficha declara total de 2,5 pt para esta estação, mas documenta apenas
      // dois critérios somando 1,50. 1,00 pt de critério não está descrito no documento.
      // Modelados somente os critérios explicitamente documentados.
    ],
  },
  {
    // Estação 5 — Sistema de Vantagem Mecânica Estendido no Tripé (2,0 pontos total)
    // Itens documentados somam 1,00 + 1,00 = 2,00. Sem discrepância.
    id: '6.0',
    title: 'ESTAÇÃO 5 — Sistema de Vantagem Mecânica Estendido no Tripé (2,0 pts)',
    items: [
      { id: '6.1', description: 'Montagem e operação do sistema 4x1 com SCP no tripé — não executada corretamente.', discount: 1.00 },
      { id: '6.2', description: 'Uso correto do T-block — não executado corretamente.', discount: 1.00 },
    ],
  },
  {
    // Estação 6 — Espaço Confinado / Galerias (1,0 ponto total)
    // Itens documentados somam 0,50 + 0,50 = 1,00. Sem discrepância.
    // Tempo específico desta estação: 5 min (critério separado do tempo geral das estações 1-5).
    id: '7.0',
    title: 'ESTAÇÃO 6 — Espaço Confinado / Galerias (1,0 pt)',
    items: [
      { id: '7.1', description: 'Execução correta da tarefa no espaço confinado de galerias — não executada corretamente.', discount: 0.50 },
      { id: '7.2', description: 'Cumprimento do tempo de 5 min na estação 6 — tempo não cumprido.', discount: 0.50 },
    ],
  },
]

export function calcScore(checkedItems, customErrorDiscount = 0) {
  let total = 0
  for (const section of SECTIONS) {
    for (const item of section.items) {
      if (checkedItems.has(item.id)) total += item.discount
    }
  }
  total += customErrorDiscount
  return {
    totalDiscount: Math.round(total * 100) / 100,
    finalScore: Math.max(0, Math.round((10 - total) * 100) / 100),
  }
}
