export const SECTIONS = [
  {
    id: '1.0',
    title: 'TEMPO DE EXECUÇÃO',
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
    id: '2.0',
    title: 'TÉCNICA INCORRETA POR FASE',
    items: [
      {
        id: '2.1',
        description: 'Uso de técnica fora do discriminado para cada fase.',
        discount: 1.00,
      },
    ],
  },
  {
    id: '3.0',
    title: '1ª FASE — MONTAGEM DO SISTEMA',
    items: [
      {
        id: '3.1',
        description: 'Execução da técnica de maneira errada ou não estipulada (Fase 1).',
        discount: 0.20,
      },
      {
        id: '3.2',
        description: 'Equipamentos fora do palco de materiais no início (desorganizados, fora do solo).',
        discount: 0.20,
      },
      {
        id: '3.3',
        description: 'Equipamentos fora do palco de materiais durante a execução (desorganizados).',
        discount: 0.20,
      },
      {
        id: '3.4',
        description: 'Falta de equipamentos para execução da técnica.',
        discount: 0.20,
      },
      {
        id: '3.5',
        description: 'Falta de linha de vida ou linha de vida inadequada.',
        discount: 0.30,
      },
      {
        id: '3.6',
        description: 'Aproximar-se do poço sem estar na linha da vida.',
        discount: 0.30,
      },
      {
        id: '3.7',
        description: 'Membro da equipe sem algum EPI.',
        discount: 0.30,
      },
      {
        id: '3.8',
        description: 'Deixar cair material no poço.',
        discount: 0.30,
      },
      {
        id: '3.9',
        description: 'Deixar cair o tripé.',
        discount: 0.20,
      },
      {
        id: '3.10',
        description: 'Fazer conexões na placa de ancoragem ou polia com o tripé no poço.',
        discount: 0.50,
      },
      {
        id: '3.11',
        description: 'Passagem da fita ou dos mosquetões no cabeçote incorreto ou desalinhado.',
        discount: 0.20,
      },
      {
        id: '3.12',
        description: 'Mosquetões dos sistemas desaqualizados na placa de ancoragem.',
        discount: 0.20,
      },
      {
        id: '3.13',
        description: 'Nós não estipulados, incorretos ou "montados" (prusick, carioca).',
        discount: 0.20,
      },
      {
        id: '3.14',
        description: 'Mosquetões abertos.',
        discount: 0.20,
      },
      {
        id: '3.15',
        description: 'Arvorar tripé fora da altura estipulada (5º furo).',
        discount: 0.20,
      },
      {
        id: '3.16',
        description: 'Tripé com pés desequalizados (não formam triângulo equilátero).',
        discount: 0.20,
      },
      {
        id: '3.17',
        description: 'Sapatas em direção errada.',
        discount: 0.20,
      },
      {
        id: '3.18',
        description: 'Amarração de ancoragem em perna inadequada em relação ao sentido da puxada no portal.',
        discount: 0.20,
      },
      {
        id: '3.19',
        description: 'Corrente das sapatas inexistente ou folgada.',
        discount: 0.20,
      },
      {
        id: '3.20',
        description: 'Passagem de fitas ou cabos em pontos bomba sem proteção de quinas.',
        discount: 0.20,
      },
      {
        id: '3.21',
        description: 'Instalação do freio oito inadequada.',
        discount: 0.20,
      },
      {
        id: '3.22',
        description: 'Passagem do cabo no freio oito inadequada (passagem simples).',
        discount: 0.30,
      },
    ],
  },
  {
    id: '4.0',
    title: '2ª FASE — DESCIDA E RESGATE DA VÍTIMA 1',
    items: [
      {
        id: '4.1',
        description: 'Execução da técnica de maneira errada ou não estipulada (Fase 2).',
        discount: 0.20,
      },
      {
        id: '4.2',
        description: 'Clipar socorrista ao cabo sem bloquear o cabo no freio.',
        discount: 0.30,
      },
      {
        id: '4.3',
        description: 'Nós não estipulados, incorretos ou "montados" (oito).',
        discount: 0.20,
      },
      {
        id: '4.4',
        description: 'Não tirar folga do cabo para entrada do socorrista no poço.',
        discount: 0.30,
      },
      {
        id: '4.5',
        description: 'Começar a descida sem ordem do comandante.',
        discount: 0.20,
      },
      {
        id: '4.6',
        description: 'Socorrista desce sem material necessário (fita, triângulo, capacetes das vítimas, EPRA, HT).',
        discount: 0.30,
      },
      {
        id: '4.7',
        description: 'Instalação do EPRA inadequada (distância, etc.).',
        discount: 0.20,
      },
      {
        id: '4.8',
        description: 'Uso incorreto de equipamento (hope grip, etc.).',
        discount: 0.20,
      },
      {
        id: '4.9',
        description: 'Descida do socorrista com velocidade excessiva.',
        discount: 0.30,
      },
      {
        id: '4.10',
        description: 'Falta de comunicação Socorrista x Comandante (uso do HT).',
        discount: 0.20,
      },
      {
        id: '4.11',
        description: 'Sistema independente inadequado (torcido, etc.).',
        discount: 0.20,
      },
      {
        id: '4.12',
        description: 'Sistema independente pouco compacto.',
        discount: 0.20,
      },
      {
        id: '4.13',
        description: 'Sistema independente sem SCP ou inadequado (volta, hope grip, etc.).',
        discount: 0.30,
      },
      {
        id: '4.14',
        description: 'Retirada da vítima nº 1 de forma insegura (sem SCP atuando).',
        discount: 0.30,
      },
      {
        id: '4.15',
        description: 'Mosquetões abertos.',
        discount: 0.30,
      },
      {
        id: '4.16',
        description: 'Não encaminhar vítima à USB.',
        discount: 0.20,
      },
    ],
  },
  {
    id: '5.0',
    title: '3ª FASE — RESGATE DA VÍTIMA 2 / SISTEMA 5x1',
    items: [
      {
        id: '5.1',
        description: 'Execução da técnica de maneira errada ou não estipulada (Fase 3).',
        discount: 0.20,
      },
      {
        id: '5.2',
        description: 'Falta de comunicação Socorrista x Comandante (uso do HT).',
        discount: 0.20,
      },
      {
        id: '5.3',
        description: 'Falta de SCP para "segurar" o cabo (para instalação do Sistema 5x1).',
        discount: 0.20,
      },
      {
        id: '5.4',
        description: 'Sistema 5x1 reduzido errado ou inadequado.',
        discount: 0.20,
      },
      {
        id: '5.5',
        description: 'Uso incorreto de equipamento (hope grip, etc.).',
        discount: 0.20,
      },
      {
        id: '5.6',
        description: 'Tracionamento ineficaz de cabo de ancoragem (comprovado nas puxadas).',
        discount: 0.20,
      },
      {
        id: '5.7',
        description: 'Negligência de proteção Socorrista x Vítima.',
        discount: 0.30,
      },
      {
        id: '5.8',
        description: 'Falta de uso de máscara ou capuz (socorrista, vítima).',
        discount: 0.30,
      },
      {
        id: '5.9',
        description: 'Retirada da vítima nº 2 de forma insegura (sem SCP atuando).',
        discount: 0.30,
      },
      {
        id: '5.10',
        description: 'Mosquetões abertos.',
        discount: 0.30,
      },
      {
        id: '5.11',
        description: 'Não encaminhar vítima ao local correto.',
        discount: 0.20,
      },
      {
        id: '5.12',
        description: 'Discussão exagerada entre membros da equipe.',
        discount: 0.20,
      },
      {
        id: '5.13',
        description: 'Falta de liderança, ação, verbalização do comandante.',
        discount: 0.30,
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
