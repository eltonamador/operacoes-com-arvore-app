export const SECTIONS = [
  {
    id: '1.0',
    title: 'TEMPO DE EXECUÇÃO',
    items: [
      { id: '1.1', description: 'Excede 16:00 — 1ª faixa (>16:01 até 16:30).', discount: 0.20 },
      { id: '1.2', description: 'Excede 16:30 — 2ª faixa (>16:31 até 17:00).', discount: 0.20 },
      { id: '1.3', description: 'Excede 17:00 — 3ª faixa (>17:01 até 17:30).', discount: 0.20 },
      { id: '1.4', description: 'Excede 17:30 — 4ª faixa (>17:31 até 18:00).', discount: 0.20 },
      { id: '1.5', description: 'Excede 18:00 — 5ª faixa (>18:01 até 18:30).', discount: 0.20 },
      { id: '1.6', description: 'Excede 18:30 — 6ª faixa (>18:31 até 19:00).', discount: 0.20 },
      { id: '1.7', description: 'Excede 19:00 — 7ª faixa (>19:01 até 19:30).', discount: 0.20 },
      { id: '1.8', description: 'Excede 19:30 — 8ª faixa (>19:31 até 20:00 — limite máximo).', discount: 0.20 },
    ],
  },
  {
    id: '2.0',
    title: 'QUEDA DA VÍTIMA',
    items: [
      { id: '2.1', description: 'Queda da vítima.', discount: 9.00 },
    ],
  },
  {
    id: '3.0',
    title: 'TÉCNICA — ESCADA DESLIZANTE',
    items: [
      {
        id: '3.1',
        description: 'Arvoramento da escada fora do padrão (ex.: não pisar na sapata; levantar sozinho; não travar no 6º degrau; não travar com nó fiel).',
        discount: 0.20,
      },
      {
        id: '3.2',
        description: 'Não realizar a segurança do companheiro durante a subida e/ou permitir dois alunos subindo simultaneamente e/ou utilizar a escada dos instrutores.',
        discount: 0.20,
      },
      {
        id: '3.3',
        description: 'Deixar cair material durante a subida ou a partir da plataforma.',
        discount: 0.20,
      },
      {
        id: '3.4',
        description: 'Arremessar material de baixo para cima.',
        discount: 0.20,
      },
      {
        id: '3.5',
        description: 'Não se clipar na linha da vida na chegada (ou demorar para fazê-lo).',
        discount: 0.30,
      },
      {
        id: '3.6',
        description: 'Angulação da escada deslizante inadequada para a técnica (mais de um degrau acima do piso).',
        discount: 0.20,
      },
      {
        id: '3.7',
        description: 'Fixação da maca ao sistema: nó balso americano incorreto ou não equalizado e/ou cote inexistente ou incorreto.',
        discount: 0.20,
      },
      {
        id: '3.8',
        description: 'Amarração diamante na maca cesto fora do padrão (nó fiel incorreto ou em local não estipulado; passagem por dentro; cruzamentos; folgas; pescador). CUMULATIVO.',
        discount: 0.20,
      },
      {
        id: '3.9',
        description: 'Amarração da vítima na maca cesto fora do padrão (nó fiel em local incorreto; passagem por dentro; cruzamentos; folgas; pescador). CUMULATIVO.',
        discount: 0.20,
      },
      {
        id: '3.10',
        description: 'Ancoragem da escada ineficiente e/ou nós incorretos e/ou nós "mal montados" e/ou fixação somente em banzo e/ou cote incorreto. CUMULATIVO.',
        discount: 0.20,
      },
      {
        id: '3.11',
        description: 'Ancoragem (V/Magic X) inadequada (nós incorretos; Magic X ausente; extensão excessiva; mosquetão aberto). CUMULATIVO.',
        discount: 0.20,
      },
      {
        id: '3.12',
        description: 'Sistema 3x1 — blocante incorreto (na corda errada e/ou instalado invertido: direção/botinha errada, polia incorreta). CUMULATIVO.',
        discount: 0.20,
      },
      {
        id: '3.13',
        description: 'Sistema 3x1 — captura de progresso incorreta (corda errada; blocante ou prusik incorreto; sistema torcido; mosquetão aberto). CUMULATIVO.',
        discount: 0.20,
      },
      {
        id: '3.14',
        description: 'Maca subindo fora do "trilho".',
        discount: 0.20,
      },
      {
        id: '3.15',
        description: 'Permitir que os "pés da escada" saltem durante a subida da maca (não estabilizar/pisar no degrau).',
        discount: 0.20,
      },
      {
        id: '3.16',
        description: 'Não travar a captura de progresso na chegada da maca.',
        discount: 0.30,
      },
      {
        id: '3.17',
        description: 'Materiais fora do palco/área de organização (desorganização).',
        discount: 0.20,
      },
      {
        id: '3.18',
        description: 'Falta de comunicação do Comandante.',
        discount: 0.30,
      },
    ],
  },
  {
    id: '4.0',
    title: 'TÉCNICA — ESCADA REBATIDA',
    items: [
      {
        id: '4.1',
        description: 'Angulação da escada rebatida inadequada para a técnica (sapata afastada da parede).',
        discount: 0.20,
      },
      {
        id: '4.2',
        description: 'Erguer/levantar a escada cometendo ato inseguro.',
        discount: 0.20,
      },
      {
        id: '4.3',
        description: 'Arremessar material de baixo para cima.',
        discount: 0.20,
      },
      {
        id: '4.4',
        description: 'Ancoragem de estabilidade e sustentação inadequada: nós fiéis sem "abraçar" banzo e degrau e/ou em local incorreto e/ou "perna curta", para baixo ou para cima, incorreto/sem cote. CUMULATIVO.',
        discount: 0.20,
      },
      {
        id: '4.5',
        description: 'Fixação da maca na escada inadequada: nó fiel incorreto e/ou somente em banzo e/ou cote inadequado e/ou distância escada/maca muito diferente entre os lados (desequilíbrio) e/ou distância escada/maca excessiva. CUMULATIVO.',
        discount: 0.20,
      },
      {
        id: '4.6',
        description: 'Erro na passagem do freio "8".',
        discount: 0.20,
      },
      {
        id: '4.7',
        description: 'Controle de descida (debreagem): descida brusca/trancos na saída do patamar e/ou aluno sem luvas.',
        discount: 0.20,
      },
      {
        id: '4.8',
        description: 'Controle de descida (debreagem): trancos durante a descida e/ou velocidade excessiva e/ou vítima com a cabeça excessivamente elevada.',
        discount: 0.20,
      },
      {
        id: '4.9',
        description: 'Estabilização: aluno não compensa desvio da escada (lateralização/deslizamento).',
        discount: 0.20,
      },
      {
        id: '4.10',
        description: 'Sustentação: aluno não utiliza EPI correto e/ou solta a corda e/ou não se posiciona no ângulo correto.',
        discount: 0.20,
      },
      {
        id: '4.11',
        description: 'Não recepcionar a vítima quando a escada já estiver totalmente apoiada no solo.',
        discount: 0.20,
      },
      {
        id: '4.12',
        description: 'Falta de liderança/ação/verbalização do comandante.',
        discount: 0.20,
      },
      {
        id: '4.13',
        description: 'Discussão excessiva entre integrantes da equipe.',
        discount: 0.20,
      },
      {
        id: '4.14',
        description: 'Atentado grave contra a segurança.',
        discount: 1.00,
      },
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
