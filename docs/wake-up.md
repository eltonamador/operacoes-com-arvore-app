# wake-up.md

## Sprint 2026-04-15 — Correção de scroll nas páginas de Relatórios Avançados

### O que foi feito

Corrigida a rolagem vertical nas telas de **AdvancedReports** de todos os módulos (motosserra, escadas, pocos, circuito) — e por extensão, todos os screens que usam `.screen-container`.

**Causa:** `.screen-container` usava `height: 100vh` mas é renderizado como flex-child de `.app-root` (também `height: 100vh; display: flex; flex-direction: column`). Em navegadores modernos, um `height: 100vh` explícito em um flex-child não constrange adequadamente a altura do filho da mesma forma que `flex: 1`, fazendo com que `.screen-content` (overflow-y: auto) não ativasse o scroll.

**Arquivo alterado:**
- `src/styles/global.css` — `.screen-container`: substituído `height: 100vh` por `flex: 1; min-height: 0`. A regra mobile override (height: auto / min-height: 100vh) permanece intacta.

**O que não foi alterado:** lógica de negócio, banco, auth, relatórios, cálculos de nota, layout visual.

---

## Sprint 2026-04-15 — Notas VC-1.1 Escada importadas + correção de subtitle

### O que foi feito

Importação das notas definitivas VC-1.1 Escada (CFSD-26) via script Node.js direto no Supabase.

**Script criado:**
- `scripts/update-escadas-notas.js` — script com 177 notas hardcoded (Nº 1–180, ausentes 14, 124, 175). Suporta `--dry-run` (padrão) e `--execute`. Atualiza existentes, insere novos. `data_avaliacao = '2026-04-15'`.

**Resultado da execução:**
- 1 registro atualizado (existia no banco)
- 176 registros inseridos
- 0 erros
- Todos os 177 alunos encontrados em `students.json`

**Correção visual:**
- `src/modules/motosserra/screens/Reports.jsx` — subtitle corrigido de `"Supabase • CFSD 2026"` para `"Motosserra • CFSD 2026"` (mantém paridade visual com escadas)

**O que permanece pendente**
- Fórmulas e consolidação acadêmica VC1/VC2/Média (Fase 4 da Spec) seguem intactas na fila.

---

## Sprint 2026-04-15 — Importação Retroativa Módulo Escadas (script original)

### O que foi feito

Realizada a importação em lote das notas históricas de Escadas dos alunos, usando os dados contidos em arquivo CSV. Isso foi inserido diretamente via comunicação NodeJS com Supabase (script avulso temporário) para poupar o app de código administrativo descartável. 

**Características da Importação:**
- Lida pontuação do CSV (`notas_de_escadas_CSV_correto.csv`).
- Cruzado número de ordem e nome vindo da listagem central do sistema (`students.json`).
- Respeitado o campo identificador com `module_id = 'escadas'`.
- Fallback seguro inserido em `itens_avaliados` computando a chave de aprovação para suprir os relatórios gerenciais existentes (nota >= 7.0 resulta em `{ resultado: 'APROVADO' }` pra não quebrar componente `AdvancedReports.jsx`).
- Adicionada idempotência no script: registros de alunos com avaliação prévia no módulo `escadas` não foram duplicados. Importados na base 176 registros de novos lançamentos limpos. 

**O que permanece pendente**
- Fórmulas e consolidação acadêmica VC1/VC2/Média (Fase 4 da Spec) seguem intactas na fila. A injeção apenas aquece a base de dados.

---

## Sprint 2026-04-14 — Padronização visual e UX do portal

### O que foi feito

Revisão completa de consistência visual e UX do portal (procedimento padrão frontend-design).

**Arquivos criados/alterados:**

- `src/styles/global.css` — adicionadas classes `.page-section-label`, `.page-section-title`, `.page-section-desc` para padronização de cabeçalhos de página; adicionado `.btn-danger-on-header` para o botão de logout no header vermelho; corrigidos `.header-title` e `.header-subtitle` (eram texto escuro sobre fundo vermelho — contraste inaceitável em campo); melhorado `.portal-nav-card` com accent border lateral; adicionada responsividade da `.page-section-title` para mobile; adicionado padding do `.portal-content` para tablet.
- `src/components/PortalLayout.jsx` — adicionado wrapper `.portal-content-inner` no main (max-width 1100px, centralizado); "Sair" alterado para `.btn-danger-on-header` (legível no header vermelho).
- `src/pages/PortalHome.jsx` — cabeçalho refatorado usando `.page-section-label/title/desc`.
- `src/pages/AvaliadorArea.jsx` — cabeçalho refatorado; cards de módulo agora exibem badge VC1/VC2/VC3.
- `src/pages/CoordenacaoArea.jsx` — cabeçalho refatorado.
- `src/pages/AlunoArea.jsx` — cabeçalho refatorado; input de busca usa `.form-input`; cards de consolidação usam `.stat-card/stat-label/stat-value`.
- `src/modules/teorica/screens/Evaluation.jsx` — refatorado para usar `.form-input`, `.card`, `.card-label`, `.card-title`, `var(--success-bg)`, `var(--danger-bg)`, `var(--success)`, `var(--danger)`; `window.location.href` substituído por `useNavigate`.
- `src/modules/teorica/screens/Signature.jsx` — mesmo padrão; `window.location.href` corrigido.
- `src/modules/teorica/screens/Summary.jsx` — usa `.summary-data-item`, `.status-info`, `.result-banner`; `window.location.href` corrigido.
- `src/modules/teorica/screens/Reports.jsx` — usa `.stat-card/stat-label/stat-value`, `.filter-bar/.filter-btn`, `.portal-table`; `window.location.href` corrigido; filtro de data migrado de select para filter-btn pills.
- `src/modules/shared/screens/StudentForm.jsx` — `window.location.href` substituído por `useNavigate`.

### Problemas corrigidos

- `.header-title` / `.header-subtitle` usavam `var(--text-primary)` / `var(--text-secondary)` (cores escuras) sobre fundo vermelho degradê — contraste inaceitável para uso em campo. Corrigido para branco.
- `portal-content-inner` (max-width 1100px) estava definido no CSS mas nunca usado — PortalLayout agora envolve children com ele.
- `window.location.href = '/avaliador'` em 5 arquivos causava hard reload (perde contexto React/Auth). Substituído por `useNavigate()`.
- Módulo `teorica` usava inline styles extensivos com valores hardcoded (rgba hex) ignorando o sistema de design tokens do CSS.
- `var(--bg-input, var(--bg))` referenciava `--bg` inexistente — corrigido para `var(--input-bg)` via classe `.form-input`.

### O que permanece pendente

- Motosserra, escadas, poços e circuito não foram tocados (já seguem o padrão CSS estabelecido).
- `AdvancedReports` de poços e circuito: não têm versão avançada (só basica) — baixa prioridade.
- Login.jsx: usa inline styles extensivos (aceitável por ser tela isolada com estilo intencional dark).

### Validação

- Manual/limitada (sem testes automatizados).
- Nenhuma lógica de negócio alterada.
- Nenhuma persistência alterada.
- Nenhuma regra de cálculo alterada.
- Fluxo de autenticação preservado.

---

## Sprint 2026-04-13 — Módulo teorica (Prova Teórica) implementado

### O que foi feito

Implementação do módulo `teorica` (Prova Teórica — VC3) como MVP funcional. Diferencia-se dos módulos práticos por não ter checklist de penalidades — o avaliador lança a nota diretamente (0 a 10).

**Arquivos criados:**
- `src/modules/teorica/TeoricaApp.jsx` — orquestrador do módulo; segue padrão dos demais módulos
- `src/modules/teorica/screens/Evaluation.jsx` — entrada de nota direta (0–10) com validação e indicador APROVADO/REPROVADO
- `src/modules/teorica/screens/Signature.jsx` — ciência do aluno via PIN (reutiliza lógica dos demais módulos)
- `src/modules/teorica/screens/Summary.jsx` — resumo e persistência em `avaliacoes` com `module_id = 'teorica'`
- `src/modules/teorica/screens/Reports.jsx` — listagem de avaliações teóricas com filtro por data e estatísticas

**Arquivos modificados:**
- `src/modules/shared/hooks/useEvaluationState.js` — adicionado `theoricaScore` (null) no estado inicial e `setTheoricaScore` no retorno
- `src/app/Router.jsx` — import TeoricaApp + rota `/avaliador/teorica` com ProtectedRoute
- `src/pages/AvaliadorArea.jsx` — módulo teorica adicionado à lista de módulos (5 módulos agora)
- `src/pages/CoordenacaoArea.jsx` — teorica adicionado a MODULE_LABELS, FILTER_OPTIONS e Promise.all

**Reaproveitado de shared/:**
- `StudentForm.jsx` — formulário de seleção de aluno
- `useEvaluationState.js` — hook de estado (estendido com theoricaScore)
- `avaliacoesService.js` — persistência (saveAvaliacao, fetchAvaliacoesByModulo, deleteAvaliacao)

### Fluxo funcional
form → evaluation (nota direta) → signature (PIN) → summary → save → reports

### Persistência
- `module_id = 'teorica'` na tabela `avaliacoes`
- `itens_avaliados` inclui `tipo_prova: 'teorica'` e `nota_teorica`
- `penalidades = 0` (não se aplica)
- Preparado para consolidação VC3 (decisão 2026-04-13)

### O que permanece pendente para teorica
- AdvancedReports (não é prioridade — apenas motosserra e escadas têm)
- Exportação CSV/XLSX específica (Reports básico já funciona)

### Validação
- Manual/limitada (sem testes automatizados)
- Nenhum erro de compilação detectado
- Nenhum módulo existente foi alterado funcionalmente

---

## Sprint 2026-04-13 — Atualização de documentação de design

### O que foi feito

Reescrita e atualização completa da documentação de design do sistema para refletir o estado real do portal (4 módulos funcionais, autenticação, perfis, consolidação decidida).

**Arquivos alterados:**
- `CLAUDE.md` — reescrito para ~90 linhas; removidas seções redundantes; referências adicionadas para `decision-rules.md` e `session-policies.md`
- `docs/current-state.md` — reescrito completamente; reflete portal com 4 módulos, auth, perfis, arquitetura modular real; removidas referências obsoletas a `App.jsx` centralizado e ausência de autenticação
- `docs/spec.md` — §4 atualizado (estado de origem); §6 com marcações de fase (✅/🔄/🔜); §8 com estrutura real de diretórios
- `docs/prd.md` — §9 atualizado para refletir módulos já implementados e Prova Teórica como VC3

**Arquivos criados:**
- `docs/decision-rules.md` — regras de decisão e tabela de roteamento por tipo de tarefa (movido de CLAUDE.md)
- `docs/session-policies.md` — política de economia de contexto (movido de CLAUDE.md)

### Risco associado

Nenhuma alteração de código — apenas documentação. Validação manual confirmada.

---

## Sprint 2026-04-13 — Módulo circuito fechado

### O que foi feito

Fechamento completo do módulo `circuito`. Todas as telas implementadas seguindo o padrão do módulo `pocos`.

**Arquivos criados:**
- `src/modules/circuito/screens/Signature.jsx` — confirmação por PIN; emoji 🔄; importa SECTIONS e calcScore de penalties.js
- `src/modules/circuito/screens/Summary.jsx` — resumo da avaliação com botão Salvar; banner APROVADO/REPROVADO
- `src/modules/circuito/screens/Reports.jsx` — lista de avaliações do módulo circuito; filtro por data; grid de estatísticas

**Arquivos modificados:**
- `src/modules/circuito/CircuitoApp.jsx` — imports e renders de Signature, Summary e Reports adicionados; placeholder removido
- `src/app/Router.jsx` — rota `/avaliador/circuito` adicionada com ProtectedRoute roles avaliador; import CircuitoApp
- `src/pages/CoordenacaoArea.jsx` — circuito adicionado a MODULE_LABELS, FILTER_OPTIONS e Promise.all

### Fluxo funcional
form → evaluation → signature → summary → save → reports (completo)

### CoordenacaoArea cobre agora
motosserra, escadas, pocos, circuito

### O que permanece pendente
AdvancedReports para circuito (não existe em nenhum módulo exceto motosserra — não é prioridade atual)

---

## Estado atual do projeto

O projeto possui hoje um portal funcional de avaliações de Salvamento Terrestre, com 4 módulos (motosserra, escadas, poços, circuito), autenticação por perfil via Supabase Auth, persistência multi-módulo com `module_id`, e visão consolidada para coordenação.

Próximos passos: implementar Prova Teórica (`teorica`) e consolidação acadêmico-operacional (Fase 4 da spec.md).

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

## Sprint — módulo pocos fechado em 2026-04-13

### O que foi feito

Fechamento do módulo `pocos` com tela de relatórios e integração à CoordenacaoArea.

**Arquivo criado:**
- `src/modules/pocos/screens/Reports.jsx` — relatório do módulo pocos; segue padrão do módulo escadas; exibe lista de avaliações com filtro por data, estatísticas (total, aprovados, reprovados, média), botão de exclusão por linha e botão de limpar tudo. Usa `finalScore` e `isPassing` já persistidos — não recalcula nota.

**Arquivos modificados:**
- `src/modules/pocos/PocoApp.jsx` — adicionado import de `Reports` e render condicional `{state.screen === 'reports' && <Reports {...props} />}`. O fluxo completo form → evaluation → signature → summary → reports agora está operacional.
- `src/pages/CoordenacaoArea.jsx` — adicionado `pocos` em `MODULE_LABELS`, `FILTER_OPTIONS` e no `Promise.all` de carregamento. A CoordenacaoArea agora cobre motosserra, escadas e pocos.

### O que permaneceu igual

- Módulos motosserra e escadas — intocados.
- Regras de cálculo de nota, penalidades, pesos — intocados.
- Banco de dados, autenticação, persistência — intocados.

### Estado atual do módulo pocos

Feature parity com escadas: **sim**, com exceção do botão "Relatórios Avançados" presente no escadas. O módulo pocos não expõe essa navegação por ora (a tela `advanced-reports` não foi criada para pocos). Isso é intencional e pode ser adicionado em sprint futura.

---

## Sprint — núcleo do módulo circuito criado em 2026-04-13

### O que foi feito

Criação do núcleo funcional do módulo `circuito` (Circuito Operacional — VC-3 2ª parte).

**Arquivos criados:**
- `src/modules/circuito/CircuitoApp.jsx` — orquestrador do módulo; segue padrão de `PocoApp.jsx`; usa `useEvaluationState` de `shared/hooks`; carrega avaliações com `fetchAvaliacoesByModulo('circuito')`; persiste com `module_id: 'circuito'`.
- `src/modules/circuito/screens/Evaluation.jsx` — tela de avaliação; checklist completo das 7 seções (1.0 a 7.0); seções 2.0–7.0 (estações operacionais) com cabeçalho dourado destacado; cálculo em tempo real via `calcScore` de `penalties.js`; campo de erro não previsto; status APROVADO/REPROVADO (nota >= 7,0); botão "Avançar para Assinatura" presente (screen `signature` ainda não implementada).

**Reutilizados de `shared/`:**
- `shared/screens/StudentForm.jsx` — sem modificação
- `shared/hooks/useEvaluationState.js` — sem modificação

### O que permaneceu igual

- Módulos motosserra, escadas e pocos — intocados.
- Router, banco, auth, serviços — intocados.

### Estado atual do módulo circuito

Funcional até a tela de avaliação. Pendente para completar o módulo:
- `screens/Signature.jsx`
- `screens/Summary.jsx`
- `screens/Reports.jsx`
- Conexão ao portal (Router.jsx) e à CoordenacaoArea

---

## Leitura correta do sistema

O sistema é um portal funcional de avaliações de Salvamento Terrestre, mas ainda não está completo. Faltam: Prova Teórica, consolidação automática (VC1/VC2/VC3), RLS e AlunoArea funcional.

A visão de produto final é um portal com:
- login unificado ✅;
- perfis distintos de acesso ✅;
- módulos por oficina (4 de 5 concluídos);
- consolidação automática de médias e pesos (decidida, não implementada);
- cálculo de aptidão final (decidido, não implementado);
- relatórios individuais e mapas de notas integrados para coordenação (parcial).

---

## Documentos-base já criados

Os seguintes arquivos devem ser considerados leitura prioritária antes de mudanças estruturais:

- `docs/current-state.md` — retrato do sistema atual
- `docs/prd.md` — visão do produto
- `docs/spec.md` — direção técnica e fases
- `docs/decision-rules.md` — regras de decisão e roteamento por tipo de tarefa
- `docs/session-policies.md` — políticas de economia de contexto
- `CLAUDE.md` — orientação essencial para atuação no repositório

---

## Situação arquitetural atual

Pontos relevantes do estado técnico atual:

- portal SPA com React 18 + Vite + react-router-dom;
- autenticação via Supabase Auth com 4 perfis (avaliador, coordenacao, aluno, admin);
- roteamento protegido por `ProtectedRoute` com validação de `role`;
- `src/services/avaliacoesService.js` centraliza todas as operações de persistência;
- 4 módulos funcionais: motosserra, escadas, pocos, circuito;
- `src/modules/shared/` com componentes e hooks reutilizáveis;
- CoordenacaoArea cobre os 4 módulos;
- RLS desabilitada em `avaliacoes` — ponto de atenção de segurança;
- AlunoArea bloqueada por migration pendente de `numero_ordem` em `profiles`;
- dados de alunos/instrutores ainda em arquivos locais (`shared/data/`);
- não há testes automatizados identificados.

---

## Prioridade técnica imediata

A frente de **consolidação acadêmico-operacional** (Fase 4 da spec.md) está pronta para começar.

### O que foi decidido (2026-04-13)

Arquivo criado: `docs/decisions/2026-04-13-consolidacao-academico-operacional.md`

Fórmulas finalizadas e mapeadas:
- VC1 = (escadas + poços) / 2
- VC2 = (motosserra + circuito) / 2
- VC3 = teorica
- Média Final = (VC1 + VC2 + VC3) / 3

Regras operacionais:
- Agregação: usa a **última avaliação registrada** por oficina
- Prova Teórica: persiste em `avaliacoes` com `module_id = 'teorica'`

### Próximo passo imediato

Poço e Circuito já estão implementados. A ordem agora é:

1. ✅ Módulo **Poço** (`'pocos'`) — concluído
2. ✅ Módulo **Circuito** (`'circuito'`) — concluído
3. ⏳ Implementar **Prova Teórica** (`'teorica'`) — abre possibilidade de calcular VC3 completo
4. ⏳ Criar `consolidacaoService.js` com as funções `calcularConsolidacao` e `fetchConsolidacaoPorAluno

---

## Sprint — circuito/data/penalties.js criado em 2026-04-13

### O que foi feito

Criação da camada de dados de penalidades do módulo `circuito`.

**Arquivo criado:**
- `src/modules/circuito/data/penalties.js` — define `SECTIONS` com 7 seções (tempo + 6 estações) e exporta `calcScore` idêntica ao padrão dos demais módulos.

**Estrutura das seções:**
- Seção 1.0: Tempo de execução (estações 1–5, máx 20 min, 8 faixas de 1 min, –0,20 cada)
- Seção 2.0: Estação 1 — Nós e Amarração (5 nós, –0,20 cada, total 1,0 pt)
- Seção 3.0: Estação 2 — Escada e Maca Cesto (4 itens, total 2,5 pts)
- Seção 4.0: Estação 3 — Nós e Amarrações (4 nós, –0,20 cada, total modelado 0,80 pt)
- Seção 5.0: Estação 4 — Sistema de Vantagem Mecânica Reduzido (2 itens, total modelado 1,50 pt)
- Seção 6.0: Estação 5 — Sistema de Vantagem Mecânica Estendido no Tripé (2 itens, –1,00 cada, total 2,0 pts)
- Seção 7.0: Estação 6 — Espaço Confinado / Galerias (2 itens, –0,50 cada, total 1,0 pt; tempo específico de 5 min é critério separado)

**Adaptação do modelo:**
A ficha original é de pontuação positiva. No portal o modelo é invertido: item marcado = critério não executado = desconto aplicado sobre base 10.

**Discrepâncias da ficha registradas em comentário no código:**
1. Estação 3: ficha declara 1,0 pt mas lista apenas 4 critérios de 0,20 (soma = 0,80). 0,20 pt não documentado. Modelados apenas os 4 critérios explícitos.
2. Estação 4: ficha declara 2,5 pts mas documenta critérios que somam apenas 1,50. 1,00 pt não está descrito. Modelados apenas os critérios explícitos.

### O que permaneceu igual

- Todos os outros módulos (motosserra, escadas, pocos) — intocados.
- Banco, autenticação, persistência — intocados.
- `shared/` — intocado.

### Estado atual do módulo circuito

Apenas `penalties.js` existe. O módulo ainda não tem fluxo funcional.

**Pendente para fluxo completo:**
- `CircuitoApp.jsx` — orquestrador do módulo
- `screens/Evaluation.jsx` — checklist baseado nas seções de `penalties.js`
- `screens/Signature.jsx` — pode reuso `shared/`
- `screens/Summary.jsx` — pode reuso `shared/`
- `screens/Reports.jsx` — específico do módulo
- Integração à rota do portal e à `CoordenacaoArea`

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

## Sprint 20 — dados do módulo Poços criados em 2026-04-13

### O que foi feito

Criação de `src/modules/pocos/data/penalties.js` — arquivo de penalidades para o módulo de Salvamento em Espaço Confinado (Poço).

**Arquivo criado:**
- `src/modules/pocos/data/penalties.js` — exporta `SECTIONS` com 5 seções e `calcScore` idêntica ao padrão dos módulos existentes.

**Fonte:** Ficha "AVALIAÇÃO PRÁTICA DE SALVAMENTO EM ESPAÇO CONFINADO — POÇO VC-2 / CFS 2022".

**Adaptação aplicada:** o módulo compõe o VC1 no CFSD-26 (junto com Escadas), não o VC2 da ficha original. O conteúdo técnico e as penalidades foram preservados integralmente; apenas o enquadramento institucional muda.

**O que NÃO foi alterado:** nenhum módulo existente, nenhuma rota, nenhuma persistência, nenhuma autenticação.

**Pendente para este módulo:** `PocoApp.jsx`, `Evaluation.jsx`, `Signature.jsx`, `Summary.jsx`, rota no portal, integração com `avaliacoesService`.

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

---

## Sprint 21 — núcleo funcional do módulo Poços criado em 2026-04-13

### O que foi feito

Implementação de `PocoApp.jsx` e `Evaluation.jsx` para o módulo de Salvamento em Espaço Confinado (Poço), fechando o fluxo mínimo de avaliação (form → evaluation).

**Arquivos criados:**
- `src/modules/pocos/PocoApp.jsx` — orquestrador do módulo. Importa `StudentForm` de shared, `Evaluation` de `./screens/Evaluation`, usa `useEvaluationState` de shared. Passa `moduleName="Salvamento em Espaço Confinado — Poço"` e `moduleEmoji="🕳️"`. Usa `module_id: 'pocos'` na persistência.
- `src/modules/pocos/screens/Evaluation.jsx` — tela de avaliação funcional com checklist completo das 5 seções, cálculo de nota em tempo real, campo de erro não previsto e painel de pontuação com status APROVADO/REPROVADO. As 3 fases operacionais (seções 3.0, 4.0, 5.0) têm cabeçalho visual destacado com borda dourada e fundo gradiente.

**Arquivo modificado:**
- `src/app/Router.jsx` — adicionada rota `/avaliador/pocos` com `<PocoApp />` protegida por `ProtectedRoute roles={['avaliador']}`.

### O que foi reutilizado de shared

- `src/modules/shared/screens/StudentForm.jsx` — reutilizado sem alteração
- `src/modules/shared/hooks/useEvaluationState.js` — reutilizado sem alteração

### O que NÃO foi implementado ainda (pendente)

- `Signature.jsx` — assinatura/visto do avaliado
- `Summary.jsx` — resumo da avaliação com botões de salvar/imprimir
- `Reports.jsx` — relatório de avaliações salvas
- Botão de avançar para assinatura (a tela de Evaluation exibe placeholder para etapa futura)

### O que permaneceu igual

- Módulos motosserra e escadas — intocados
- Shared layer — intocada (nenhum arquivo de shared foi modificado)
- Regras de cálculo — preservadas integralmente da `penalties.js` existente
- Persistência e autenticação — intocadas

Regra de ouro:
- preservar o que funciona hoje enquanto se prepara corretamente o sistema de amanhã.

---

## Sprint 22 — fluxo completo do módulo Poços (2026-04-13)

### O que foi feito

Fechamento do fluxo de avaliação do módulo Poços: form → evaluation → signature → summary → (save → reports).

**Arquivos criados:**
- `src/modules/pocos/screens/Signature.jsx` — tela de visto de prova com PIN de 4 dígitos (bloqueio após 3 tentativas, 30s), declaração de ciência por checkbox, listagem de erros/penalidades e exibição de nota com APROVADO/REPROVADO. Segue o padrão do módulo escadas; emojis e contexto ajustados para "🕳️ Poço".
- `src/modules/pocos/screens/Summary.jsx` — resumo da avaliação com banner de resultado, listagem de itens penalizados, painel de visto de prova e pontuação detalhada. Botão "Salvar e Ver Relatório" chama `saveEvaluation` e navega para reports. Botão "Voltar" retorna à `signature`. Segue o padrão do módulo escadas.

**Arquivos modificados:**
- `src/modules/pocos/screens/Evaluation.jsx` — substituído o placeholder "Assinatura e relatórios serão implementados em etapa futura" por botão real "Avançar para Assinatura →" com `onClick={() => goTo('signature')}` e classe `btn btn-primary`.
- `src/modules/pocos/PocoApp.jsx` — adicionados imports de `Signature` e `Summary`; adicionados renders condicionais `state.screen === 'signature'` e `state.screen === 'summary'`.

### O que foi reutilizado

- Padrão completo de `Signature.jsx` do módulo escadas (lógica de PIN, bloqueio, visto, layout de grid).
- Padrão completo de `Summary.jsx` do módulo escadas (banner de resultado, listagem de penalidades, sidebar com visto e pontuação).
- `calcScore` e `SECTIONS` de `src/modules/pocos/data/penalties.js` — sem alteração.
- Nenhum arquivo de `shared/` foi modificado.

### O que NÃO foi alterado

- Módulos motosserra e escadas — intocados.
- Shared layer — intocada.
- Persistência, autenticação e RLS — intocados.
- `module_id: 'pocos'` já estava em `PocoApp.jsx` — não duplicado.

### O que ainda falta para o módulo estar 100% completo

- `Reports.jsx` — tela de relatório de avaliações salvas para o módulo pocos (filtrando por `module_id = 'pocos'`).
- `AdvancedReports.jsx` — opcional, feature parity com motosserra/escadas.
- Integração de Poços na `CoordenacaoArea` (adicionar ao `Promise.all` que já busca motosserra e escadas).

### Status atual do fluxo

form → evaluation → signature → summary → save → (reports — stub ainda ausente) — **fluxo principal funcional**.