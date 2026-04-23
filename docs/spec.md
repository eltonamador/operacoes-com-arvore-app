# spec.md

## 1. Objetivo da SPEC

Esta SPEC define a direcao tecnica do Portal de Avaliacoes de Salvamento Terrestre — CBMAP CFSD-26.

O sistema ja opera em producao com login unificado, 5 modulos de avaliacao, perfis de acesso e persistencia multi-modulo. A especificacao orienta a evolucao incremental do produto, com foco atual na consolidacao academico-operacional (Fase 4):

- consolidacao automatica de notas (VC1/VC2/VC3/Media Final) — concluída;
- relatorios individuais e gerenciais avancados — operacionais (dashboards);
- calculo de aptidao final — concluída;
- mapas de notas para coordenacao — concluída.

---

## 2. Principios de evolucao

A evolucao do sistema segue os principios abaixo:

### 2.1 Preservar o que funciona
O sistema em producao resolve necessidades reais e nao deve ser desestabilizado sem justificativa.

### 2.2 Evoluir incrementalmente
Mudancas devem ter ganho estrutural progressivo, sem reescrita ampla desnecessaria.

### 2.3 Modularizar antes de expandir
Novos modulos ou funcionalidades nao devem ser adicionados sem respeitar a arquitetura modular estabelecida.

### 2.4 Perfis e permissoes como base
A arquitetura distingue claramente avaliador, aluno, coordenacao e administracao — toda evolucao deve respeitar essa separacao.

### 2.5 Dados primeiro, telas depois
Modelagem de dados e regras de calculo devem ser definidas antes da multiplicacao de interfaces.

---

## 3. Escopo desta SPEC

Esta SPEC cobre a arquitetura e evolucao do portal, incluindo:

- estrutura modular do frontend (concluida);
- autenticacao e autorizacao por perfil (concluida);
- modularizacao por oficina com 5 modulos (concluida);
- modelagem de dados centralizada com `module_id` (concluida);
- estrategia de consolidacao de notas (concluída);
- estrategia de relatorios avancados e mapas de notas (concluída);
- criterios de evolucao segura.

Fora de escopo:
- desenho detalhado de UI final de todas as telas;
- integracoes externas avancadas;
- analytics avancado;
- aplicativo mobile;
- suporte offline.

---

## 4. Estado atual

O sistema opera em producao como portal de avaliacoes com:

- autenticacao via Supabase Auth com 4 perfis (avaliador, coordenacao, aluno, admin);
- roteamento protegido via `react-router-dom` e `ProtectedRoute`;
- 5 modulos operacionais: motosserra, escadas, pocos, circuito e teorica;
- camada de servico centralizada (`avaliacoesService.js`);
- persistencia multi-modulo com `module_id` na tabela `avaliacoes`;
- RLS ativa em `avaliacoes` e `profiles`;
- `shared/` com componentes e hooks reutilizaveis entre modulos;
- CoordenacaoArea com visao consolidada dos 5 modulos;
- AlunoArea funcional com consulta por `numero_ordem`.

O sistema atingiu a maturidade da Fase 4. O foco técnico migra para refinamentos de segurança (RLS), qualidade de código (lint/testes) e personalização da visualização do aluno.

---

## 5. Capacidades ja entregues e proximas

O sistema ja possui em producao:

- ✅ login unificado;
- ✅ controle de acesso por perfil;
- ✅ modulos de avaliacao por oficina (5 operacionais);
- ✅ regras de calculo por disciplina;
- ✅ base unica de dados de avaliacoes com `module_id`;
- ✅ estrutura modular preparada para crescimento.

Pendentes (Fase 4):

- ✅ consolidacao automatica entre modulos;
- ✅ relatorios individuais consolidados por aluno;
- ✅ relatorios gerenciais avancados por coordenacao;
- ✅ calculo de aptidao final e mapas de notas (operacional).

---

## 6. Estratégia de evolução por fases

## Fase 1 — Organização da base atual ✅ concluída
Objetivo: reduzir acoplamento sem alterar profundamente a experiência do usuário.

Entregas principais:
- separar responsabilidades concentradas em `App.jsx`;
- criar camada de serviços para Supabase (`avaliacoesService.js`);
- isolar regras de cálculo e persistência;
- preparar organização por módulos.

Resultado: sistema continua funcionando; acesso ao Supabase centralizado no serviço; base mais segura para expansão.

---

## Fase 2 — Estruturação do portal ✅ concluída
Objetivo: introduzir identidade de portal e múltiplos acessos.

Entregas principais:
- autenticação via Supabase Auth;
- perfis de usuário (avaliador, coordenacao, aluno, admin);
- tela inicial de portal (`PortalHome`);
- separação entre área do avaliador, aluno e coordenação;
- roteamento por módulos com `react-router-dom` e `ProtectedRoute`.

Resultado: o sistema tem arquitetura de portal com autenticação e controle de acesso por perfil.

---

## Fase 3 — Modularizacao por oficina ✅ concluida
Objetivo: permitir que varias disciplinas compartilhem a mesma base estrutural.

Entregas:
- ✅ Modulo Motosserra (Operacoes com Arvore / Corte com Motosserra) — `module_id: 'motosserra'`
- ✅ Modulo Escadas — `module_id: 'escadas'`
- ✅ Modulo Pocos — `module_id: 'pocos'`
- ✅ Modulo Circuito — `module_id: 'circuito'`
- ✅ Prova Teorica — `module_id: 'teorica'` (lancamento direto de nota 0-10, sem checklist)

Resultado: cada oficina possui seu fluxo tecnico proprio, usando a mesma infraestrutura de usuarios, dados e relatorios. Todos os 5 modulos estao operacionais em producao.

---

## Fase 4 — Consolidacao academico-operacional (proxima)
Objetivo: transformar o portal em base central de gestao academica da coordenacao.

Entregas principais:
- ✅ cálculo automático de médias e pesos (concluído);
- ✅ status final de aptidão (concluído);
- ✅ mapas de notas (CoordenacaoArea);
- ✅ relatórios de evolução individual (AlunoArea);
- ✅ painéis de consulta para coordenação (CoordenacaoArea).

Resultado esperado:
- lançamento feito por avaliador já alimenta automaticamente a base consolidada do curso.

---

## 7. Estrutura funcional alvo

O portal deve possuir, no mínimo, as seguintes áreas:

### 7.1 Área do avaliador
Responsável por:
- selecionar oficina/disciplina;
- acessar checklist técnico;
- usar cronômetros, quando aplicável;
- lançar penalidades, observações e notas;
- salvar avaliações.

### 7.2 Área do aluno
Responsável por:
- consultar apenas seu próprio histórico;
- visualizar notas por oficina;
- acompanhar desempenho geral;
- consultar relatório individual.

### 7.3 Área da coordenação
Responsável por:
- consultar dados consolidados;
- filtrar por pelotão, oficina, aluno e período;
- emitir mapas de notas;
- visualizar médias, pesos e aptidão final.

### 7.4 Área administrativa
Responsável por:
- gerenciar usuários;
- gerenciar perfis;
- parametrizar oficinas;
- parametrizar pesos e regras de cálculo;
- manter coerência estrutural do sistema.

---

## 8. Proposta de organização técnica do frontend

A estrutura atual deve evoluir para algo mais modular.

### Estrutura sugerida

```text
src/
  app/
    Router.jsx
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
    avaliacoesService.js
    consolidacaoService.js
    exportService.js
  modules/
    motosserra/
    escadas/
    pocos/
    circuito/
    shared/
      screens/
      hooks/
      data/
  lib/
  utils/
  styles/