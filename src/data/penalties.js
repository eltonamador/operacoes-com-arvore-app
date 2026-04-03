export const SECTIONS = [
  {
    id: '1.0',
    title: 'EPI E APRESENTAÇÃO',
    items: [
      {
        id: '1.1',
        description: 'Deixar de utilizar ou ajustar incorretamente qualquer EPI exigido.',
        discount: 0.30,
      },
    ],
  },
  {
    id: '2.0',
    title: 'MONTAGEM (BANCADA)',
    items: [
      { id: '2.1', description: 'Montar a corrente no sentido inverso (barbatana para trás).', discount: 0.20 },
      { id: '2.2', description: 'Deixar de retornar o tensionador ou realizar ajuste inadequado da corrente.', discount: 0.20 },
      { id: '2.3', description: 'Não realizar o aperto firme das porcas da tampa.', discount: 0.20 },
      { id: '2.4', description: 'Esquecer de testar a movimentação adequada da corrente.', discount: 0.20 },
      { id: '2.5', description: 'Esquecer de testar o travamento do freio de corrente na bancada.', discount: 0.20 },
      { id: '2.6', description: 'Deixar a corrente com folga excessiva.', discount: 0.20 },
    ],
  },
  {
    id: '3.0',
    title: 'DESLOCAMENTO E PARTIDA',
    items: [
      { id: '3.1', description: 'Deslocar-se com o sabre voltado para frente ou de forma insegura.', discount: 0.20 },
      { id: '3.2', description: 'Não verbalizar a rota de fuga.', discount: 0.20 },
      { id: '3.3', description: 'Não limpar a área de trabalho, quando necessário.', discount: 0.20 },
      { id: '3.4', description: 'Realizar partida incorreta (sem apoiar no chão ou sem travar o freio).', discount: 0.20 },
      { id: '3.5', description: 'Não colocar o interruptor na posição de trabalho "I" para ligar.', discount: 0.20 },
    ],
  },
  {
    id: '4.0',
    title: 'TÉCNICA DE CORTE – MONO-APOIADO',
    items: [
      { id: '4.1', description: 'Destravar o freio com a mão dominante (traseira).', discount: 0.20 },
      { id: '4.2', description: 'Não realizar base corporal correta (posição dos pés).', discount: 0.20 },
      { id: '4.3', description: 'Posicionar-se na direção final de corte do tronco.', discount: 0.20 },
      { id: '4.4', description: 'Iniciar o corte com a ponta do sabre (risco de rebote).', discount: 0.20 },
      { id: '4.5', description: 'Entrar no corte com aceleração inadequada (muito baixa ou 100%).', discount: 0.10 },
      { id: '4.6', description: 'Apoiar a motosserra no tronco antes de acelerar.', discount: 0.20 },
      { id: '4.7', description: 'Forçar o conjunto sabre/corrente até travar ("máquina reclamando").', discount: 0.20 },
      { id: '4.8', description: 'Não realizar desaceleração na saída do corte.', discount: 0.20 },
      { id: '4.9', description: 'Não realizar a técnica da gangorra ou aplicar o "serrotar".', discount: 0.20 },
      { id: '4.10', description: 'Não realizar o travamento do freio após o corte.', discount: 0.20 },
    ],
  },
  {
    id: '5.0',
    title: 'TÉCNICA DE CORTE – BI-APOIADO',
    items: [
      { id: '5.1', description: 'Destravar o freio com a mão dominante (traseira).', discount: 0.20 },
      { id: '5.2', description: 'Não realizar base corporal correta (posição dos pés).', discount: 0.20 },
      { id: '5.3', description: 'Posicionar-se na direção final de corte do tronco.', discount: 0.20 },
      { id: '5.4', description: 'Não realizar corte de alívio no bi-apoiado, quando necessário.', discount: 0.10 },
      { id: '5.5', description: 'Iniciar o corte com a ponta do sabre (risco de rebote).', discount: 0.20 },
      { id: '5.6', description: 'Entrar no corte com aceleração inadequada (muito baixa ou 100%).', discount: 0.10 },
      { id: '5.7', description: 'Apoiar a motosserra no tronco antes de acelerar.', discount: 0.20 },
      { id: '5.8', description: 'Forçar o conjunto sabre/corrente até travar ("máquina reclamando").', discount: 0.20 },
      { id: '5.9', description: 'Não realizar desaceleração na saída do corte.', discount: 0.20 },
      { id: '5.10', description: 'Não realizar a técnica da gangorra ou aplicar o "serrotar".', discount: 0.20 },
    ],
  },
  {
    id: '6.0',
    title: 'FINALIZAÇÃO',
    items: [
      { id: '6.1', description: 'Deixar de travar e/ou desligar a máquina antes de "dar o pronto".', discount: 0.20 },
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
