# CLAUDE.md

## Contexto do repositório

Este repositório contém o núcleo inicial de um sistema de avaliações práticas do CBMAP, atualmente funcional para a avaliação de motosserra no contexto do CFSD-26.

O estado atual do sistema está documentado em:
- `docs/current-state.md`

A visão futura do produto está documentada em:
- `docs/prd.md`

A direção técnica da transição está documentada em:
- `docs/spec.md`

Antes de qualquer mudança relevante, leia esses arquivos.

---

## Fase atual do projeto

O projeto está em fase de transição entre:

1. **estado atual**
   - aplicação React SPA com Supabase
   - fluxo funcional de avaliação de motosserra
   - arquitetura centralizada e enxuta

2. **estado-alvo**
   - portal centralizado de avaliações de Salvamento Terrestre
   - login unificado
   - perfis distintos
   - múltiplas oficinas
   - consolidação automática de médias, pesos e aptidão final
   - relatórios integrados para alunos e coordenação

Toda intervenção no código deve respeitar essa transição.

---

## Regra principal de atuação

Antes de alterar código, pergunte:

1. esta mudança atende o sistema atual ou o portal-alvo?
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

## Regras de decisão

### 1. Preservação do fluxo funcional
Se uma tarefa mexer no fluxo atual de avaliação, relatórios ou persistência, trate isso como área sensível.

**Quando uma mudança afetar o fluxo atual de avaliação, faça:**
- identificar quais telas serão impactadas;
- identificar quais regras de cálculo serão impactadas;
- evitar alteração ampla sem necessidade;
- preferir mudança mínima segura;
- registrar no `docs/wake-up.md` o que mudou e o risco associado.

### 2. Não confundir estado atual com produto-alvo
O sistema atual não deve ser tratado como produto final.  
Também não deve ser desmontado sem necessidade.

**Quando uma tarefa estiver ligada ao portal futuro, faça:**
- preservar o comportamento atual sempre que possível;
- criar base de transição ao invés de reescrita impulsiva;
- documentar nova decisão estrutural em `docs/decisions/` quando aplicável.

### 3. Dados sensíveis e integridade
O projeto atual possui dados operacionais relevantes e lógica crítica de avaliação.

**Quando uma mudança envolver alunos, PIN, regras de nota, persistência ou permissões, faça:**
- considerar isso como mudança crítica;
- explicitar o impacto na integridade dos dados;
- não assumir que uma alteração local é trivial;
- evitar exposição desnecessária de dados sensíveis;
- registrar qualquer mudança de modelo ou regra em documentação.

### 4. Modularização antes de expansão
O projeto deve evoluir para múltiplas oficinas, mas sem ampliar desorganização.

**Quando surgir demanda para nova oficina ou nova área do portal, faça:**
- primeiro avaliar se a estrutura atual suporta isso com segurança;
- se não suportar, priorizar modularização mínima antes da expansão;
- evitar copiar e colar grandes blocos de código como solução definitiva.

### 5. Serviços antes de lógica espalhada
O sistema atual já apresenta centralização excessiva em `App.jsx`.

**Quando uma mudança envolver Supabase, regras de persistência ou acesso a dados, faça:**
- evitar colocar mais responsabilidade em `App.jsx`;
- preferir mover ou criar funções em camada identificável de serviço;
- manter a lógica de acesso a dados fora de utilitários genéricos, sempre que possível.

### 6. Fórmulas e critérios devem ser explícitos
As regras de cálculo são críticas para a credibilidade do sistema.

**Quando mexer em notas, pesos, médias, penalidades ou aptidão final, faça:**
- deixar a regra explícita;
- evitar fórmulas escondidas em componentes confusos;
- descrever claramente o que foi alterado;
- registrar a decisão se houver impacto institucional ou acadêmico.

---

## Tabela de roteamento

### Quando a tarefa for correção de bug
Faça:
- reproduzir o problema;
- localizar a origem;
- propor correção mínima segura;
- validar impacto colateral;
- registrar no `docs/wake-up.md` se o bug for relevante.

### Quando a tarefa for refatoração
Faça:
- explicar o motivo da refatoração;
- limitar escopo;
- preservar comportamento;
- evitar mistura com feature nova;
- preferir refatoração incremental.

### Quando a tarefa for nova feature
Faça:
- verificar aderência ao `docs/prd.md`;
- verificar aderência ao `docs/spec.md`;
- identificar se pertence ao sistema atual ou ao portal futuro;
- descrever arquivos impactados antes de alterar.

### Quando a tarefa for nova oficina/disciplina
Faça:
- avaliar se já existe estrutura modular suficiente;
- evitar encaixar nova oficina diretamente no modelo centralizado antigo;
- padronizar o que for comum;
- isolar o que for específico.

### Quando a tarefa for mudança em autenticação ou perfil
Faça:
- tratar como mudança estrutural;
- considerar impacto em aluno, avaliador, coordenação e admin;
- não implementar sem clareza mínima de permissão;
- documentar a decisão.

### Quando a tarefa for alteração no banco ou modelo de dados
Faça:
- mapear impacto nos dados existentes;
- evitar quebra silenciosa de compatibilidade;
- registrar a decisão em `docs/decisions/`;
- atualizar `docs/current-state.md` se a mudança alterar o retrato do sistema.

### Quando a tarefa for geração de relatório
Faça:
- validar origem dos dados;
- manter consistência com regras de cálculo;
- evitar duplicação de lógica em múltiplos pontos;
- preferir dados derivados de base central confiável.

---

## Padrões proibidos

### Arquitetura
- Não colocar novas responsabilidades grandes em `App.jsx`.
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
- Não concluir tarefa dizendo que “está pronto” sem verificar o fluxo afetado.
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

Se houver testes configurados no futuro:
- rodar os testes relevantes;
- não ignorar falhas silenciosamente.

Se não houver testes:
- declarar explicitamente que a validação foi manual/limitada.
---
## Política de economia de contexto

- Use `/compact` quando a sessão continuar no mesmo fluxo e o histórico já estiver grande.
- Use `/clear` quando houver mudança real de tarefa, módulo ou assunto.
- Antes de tarefas longas ou sessões extensas, verificar `/context` e `/cost`.
- Evitar colar logs grandes; usar apenas os trechos relevantes.
- Agrupar pedidos relacionados em uma única mensagem, sempre que possível.
- Se houver 3 tentativas fracassadas no mesmo erro, parar e voltar ao diagnóstico da causa raiz.
- Priorizar contexto persistido em arquivos do projeto em vez de depender de histórico longo da conversa.
- Evitar comandos que despejem contexto desnecessário, como históricos extensos de git, salvo quando explicitamente necessário.
---

## Regras de documentação viva

### Quando atualizar `docs/current-state.md`
Atualize quando houver mudança real no retrato atual do sistema, como:
- nova arquitetura relevante;
- autenticação implementada;
- novos módulos já incorporados;
- mudança material de fluxo.

### Quando atualizar `docs/prd.md`
Atualize quando houver mudança de visão de produto, escopo ou objetivos.

### Quando atualizar `docs/spec.md`
Atualize quando a direção técnica da transição mudar ou quando uma nova fase/sprint for formalizada.

### Quando atualizar `docs/wake-up.md`
Atualize sempre que houver:
- mudança relevante de estado;
- decisão prática importante;
- próximo passo claro;
- risco ou bloqueio que não pode ser esquecido.

### Quando criar arquivo em `docs/decisions/`
Crie quando houver:
- decisão arquitetural;
- decisão de modelagem de dados;
- decisão sobre autenticação/perfis;
- decisão sobre regra de cálculo central;
- decisão que influencie trabalhos futuros.

---

## Estrutura documental do projeto

A estrutura esperada é:

```text id="h8x86i"
APP/
├── CLAUDE.md
└── docs/
    ├── current-state.md
    ├── prd.md
    ├── spec.md
    ├── wake-up.md
    ├── decisions/
    └── journal/