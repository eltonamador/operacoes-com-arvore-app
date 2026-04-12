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

### Próximo passo imediato (Sprint 14+)
Próximas frentes ordenadas por prioridade:

1. **Executar migration no Supabase** ← bloqueador atual
   ```sql
   ALTER TABLE avaliacoes ADD COLUMN module_id VARCHAR(50) NOT NULL DEFAULT 'motosserra';
   ```
   Depois: testar integralmente (relatórios, filtros, salvamento por módulo)

2. ~~Implementar AdvancedReports para escadas~~ — **concluído na Sprint 14**

3. **Avançar para Fase 2 da SPEC** (autenticação, perfis, portal)

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
- preparar estrutura `src/modules/motosserra/` como base para novas oficinas.

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

### Risco identificado

Enquanto RLS em `avaliacoes` não for habilitado, qualquer usuário autenticado com anon key pode ler e gravar avaliações diretamente via API Supabase — a proteção hoje é apenas frontend. Isso é aceitável nesta fase desde que o ambiente não seja público.

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

## Riscos que não podem ser esquecidos

- expandir novas oficinas sem antes modularizar a estrutura;
- continuar concentrando responsabilidades em `App.jsx`;
- alterar regra de cálculo sem documentação clara;
- manter dados sensíveis e críticos em fluxo improvisado;
- crescer o sistema sem definir bem perfis e permissões;
- misturar mudança estrutural com feature nova sem controle.

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

## Resumo curto para retomada rápida

Projeto atual:
- app funcional de avaliação de motosserra.

Direção futura:
- portal centralizado de avaliações de Salvamento Terrestre.

Prioridade imediata:
- reorganizar a base antes de ampliar escopo.

Regra de ouro:
- preservar o que funciona hoje enquanto se prepara corretamente o sistema de amanhã.