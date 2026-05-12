# 2026-05-12 — Status de desempenho substitui Aprovado/Reprovado

**Tipo:** decisão de produto + decisão técnica
**Status:** Implementada
**Plano:** [docs/plans/2026-05-12-status-desempenho.md](../plans/2026-05-12-status-desempenho.md)

---

## Contexto

O sistema exibia "APROVADO/REPROVADO" em todas as avaliações individuais (Motosserra, Escadas, Poços, Circuito, Prova Teórica). Conforme regulamento da Academia Bombeiro Militar, **isso é incorreto**: avaliação individual não reprova aluno — apenas indica o desempenho em relação à média 7,00. A reprovação só existe via "Verificação Final" quando a média final consolidada VC1+VC2+VC3 fica abaixo de 7,00.

## Decisão

### Avaliação individual (por módulo)
- `nota < 7,00` → **"Abaixo da média"** (âmbar)
- `nota === 7,00` → **"Na média"** (neutro)
- `nota > 7,00` → **"Acima da média"** (verde)

Nenhuma avaliação individual exibe "Reprovado" ou "Aprovado".

### Consolidação final (VC1+VC2+VC3)/3
- `< 7,00` → **"Verificação Final"** (atenção; aluno faz prova adicional)
- `=== 7,00` → **"Na Média Final"**
- `> 7,00` → **"Acima da Média Final"**

Termo "Reprovado" não é usado.

### Itens específicos
- **Quiz:** fora do escopo desta decisão (gamificação, não compõe VC).
- **Erros críticos (motosserra):** removido o aviso "o aluno pode ser reprovado". O toggle `criticalErrors` permanece como sinalização informativa apenas; não afeta o status.
- **Booleano `apto` em `consolidacaoService`:** mantido por compat. ATENÇÃO: `apto === false` agora significa "Verificação Final", não "Reprovado".
- **Cor de "Abaixo da média":** âmbar (#E0A800 / #ffcc4d), nunca vermelho.

## Implementação

### Núcleo
- [src/utils/statusNota.js](../../src/utils/statusNota.js) — `getStatusNotaIndividual`, `getStatusMediaFinal`, `labelIndividual`, `labelFinal`, `getVisualIndividual`, `TONE_VISUAL`, constantes `STATUS_INDIVIDUAL` e `STATUS_FINAL`, `MEDIA = 7`, `round2`.
- [src/components/StatusBadge.jsx](../../src/components/StatusBadge.jsx) — badge unificado (props `tipo`, `nota`, `status`, `vc1/vc2/vc3`).

### Serviços
- [avaliacoesService.js](../../src/services/avaliacoesService.js): `mapDbToUi` agora calcula `statusIndividual` dinamicamente da nota; `isPassing` agora deriva de `finalScore >= 7` (não mais da string legacy `'APROVADO'`).
- [consolidacaoService.js](../../src/services/consolidacaoService.js): `calcularConsolidacao` retorna agora `{ vc1, vc2, vc3, mediaFinal, statusFinal, apto }`.

### Telas refatoradas
- **Summary.jsx** dos 5 módulos: pararam de gravar `itens_avaliados.resultado: 'APROVADO'|'REPROVADO'`. Banner usa visual de 4 tons.
- **Evaluation.jsx + Signature.jsx** dos 5 módulos: badge de desempenho substituiu "APROVADO/REPROVADO".
- **Reports.jsx + AdvancedReports.jsx** dos 9 módulos: 3 cards Acima/Na/Abaixo, `StatusBadge` nas tabelas, exportações CSV/XLSX com `labelIndividual`, ranking por pelotão renomeado para `atOrAboveRate` ("≥ média").

### Portal
- **CoordenacaoArea.jsx** e **AlunoArea.jsx**: KPIs (3 colunas), donut 3-segmentos (`DonutChart3`), filtros (`acima`/`na`/`abaixo`), exportações, tabelas; consolidação relabeled (`≥ Média Final` / `Verificação Final`).

### Impressão
- [vistoProvaReport.js](../../src/utils/vistoProvaReport.js): cards e badges com nova nomenclatura.
- `collectiveSignatureSheet.js`: nenhuma alteração necessária.

## Compatibilidade retroativa

- **Banco:** nenhuma migration. Registros antigos com `itens_avaliados.resultado: 'APROVADO'|'REPROVADO'` permanecem; o sistema **ignora** esse campo e recalcula o status pela `nota_final`. Resultado: nenhum registro antigo aparece mais como "Reprovado".
- **Novos saves:** o campo `resultado` deixou de ser gravado.

## Riscos conhecidos

1. Integrações externas (planilhas exportadas) que dependam dos textos "APROVADO"/"REPROVADO" passam a receber "Acima da média" / "Na média" / "Abaixo da média". Documentado em `wake-up.md`.
2. URLs com `?filtroResultado=aprovado` deixam de filtrar. Aceito.
3. Cor âmbar deve ser validada manualmente em tema claro/escuro (não testado automaticamente).
