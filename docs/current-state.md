# current-state.md

## 1. Identificação do sistema

**Nome de referência:** Portal de Avaliações de Salvamento Terrestre — CBMAP CFSD-26
**Tipo de sistema:** Aplicação web SPA (Single Page Application) com React 18 + Vite, autenticação via Supabase Auth e persistência em PostgreSQL via Supabase.
**Finalidade:** Digitalizar e consolidar avaliações práticas e teóricas de Salvamento Terrestre no Curso de Formação de Soldados do CBMAP. Operacional em produção com 5 módulos: motosserra (Operações com Arvore), escadas, pocos, circuito e prova teorica (VC3). Autenticacao por perfil, RLS ativa, persistencia multi-modulo estabilizada.

---

## 2. Objetivo operacional

O sistema digitaliza o processo de avaliação prática, permitindo que o avaliador:

- selecione aluno, data e avaliador;
- aplique penalidades previstas em checklist por módulo;
- visualize a nota em tempo real;
- registre observações e erros críticos;
- colha a ciência do avaliado por PIN;
- salve a avaliação em banco com identificação de módulo;
- consulte relatórios, ranking e exportações por módulo.

A coordenação consulta dados consolidados de todas as oficinas em uma tela unificada.

---

## 3. Perfil de uso

4 perfis autenticados via Supabase Auth:

- **avaliador** — lança avaliações por módulo;
- **coordenacao** — consulta dados consolidados de todos os módulos;
- **aluno** — consulta própria situação (bloqueado por migration pendente de `numero_ordem`);
- **admin** — acesso irrestrito.

Acesso protegido por `ProtectedRoute` com validação de `role` via contexto de autenticação.

---

## 4. Escopo funcional

### Fluxo de avaliação (aplicável a todos os módulos)

1. **Seleção inicial** — aluno, pelotão, data, avaliador
2. **Avaliação** — checklist de penalidades, cálculo automático de nota, erro não previsto, erro crítico, observações
3. **Ciência do avaliado** — confirmação por checkbox + validação por PIN de 4 dígitos, bloqueio por excesso de tentativas
4. **Resumo e persistência** — resultado final, impressão, salvamento no Supabase com `module_id`
5. **Relatórios** — listagem, filtros por data, estatísticas, ranking, exportação CSV/XLSX

- **Consolidacao academica** com formulas VC1/VC2/VC3 — implementada em `src/services/consolidacaoService.js`
- **Exportacao de dados** para CSV e Excel — implementada em `src/services/exportService.js`

### Entregas estabilizadas

- **Prova Teorica** como VC3 — operacional como modulo `teorica` com `module_id = 'teorica'`
- **Modularizacao por oficina** — 5 modulos completos com fluxo operacional fechado
- **Autenticacao por perfil** — Supabase Auth com 4 perfis e RLS ativa
- **Persistencia multi-modulo** — tabela unica com `module_id`, campo estabilizado em producao
- **Camada de Servicos** — consolidacao e exportacao operacionais

---

## 5. Arquitetura

Portal SPA com:

- **React 18 + Vite** — UI e build
- **react-router-dom** — roteamento declarativo com `BrowserRouter`
- **Supabase Auth** — autenticação com perfis por `role`
- **Supabase (PostgreSQL)** — persistência de avaliações
- **ThemeContext / ThemeToggle** — tema claro/escuro
- **AuthContext** — estado global de autenticação e perfil

Camadas identificadas:
- `src/services/` — acesso ao Supabase (centralizado)
- `src/modules/` — módulos por oficina
- `src/contexts/` — estado global (auth, tema)
- `src/pages/` — telas de portal (login, home, áreas por perfil)
- `src/components/` — componentes compartilhados de infraestrutura

---

## 6. Estrutura do projeto

```
src/
  app/
    Router.jsx                    — roteamento principal com ProtectedRoute
  pages/
    Login.jsx
    PortalHome.jsx
    AvaliadorArea.jsx
    CoordenacaoArea.jsx
    AlunoArea.jsx
  contexts/
    AuthContext.jsx
    ThemeContext.jsx
  components/
    PortalLayout.jsx
    ProtectedRoute.jsx
    ThemeToggle.jsx
  services/
    avaliacoesService.js          — fetchAvaliacoes, saveAvaliacao, deleteAvaliacao, etc.
    consolidacaoService.js        — calculo de VC1, VC2, VC3 e Media Final por aluno.
    exportService.js              — exportacao para CSV e XLSX (Excel).
  modules/
    motosserra/                   — módulo completo com AdvancedReports
    escadas/                      — módulo completo com AdvancedReports
    pocos/                        — módulo completo (sem AdvancedReports)
    circuito/                     — módulo completo (sem AdvancedReports)
    teorica/                      — módulo completo (Prova Teórica — VC3)
    shared/
      screens/StudentForm.jsx     — formulário inicial reutilizado por todos os módulos
      hooks/useEvaluationState.js — hook de estado de avaliação reutilizado
      data/                       — alunos, instrutores (JSON estático)
```

---

## 7. Regras de negócio

### Avaliação por módulo
- Avaliação composta por penalidades distribuídas em seções; cada penalidade gera desconto sobre base 10.
- Nota final recalculada em tempo real.
- Erro não previsto com desconto livre.
- Erros críticos influenciam o resultado.
- Ciência do aluno exige confirmação e PIN válido.
- A avaliação só avança quando os requisitos mínimos da etapa são cumpridos.

### Consolidação acadêmica (implementada)
- **VC1** = (escadas + poços) / 2
- **VC2** = (motosserra + circuito) / 2
- **VC3** = teórica
- **Média Final** = (VC1 + VC2 + VC3) / 3
- **Média para Aptidão** = >= 7.0
- **Transparência**: Alunos possuem visão consolidada de toda a turma (Mapa de Notas).
- Agregação: usa a **última avaliação registrada** por oficina por aluno
- Nota zero ≠ não avaliado (distinção importante para consolidação)

---

## 8. Modelo de dados

### Tabela `avaliacoes`
Avaliações de todos os módulos na mesma tabela, diferenciadas por `module_id VARCHAR(50)`:
- `'motosserra'`, `'escadas'`, `'pocos'`, `'circuito'`, `'teorica'`

Campos relevantes: `nome_aluno`, `numero_ordem`, `pelotao`, `avaliador`, `data_avaliacao`, `nota_final`, `penalidades`, `observacoes`, `module_id`, `itens_avaliados` (JSONB — inclui itens_penalizados, erros_criticos, resultado, visto_confirmado etc.).

### Tabela `profiles`
Campos: `role` (avaliador | coordenacao | aluno | admin), `numero_ordem`.

### Dados estáticos locais
Alunos e instrutores mantidos em JSON estático em `src/modules/shared/data/`. Atualização depende de alteração manual e novo deploy.

---

## 9. Stack tecnológica

- **Linguagem:** JavaScript (ES Modules)
- **UI:** React 18
- **Build/dev:** Vite
- **Roteamento:** react-router-dom
- **Autenticação:** Supabase Auth
- **Persistência / BaaS:** Supabase (PostgreSQL)
- **Exportação de planilhas:** `xlsx`
- **Estilização:** CSS vanilla
- **Tema:** ThemeContext / ThemeToggle (claro/escuro)
- **Testes:** não identificados
- **Lint/formatter:** não identificados

---

## 10. Estado de maturidade

**Produto operacional em producao** — portal com 5 modulos funcionais, autenticacao por perfil via Supabase Auth, RLS ativa, roteamento protegido, persistencia multi-modulo, relatorios avancados e exportacoes. Sistema em uso real no CFSD-26.

---

## 11. Pontos fortes

- Arquitetura modular com `shared/` reutilizável entre módulos.
- Autenticação por perfil via Supabase Auth e ProtectedRoute.
- Persistência com `module_id` permite consolidação futura sem mudança de schema.
- Fluxo operacional claro e coeso: formulário → avaliação → assinatura → resumo → relatórios.
- Nota calculada em tempo real com checklist de penalidades.
- Camada de serviço centralizada (`avaliacoesService.js`).
- CoordenacaoArea cobre os 5 modulos com visao consolidada.
- RLS ativa em `avaliacoes` e `profiles` — dados protegidos por perfil no banco.

---

## 12. Pendencias de producao

### Seguranca e integridade
- PINs dos alunos estao em arquivo local distribuido no frontend (mecanismo de ciencia do avaliado, nao de autenticacao).

### Funcionalidades com restricoes
- AlunoArea funcional, porem depende de `numero_ordem` preenchido corretamente em `profiles` para cada conta de aluno.

### Relatorios
- Modulos `pocos` e `circuito` nao possuem `AdvancedReports` (apenas motosserra e escadas tem). Baixa prioridade.

### Seguranca e integridade
- PINs dos alunos estao em arquivo local distribuido no frontend (mecanismo de ciencia do avaliado, nao de autenticacao).
- RLS desabilitada em `avaliacoes` e `profiles` — ponto de atenção de segurança técnica.

### Qualidade de engenharia
- Ausencia de testes automatizados.
- Ausencia de lint/formatter.
- Atualizacao de alunos/instrutores depende de alteracao manual de arquivos e novo deploy.

---

## 13. Roadmap de evolucao

- **Fase 1** ✅ — Organizacao da base (servico centralizado, extracao de logica de `App.jsx`)
- **Fase 2** ✅ — Portal com autenticacao, perfis e roteamento
- **Fase 3** ✅ — Modularizacao por oficina (motosserra, escadas, pocos, circuito, teorica — todos operacionais)
- **Fase 4** ✅ — Consolidacao academico-operacional (Concluída: Servicos, Exportação, Dashboards e Mapa de Notas operacionais)

---

## 14. Proximas entregas planejadas

O sistema esta operacional. As pendencias restantes sao de evolucao do produto:

As pendencias restantes sao de refinamento e segurança técnica:
- **Refinamento de RLS**: revisão e ativação rigorosa das políticas no Supabase (atualmente em foco de governança).

---

## 15. Resumo executivo

O sistema e um portal SPA de avaliacoes de Salvamento Terrestre em producao, com 5 modulos operacionais (motosserra, escadas, pocos, circuito, prova teorica), autenticacao por perfil via Supabase Auth com RLS ativa, persistencia multi-modulo com `module_id`, camada de servico centralizada, relatorios avancados e visao consolidada para a coordenacao. As Fases 1, 2 e 3 da spec estao concluidas e estabilizadas.

O sistema atingiu o estado de maturidade total conforme a SPEC original: lancamento técnico, persistência multi-módulo, e dashboard de consolidação acadêmica (Mapa de Notas) com visualizações gráficas avançadas e exportação. O próximo ciclo estratégico envolve refinamento de segurança por perfil e personalização da jornada do aluno.

Este documento e a **fonte de verdade do estado atual do sistema**, servindo de base para PRD, SPEC, `CLAUDE.md` e futuras sessoes de desenvolvimento.
