# Decisão — Relatório de Pendências (Coordenação)

**Data:** 2026-05-17
**Status:** Implementado (Fase 1 — apenas leitura)
**Contexto:** Turma CFSD-26, ~180 alunos. Identificada possibilidade de registros duplicados na mesma avaliação para o mesmo aluno. Coordenação precisa de visão única para conferência manual antes de qualquer correção.

## Decisão

Criar nova aba **"Pendências"** na área de Coordenação que cruza `students.json` × tabela `avaliacoes` e classifica cada aluno em uma das 6 situações: COMPLETO, PENDENTE PARCIAL, SEM NENHUMA AVALIAÇÃO, POSSÍVEL DUPLICIDADE, ASSINATURA/PIN PENDENTE, REQUER ANÁLISE DA COORDENAÇÃO.

## Regras aplicadas

- **Escopo de módulos:** `escadas`, `pocos`, `motosserra`, `circuito`. **Teórica fora** (não compõe esta análise).
- **Janela temporal:** `data_avaliacao >= '2026-01-01'` (turma CFSD-26).
- **Duplicidade:** chave `(numero_ordem, module_id)`. Mais de 1 registro válido = DUPLICADO. Inclui Poço (cada integrante deve aparecer exatamente 1 vez).
- **Aluno fantasma:** `numero_ordem` presente em `avaliacoes` sem correspondência em `students.json` → SITUACAO.REQUER_ANALISE com observação "Registro órfão".
- **PIN/assinatura:** registro com `nota_final` mas `itens_avaliados.visto_confirmado !== true` (Poço usa `assinatura_individual.visto_confirmado`).
- **Precedência da situação geral:** sem nada → SEM_NENHUMA; duplicidade + pendência/PIN → REQUER_ANALISE; só duplicidade → POSSIVEL_DUPLICIDADE; tudo OK → COMPLETO; tudo com nota mas faltando assinatura → PIN_PENDENTE; demais combinações → PENDENTE_PARCIAL.

## O que **NÃO** foi feito (escopo desta fase)

- Sem `UPDATE`, `DELETE` ou migration.
- Sem `UNIQUE constraint` na tabela `avaliacoes` (proposta para fase futura).
- Sem mudança em cálculo de média, status de aluno ou critério de aprovação.
- Sem correção automática de duplicidade — apenas exposição de IDs para conferência manual.
- Sem debounce/guard de clique duplo no save (proposta para fase futura).

## Arquivos

**Criados:**
- `src/services/pendenciasService.js` — funções puras + fetch único.
- `src/hooks/usePendencias.js` — wrapper de loading/error/reload.
- `src/pages/coordenacao/RelatorioPendencias.jsx` — UI completa.
- `docs/decisions/2026-05-17-relatorio-pendencias.md` (este arquivo).

**Editados:**
- `src/pages/CoordenacaoArea.jsx` — nova aba "Pendências".
- `docs/current-state.md`, `docs/wake-up.md`.

## Próximas fases (não implementadas)

1. **Prevenção de novos duplicados (frontend):** desabilitar botão Salvar após 1º clique nos 4 módulos.
2. **Prevenção no banco:** migration adicionando `UNIQUE (numero_ordem, module_id)` para escadas/motosserra/circuito; `UNIQUE (numero_ordem, module_id, data_avaliacao)` para Poço. **Pré-requisito:** limpar duplicatas manualmente usando este relatório.
3. **Trocar `INSERT` por `upsert`** com `onConflict` apropriado em `avaliacoesService.saveAvaliacao`.
4. **Validar PIN no servidor** (hoje o PIN vive em `students.json` no client).

## Riscos conhecidos

- `students.json` desatualizado pode listar alunos transferidos/desligados.
- Registros antigos (anteriores ao tracking de assinatura) podem aparecer falsamente como PIN_PENDENTE — usar com bom senso.
- Validação foi manual/limitada — não há suíte de testes no projeto.
