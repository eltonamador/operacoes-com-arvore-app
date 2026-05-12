# Plano — Lógica de Resultado: Desempenho vs. Verificação Final

**Data:** 2026-05-12
**Status:** Aprovado (aguardando execução)
**Autor:** elton.amador@gmail.com

---

## 1. Motivação

O sistema atualmente exibe **"APROVADO" / "REPROVADO"** em avaliações individuais (Circuito, Escada, Poço, Motosserra, Prova Teórica), o que é **incorreto** conforme o regulamento da Academia Bombeiro Militar.

**Regra correta:**

- Avaliações **individuais** apenas indicam a posição da nota em relação à média **7,00**:
  - `< 7,00` → **Abaixo da média**
  - `= 7,00` → **Na média**
  - `> 7,00` → **Acima da média**
- Apenas na **consolidação final** (média de VC1, VC2, VC3) é que há juízo:
  - `< 7,00` → **Verificação Final** (não "Reprovado")
  - `= 7,00` → **Na Média Final**
  - `> 7,00` → **Acima da Média Final**

---

## 2. Decisões aprovadas

| Item | Decisão |
|---|---|
| Quiz entra no escopo? | **Não** — quiz é fluxo de gamificação, não compõe VC. |
| Texto "o aluno pode ser reprovado" em motosserra/Evaluation.jsx:228 | **Remover** |
| Cor de "Abaixo da média" | **Âmbar** (atenção moderada, sem tom de reprovação) |
| Manter booleano `apto` em consolidacaoService? | **Sim** (manter compat) |
| Gravar este plano em docs/plans/ | **Sim** (este arquivo) |

---

## 3. Diagnóstico do estado atual

Fonte única de "passou/não passou" hoje: `isPassing = finalScore >= 7.0`, recalculada em cada tela e persistida como string `'APROVADO'`/`'REPROVADO'` em `itens_avaliados.resultado` (JSONB).

**Arquivos afetados (~30):**

**Serviços**
- `src/services/avaliacoesService.js` — `isPassing` derivado da string `'APROVADO'`.
- `src/services/consolidacaoService.js` — calcula `vc1/vc2/vc3/mediaFinal/apto`.

**Módulos (5 módulos × 5 telas)**: `motosserra`, `escadas`, `pocos`, `circuito`, `teorica` — cada um com `Evaluation.jsx`, `Signature.jsx`, `Summary.jsx`, `Reports.jsx`, `AdvancedReports.jsx`.

- `Summary.jsx` (linha ~37/41/44 em cada módulo) — **grava** `resultado: 'APROVADO'|'REPROVADO'`.
- `Evaluation/Signature/Summary` — badge verde/vermelho.
- `Reports/AdvancedReports` — cards "Aprovados/Reprovados", coluna "Resultado", exportação CSV/XLSX, filtros.

**Páginas de portal**
- `src/pages/CoordenacaoArea.jsx` — KPIs, donut, filtros, tabela, exportação.
- `src/pages/AlunoArea.jsx` — KPIs, filtros, tabela.

**Utilitários**
- `src/utils/vistoProvaReport.js`
- `src/utils/collectiveSignatureSheet.js`

**Fora do escopo:** `src/modules/quiz/*` (decisão a).

---

## 4. Funções centralizadas a criar

Novo módulo `src/utils/statusNota.js` (zero dependências):

```js
export const STATUS_INDIVIDUAL = {
  ABAIXO: 'ABAIXO_DA_MEDIA',
  NA:     'NA_MEDIA',
  ACIMA:  'ACIMA_DA_MEDIA',
}

export const STATUS_FINAL = {
  VERIFICACAO: 'VERIFICACAO_FINAL',
  NA:          'NA_MEDIA_FINAL',
  ACIMA:       'ACIMA_DA_MEDIA_FINAL',
}

export const MEDIA = 7

export const round2 = (n) => Math.round(Number(n) * 100) / 100

export function getStatusNotaIndividual(nota) {
  const v = round2(nota)
  if (v < MEDIA)  return STATUS_INDIVIDUAL.ABAIXO
  if (v === MEDIA) return STATUS_INDIVIDUAL.NA
  return STATUS_INDIVIDUAL.ACIMA
}

export function getStatusMediaFinal(vc1, vc2, vc3) {
  const media = round2((Number(vc1) + Number(vc2) + Number(vc3)) / 3)
  if (media < MEDIA)  return { media, status: STATUS_FINAL.VERIFICACAO }
  if (media === MEDIA) return { media, status: STATUS_FINAL.NA }
  return { media, status: STATUS_FINAL.ACIMA }
}

export const labelIndividual = (s) => ({
  ABAIXO_DA_MEDIA: 'Abaixo da média',
  NA_MEDIA:        'Na média',
  ACIMA_DA_MEDIA:  'Acima da média',
}[s])

export const labelFinal = (s) => ({
  VERIFICACAO_FINAL:    'Verificação Final',
  NA_MEDIA_FINAL:       'Na Média Final',
  ACIMA_DA_MEDIA_FINAL: 'Acima da Média Final',
}[s])

export const toneIndividual = (s) => ({
  ABAIXO_DA_MEDIA: 'attention',  // âmbar
  NA_MEDIA:        'neutral',
  ACIMA_DA_MEDIA:  'positive',
}[s])

export const toneFinal = (s) => ({
  VERIFICACAO_FINAL:    'alert',      // vermelho-laranja
  NA_MEDIA_FINAL:       'neutral',
  ACIMA_DA_MEDIA_FINAL: 'positive',
}[s])
```

Componente compartilhado `src/components/StatusBadge.jsx` com props `status` e `tipo: 'individual' | 'final'`.

---

## 5. Modelo de dados e compatibilidade

- **Banco:** não migrar `itens_avaliados.resultado`. Registros antigos preservados.
- **Saves novos:** remover gravação de `resultado: 'APROVADO'/'REPROVADO'` em todos os `Summary.jsx`.
- **`avaliacoesService.js`:** calcular `statusIndividual` dinamicamente a partir de `finalScore`. Manter `isPassing` derivado da nota (não da string legacy) para compat interna.
- **`consolidacaoService.js`:** adicionar `statusFinal` retornado por `getStatusMediaFinal`. Manter `apto` (booleano) por compat.
- **Compat retroativa:** registros antigos exibem status recalculado a partir da nota — nunca exibem "REPROVADO".

---

## 6. CSS / paleta visual

Adicionar tokens em `src/styles/global.css`:

| Tom | Uso | Cor sugerida |
|---|---|---|
| `positive` | Acima da média / Acima da Média Final | verde suave |
| `neutral`  | Na média / Na Média Final | cinza-azulado |
| `attention` | Abaixo da média | **âmbar** (#E0A800 / #FFB84D) |
| `alert`    | Verificação Final | vermelho-laranja |

Componente `StatusBadge` aplica classes `badge badge--{tone}`.

---

## 7. Telas a alterar (por módulo)

Para `motosserra`, `escadas`, `pocos`, `circuito`, `teorica`:

| Tela | Mudança |
|---|---|
| `Evaluation.jsx` | Badge `<StatusBadge tipo="individual" />` |
| `Signature.jsx` | Idem |
| `Summary.jsx` | Idem + **remover** gravação `resultado:` |
| `Reports.jsx` | Cards "Aprovados/Reprovados" → 3 cards (Acima/Na/Abaixo). Coluna "Resultado" → label individual |
| `AdvancedReports.jsx` | Idem + ajustar exportação CSV/XLSX + filtros |

**Especial:** `motosserra/Evaluation.jsx:228` — remover o texto "O aluno pode ser reprovado independentemente da nota final" (decisão b).

---

## 8. Páginas de portal

**CoordenacaoArea.jsx**
- Donut 2 segmentos → **donut 3 segmentos** (Acima/Na/Abaixo) para avaliações individuais.
- Filtros `aprovado/reprovado` → `acima/na/abaixo`.
- **Nova seção "Consolidação"** com filtros `verificacao_final/na_media_final/acima_da_media_final` (alimentada por `consolidacaoService`).
- Exportações: atualizar cabeçalhos.

**AlunoArea.jsx**
- KPIs + filtros + tabela com nova nomenclatura.

---

## 9. Utilitários

- `src/utils/vistoProvaReport.js` — cards e badges com nova nomenclatura.
- `src/utils/collectiveSignatureSheet.js` — revisar; só ajustar se exibir resultado.

---

## 10. Plano de testes manuais

**Individual:**
- nota `0` → Abaixo da média
- nota `6.99` → Abaixo da média
- nota `7.00` → Na média
- nota `6.999` (após `round2`) → Na média
- nota `7.01` → Acima da média
- nota `10` → Acima da média

**Média Final:**
- `6+7+8` → 7.00 → Na Média Final
- `5+6+7` → 6.00 → Verificação Final
- `8+9+10` → 9.00 → Acima da Média Final
- `7+7+7` → 7.00 → Na Média Final
- VC1 ausente → não mostra status final (mantém `null`)

**Regressão:**
- Carregar avaliação antiga com `resultado: 'REPROVADO'` → tela deve recalcular pela nota; nunca exibir "Reprovado".
- Salvar nova avaliação → `itens_avaliados.resultado` não mais gravado.
- Fluxo completo: lançamento → assinatura/PIN → resumo → relatório → ranking → exportação CSV/XLSX/impressão.

---

## 11. Riscos

1. **`resultado` legacy em integrações externas (planilhas).** Mitigação: não apagar coluna; documentar em `wake-up.md`.
2. **Alto volume de mudanças (5 × 5 telas).** Mitigação: refator por etapas; commit por etapa.
3. **URLs com `?filtroResultado=aprovado`** quebram. Aceito.
4. **Contraste do âmbar em tema escuro/claro** — validar manualmente.

---

## 12. Ordem de execução

1. Criar `src/utils/statusNota.js` + `src/components/StatusBadge.jsx` + tokens CSS.
2. Ajustar `avaliacoesService.js` e `consolidacaoService.js`.
3. Refatorar `Summary.jsx` dos 5 módulos (parar de gravar `resultado`, usar badge).
4. Refatorar `Evaluation.jsx` + `Signature.jsx` dos 5 módulos.
5. Refatorar `Reports.jsx` + `AdvancedReports.jsx` dos 5 módulos.
6. Refatorar `CoordenacaoArea.jsx` e `AlunoArea.jsx`.
7. Atualizar `vistoProvaReport.js` e `collectiveSignatureSheet.js`.
8. Testes manuais (§10).
9. Registrar decisão em `docs/decisions/2026-05-12-status-desempenho.md` e atualizar `docs/wake-up.md`.

---

## 13. Critérios de aceite

- Nenhuma avaliação individual exibe "Reprovado" ou "Aprovado".
- Status individual segue 3 valores: Abaixo / Na / Acima da média.
- "Verificação Final" só aparece na consolidação, quando média final < 7.
- Relatórios, rankings, filtros e exportações usam a nova nomenclatura.
- Registros antigos continuam carregando sem erro e exibem status recalculado.
- Fluxo completo (lançamento → assinatura → relatório) permanece funcional.
