# CLAUDE.md

## Contexto do repositório

**Portal de Avaliações de Salvamento Terrestre — CBMAP CFSD-26.**

Sistema web SPA em produção com 5 módulos funcionais de avaliação: motosserra (Operações com Árvore), escadas, poços, circuito e prova teórica (VC3). Autenticação por perfil via Supabase Auth, persistência multi-módulo com RLS, e visão consolidada para coordenação. Consolidação acadêmica (VC1/VC2/VC3/Média Final) decidida, pendente de implementação.

- Estado atual do sistema: `docs/current-state.md`
- Visão do produto: `docs/prd.md`
- Direção técnica: `docs/spec.md`

Antes de qualquer mudança relevante, leia esses arquivos.

Para regras de decisão e roteamento por tipo de tarefa, consulte `docs/decision-rules.md`.

Para políticas de economia de contexto, consulte `docs/session-policies.md`.

---

## Regra principal de atuação

Antes de alterar código, pergunte:

1. esta mudança atende o sistema em produção ou o roadmap de evolução?
2. esta mudança preserva o que já funciona?
3. esta mudança aumenta ou reduz o acoplamento?
4. esta mudança está alinhada com `docs/spec.md`?

Se a resposta for incerta, não improvise. Explique a dúvida e proponha o caminho mais seguro.

---

## Hierarquia de leitura obrigatória

Quando a tarefa envolver impacto estrutural, use esta ordem de leitura:

1. `docs/current-state.md`
2. `docs/prd.md`
3. `docs/spec.md`
4. `docs/wake-up.md`

Se a tarefa envolver uma decisão nova relevante, consulte também:
- `docs/decisions/`

---

## Padrões proibidos

### Arquitetura
- Não concentrar lógica de negócio em componentes de tela — preferir serviços e hooks.
- Não espalhar acesso ao Supabase por arquivos aleatórios sem critério.
- Não criar nova oficina por simples cópia bruta de telas sem pensar em modularização.
- Não misturar refatoração estrutural com feature nova sem explicitar isso.

### Dados e segurança
- Não assumir que PIN em frontend é solução definitiva.
- Não expor dados de alunos ou notas sem considerar perfil de acesso.
- Não alterar regra de cálculo sem explicitar efeito.
- Não alterar estrutura de dados crítica sem registrar decisão.

### Qualidade
- Não usar nomes vagos para funções críticas.
- Não deixar regra importante implícita em JSX confuso.
- Não concluir tarefa dizendo que "está pronto" sem verificar o fluxo afetado.
- Não inventar comportamento do sistema sem base no código ou na documentação.

---

## Quality gates

Antes de encerrar qualquer tarefa com alteração de código, faça pelo menos o seguinte:

1. verificar quais arquivos foram alterados;
2. revisar se a mudança está alinhada com `docs/spec.md`;
3. revisar se o fluxo atual afetado continua coerente;
4. verificar se houve impacto em:
   - cálculo de nota
   - persistência
   - relatórios
   - perfis de acesso
5. registrar no `docs/wake-up.md` mudanças relevantes;
6. se a mudança for estrutural, registrar decisão em `docs/decisions/`.

Se não houver testes:
- declarar explicitamente que a validação foi manual/limitada.
