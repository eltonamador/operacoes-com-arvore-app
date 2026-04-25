export const SECTIONS = [
  {
    id: '1.0',
    title: 'EPI E APRESENTAÇÃO',
    items: [
      { id: '1.1', description: 'Deixar de usar ou ajustar incorretamente qualquer EPI exigido.', discount: 0.30 },
      { id: '1.2', description: 'Deixar de usar luva de raspa nas manobras de tração em corda.', discount: 0.30 },
      { id: '1.3', description: 'Retirar luvas, óculos ou capacete durante a execução da atividade.', discount: 0.30 },
    ],
  },
  {
    id: '2.0',
    title: 'MONTAGEM INICIAL E PALCO DE MATERIAIS',
    items: [
      { id: '2.1', description: 'Deixar equipamentos fora do palco de materiais no início da prova, desorganizados ou fora do solo.', discount: 0.20 },
      { id: '2.2', description: 'Deixar equipamentos fora do palco de materiais durante a execução, de forma desorganizada.', discount: 0.20 },
      { id: '2.3', description: 'Deixar faltar material necessário para a execução da técnica.', discount: 0.20 },
      { id: '2.4', description: 'Organizar inadequadamente cabos, ferragens e aduchamentos no palco.', discount: 0.20 },
      { id: '2.5', description: 'Deixar o tripé cair durante a montagem.', discount: 0.50 },
    ],
  },
  {
    id: '3.0',
    title: 'FASE 1 – TRIPÉ, ANCORAGENS E SISTEMAS',
    items: [
      { id: '3.1', description: 'Fazer conexões na placa de ancoragem ou em polia com o tripé já posicionado sobre o poço.', discount: 0.30 },
      { id: '3.2', description: 'Montar incorretamente equipamentos ou sistemas.', discount: 0.30 },
      { id: '3.3', description: 'Posicionar incorretamente mosquetões dos sistemas na placa de ancoragem, deixando-os desalinhados ou mal distribuídos.', discount: 0.20 },
      { id: '3.4', description: 'Usar mosquetão automático.', discount: 0.30 },
      { id: '3.5', description: 'Deixar mosquetão aberto ou sem fechamento adequado, por unidade.', discount: 0.30, perUnit: true },
      { id: '3.6', description: 'Deixar de dar a meia-volta final no mosquetão de rosca, por unidade.', discount: 0.20, perUnit: true },
      { id: '3.7', description: 'Executar nó não estipulado, incorreto ou mal montado, por unidade.', discount: 0.20, perUnit: true },
      { id: '3.8', description: 'Deixar sistemas descentralizados na abertura do poço.', discount: 0.20 },
      { id: '3.9', description: 'Posicionar mal os pés do tripé, sem geometria adequada de apoio.', discount: 0.20 },
      { id: '3.10', description: 'Deixar a corrente das sapatas inexistente, frouxa ou inadequadamente ajustada.', discount: 0.20 },
      { id: '3.11', description: 'Montar incorretamente o blocante estrutural.', discount: 0.40 },
      { id: '3.12', description: 'Passar fita em ponto-bomba sem proteção de quinas.', discount: 0.20 },
      { id: '3.13', description: 'Instalar inadequadamente o freio oito.', discount: 0.20 },
      { id: '3.14', description: 'Executar incorretamente o nó direito de escape ou deixar de aplicar cote.', discount: 0.20 },
      { id: '3.15', description: 'Deixar frouxa a amarração de ancoragem na perna do tripé.', discount: 0.20 },
      { id: '3.16', description: 'Montar sistema torcido ou desalinhado.', discount: 0.30 },
      { id: '3.17', description: 'Deixar de instalar SCP, ou instalá-lo inadequadamente, no sistema exigido.', discount: 0.50 },
    ],
  },
  {
    id: '4.0',
    title: 'FASE 2 – DESCIDA DO SOCORRISTA E SALVAMENTO DA VÍTIMA Nº 1',
    items: [
      { id: '4.1', description: 'Executar incorretamente o nó oito, deixá-lo sem cote ou montá-lo de forma inadequada.', discount: 0.20 },
      { id: '4.2', description: 'Deixar de retirar a folga do cabo para a entrada do socorrista no poço.', discount: 0.20 },
      { id: '4.3', description: 'Iniciar a descida sem ordem do comandante.', discount: 0.20 },
      { id: '4.4', description: 'Descer sem o material necessário, como cabo, capacetes das vítimas e EPRA.', discount: 0.20 },
      { id: '4.5', description: 'Socorrista desce sem o sistema 4x1 conectado ao lado da cadeirinha.', discount: 0.20 },
      { id: '4.6', description: 'Instalar inadequadamente o EPRA.', discount: 0.20 },
      { id: '4.7', description: 'Conectar o conjunto EPRA ao sistema sem cautela ou sem o apoio de dois militares, expondo risco de queda sobre a vítima.', discount: 0.40 },
      { id: '4.8', description: 'Instalar inadequadamente o SCP no sistema 4x1.', discount: 0.20 },
      { id: '4.9', description: 'Sistema estendido 4x1 trava a descida do socorrista.', discount: 0.20 },
      { id: '4.10', description: 'Descer o socorrista com velocidade excessiva.', discount: 0.20 },
      { id: '4.11', description: 'Deixar de manter comunicação entre socorrista e comandante.', discount: 0.20 },
      { id: '4.12', description: 'Deixar o sistema torcer durante a subida da vítima nº 1 ou deixar de corrigir torção evidente.', discount: 0.20 },
      { id: '4.13', description: 'Executar incorretamente a cadeirinha rápida (Nilson) na vítima nº 1.', discount: 0.30 },
      { id: '4.14', description: 'Conectar inadequadamente a vítima nº 1 ao sistema 4x1.', discount: 0.30 },
      { id: '4.15', description: 'Retirar a vítima nº 1 de forma insegura, sem SCP atuando adequadamente.', discount: 0.50 },
      { id: '4.16', description: 'Usar mosquetão mal fechado na conexão da vítima nº 1.', discount: 0.30 },
      { id: '4.17', description: 'Desclipar a vítima nº 1 antes do ponto regulamentar.', discount: 0.30 },
    ],
  },
  {
    id: '5.0',
    title: 'FASE 3 – SALVAMENTO DA VÍTIMA Nº 2',
    items: [
      { id: '5.1', description: 'Deixar de manter comunicação entre socorrista e comandante.', discount: 0.20 },
      { id: '5.2', description: 'Deixar de usar SCP para segurar o cabo durante a instalação do sistema 5x1.', discount: 0.20 },
      { id: '5.3', description: 'Montar incorretamente o sistema 5x1 reduzido ou deixá-lo inadequado.', discount: 0.20 },
      { id: '5.4', description: 'Usar incorretamente equipamento, como Hope Grip ou anel para Prusik.', discount: 0.20 },
      { id: '5.5', description: 'Tracionar ineficazmente o cabo de ancoragem, mantendo o EPRA no fundo do poço.', discount: 0.20 },
      { id: '5.6', description: 'Deixar de tensionar o sistema T-Block logo após a primeira puxada da vítima nº 2.', discount: 0.20 },
      { id: '5.7', description: 'Executar inadequadamente os resets do sistema.', discount: 0.20 },
      { id: '5.8', description: 'Negligenciar a proteção entre socorrista e vítima.', discount: 0.20 },
      { id: '5.9', description: 'Ancorar inadequadamente a vítima nº 2 à cadeirinha tipo 3.', discount: 0.20 },
      { id: '5.10', description: 'Retirar a vítima nº 2 de forma insegura, sem SCP atuando adequadamente.', discount: 0.50 },
      { id: '5.11', description: 'Deixar de retirar o EPRA do cabo antes da saída da dupla do poço.', discount: 0.20 },
      { id: '5.12', description: 'Deixar mosquetões abertos ou mal fechados no sistema da vítima nº 2.', discount: 0.20 },
      { id: '5.13', description: 'Desclipar a vítima nº 2 antes do ponto regulamentar.', discount: 0.30 },
    ],
  },
  {
    id: '6.0',
    title: 'DISCIPLINA, TEMPO E OCORRÊNCIAS CRÍTICAS',
    items: [
      { id: '6.1', description: 'Executar, como comandante de grupo com 6 alunos, tarefa não estipulada para sua função.', discount: 1.00 },
      { id: '6.2', description: 'Aproximar-se da zona do poço sem estar devidamente clipado à linha de vida.', discount: 0.30 },
      { id: '6.3', description: 'Deixar cair material ao solo, de forma insegura.', discount: 0.20 },
      { id: '6.4', description: 'Deixar cair material no poço.', discount: 2.00 },
      { id: '6.5', description: 'Permitir discussão exagerada entre os membros da equipe.', discount: 0.20 },
      { id: '6.6', description: 'Deixar de verbalizar ou comandar com clareza durante a prova.', discount: 0.20 },
      { id: '6.7a', description: 'Exigir intervenção do avaliador por falha grave de segurança (–0,50).', discount: 0.50 },
      { id: '6.7b', description: 'Exigir intervenção do avaliador por falha grave de segurança (–1,00).', discount: 1.00 },
      { id: '6.8', description: 'Deixar o tripé cair durante o salvamento com vítimas (Falta gravíssima – Nota zero).', discount: 10.00 },
      { id: '6.9.1', description: 'Tempo: Excede 17:00 (>17:01 até 18:00).', discount: 0.20 },
      { id: '6.9.2', description: 'Tempo: Excede 18:00 (>18:01 até 19:00).', discount: 0.20 },
      { id: '6.9.3', description: 'Tempo: Excede 19:00 (>19:01 até 20:00).', discount: 0.20 },
      { id: '6.9.4', description: 'Tempo: Excede 20:00 (>20:01 até 21:00).', discount: 0.20 },
      { id: '6.9.5', description: 'Tempo: Excede 21:00 (>21:01 até 22:00).', discount: 0.20 },
      { id: '6.9.6', description: 'Tempo: Excede 22:00 (>22:01 até 23:00).', discount: 0.20 },
      { id: '6.9.7', description: 'Tempo: Excede 23:00 (>23:01 até 24:00).', discount: 0.20 },
      { id: '6.9.8', description: 'Tempo: Excede 24:00 (>24:01 até 25:00 - limite máximo).', discount: 0.20 },
    ],
  },
]

/**
 * Calcula nota final.
 * @param {Set<string>} checkedItems
 * @param {number} customErrorDiscount
 * @param {Object} itemQuantities — { [itemId]: number } para itens perUnit
 */
export function calcScore(checkedItems, customErrorDiscount = 0, itemQuantities = {}) {
  let total = 0
  for (const section of SECTIONS) {
    for (const item of section.items) {
      if (checkedItems.has(item.id)) {
        const qty = item.perUnit ? (itemQuantities[item.id] || 1) : 1
        total += item.discount * qty
      }
    }
  }
  total += customErrorDiscount
  return {
    totalDiscount: Math.round(total * 100) / 100,
    finalScore: Math.max(0, Math.round((10 - total) * 100) / 100),
  }
}
