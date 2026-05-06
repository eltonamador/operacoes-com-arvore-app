// Ficha fonte: VC-2 2ª Parte — Circuito Operacional (CFSD-26)
//
// Modelo de pontuação: penalidades (começa em 10, subtrai erros).
// Cada seção tem um teto — desconto por estação é limitado ao valor do teto.
//
// BLOCO I : Estações 1–6 · Tempo de referência 16 min · Máx 25 min
// BLOCO II: Estação 7 (Montagem de Motosserra) · cronometrado em separado

export const SECTIONS = [

  // ── BLOCO I — Penalidade Temporal ────────────────────────────────────────
  {
    id: '0.0',
    title: 'PENALIDADE TEMPORAL — Bloco I',
    subtitle: '−0,20 por minuto excedido a partir de 16:01 · interrupção acima de 25:00',
    bloco: 'I',
    isTemporal: true,
    teto: 1.80,
    items: [
      { id: '0.1', description: '16:01 — 17:00 · 1º minuto excedido', discount: 0.20 },
      { id: '0.2', description: '17:01 — 18:00 · 2º minuto excedido', discount: 0.20 },
      { id: '0.3', description: '18:01 — 19:00 · 3º minuto excedido', discount: 0.20 },
      { id: '0.4', description: '19:01 — 20:00 · 4º minuto excedido', discount: 0.20 },
      { id: '0.5', description: '20:01 — 21:00 · 5º minuto excedido', discount: 0.20 },
      { id: '0.6', description: '21:01 — 22:00 · 6º minuto excedido', discount: 0.20 },
      { id: '0.7', description: '22:01 — 23:00 · 7º minuto excedido', discount: 0.20 },
      { id: '0.8', description: '23:01 — 24:00 · 8º minuto excedido', discount: 0.20 },
      { id: '0.9', description: '24:01 — 25:00 · 9º minuto excedido', discount: 0.20 },
      // Acima de 25:00 → interrupção: aplicar todos os 9 itens (−1,80) +
      // penalidades das estações não concluídas.
    ],
  },

  // ── BLOCO I — Estações 1–6 ───────────────────────────────────────────────
  {
    id: '1.0',
    title: 'EST. 1 — Amarração Diamante na Maca Cesto + Balso Americano (chicote)',
    bloco: 'I',
    teto: 1.50,
    items: [
      { id: '1.1', description: 'Nós não estipulados ou incorretos ou sem cote.', discount: 0.20 },
      { id: '1.2', description: 'Cruzamento e tracionamento do cabo em local errado.', discount: 0.20 },
      { id: '1.3', description: 'Passagem de cote na Amarração Diamante.', discount: 0.20 },
      { id: '1.4', description: 'Sistema com folga', discount: 0.20 },
      { id: '1.5', description: 'Balso Americano (chicote) incorreto', discount: 0.30 },
      { id: '1.6', description: 'Cote ausente no Balso Americano.', discount: 0.20 },
    ],
  },
  {
    id: '2.0',
    title: 'EST. 2 — Sistema 4×1 Estendido com SCP + Passabloc no Tripé',
    bloco: 'I',
    teto: 1.50,
    items: [
      { id: '2.1', description: 'Sistema 4×1 inadequado ou fora do estipulado ou torcido.', discount: 0.20 },
      { id: '2.2', description: 'SCP inexistente ou ineficaz (carga retorna ao ser liberada a tração).', discount: 0.20 },
      { id: '2.3', description: 'Nós errados, sem cote (oito no 4×1).', discount: 0.20 },
      { id: '2.4', description: 'Mosquetão aberto ao final da montagem do sistema 4×1.', discount: 0.20 },
      { id: '2.5', description: 'Carga não elevada até o ponto indicado pelo avaliador.', discount: 0.20 },
      { id: '2.6', description: 'Nós do Passablocincorretos ou topologia descaracterizada (sete e oito).', discount: 0.20 },
      { id: '2.7', description: 'Passabloc ineficaz — escorrega, desfaz-se ou não traciona (prussik baixo).', discount: 0.20 },
      { id: '2.8', description: 'Mosquetão aberto na confecção do Passabloc.', discount: 0.20 },
      { id: '2.9', description: 'Tripé caído durante ou após a montagem.', discount: 0.20 },
      // Soma máxima: 9×0,20 = 1,80 · teto aplicado: 1,50
    ],
  },
  {
    id: '3.0',
    title: 'EST. 3 — Arvoramento de Escada de Fibra (2 lances) + Nó Fiel Banzo/Degrau',
    bloco: 'I',
    teto: 1.00,
    items: [
      { id: '3.1', description: 'Arvoramento incorreto — escada não atingiu o 6º degrau ou não foi travada adequadamente.', discount: 0.20 },
      { id: '3.2', description: 'Nó fiel de redundância ausente em 02 (dois) degraus.', discount: 0.20 },
      { id: '3.3', description: 'Nó fiel banzo/degrau incorreto ou ausente.', discount: 0.20 },
      { id: '3.4', description: 'Cote ausente após o nó banzo/degrau.', discount: 0.20 },
      { id: '3.5', description: 'Escada instável ao teste manual após declaração de conclusão.', discount: 0.20 },
    ],
  },
  {
    id: '4.0',
    title: 'EST. 4 — Nós e Amarrações – Bloco A (5 nós)',
    bloco: 'I',
    teto: 1.00,
    items: [
      { id: '4.1', description: 'Cadeirinha Japonesa em desacordo com o padrão técnico.', discount: 0.20 },
      { id: '4.2', description: 'Nó Sete (Bidirecional) – 1º exemplar em desacordo.', discount: 0.20 },
      { id: '4.3', description: 'Nó Sete (Bidirecional) – 2º exemplar em desacordo.', discount: 0.20 },
      { id: '4.4', description: 'Volta da Ribeira em desacordo com o padrão técnico.', discount: 0.20 },
      { id: '4.5', description: 'Balso Americano (no seio) em desacordo com o padrão técnico.', discount: 0.20 },
    ],
  },
  {
    id: '5.0',
    title: 'EST. 5 — Sistema 5×1 Reduzido com SCP + Ancoragem Equalizável "V"',
    bloco: 'I',
    teto: 1.50,
    items: [
      { id: '5.1', description: 'Sistema 5×1 inadequado ou fora do estipulado (configuração ou torcido).', discount: 0.20 },
      { id: '5.2', description: 'SCP inexistente ou ineficaz (carga retorna ao ser liberada a tração).', discount: 0.20 },
      { id: '5.3', description: 'Nós errados, sem cote ou inexistentes no sistema 5×1.', discount: 0.20 },
      { id: '5.4', description: 'Mosquetão aberto ao final da montagem do sistema 5×1.', discount: 0.20 },
      { id: '5.5', description: 'Carga não elevada até o ponto indicado pelo avaliador.', discount: 0.20 },
      { id: '5.6', description: 'Ancoragem equalizável fora da configuração "V" ou ângulo superior a 90°.', discount: 0.30 },
      { id: '5.7', description: 'Ausência do Magic X na ancoragem equalizável.', discount: 0.20 },
    ],
  },
  {
    id: '6.0',
    title: 'EST. 6 — Nós e Amarrações – Bloco B (5 nós)',
    bloco: 'I',
    teto: 1.00,
    items: [
      { id: '6.1', description: 'Cadeirinha Rápida Nilson em desacordo (pescador,boca de lobo ou direito).', discount: 0.20 },
      { id: '6.2', description: 'Prussik (horizontal) em desacordo com o padrão técnico.', discount: 0.20 },
      { id: '6.3', description: 'Lais de Guia (empatado) em desacordo com o padrão técnico.', discount: 0.20 },
      { id: '6.4', description: 'Escota Duplo em desacordo com o padrão técnico.', discount: 0.20 },
      { id: '6.5', description: 'Nó de Fita em desacordo com o padrão técnico.', discount: 0.20 },
    ],
  },

  // ── BLOCO II — Estação 7 ─────────────────────────────────────────────────
  {
    id: '7.0',
    title: 'EST. 7 — Montagem de Motosserra',
    subtitle: 'Cronometrado em separado · Ref: 1min30s · Máx: 2min',
    bloco: 'II',
    teto: 1.00,
    items: [
      { id: '7.1', description: 'Tempo de montagem excedido (superior a 1min30s).', discount: 0.20 },
      { id: '7.2', description: 'Corrente frouxa — folga perceptível ao puxar verticalmente pelo elo central do sabre.', discount: 0.20 },
      { id: '7.3', description: 'Porcas frouxas — movimento perceptível ao movimentar sabre ou porcas manualmente.', discount: 0.20 },
      { id: '7.4', description: 'Corrente invertida — dentes de corte apontando em sentido contrário ao giro de operação.', discount: 0.20 },
      { id: '7.5', description: 'Corrente apertada em excesso — não desliza livremente ao longo do sabre.', discount: 0.20 },
    ],
  },
]

// Desconto por seção limitado ao teto da estação.
export function calcScore(checkedItems, customErrorDiscount = 0) {
  let totalDiscount = 0
  let temporalDiscount = 0
  let stationDiscount = 0

  for (const section of SECTIONS) {
    let sectionSum = 0
    for (const item of section.items) {
      if (checkedItems.has(item.id)) sectionSum += item.discount
    }
    const capped = Math.min(sectionSum, section.teto)
    totalDiscount += capped
    if (section.isTemporal) temporalDiscount += capped
    else stationDiscount += capped
  }

  totalDiscount += customErrorDiscount

  return {
    totalDiscount: Math.round(totalDiscount * 100) / 100,
    temporalDiscount: Math.round(temporalDiscount * 100) / 100,
    stationDiscount: Math.round(stationDiscount * 100) / 100,
    finalScore: Math.max(0, Math.round((10 - totalDiscount) * 100) / 100),
  }
}
