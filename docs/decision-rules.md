# decision-rules.md

Regras de decisão e roteamento por tipo de tarefa para o Portal de Avaliações de Salvamento Terrestre — CBMAP CFSD-26.

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
O projeto possui dados operacionais relevantes e lógica crítica de avaliação.

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
**Quando uma mudança envolver Supabase, regras de persistência ou acesso a dados, faça:**
- preferir criar ou mover funções para a camada de serviços (`src/services/`);
- manter a lógica de acesso a dados fora de componentes de tela;
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
