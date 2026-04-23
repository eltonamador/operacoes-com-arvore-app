# 2026-04-13-consolidacao-academico-operacional.md

## Título
Consolidação acadêmico-operacional: fórmulas de cálculo, regras de agregação e estrutura de serviço

## Data
2026-04-13

## Status
Decidido — implementacao pendente (todos os modulos prerequisito ja estao em producao)

## Contexto

A Fase 4 da spec.md prevê consolidação automática de notas e cálculo de aptidão final para alunos de múltiplas oficinas.

Atualmente, o projeto possui:
- Dois módulos funcionais: **motosserra** (`'motosserra'`) e **escadas** (`'escadas'`)
- Tabela `avaliacoes` com `module_id` como identificador de oficina (decisão 2026-04-12)
- Notas persistidas em `finalScore` por avaliação individual

Faltam para iniciar a consolidação:
- Clareza nas fórmulas de cálculo
- Mapeamento explícito entre `module_id` e componentes de fórmula
- Regras de agregação quando um aluno possui múltiplas avaliações na mesma oficina
- Definição de quando a Prova Teórica (VC3) é lançada e onde é persistida
- Sequência de priorização dos módulos faltantes (Poço, Circuito)

---

## Decisão

### Fórmulas de consolidação

A média final de um aluno será calculada como:

```
VC1 = (nota_escadas + nota_pocos) / 2
VC2 = (nota_motosserra + nota_circuito) / 2
VC3 = nota_teorica
Média Final = (VC1 + VC2 + VC3) / 3
```

### Mapeamento de `module_id` para componentes

| `module_id` | Componente | VC | Descrição |
|---|---|---|---|
| `'escadas'` | Escadas | VC1 | Avaliação de operações de movimentação vertical |
| `'pocos'` | Poço | VC1 | Avaliação de operações em poços |
| `'motosserra'` | Corte de Árvore | VC2 | Avaliação de operações de corte com motosserra |
| `'circuito'` | Circuito | VC2 | Avaliação de operações em circuito de resgate |
| `'teorica'` | Prova Teórica | VC3 | Avaliação teórica unificada |

### Regras de agregação

1. **Múltiplas avaliações na mesma oficina**: vale a **última avaliação registrada** (por `created_at` DESC)
   - Justificativa: permite reavaliação e progressão sem necessidade de deletar registros
   - Implementação: `SELECT * FROM avaliacoes WHERE aluno_id = ? AND module_id = ? ORDER BY created_at DESC LIMIT 1`

2. **Avaliação faltante**: um aluno pode ter VC1 ou VC2 incompleto se uma das oficinas ainda não foi realizada
   - Tratamento: campo será `null` até que todas as avaliações do VC sejam concluídas
   - A Média Final só será calculada quando VC1, VC2 e VC3 estiverem todos completos

3. **Nota zero vs. não avaliado**: são estados distintos
   - Não avaliado = `NULL`
   - Nota zero = `0` (aluno foi avaliado e não alcançou pontuação)

### Persistência da Prova Teórica

- A Prova Teórica será persistida na mesma tabela `avaliacoes`
- `module_id = 'teorica'` para identificar avaliações teóricas
- `finalScore` conterá a nota (0-10 ou conforme escala definida)
- Será adicionada a oficina "Prova Teórica" no menu de oficinas do avaliador

### Priorização de módulos faltantes

**Ordem de implementação:**
1. **Poço** (`'pocos'`) — prioridade ALTA
   - Necessário para fechar VC1
   - Deve ser implementado antes de Circuito
   
2. **Circuito** (`'circuito'`) — prioridade ALTA
   - Necessário para fechar VC2
   - Segue após Poço
   
3. **Prova Teórica** (`'teorica'`) — prioridade MÉDIA
   - Necessário para fechar VC3
   - Natureza diferente (não checklist de penalidades)
   - Pode ser desenvolvida em paralelo com Poço/Circuito

---

## Justificativa

### Por que "última avaliação" em caso de múltiplos registros?

1. **Permite reavaliação**: aluno não alcançou nota, reavalia, a nova nota substitui a anterior
2. **Sem necessidade de delete**: mantém histórico completo de tentativas
3. **Simples de implementar**: uma cláusula `ORDER BY created_at DESC LIMIT 1`
4. **Alinhado com prática pedagógica**: última tentativa reflete aprendizado atual

Alternativa rejeitada (média de tentativas): complexa e não reflete adequadamente a progressão do aluno.

### Por que Prova Teórica na mesma tabela?

1. **Consistência com modelagem unificada**: decisão 2026-04-12 já prevê tabela única
2. **Simplifica consolidação**: todas as notas em um só lugar
3. **Mesmas políticas de RLS**: controle de acesso centralizado
4. **Futuro-proof**: se houver variações na Prova Teórica (parciais, recuperação), fica fácil adicionar registros

Alternativa rejeitada (tabela separada): violaria princípio de base única e tornaria consolidação mais complexa.

### Por que VC1/VC2 podem estar incompletos?

1. **Realidade do calendário**: oficinas são realizadas em datas diferentes
2. **Relatórios de progresso**: coordenador precisa saber o desempenho parcial antes do final
3. **Flexibilidade**: aluno pode ser avaliado em escadas agora e poço depois
4. **Evita cálculo errado**: não forçar cálculo com dados faltantes = evita inadmissíveis `NaN` ou cálculos por padrão

---

## Consequências

### Positivas

- ✅ Fórmulas explícitas e rastreáveis (não estão escondidas em código)
- ✅ Regra única e clara de agregação (última avaliação)
- ✅ Estrutura unificada (tudo em `avaliacoes` com `module_id`)
- ✅ Preparação para implementação de `consolidacaoService.js`
- ✅ Permite relatórios parciais enquanto VC1/VC2/VC3 estão em conclusão

### Técnicas

- ⚠️ `consolidacaoService.js` deve ser criado para centralizar cálculo de VC1/VC2/VC3/Média Final
- ⚠️ Poço e Circuito devem ser implementados antes de oferecer consolidação completa
- ⚠️ Frontend da Coordenação precisa tratar valores `null` para VCs incompletos
- ⚠️ Relatórios precisam distinguir "não avaliado" de "não aprovado"

---

## Impacto em outras áreas

### `src/services/consolidacaoService.js` (novo arquivo)

Será criado com as seguintes funções:

```javascript
// Função pura de cálculo
export function calcularConsolidacao(avaliacoesPorModulo) {
  // avaliacoesPorModulo = { escadas: {...}, pocos: {...}, motosserra: {...}, circuito: {...}, teorica: {...} }
  // retorna { vc1, vc2, vc3, mediaFinal, apto, motivo_nao_apto }
}

// Função que busca e aplica cálculo
export async function fetchConsolidacaoPorAluno(numero_ordem) {
  // busca todas as avaliações do aluno, extrai última de cada oficina, calcula
  // retorna consolidação completa ou parcial
}
```

### `CoordenacaoArea.jsx`

- Passará a consumir `fetchConsolidacaoPorAluno` para exibir VC1, VC2, VC3 e Média Final
- Tratará `null` values para VCs incompletos
- Exibirá status: "Em progresso", "Completo", "Não apto"

### `AlunoArea.jsx`

- Passará a exibir seu próprio VC1, VC2, VC3 (se fechado)
- Mostrará qual oficina falta para completar cada VC

### Módulos novos: `pocos` e `circuito`

- Seguirão o mesmo padrão de `motosserra` e `escadas`
- Ao salvar, passarão `module_id = 'pocos'` ou `'circuito'` para `saveAvaliacao`

### Prova Teórica

- Será adicionada como nova opção no menu de oficinas do avaliador
- Não usará checklist de penalidades; será entrada direta de nota 0-10
- Ao salvar, passará `module_id = 'teorica'`

---

## Estratégia de implementação

### Fase 1: Infraestrutura de consolidação (sem dar acesso ao usuário ainda)

1. Criar `src/services/consolidacaoService.js` com função pura `calcularConsolidacao`
2. Registrar testes manuais da fórmula com dados fictícios
3. **Não expor** consolidação em nenhuma tela ainda

### Fase 2: Implementar Poço (prioridade alta)

1. Criar `src/modules/pocos/` com a mesma estrutura de `motosserra`
2. Adicionar rota no `Router.jsx`
3. Módulo salva com `module_id = 'pocos'`

### Fase 3: Implementar Circuito (prioridade alta)

1. Criar `src/modules/circuito/` 
2. Adicionar rota
3. Módulo salva com `module_id = 'circuito'`

### Fase 4: Expor consolidação (após Poço e Circuito)

1. Integrar `fetchConsolidacaoPorAluno` na `CoordenacaoArea`
2. Exibir VC1, VC2, VC3, Média Final para cada aluno
3. Implementar badge de "Apto" / "Não apto" com base no critério final

### Fase 5: Prova Teórica

1. Criar entrada de nota teórica (UI simples, sem penalidades)
2. Salvar com `module_id = 'teorica'`
3. Incluir no cálculo final

---

## Próximos passos

1. ✅ **Decisão formalizada** (este documento)
2. ⏭️ **Não implementar `consolidacaoService.js` ainda** — aguardar aprovação desta decisão
3. ⏭️ **Atualizar `docs/wake-up.md`** com prioridade de Poço e status desta decisão
4. ⏭️ **Iniciar implementação de Poço** como próximo sprint, dependente desta decisão

---

## Alternativas consideradas e rejeitadas

### Média de todas as tentativas vs. última tentativa

**Considerada**: usar média de todas as avaliações de uma oficina.

**Rejeitada** porque:
- Não reflete aprendizado progressivo (nota baixa + nota alta = média neutra)
- Penaliza aluno que reavaliou e melhorou
- Difícil de explicar pedagogicamente

### Obrigar VC completo para calcular Média Final

**Considerada**: só exibir consolidação quando VC1, VC2 e VC3 estiverem todos completos.

**Rejeitada** porque:
- Impossibilita relatórios de progresso durante o curso
- Coordenador quer acompanhar desempenho parcial
- Oficinas têm calendários diferentes

### Tabela separada para consolidação

**Considerada**: criar tabela `consolidacoes` com cálculos pré-computados.

**Rejeitada** porque:
- Adiciona redundância de dados
- Exige manutenção sincronizada (quando uma avaliação muda, consolidação desatualiza)
- Para o escopo atual, cálculo on-demand é suficiente e mais seguro

---

## Referências

- `docs/spec.md` — Fase 4 (Consolidação acadêmico-operacional)
- `docs/decisions/2026-04-12-modelagem-avaliacoes-multi-oficina.md` — Modelagem com `module_id`
- `src/services/avaliacoesService.js` — Implementação atual de persistência
- `src/pages/CoordenacaoArea.jsx` — Consumidor futuro de consolidação
- `CLAUDE.md` — Regras de operação no repositório

---

## Resumo executivo

Consolidação acadêmico-operacional será implementada a partir de fórmulas explícitas: VC1 = (escadas + poços) / 2, VC2 = (motosserra + circuito) / 2, VC3 = teórica, Média Final = (VC1 + VC2 + VC3) / 3. Agregação usa última avaliação por oficina. Prova Teórica persiste em `avaliacoes` com `module_id = 'teorica'`. Poço tem prioridade antes de Circuito. `consolidacaoService.js` será criado após confirmação desta decisão.
