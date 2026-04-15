# spec.md

## 1. Objetivo da SPEC

Esta SPEC define a direção técnica inicial para evoluir o sistema atual de avaliação de motosserra para um portal centralizado de avaliações de Salvamento Terrestre.

O foco desta especificação não é reescrever todo o sistema imediatamente, mas conduzir uma transição controlada, preservando o que já funciona e reorganizando a base para suportar:

- login unificado;
- múltiplas oficinas;
- perfis distintos de acesso;
- consolidação automática de notas;
- relatórios individuais e gerenciais;
- integração direta com a coordenação.

---

## 2. Princípios de transição

A evolução do sistema deve seguir os princípios abaixo:

### 2.1 Preservar o que já funciona
O sistema atual já resolve uma necessidade real e deve ser tratado como base funcional válida.

### 2.2 Evitar reescrita total imediata
A transição deve ser incremental, com ganho estrutural progressivo.

### 2.3 Separar produto atual de produto-alvo
O sistema atual é um módulo funcional; o produto-alvo é um portal de avaliações centralizado.

### 2.4 Modularizar antes de expandir
Novas oficinas não devem ser adicionadas sobre a mesma estrutura centralizada atual sem reorganização prévia mínima.

### 2.5 Preparar o sistema para múltiplos perfis
A arquitetura futura deve distinguir claramente avaliador, aluno, coordenação e administração.

### 2.6 Dados primeiro, telas depois
A modelagem de dados e regras de cálculo devem ser definidas antes da multiplicação das interfaces.

---

## 3. Escopo desta SPEC

Esta SPEC cobre a primeira onda de evolução arquitetural do sistema, incluindo:

- reorganização estrutural mínima do frontend;
- preparação para autenticação e autorização;
- preparação para múltiplas oficinas;
- modelagem inicial de dados centralizados;
- estratégia de consolidação de notas;
- estratégia de relatórios;
- critérios de transição segura.

Não cobre ainda:
- desenho detalhado de UI final de todas as telas;
- implementação completa de todas as oficinas;
- integrações externas avançadas;
- analytics avançado;
- aplicativo mobile;
- suporte offline.

---

## 4. Estado de origem

O sistema partiu de uma SPA React com Vite focada na avaliação de motosserra. Hoje já evoluiu para um portal com:

- autenticação via Supabase Auth com 4 perfis (avaliador, coordenacao, aluno, admin);
- roteamento protegido via `react-router-dom` e `ProtectedRoute`;
- 4 módulos funcionais: motosserra, escadas, poços e circuito;
- camada de serviço centralizada (`avaliacoesService.js`);
- persistência multi-módulo com `module_id` na tabela `avaliacoes`;
- `shared/` com componentes e hooks reutilizáveis entre módulos;
- CoordenacaoArea com visão consolidada dos 4 módulos.

O principal desafio técnico restante não é mais a falta de estrutura — é finalizar os módulos pendentes (Prova Teórica) e implementar a consolidação acadêmico-operacional (Fase 4).

---

## 5. Estado-alvo de médio prazo

O sistema deverá evoluir para um portal com estas capacidades estruturais:

- login unificado;
- controle de acesso por perfil;
- módulos de avaliação por oficina;
- regras de cálculo por disciplina;
- consolidação automática entre módulos;
- relatórios individuais por aluno;
- relatórios gerenciais por coordenação;
- base única de dados de avaliações;
- estrutura preparada para crescimento.

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

## Fase 3 — Modularização por oficina 🔄 em andamento
Objetivo: permitir que várias disciplinas compartilhem a mesma base estrutural.

Entregas:
- ✅ Módulo Motosserra (Operações com Árvore / Corte com Motosserra) — `module_id: 'motosserra'`
- ✅ Módulo Escadas — `module_id: 'escadas'`
- ✅ Módulo Poços — `module_id: 'pocos'`
- ✅ Módulo Circuito — `module_id: 'circuito'`
- ✅ Prova Teórica — `module_id: 'teorica'` (implementada — lança nota direta 0–10, sem checklist)

Resultado esperado: cada oficina possui seu fluxo técnico próprio, mas usa a mesma infraestrutura de usuários, dados e relatórios.

---

## Fase 4 — Consolidação acadêmico-operacional
Objetivo: transformar o portal em base central da coordenação.

Entregas principais:
- cálculo automático de médias e pesos;
- status final de aptidão;
- mapas de notas;
- relatórios de evolução individual;
- painéis de consulta para coordenação.

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