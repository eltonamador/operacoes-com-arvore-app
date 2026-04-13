# wake-up.md

## Estado atual do projeto

O projeto possui hoje um sistema funcional de avaliação prática de motosserra, desenvolvido em React com Supabase, já capaz de:

- selecionar aluno, avaliador e data;
- aplicar penalidades em checklist;
- calcular nota em tempo real;
- colher ciência do avaliado por PIN;
- salvar avaliações no banco;
- gerar relatórios e exportações.

Esse sistema está operacionalmente coerente e deve ser tratado como o núcleo funcional inicial do projeto.

---

## Sprint 1 — concluída em 2026-04-11

### O que foi feito

Reorganização estrutural mínima do frontend, sem alteração de comportamento funcional.

**Arquivo criado:**
- `src/services/avaliacoesService.js` — camada de serviço centralizada para todo acesso ao Supabase relacionado a avaliações. Exporta: `mapDbToUi`, `fetchAvaliacoes`, `fetchAvaliacoesByData`, `saveAvaliacao`, `deleteAvaliacao`, `clearAllAvaliacoes`.

**Arquivos modificados:**
- `src/App.jsx` — removida função `mapDbEvaluationToUi` e chamadas diretas ao Supabase; substituídas por imports do serviço. Estado, navegação e feedback de UI (confirm/alert) permanecem no componente.
- `src/utils/vistoProvaReport.js` — removida `fetchEvaluationsFromDb` local e import direto do Supabase; substituídos por `fetchAvaliacoesByData` do serviço.

### O que permaneceu igual

- Todas as telas (`StudentForm`, `Evaluation`, `Signature`, `Summary`, `Reports`, `AdvancedReports`) — **intocadas**.
- `src/lib/supabase.js`, `src/data/`, `src/styles/` — **intocados**.
- Comportamento funcional do usuário — **idêntico**.

### Bug corrigido em 2026-04-11

Em `src/services/avaliacoesService.js → fetchAvaliacoesByData`, o filtro por data não era aplicado porque o query builder do Supabase é imutável (`query.eq(...)` retornava um novo objeto sem reassinar `query`). Corrigido alterando `const` para `let` e reassinando `query = query.eq(...)`. O relatório de Visto de Prova agora filtra corretamente por data no banco.

---

## Leitura correta do sistema

O sistema atual **não deve ser tratado como produto final**.

Ele deve ser entendido como:
- um módulo funcional já validado;
- uma base de conhecimento operacional importante;
- o embrião de um portal maior de avaliações de Salvamento Terrestre.

A visão futura do projeto é um portal centralizado com:
- login unificado;
- perfis distintos de acesso;
- módulos por oficina;
- consolidação automática de médias e pesos;
- cálculo de aptidão final;
- relatórios individuais e mapas de notas integrados para coordenação.

---

## Documentos-base já criados

Os seguintes arquivos devem ser considerados leitura prioritária antes de mudanças estruturais:

- `docs/current-state.md`
- `docs/prd.md`
- `docs/spec.md`
- `CLAUDE.md`

Esses documentos definem:
- o que o sistema é hoje;
- o que o produto deve se tornar;
- como a transição deve acontecer;
- como a IA deve operar no repositório.

---

## Situação arquitetural atual

Pontos relevantes do estado técnico atual:

- `App.jsx` concentra estado global e navegação — acesso ao Supabase foi extraído para serviço;
- `src/services/avaliacoesService.js` centraliza todas as operações de persistência de avaliações;
- o sistema ainda é uma SPA enxuta e centralizada;
- não existe autenticação formal por perfil;
- dados críticos ainda dependem, em parte, de arquivos locais;
- não há testes automatizados identificados;
- o sistema atual é funcional, e agora tem base um pouco mais segura para crescer.

---

## Prioridade técnica imediata

Sprint 1 concluída, incluindo correção do bug do filtro por data e extração do estado de avaliação em curso para hook dedicado. A próxima frente é continuar a Fase 1 da SPEC:

- extraído: `src/hooks/useEvaluationState.js` — estado da avaliação em curso e todos os seus handlers;
- `App.jsx` agora tem ~90 linhas e responsabilidade clara: orquestração de persistência + composição de tela;
- preparar estrutura de pastas `src/modules/` para quando a Fase 2 (portal, autenticação) começar.

---

## Sprint 2 — concluída em 2026-04-11

### O que foi feito

Implantação da casca inicial do portal com roteamento, sem mover nem alterar o módulo de motosserra.

**Dependência instalada:**
- `react-router-dom` — roteamento declarativo para SPA.

**Arquivos criados:**
- `src/app/Router.jsx` — BrowserRouter com 5 rotas: `/`, `/avaliador`, `/avaliador/motosserra`, `/coordenacao`, `/aluno`.
- `src/pages/PortalHome.jsx` — home do portal com links para as áreas.
- `src/pages/AvaliadorArea.jsx` — stub da área do avaliador.
- `src/pages/CoordenacaoArea.jsx` — stub da área de coordenação.
- `src/pages/AlunoArea.jsx` — stub da área do aluno.

**Arquivos modificados:**
- `src/main.jsx` — monta `<Router />` no lugar de `<App />` diretamente.

### O que permaneceu igual

- `src/App.jsx` — **intocado**. Funciona como sempre, agora montado em `/avaliador/motosserra`.
- Toda a lógica de avaliação, persistência, hooks e serviços — **intocados**.
- `vite.config.js` — **não foi necessário alterar** (dev server já trata SPA fallback automaticamente).

### Risco identificado

Produção: se o app for publicado em servidor externo (Nginx, Apache, etc.), o servidor precisará redirecionar todas as rotas para `index.html`. Isso não é configuração do Vite — é do servidor de deploy.

---

## Sprint 3 — concluída em 2026-04-11

### O que foi feito

Movimentação do módulo de motosserra para estrutura modular, sem alteração de comportamento.

**Arquivo criado:**
- `src/modules/motosserra/MotosserraApp.jsx` — conteúdo idêntico ao antigo `src/App.jsx`, com imports atualizados para `../../screens/`, `../../services/`, `../../hooks/`.

**Arquivo excluído:**
- `src/App.jsx` — removido após a migração. Não há referências restantes.

**Arquivo modificado:**
- `src/app/Router.jsx` — import atualizado de `'../App'` para `'../modules/motosserra/MotosserraApp'`; elemento da rota atualizado de `<App />` para `<MotosserraApp />`.

### O que permaneceu igual

- Lógica interna do módulo — **idêntica**.
- Telas, hooks, services, utils — **intocados**.
- Comportamento funcional do usuário — **idêntico**.

---

## Sprint 4 — concluída em 2026-04-11

### O que foi feito

Movimentação das telas e hook exclusivos do módulo de motosserra para dentro de `src/modules/motosserra/`, sem alteração de comportamento.

**Arquivos criados:**
- `src/modules/motosserra/screens/StudentForm.jsx`
- `src/modules/motosserra/screens/Evaluation.jsx`
- `src/modules/motosserra/screens/Signature.jsx`
- `src/modules/motosserra/screens/Summary.jsx`
- `src/modules/motosserra/screens/Reports.jsx`
- `src/modules/motosserra/screens/AdvancedReports.jsx`
- `src/modules/motosserra/hooks/useEvaluationState.js`

**Arquivos excluídos:**
- `src/screens/StudentForm.jsx`
- `src/screens/Evaluation.jsx`
- `src/screens/Signature.jsx`
- `src/screens/Summary.jsx`
- `src/screens/Reports.jsx`
- `src/screens/AdvancedReports.jsx`
- `src/hooks/useEvaluationState.js`

**Arquivo modificado:**
- `src/modules/motosserra/MotosserraApp.jsx` — imports de telas e hook atualizados de `../../screens/` e `../../hooks/` para `./screens/` e `./hooks/`.

### Imports ajustados nas telas movidas
- `../data/` → `../../../data/` (Evaluation, Signature, Summary, StudentForm)
- `../utils/vistoProvaReport` → `../../../utils/vistoProvaReport` (Reports)
- `AdvancedReports` e `useEvaluationState` — sem imports locais para ajustar

### O que permaneceu igual
- Lógica interna de todas as telas e do hook — **idêntica**.
- `src/services/`, `src/utils/`, `src/data/`, `src/lib/` — **intocados**.
- Comportamento funcional do usuário — **idêntico**.
- `src/screens/` — pasta agora vazia (pode ser removida futuramente).

---

## Sprint 5, 6, 7 — concluídas em 2026-04-11

### O que foi feito

**Sprint 5** — `src/data/penalties.js` movido para `src/modules/motosserra/data/penalties.js`. Imports ajustados em Evaluation, Signature, Summary. Arquivo original excluído.

**Sprint 6** — `src/data/students.json` e `instructors.json` movidos para `src/modules/shared/data/`. Imports ajustados em StudentForm e Signature do módulo motosserra.

**Sprint 7** — `StudentForm.jsx` extraído de `src/modules/motosserra/screens/` para `src/modules/shared/screens/StudentForm.jsx` com parametrização mínima via props (`moduleName`, `moduleEmoji`). MotosserraApp atualizado para importar de shared e passar os valores específicos.

### Padrão estabelecido para novos módulos
- Telas genéricas (StudentForm) moram em `src/modules/shared/screens/`
- Dados compartilhados (alunos, instrutores) moram em `src/modules/shared/data/`
- Dados específicos (penalties.js) e telas específicas ficam dentro do módulo
- Novo módulo importa StudentForm de shared e passa `moduleName` e `moduleEmoji`

---

## Sprint 8 — concluída em 2026-04-11

### O que foi feito

Criação do stub inicial do módulo `escadas`, seguindo o padrão estabelecido.

**Arquivos criados:**
- `src/modules/escadas/EscadasApp.jsx` — orquestrador do módulo; importa `StudentForm` de shared com `moduleName="Operações com Escadas"` e `moduleEmoji="🪜"`
- `src/modules/escadas/hooks/useEvaluationState.js` — cópia do hook de motosserra (idêntico; pode ser unificado futuramente)
- `src/modules/escadas/data/penalties.js` — stub vazio com `SECTIONS = []` e `calcScore` funcional
- `src/modules/escadas/screens/Evaluation.jsx` — placeholder "em desenvolvimento"
- `src/modules/escadas/screens/Signature.jsx` — placeholder "em desenvolvimento"
- `src/modules/escadas/screens/Summary.jsx` — placeholder "em desenvolvimento"
- `src/modules/escadas/screens/Reports.jsx` — placeholder "em desenvolvimento"

**Arquivo modificado:**
- `src/app/Router.jsx` — adicionada rota `/avaliador/escadas` → `<EscadasApp />`

### O que permaneceu igual
- Módulo de motosserra — **intocado**.
- Shared layer — **intocada**.
- Comportamento do sistema existente — **idêntico**.

### Pendências do módulo escadas
- Preencher `data/penalties.js` com seções e itens reais da ficha de avaliação
- Implementar `screens/Evaluation.jsx` com checklist real
- Implementar `screens/Signature.jsx`, `Summary.jsx`, `Reports.jsx` com lógica real

---

## Sprint 9 — concluída em 2026-04-11

### O que foi feito

Extração do hook `useEvaluationState` para camada compartilhada.

**Arquivo criado:**
- `src/modules/shared/hooks/useEvaluationState.js` — hook genérico de estado de avaliação, reutilizado por motosserra e escadas.

**Arquivos modificados:**
- `src/modules/motosserra/MotosserraApp.jsx` — import atualizado de `./hooks/useEvaluationState` para `../shared/hooks/useEvaluationState`
- `src/modules/escadas/EscadasApp.jsx` — import atualizado de `./hooks/useEvaluationState` para `../shared/hooks/useEvaluationState`

**Arquivos excluídos:**
- `src/modules/motosserra/hooks/` — diretório inteiro removido (arquivo duplicado agora em shared)
- `src/modules/escadas/hooks/` — diretório inteiro removido (arquivo duplicado agora em shared)

### Análise de compatibilidade

Ambos os hooks eram **100% idênticos**:
- Mesmo `initialEval` com todos os campos de estado
- Mesmas 12 funções de gerenciamento de estado
- Mesma interface de retorno
- Sem qualquer dependência ou referência específica de módulo

Extração foi **segura e sem impacto no comportamento**:
- Mudança apenas de localização de arquivo
- Imports ajustados para novo caminho
- Lógica, interface e comportamento em tempo de execução preservados integralmente

### O que permaneceu igual
- Lógica de estado de avaliação — **intacta**.
- Comportamento funcional de motosserra e escadas — **idêntico**.
- Fluxo de navegação e gerenciamento de dados — **idêntico**.
- Persistência e serviços — **intocados**.

### Novo padrão estabelecido
- Hooks genéricos (compartilhados entre módulos) residem em `src/modules/shared/hooks/`
- Hooks específicos de módulo residem em `src/modules/{moduleName}/hooks/`

---

## Sprint 10 — concluída em 2026-04-11

### O que foi feito

Implementação da primeira versão funcional do núcleo de avaliação do módulo escadas, com base na PLAV CFSD-26 STER Escadas.

**Arquivo modificado:**
- `src/modules/escadas/data/penalties.js` — preenchido com 4 seções e 41 itens reais da ficha de avaliação:
  - Seção 1.0: Tempo de Execução (8 faixas de 30s, cada uma a –0,20; máx –1,60)
  - Seção 2.0: Queda da Vítima (1 item, –9,00)
  - Seção 3.0: Técnica Escada Deslizante (18 itens, descontos de –0,20 e –0,30)
  - Seção 4.0: Técnica Escada Rebatida (14 itens, descontos de –0,20 e –1,00)

- `src/modules/escadas/screens/Evaluation.jsx` — substituído o placeholder por tela funcional real:
  - Checklist completo por seção, com marcação por toque
  - Cálculo de nota em tempo real (mesmo padrão do módulo motosserra)
  - Campo de erro não previsto com descrição e desconto livre
  - Painel de pontuação com nota final e status APROVADO/REPROVADO
  - Sem toggle de Erros Críticos (não aplicável à ficha de escadas)

### Decisões de implementação registradas

- **Penalidade de tempo:** representada como 8 checkboxes independentes (um por faixa de 30s). O avaliador marca quantas faixas foram ultrapassadas. Não há input de tempo — escolha mais segura para o padrão atual.
- **Itens CUMULATIVO:** tratados como checkbox único (uma marcação = uma ocorrência). Marcações múltiplas do mesmo erro ficam para evolução futura da arquitetura.
- **Erros Críticos toggle:** removido da tela de escadas. Conceito não existe na ficha; queda da vítima é tratada como item 2.1 com –9,00.

### O que permaneceu igual
- Módulo motosserra — **intocado**.
- Shared layer (StudentForm, useEvaluationState) — **intocada**.
- Comportamento de persistência e navegação — **idêntico**.

### Pendências restantes do módulo escadas
Nenhuma pendência de fluxo básico. Módulo escadas está funcionalmente completo.

---

## Sprint 11 — concluída em 2026-04-11

### O que foi feito

Implementação das telas restantes do módulo escadas, fechando o fluxo completo de avaliação.

**Arquivos modificados:**
- `src/modules/escadas/screens/Signature.jsx` — substituído placeholder por tela funcional:
  - PIN de 4 dígitos com bloqueio após 3 tentativas inválidas (30s)
  - Declaração de ciência por checkbox
  - Listagem de erros/penalidades registrados
  - Exibição de nota e resultado (APROVADO/REPROVADO)
  - Sem referência a `criticalErrors` (não aplicável em escadas)

- `src/modules/escadas/screens/Summary.jsx` — substituído placeholder por tela funcional:
  - Banner de resultado com nota final destacada
  - Listagem completa de itens penalizados + erro não previsto
  - Painel de visto de prova confirmado
  - Botões: Nova Avaliação, Imprimir, Relatório, Salvar
  - Sem referência a `criticalErrors` nem a "Relatórios Avançados" (não implementado em escadas)

- `src/modules/escadas/screens/Reports.jsx` — substituído placeholder por tela funcional:
  - Filtro por data com botões de acesso rápido
  - Cards de estatísticas (total, aprovados, reprovados, média)
  - Tabela completa de avaliações salvas com exclusão individual
  - Sem botões "Relatórios Avançados" e "Visto de Prova" (não implementados em escadas)

### O que foi reaproveitado
- Estrutura completa das três telas do módulo motosserra (~85–95% do código)

### O que foi adaptado
- Imports de `penalties` apontados para `../data/penalties` (escadas)
- Emojis e títulos de header para contexto de escadas
- `isPassing = finalScore >= 7.0` (sem `criticalErrors`)
- Removidas todas as referências a `criticalErrors` e a funcionalidades exclusivas de motosserra

### O que permaneceu igual
- Módulo motosserra — **intocado**
- Shared layer — **intocada**
- Lógica de persistência (avaliacoesService) — **intocada**

---

## Sprint 12 — preparação técnica em 2026-04-12

### O que foi feito

Análise completa da persistência multi-oficina e documentação da decisão arquitetural.

**Documentação criada:**
- `docs/decisions/2026-04-12-modelagem-avaliacoes-multi-oficina.md` — decisão formal sobre como persistir avaliações de múltiplas oficinas.

**Análise realizada:**

Motosserra e escadas compartilham a mesma tabela `avaliacoes` do Supabase **sem nenhum campo que identifique a qual oficina pertence cada avaliação**. Isso é um risco crítico porque:

1. Relatórios de escadas recebem dados de motosserra misturados
2. Relatórios de motosserra recebem dados de escadas misturados
3. Impossível consolidar notas por oficina (bloqueio para Fase 4 da SPEC)
4. Impossível calcular médias e aptidão final por aluno considerando múltiplas oficinas
5. Adicionar poços, circuito, árvores sem identificação tornará a base impossível de gerenciar

**Decisão assumida:**

Tabela única `avaliacoes` com novo campo `module_id` (VARCHAR):
- `module_id = 'motosserra'` (já existentes)
- `module_id = 'escadas'` (já existentes)
- `module_id = 'pocos'`, `'circuito'`, `'arvores'` (futuro)

Migration: `ALTER TABLE avaliacoes ADD COLUMN module_id VARCHAR(50) NOT NULL DEFAULT 'motosserra'`

**O que permaneceu igual:**

- Nenhum código foi alterado
- Nenhuma migration foi executada
- Comportamento do sistema existente continua idêntico

### Por que essa decisão

- Alinha-se ao spec.md ("base única de dados de avaliações")
- Mudança estrutural mínima (uma coluna)
- Compatível com dados existentes (default 'motosserra')
- Prepara para consolidação automática (Fase 4)
- Escala naturalmente para novas oficinas
- Rejeita alternativas (tabelas separadas fragmentariam dados; overcomplexidade seria ineficiente)

---

## Próximos passos recomendados

### Sprint 13 — concluída em 2026-04-12

#### O que foi feito

Implementação mínima do suporte a `module_id` no código (persistência multi-oficina). Nenhum banco foi alterado nesta sprint.

**`src/services/avaliacoesService.js`**
- `mapDbToUi`: adicionado campo `moduleId: row.module_id || null` no objeto de retorno
- Adicionada `fetchAvaliacoesByModulo(module_id)` — busca filtrada por módulo
- Adicionada `fetchAvaliacoesByDataAndModulo(data, module_id)` — busca filtrada por data e módulo

**`src/modules/motosserra/MotosserraApp.jsx`**
- `loadEvaluations()`: agora usa `fetchAvaliacoesByModulo('motosserra')` em vez de `fetchAvaliacoes()`
- `saveEvaluation()`: injeta `module_id: 'motosserra'` no payload antes de salvar

**`src/modules/escadas/EscadasApp.jsx`**
- `loadEvaluations()`: agora usa `fetchAvaliacoesByModulo('escadas')` em vez de `fetchAvaliacoes()`
- `saveEvaluation()`: injeta `module_id: 'escadas'` no payload antes de salvar

**`src/utils/vistoProvaReport.js`**
- Passou a usar `fetchAvaliacoesByDataAndModulo(data, 'motosserra')` — relatório isolado de motosserra

#### O que NÃO foi alterado

- Regras de cálculo — intocadas
- Telas de todos os módulos — intocadas
- `fetchAvaliacoes()` e `fetchAvaliacoesByData()` — mantidas sem alteração (compatibilidade)
- `deleteAvaliacao`, `clearAllAvaliacoes` — intocadas (operam por ID)
- Banco de dados — nenhuma migration executada

#### ⚠️ Dependência crítica pendente — migration obrigatória

**O código está pronto, mas o banco ainda não tem a coluna `module_id`.**

Migration necessária (a ser executada no Supabase):
```sql
ALTER TABLE avaliacoes ADD COLUMN module_id VARCHAR(50) NOT NULL DEFAULT 'motosserra';
```

**Enquanto essa migration não for executada:**
- `fetchAvaliacoesByModulo()` retornará zero resultados (coluna inexistente no filtro)
- `saveAvaliacao()` pode falhar ou ignorar o campo, dependendo da política do Supabase
- O sistema atual funcionará normalmente enquanto `fetchAvaliacoes()` for chamado (código legado ainda presente em outros utilitários não alterados)

### Próximo passo imediato (Sprint 18+)

**`CoordenacaoArea`** — ✅ MVP concluído na Sprint 17.

**`AlunoArea`** — bloqueada por migration pendente:
```sql
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS numero_ordem VARCHAR(20);
```
Decisão registrada em `docs/decisions/2026-04-12-vinculo-aluno-avaliacao.md`.
Após executar a migration + preencher `numero_ordem` nas contas de aluno: implementar `AlunoArea`.

Próximas frentes após migration:

1. **Implementar `AlunoArea`** (consulta de notas do aluno)
   - Filtro por `profiles.numero_ordem = avaliacoes.numero_ordem`
   - Mostrar notas finais por oficina

2. **Fase 3 da SPEC** (modularização por oficina com acesso restrito por avaliador)
   - Estender perfil avaliador para ter restrições de módulo
   - Criar estrutura de permissões finas

### Sprint 14 — concluída em 2026-04-12

#### O que foi feito

Implantação do relatório avançado no módulo escadas (feature parity com motosserra).

**`src/modules/escadas/screens/AdvancedReports.jsx`** — criado
- Componente idêntico ao de motosserra em estrutura e lógica
- Subtitle adaptado: "Dashboard de Desempenho – Escadas – CFSD 2026"
- Exportação CSV/XLSX com filename `ranking-desempenho-escadas.*`
- Filtra por pelotão, calcula ranking, exibe stats

**`src/modules/escadas/screens/Reports.jsx`** — modificado
- Adicionado botão "📊 Relatórios Avançados" que navega para `'advanced-reports'`
- Botão desabilitado quando não há avaliações (mesmo padrão de motosserra)

**`src/modules/escadas/EscadasApp.jsx`** — modificado
- Import de `AdvancedReports` adicionado
- Render condicional `state.screen === 'advanced-reports'` adicionado

#### O que NÃO foi alterado
- Módulo motosserra — intocado
- Regras de cálculo — intocadas
- Dados filtrados corretamente via `module_id = 'escadas'` (herda do `fetchAvaliacoesByModulo` já implementado)

### Próximos passos de médio prazo (Fase 2 da SPEC)
- ~~introduzir autenticação (Supabase Auth)~~ — **concluído na Sprint 16**
- ~~separar perfis de acesso (avaliador, coordenação)~~ — **concluído na Sprint 16**
- ~~criar tela de portal inicial~~ — já existia
- ~~corrigir loading infinito e adicionar signOut~~ — **concluído no Fix 16.1**
- preparar estrutura `src/modules/motosserra/` como base para novas oficinas.

---

## Fix 16.1 — Correção de bugs de autenticação (2026-04-12)

### Sintomas corrigidos

1. App travado em "Carregando..." após login.
2. Links internos não respondiam (consequência do loading infinito — `ProtectedRoute` nunca liberava o conteúdo).
3. Sem botão de logout visível — usuário precisava limpar cache para sair.

### Causa raiz

**`src/contexts/AuthContext.jsx`** — o `setLoading(false)` era chamado apenas dentro da promise `getSession().then(...)`. Se essa promise falhava (erro de rede, timeout) ou se o `onAuthStateChange` resolvia antes e era a única fonte de verdade da sessão, o `loading` ficava `true` para sempre. O listener `onAuthStateChange` nunca chamava `setLoading(false)` independentemente.

### O que foi corrigido

**`src/contexts/AuthContext.jsx`:**
- Removida a chamada redundante a `getSession().then(...)` que populava estado (duplicava o trabalho do listener).
- `onAuthStateChange` agora chama `setLoading(false)` após o primeiro evento (seja `INITIAL_SESSION` ou `SIGNED_IN`), usando flag `initialised` para garantir que só dispara uma vez.
- `getSession().catch(...)` adicionado como fallback: se o listener nunca disparar (edge case de falha de rede), `loading` ainda é resolvido para `false`.
- Resultado: `loading` sempre termina em `false`, independente do caminho de execução.

**`src/pages/PortalHome.jsx`:**
- Importado `useNavigate` e `useAuth`.
- Adicionado botão "Sair" no canto superior direito do portal.
- `handleSignOut`: chama `signOut()` do contexto; navega para `/login` no bloco `finally` (funciona mesmo se `signOut` lançar erro — Supabase limpa sessão localmente mesmo com falha de rede).
- Exibe `displayName` do perfil quando disponível.

### O que NÃO foi alterado

- Nenhuma lógica de cálculo de nota.
- Nenhum módulo (motosserra, escadas).
- `ProtectedRoute.jsx`, `Login.jsx`, `Router.jsx` — intocados.
- `src/services/avaliacoesService.js` — intocado.
- Nenhum banco de dados alterado.

### Risco residual

Nenhum risco novo introduzido. O risco de RLS em `avaliacoes` ainda desabilitada permanece como antes (registrado na Sprint 16).

---

## Sprint 16 — concluída em 2026-04-12

### O que foi feito

Implementação da camada de autenticação frontend (Fase 2 Parte 2 da SPEC).

**Arquivos criados:**
- `src/contexts/AuthContext.jsx` — provedor de sessão Supabase Auth. Recupera sessão no mount, escuta mudanças via `onAuthStateChange`, busca perfil na tabela `profiles` a cada login, expõe: `session`, `profile`, `role`, `displayName`, `loading`, `signIn`, `signOut`. Hook `useAuth()` exportado para consumo em qualquer componente.
- `src/pages/Login.jsx` — tela de login com email/password. Após autenticação bem-sucedida, consulta `profiles` para obter role e redireciona para a rota-padrão do perfil (`/avaliador`, `/coordenacao`, `/aluno`, ou `/` para admin).
- `src/components/ProtectedRoute.jsx` — guarda de rota. Exibe "Carregando..." enquanto `loading = true` (evita flash de redirect). Redireciona para `/login` se não autenticado. Redireciona para `/` se role não permitida. Role `admin` tem acesso irrestrito a qualquer rota protegida.

**Arquivo modificado:**
- `src/app/Router.jsx` — envolvido com `<AuthProvider>`. Adicionada rota pública `/login`. Todas as demais rotas envolvidas por `<ProtectedRoute>` com roles específicas:
  - `/` — qualquer role autenticada
  - `/avaliador`, `/avaliador/motosserra`, `/avaliador/escadas` — roles: `['avaliador']`
  - `/coordenacao` — roles: `['coordenacao']`
  - `/aluno` — roles: `['aluno']`
  - `admin` tem acesso a tudo (verificado em ProtectedRoute: `role !== 'admin'` sempre bypassa restrição de role)

### O que NÃO foi alterado

- Nenhuma lógica de cálculo de nota — intocada.
- Nenhum módulo (motosserra, escadas) — intocado.
- `src/services/avaliacoesService.js` — intocado.
- Nenhuma migration executada.
- RLS em `avaliacoes` — ainda desabilitada (intencional).

### Dependência de banco (Parte 1 — já executada conforme contexto)

A Sprint 16 pressupõe que a Parte 1 da Fase 2 já foi executada no Supabase:
- tabela `profiles` existe com colunas `id`, `role`, `display_name`
- função `get_my_role()` existe
- RLS ativa em `profiles`
- usuários de teste criados

### O que ainda falta para habilitar RLS em `avaliacoes` com segurança

1. Validar que login + redirect funciona para cada role (avaliador, coordenacao, aluno, admin)
2. Validar que rotas protegidas redirecionam corretamente quando não autenticado
3. Confirmar que `signOut` limpa sessão e redireciona para `/login`
4. Redigir e validar policies RLS para `avaliacoes`:
   - `avaliador`: INSERT + SELECT nas próprias avaliações (ou por module_id autorizado)
   - `coordenacao`: SELECT em todas as avaliações
   - `admin`: acesso total
5. Somente após policies testadas em ambiente de desenvolvimento: `ALTER TABLE avaliacoes ENABLE ROW LEVEL SECURITY`

### Status atual — Fase 2 CONCLUÍDA (2026-04-12)

Ambas as partes foram executadas com sucesso:

**Parte 1 (Supabase):**
- ✅ Tabela `profiles` criada com RLS habilitada
- ✅ Função `get_my_role()` criada (SECURITY DEFINER)
- ✅ Policies RLS em `avaliacoes` criadas (SELECT, INSERT, DELETE)
- ✅ Usuários de teste inseridos

**Parte 2 (Frontend):**
- ✅ `AuthContext.jsx` implementado
- ✅ `Login.jsx` implementado
- ✅ `ProtectedRoute.jsx` implementado
- ✅ Router protegido com AuthProvider

**Validações executadas:**
- ✅ Login por perfil (avaliador, coordenacao, aluno, admin) redireciona corretamente
- ✅ Links filtrados por role em PortalHome
- ✅ Navegação interna funciona
- ✅ Bloqueio de rota indevida funciona
- ✅ Refresh mantém sessão
- ✅ Logout funciona
- ✅ `MotosserraApp` carrega avaliações com JWT ativo
- ✅ `EscadasApp` carrega avaliações com JWT ativo

**RLS ativado:**
- ✅ `ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;` executado com sucesso
- ✅ Dados são filtrados corretamente por perfil
- ✅ Acesso indevido redirecionado para `/`

### Impacto

O portal agora possui:
- Login unificado com Supabase Auth
- Perfis distintos protegidos no banco por RLS
- Rotas protegidas no frontend
- Dados separados por perfil no banco de dados

---

## Sprint 15 — decisão arquitetural registrada em 2026-04-12

### O que foi feito

Análise arquitetural da Fase 2 e registro formal da decisão de autenticação e perfis.

**Documento criado:**
- `docs/decisions/2026-04-12-autenticacao-e-perfis-fase2.md` — decisão formal sobre autenticação (Supabase Auth), modelo de perfis e estratégia de RLS.

**Decisão assumida:** adotar **Supabase Auth** com tabela `profiles` e RLS na tabela `avaliacoes`.

**Perfis definidos:** `avaliador`, `coordenacao`, `aluno`, `admin`.

### Nenhum código foi alterado

- Sistema continua funcionando normalmente.
- Nenhuma migration foi executada.

### Bloqueador atual

A implementação da Fase 2 depende de dois passos sequenciais:

1. **Parte 1 — Setup no Supabase** (sem tocar no código):
   - Criar tabela `profiles`
   - Habilitar email provider no Supabase Auth
   - Criar políticas RLS na tabela `avaliacoes`
   - Habilitar RLS **somente após** policies prontas
   - Criar usuários de teste

2. **Parte 2 — Frontend** (após Parte 1 validada):
   - `src/contexts/AuthContext.jsx`
   - Componente `ProtectedRoute`
   - Tela de login (`src/pages/Login.jsx`)
   - Proteção de rotas em `Router.jsx`

⚠️ Habilitar RLS sem policies prontas derruba o app imediatamente.

---

## Decisões já assumidas

As seguintes decisões já estão assumidas como base de trabalho:

- o sistema atual será reaproveitado, não descartado;
- a evolução será incremental, não por reescrita total imediata;
- o objetivo final é um portal centralizado de avaliações de Salvamento Terrestre;
- o sistema de motosserra será tratado como primeiro núcleo funcional dessa plataforma;
- modularização virá antes da expansão ampla de oficinas;
- autenticação, perfis e consolidação de notas serão pilares da evolução futura.

---

## Fix 16.3 — Correção de race condition em navegação por perfil (2026-04-12)

### Sintoma corrigido

Após login, navegação interna por perfil continuava falhando. Clicar em links como `/avaliador` ou `/coordenacao` redirecionava de volta para `/` ao invés de renderizar a página correta.

### Causas raiz (duas)

**1. Race condition em `AuthContext.jsx`:**
`setSession(newSession)` era chamado imediatamente dentro do handler de `onAuthStateChange`, mas `setProfile` só era chamado após o `await fetchProfile()`. Durante esse intervalo (que ocorre também em toda renovação de token), `ProtectedRoute` via `session != null` + `role == null`. Como `role` é derivado de `profile`, a checagem `!roles.includes(role)` retornava `true` (null não está em `['avaliador']`), causando redirect para `/`. O `useMemo` também era ineficaz porque `signIn` e `signOut` eram funções redeclaradas a cada render sem `useCallback`.

**2. `PortalHome` exibia links sem filtro de perfil:**
Usuários `aluno` viam links para `/avaliador`, clicavam, e eram redirecionados para `/` pelo `ProtectedRoute`. Parecia "navegação quebrada" mas era proteção correta sem visibilidade adequada por perfil.

### O que foi corrigido

**`src/contexts/AuthContext.jsx`:**
- `fetchProfile` agora é chamado ANTES dos `setState` — session e profile são atualizados juntos no mesmo ciclo de render (React 18 automatic batching garante isso em contexto async)
- `signIn` e `signOut` agora usam `useCallback` com deps `[]` — referências estáveis que tornam o `useMemo` genuinamente eficaz
- Resultado: `ProtectedRoute` nunca mais vê `session != null` + `role == null`

**`src/pages/PortalHome.jsx`:**
- Links filtrados por role: avaliador vê links de avaliador, coordenação vê link de coordenação, aluno vê link de aluno, admin vê tudo

### Validação

- Login com qualquer perfil → redirecionamento correto
- Links na tela inicial → mostram apenas rotas acessíveis ao perfil logado
- Navegação para áreas protegidas → funciona sem redirect indevido
- Token refresh → não derruba mais a navegação ativa
- Logout → limpa sessão e redireciona para `/login`

### O que NÃO foi alterado

- `ProtectedRoute.jsx`, `Router.jsx`, `Login.jsx` — intocados
- Nenhuma lógica de cálculo, módulo ou banco

---

## Fix 16.2 — Correção de navegação interna (2026-04-12)

### Sintoma corrigido

Após login, navegação interna não funcionava. Links clicáveis (e.g., `/avaliador` → `/avaliador/motosserra`, `/` → `/coordenacao`) não respondiam. Usuário permanecia na mesma página.

### Causa raiz

**`src/contexts/AuthContext.jsx`** — o objeto `value` passado ao `AuthContext.Provider` era criado fresh a cada render. Como nenhuma estabilização via `useMemo` existia, todo componente consumidor via `useAuth()` recebia uma nova referência e re-renderizava. Isso incluía `ProtectedRoute`, que é envolvido em cada rota. React Router perdia o controle de navegação quando todas as rotas eram remontadas simultaneamente a cada atualização do contexto.

### O que foi corrigido

**`src/contexts/AuthContext.jsx`:**
- Import adicionado: `useMemo` do React
- `value` object agora envolvido com `useMemo([session, profile, loading, signIn, signOut])`
- Resultado: context reference é estável entre renders enquanto os valores essenciais não mudarem
- `ProtectedRoute` deixa de re-renderizar desnecessariamente
- React Router recupera controle de navegação

### Validação

- Login funciona (auth state changes trigger memoized value update → redirect por-role funciona)
- Logout funciona (signOut clears session → memoized value update → ProtectedRoute redireciona para /login)
- Links internos funcionam (navegação entre `/`, `/avaliador`, `/coordenacao`, `/aluno` agora preserva state)
- Navegação para módulos funciona (`/avaliador/motosserra`, `/avaliador/escadas`)
- Estado de telas dentro de módulos preservado (interno, não afetado)

### O que NÃO foi alterado

- Nenhuma lógica de cálculo
- Nenhum módulo
- `ProtectedRoute.jsx`, `Router.jsx`, `Login.jsx` — intocados
- Nenhuma alteração de banco

---

## Sprint 17 — Padronização visual do portal (2026-04-12)

### O que foi feito

Unificação visual de todo o portal para tema dark, alinhando o portal ao mesmo padrão visual das telas de módulo (motosserra e escadas). Zero impacto em lógica de negócio, auth ou persistência.

**`src/styles/global.css`** — adicionada seção `PORTAL PAGES` com:
- `.portal-page` / `.portal-content` — wrapper e área scrollável para todas as páginas do portal
- `.portal-nav-card` / `.portal-nav-grid` — cards de navegação com hover dourado
- `.portal-back-link` — link de retorno padronizado
- `.status-info` / `.status-error` / `.status-muted` — mensagens de estado com tema dark
- `.portal-table` / `.portal-table-wrapper` / `.portal-table th,td` — tabela dark com cabeçalho dourado
- `.badge-pass` / `.badge-fail` — badges de resultado (verde/vermelho com opacidade)
- `.header-user-info` / `.header-user-name` / `.header-role-tag` — área de usuário no header
- `.btn-sm` — variante compacta do botão existente
- `.login-page` / `.login-card` — container dark para tela de login

**`src/components/PortalLayout.jsx`** — reescrito:
- Usa `.portal-page` e `.portal-content` (dark, scroll controlado)
- Header usa classes `.header`, `.header-emblem`, `.header-titles`, `.header-org`, `.header-title`, `.header-subtitle` — mesmo padrão dos módulos
- Exibe `displayName`, role tag dourada e botão "Sair" com `.btn btn-danger btn-sm`
- Removida prop `title` (cada página gerencia seu próprio cabeçalho)
- Removidos todos os inline styles

**`src/pages/Login.jsx`** — reescrito:
- Usa `.login-page` e `.login-card` (dark)
- Branding institucional: emblema + org `CBMAP — CFSD-26` + título gold
- Inputs com `.form-input`, labels com `.form-label`, botão com `.btn btn-primary`
- Lógica de auth preservada integralmente

**`src/pages/PortalHome.jsx`** — reescrito:
- Usa `PortalLayout` (sem `title` prop)
- Links convertidos para `.portal-nav-card` com títulos e descrições

**`src/pages/AvaliadorArea.jsx`** — reescrito:
- Cards de módulo como `.portal-nav-card` com hover gold
- Link de retorno com `.portal-back-link`
- Removido state de hover manual (substituído por CSS hover)

**`src/pages/AlunoArea.jsx`** — reescrito:
- Tabela com `.portal-table` e cabeçalho dark gold
- Badges de resultado com `.badge-pass` / `.badge-fail`
- Mensagens de estado com `.status-info`, `.status-error`, `.status-muted`

**`src/pages/CoordenacaoArea.jsx`** — reescrito:
- Filtros usando `.filter-btn` / `.filter-btn--active` (já existiam no global.css)
- Tabela com `.portal-table`
- Badges e mensagens de estado alinhados

### O que NÃO foi alterado

- Todos os módulos (motosserra, escadas) — **intocados**
- `src/services/`, `src/lib/`, `src/data/` — **intocados**
- `src/contexts/AuthContext.jsx`, `src/components/ProtectedRoute.jsx`, `src/app/Router.jsx` — **intocados**
- Regras de cálculo, persistência, auth — **intocadas**
- Lógica de fetch de dados em AlunoArea e CoordenacaoArea — **idêntica**

### Resultado visual

| Tela | Antes | Depois |
|---|---|---|
| Login | Fundo cinza claro, card branco | Dark card com branding institucional |
| Portal Home | Links simples sobre fundo cinza | Cards dark com hover gold |
| Área do Avaliador | Cards claros com hover manual (JS) | Cards dark com CSS hover |
| Área do Aluno | Tabela branca com badges coloridos claros | Tabela dark gold com badges translúcidos |
| Área de Coordenação | Idem Aluno + filtros brancos | Tabela dark + filtros reutilizando `.filter-btn` |
| Header do portal | Header branco com navbar simples | Header dark com emblema, branding e user info |

### Risco

Baixo. Mudanças puramente visuais/estruturais. Nenhum comportamento funcional foi alterado.

---

## Riscos que não podem ser esquecidos

- expandir novas oficinas sem antes modularizar a estrutura;
- continuar concentrando responsabilidades em `App.jsx`;
- alterar regra de cálculo sem documentação clara;
- manter dados sensíveis e críticos em fluxo improvisado;
- crescer o sistema sem definir bem perfis e permissões;
- misturar mudança estrutural com feature nova sem controle;
- esquecer que contexto React sem memoização força re-renders em cadeia (perdendo navegação).

---

## Como agir nas próximas sessões

Quando iniciar uma nova sessão de trabalho neste projeto:

1. ler `CLAUDE.md`
2. ler `docs/current-state.md`
3. ler `docs/prd.md`
4. ler `docs/spec.md`
5. ler este `docs/wake-up.md`

Depois disso, identificar:
- a tarefa do momento;
- se ela pertence ao sistema atual ou ao portal futuro;
- quais arquivos serão afetados;
- se exige registro em `docs/decisions/`.

---

## Quando atualizar este arquivo

Atualizar este arquivo sempre que houver:
- mudança relevante no estado do projeto;
- decisão prática importante;
- novo risco identificado;
- redefinição do próximo passo;
- conclusão de etapa estrutural relevante.

---

## Sprint 17 — concluída em 2026-04-12

### O que foi feito

Implementacao do MVP da `CoordenacaoArea` — primeiro relatório consolidado do portal.

**Arquivo modificado:**
- `src/pages/CoordenacaoArea.jsx` — substituido placeholder por tela funcional de consulta somente leitura.

### O que a tela faz

- Busca avaliacoes de ambos os modulos em paralelo (`Promise.all`) ao montar, usando `fetchAvaliacoesByModulo('motosserra')` e `fetchAvaliacoesByModulo('escadas')` do servico ja existente.
- Combina os resultados e ordena por data de criacao decrescente.
- Exibe tabela com colunas: Aluno, Ordem, Pelotao, Avaliador, Data, Nota Final, Resultado (APROVADO/REPROVADO com badge colorido), Modulo.
- Filtro por modulo: Todos / Motosserra / Escadas (botoes inline).
- Estado de carregamento exibido enquanto as consultas estao em andamento.
- Estado de erro exibido com mensagem clara se alguma consulta falhar.
- Mensagem de vazio quando o filtro nao retorna resultados.
- Link "Voltar ao Portal" no cabecalho.
- Estilo consistente com `PortalHome.jsx` (inline styles, sans-serif, padding 32px).

### O que NAO foi alterado

- `src/services/avaliacoesService.js` — **intocado**. Nenhuma nova funcao necessaria; chamar `fetchAvaliacoesByModulo` duas vezes e suficiente.
- Todos os modulos (motosserra, escadas) — **intocados**.
- Regras de calculo — **intocadas**. O relatorio apenas apresenta `finalScore` e `isPassing` ja calculados e persistidos.
- Banco de dados — **nenhuma alteracao**.
- RLS — **intocada**.

### O que NAO esta no MVP (pertence a versoes futuras)

- Exportacao CSV/XLSX consolidada da coordenacao.
- Agregacoes por aluno (media entre oficinas, aptidao final).
- Mapa de notas (grade map) por pelotao.
- Filtro por pelotao ou por aluno especifico.
- Relatorio individual por soldado (consulta da visao do aluno).
- Consolidacao automatica de pesos entre oficinas (Fase 4 da SPEC).
- Paginacao (nao necessaria no volume atual; revisitar quando houver centenas de registros).

### Dependencia critica pendente (herdada da Sprint 13)

A tela funciona corretamente **somente se a migration `module_id` ja foi executada no banco**:

```sql
ALTER TABLE avaliacoes ADD COLUMN module_id VARCHAR(50) NOT NULL DEFAULT 'motosserra';
```

Se a coluna nao existir, `fetchAvaliacoesByModulo` retorna zero resultados para ambos os modulos e a tabela aparecera vazia (sem erro visivel — apenas sem dados). Verificar status da migration antes de validar a tela em producao.

---

## Sprint 18 — concluída em 2026-04-12

### O que foi feito

Implementacao do MVP da `AlunoArea` — tela de consulta de notas do aluno logado.

**`src/contexts/AuthContext.jsx`** — modificado:
- Select da tabela `profiles` ampliado de `'role, nome'` para `'role, nome, numero_ordem'`.
- Campo `numeroOrdem: profile?.numero_ordem ?? null` adicionado ao objeto `value` do contexto.
- Nenhuma outra logica alterada. `useMemo`, `useCallback`, signIn, signOut — intocados.

**`src/services/avaliacoesService.js`** — modificado:
- Adicionada `fetchAvaliacoesByNumeroOrdem(numero_ordem)`: busca avaliacoes filtrando por `numero_ordem`, ordenadas por `created_at DESC`. Usa `mapDbToUi` existente. Funcao somente leitura, sem efeito colateral.

**`src/pages/AlunoArea.jsx`** — substituido placeholder por tela funcional:
- Usa `useAuth()` para obter `displayName` e `numeroOrdem`.
- No mount, chama `fetchAvaliacoesByNumeroOrdem(numeroOrdem)` se `numeroOrdem` estiver preenchido.
- Se `numeroOrdem` for null: exibe aviso amarelo ("Numero de ordem nao configurado no perfil. Contacte o administrador.").
- Exibe saudacao com `displayName` no cabecalho.
- Tabela com colunas: Modulo, Data, Avaliador, Nota Final, Resultado (badge APROVADO/REPROVADO).
- Estados de loading, erro e vazio tratados explicitamente.
- Link "Voltar ao Portal" no cabecalho.
- Estilo consistente com `CoordenacaoArea.jsx` (inline styles, sans-serif, padding 32px).

### O que NAO esta no MVP (pertence a versoes futuras)

- Media consolidada entre oficinas (requer Fase 4 da SPEC — pesos e formula de aptidao).
- Status de aptidao final (APTO/INAPTO) — depende da media consolidada.
- Exportacao individual (CSV/XLSX) das proprias avaliacoes.
- Detalhe de penalidades por avaliacao (expandir linha ou tela de detalhe).
- Paginacao (nao necessaria no volume atual).

### O que NAO foi alterado

- Todos os modulos (motosserra, escadas) — intocados.
- Regras de calculo — intocadas. A tela apresenta `finalScore` e `isPassing` ja calculados e persistidos.
- `ProtectedRoute.jsx`, `Router.jsx`, `Login.jsx` — intocados.
- Banco de dados — nenhuma alteracao. A migration `numero_ordem` ja havia sido aplicada conforme contexto da task.
- RLS — intocada.

### Dependencia critica (ja satisfeita conforme contexto)

A tela funciona corretamente somente se:
1. A coluna `numero_ordem` existe em `profiles` (migration ja aplicada).
2. A conta do aluno tem `numero_ordem` preenchido com valor que bate com `avaliacoes.numero_ordem`.
3. A coluna `module_id` existe em `avaliacoes` (migration da Sprint 13).

Se `numero_ordem` estiver nulo no perfil, a tela exibe aviso claro ao inves de falhar silenciosamente.

---

## Sprint 19 — concluída em 2026-04-12

### O que foi feito

Criação de `PortalLayout` e aplicação nas páginas de portal. Mudança exclusivamente visual/estrutural — nenhuma lógica de cálculo, persistência, autenticação ou regras de nota foram alteradas.

**Arquivo criado:**
- `src/components/PortalLayout.jsx` — layout compartilhado para todas as páginas autenticadas do portal. Provê: fundo claro (`#f5f5f5`), barra de cabeçalho branca com nome do portal à esquerda e info do usuário + botão "Sair" à direita, barra de título opcional via prop `title`, e área de conteúdo com scroll natural. Usa `useAuth()` para `displayName`, `role` e `signOut`. Navega para `/login` após signOut via `useNavigate`.

**Arquivos modificados:**
- `src/pages/PortalHome.jsx` — removido cabeçalho inline próprio (título, saudação, botão "Sair"). Conteúdo envolvido em `<PortalLayout title="Início">`. Saudação ao usuário mantida dentro do conteúdo da página.
- `src/pages/AvaliadorArea.jsx` — removido `<h1>` próprio. Conteúdo envolvido em `<PortalLayout title="Área do Avaliador">`.
- `src/pages/CoordenacaoArea.jsx` — removido header div (título, subtítulo, link "Voltar ao Portal"). Conteúdo envolvido em `<PortalLayout title="Área de Coordenação">`. Import de `Link` removido (não mais utilizado).
- `src/pages/AlunoArea.jsx` — removido header div (título, link "Voltar ao Portal"). Saudação `displayName` mantida no conteúdo. Conteúdo envolvido em `<PortalLayout title="Área do Aluno">`. Import de `Link` removido.

**O que NÃO foi alterado:**
- `src/pages/Login.jsx` — não usa PortalLayout (página pública).
- `src/modules/motosserra/` e `src/modules/escadas/` — intocados, continuam usando o tema escuro de `global.css`.
- `src/styles/global.css` — não alterado. O `overflow: hidden` em `html, body, #root` é necessário para o scroll interno dos módulos. `PortalLayout` usa `minHeight: 100vh` e `display: flex / flex-direction: column` para scroll natural das páginas de portal sem depender do overflow global.

**Risco:** baixo. Mudança puramente visual nas páginas de portal. Módulos não foram tocados. Fluxo de auth não foi alterado.

---

## Resumo curto para retomada rápida

Projeto atual:
- app funcional de avaliação de motosserra + escadas
- **portal com login unificado e perfis protegidos** (Fase 2 concluída)
- dados protegidos por RLS no banco
- **CoordenacaoArea MVP funcional** (Sprint 17)
- **PortalLayout light theme implantado** (Sprint 19) — todas as páginas de portal usam tema claro de alto contraste

Estado de Fase 2:
- ✅ Supabase Auth integrado
- ✅ Tabela `profiles` com RLS ativa
- ✅ Rotas protegidas no frontend
- ✅ RLS em `avaliacoes` ativa (dados filtrados por perfil)

Estado de relatórios:
- ✅ CoordenacaoArea exibe tabela consolidada de motosserra + escadas com filtro por modulo
- ✅ AlunoArea MVP funcional (Sprint 18) — consulta de notas do aluno logado por numero_ordem
- Pendente: media consolidada entre oficinas, aptidao final, exportacao individual, mapa de notas

Direção futura:
- portal centralizado de avaliações de Salvamento Terrestre
- conteúdo real em área do aluno
- Fase 3: modularização por oficina com acesso por avaliador
- Fase 4: consolidação de médias, pesos e aptidão final

Prioridade imediata:
- implementar tela de conteúdo para AlunoArea
- preparar Fase 3

Regra de ouro:
- preservar o que funciona hoje enquanto se prepara corretamente o sistema de amanhã.