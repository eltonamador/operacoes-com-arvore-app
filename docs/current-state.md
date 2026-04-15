# current-state.md

## 1. Identificação do sistema

**Nome de referência:** Portal de Avaliações de Salvamento Terrestre — CBMAP CFSD-26
**Tipo de sistema:** Aplicação web SPA (Single Page Application) com React 18 + Vite, autenticação via Supabase Auth e persistência em PostgreSQL via Supabase.
**Finalidade atual:** Digitalizar avaliações práticas de múltiplas oficinas de Salvamento Terrestre no Curso de Formação de Soldados do CBMAP. Atualmente funcional com 5 módulos: motosserra (Operações com Árvore), escadas, poços, circuito e prova teórica (VC3).

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

### Decisões tomadas, ainda não implementadas

- **Consolidação acadêmica** com fórmulas VC1/VC2/VC3 — decidida em `docs/decisions/2026-04-13-consolidacao-academico-operacional.md`

### Decisões implementadas

- **Prova Teórica** como VC3 — implementada como módulo `teorica` com `module_id = 'teorica'`

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

### Consolidação acadêmica (decidida, não implementada)
- **VC1** = (escadas + poços) / 2
- **VC2** = (motosserra + circuito) / 2
- **VC3** = teórica
- **Média Final** = (VC1 + VC2 + VC3) / 3
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

**Avançado** — portal funcional com 4 módulos, autenticação por perfil, roteamento protegido, persistência multi-oficina, relatórios e exportações.

---

## 11. Pontos fortes

- Arquitetura modular com `shared/` reutilizável entre módulos.
- Autenticação por perfil via Supabase Auth e ProtectedRoute.
- Persistência com `module_id` permite consolidação futura sem mudança de schema.
- Fluxo operacional claro e coeso: formulário → avaliação → assinatura → resumo → relatórios.
- Nota calculada em tempo real com checklist de penalidades.
- Camada de serviço centralizada (`avaliacoesService.js`).
- CoordenacaoArea cobre os 4 módulos com visão consolidada.

---

## 12. Fragilidades e limitações

### Segurança e integridade
- RLS desabilitada na tabela `avaliacoes` — qualquer usuário autenticado pode ler/escrever.
- PINs dos alunos estão em arquivo local distribuído no frontend.

### Funcionalidades bloqueadas
- AlunoArea não funcional: `numero_ordem` ainda não está na tabela `profiles` (migration pendente).

### Relatórios
- Módulos `pocos` e `circuito` não possuem `AdvancedReports` (apenas motosserra e escadas têm).

### Pendências de produto
- Consolidação automática (VC1/VC2/VC3/Média Final) ainda não implementada.

### Qualidade de engenharia
- Ausência de testes automatizados.
- Ausência de lint/formatter.
- Atualização de alunos/instrutores depende de alteração manual de arquivos e novo deploy.

---

## 13. Direção de evolução

- **Fase 1** ✅ — Organização da base (serviço centralizado, extração de lógica de `App.jsx`)
- **Fase 2** ✅ — Portal com autenticação, perfis e roteamento
- **Fase 3** 🔄 — Modularização por oficina (motosserra, escadas, poços, circuito concluídos; Prova Teórica pendente)
- **Fase 4** 🔜 — Consolidação acadêmico-operacional (fórmulas VC1/VC2/VC3 já decididas)

---

## 14. Implicações arquiteturais imediatas

O que ainda falta para fechar o portal como produto funcional completo:

- **RLS** — habilitar políticas de acesso por `role` na tabela `avaliacoes`;
- **Migration `profiles`** — adicionar `numero_ordem` para desbloquear AlunoArea;
- **Prova Teórica** — criar módulo `teorica` com fluxo simplificado de lançamento de nota;
- **`consolidacaoService.js`** — implementar cálculo de VC1, VC2, VC3 e Média Final após os 3 módulos relevantes estarem prontos;
- **AdvancedReports** para poços e circuito (baixa prioridade).

---

## 15. Resumo executivo

O sistema é um portal SPA de avaliações práticas de Salvamento Terrestre, com 4 módulos funcionais (motosserra, escadas, poços, circuito), autenticação por perfil via Supabase Auth, persistência multi-módulo com `module_id`, camada de serviço centralizada e visão consolidada para a coordenação. A arquitetura modular está estabelecida e validada em operação real.

O próximo passo estratégico é implementar a Prova Teórica (Fase 3) e a consolidação acadêmico-operacional (Fase 4), ambas já com regras definidas.

Este documento é a **fonte de verdade do estado atual do sistema**, servindo de base para PRD, SPEC, `CLAUDE.md` e futuras sessões de desenvolvimento.
