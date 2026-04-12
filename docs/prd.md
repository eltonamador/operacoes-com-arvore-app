# prd.md

## 1. Nome do produto

**Portal de Avaliações de Salvamento Terrestre — CBMAP**

---

## 2. Visão do produto

O produto tem como objetivo centralizar, padronizar e consolidar as avaliações das oficinas e disciplinas práticas de Salvamento Terrestre em um único portal institucional.

A proposta é evoluir o sistema atual, hoje focado na avaliação de motosserra, para uma plataforma mais ampla, com login unificado, controle de acesso por perfil, lançamento técnico de notas por oficina, consolidação automática de médias e pesos, cálculo instantâneo de aptidão final e integração direta com a coordenação do curso.

O sistema deverá servir simultaneamente a três necessidades principais:

- permitir que avaliadores lancem notas e critérios técnicos com rapidez e segurança;
- permitir que alunos consultem apenas seu próprio desempenho;
- permitir que a coordenação visualize, consolide e extraia dados globais do curso.

---

## 3. Problema

Atualmente, avaliações práticas de diferentes oficinas tendem a ficar dispersas em controles separados, planilhas, formulários distintos ou registros manuais, o que dificulta:

- padronização dos lançamentos;
- consolidação rápida de notas;
- aplicação uniforme de pesos e médias;
- rastreabilidade da evolução individual dos militares;
- visão central da coordenação;
- emissão ágil de mapas de notas;
- segurança e controle de acesso aos dados.

Mesmo quando já existe uma solução funcional para uma disciplina específica, ela ainda não resolve o problema mais amplo da gestão integrada das avaliações de Salvamento Terrestre como um todo.

---

## 4. Objetivo do produto

Criar um portal centralizado de avaliações práticas de Salvamento Terrestre, no qual:

- avaliadores registrem checklists técnicos, tempos, penalidades e notas por oficina;
- alunos acessem apenas seus próprios resultados e relatórios;
- a coordenação acompanhe o desempenho geral, individual e por disciplina;
- o sistema consolide automaticamente médias, pesos e status final de aptidão;
- o lançamento de notas alimente automaticamente uma base única de dados;
- relatórios institucionais e individuais sejam gerados com rapidez, padronização e rastreabilidade.

---

## 5. Goals

### 5.1 Goals funcionais

- Centralizar em um único portal as avaliações práticas de Salvamento Terrestre.
- Implementar login unificado com separação de perfis.
- Permitir lançamento técnico de notas por avaliadores.
- Permitir consulta individual de desempenho por aluno.
- Consolidar automaticamente médias e pesos entre disciplinas.
- Gerar status final de aptidão de forma instantânea.
- Produzir mapas de notas detalhados para coordenação.
- Produzir relatórios individuais de desempenho e evolução.

### 5.2 Goals operacionais

- Reduzir retrabalho administrativo.
- Reduzir risco de erro em consolidação manual.
- Melhorar rastreabilidade das avaliações.
- Aumentar velocidade de consulta e emissão de relatórios.
- Manter padronização entre diferentes oficinas e avaliadores.

### 5.3 Goals técnicos

- Evoluir a base atual sem perder o conhecimento já embutido no sistema existente.
- Tornar o sistema modular por oficina/disciplina.
- Permitir futura expansão para novas oficinas sem reestruturação completa.
- Melhorar integridade e centralização dos dados.

---

## 6. Fora de escopo inicial

Neste momento, não fazem parte do escopo inicial:


- criação de aplicativo mobile nativo;
- integração com sistemas externos corporativos não essenciais;
- analytics avançado ou BI completo;
- automações complexas de mensageria;
- módulo acadêmico amplo fora do contexto de avaliação prática;
- suporte offline completo;
- gamificação ou funcionalidades sociais.

Também não é objetivo inicial transformar o portal em um ERP institucional amplo. O foco é a gestão de avaliações práticas de Salvamento Terrestre.

---

## 7. Usuários e perfis

### 7.1 Avaliador
Responsável por registrar avaliações, aplicar checklists, tempos, penalidades, observações e notas.

**Necessidades principais:**
- acesso rápido às oficinas sob sua responsabilidade;
- interface objetiva para lançamento;
- cálculo automático de resultados;
- confiança na integridade dos dados lançados.

### 7.2 Aluno
Militar avaliado nas oficinas do curso.

**Necessidades principais:**
- consultar suas próprias notas;
- visualizar desempenho por disciplina;
- acompanhar evolução individual;
- ter clareza sobre situação final.

### 7.3 Coordenação
Responsável pela visão global do curso e consolidação institucional das notas.

**Necessidades principais:**
- visualizar dados por aluno, oficina, pelotão e turma;
- gerar mapas de notas;
- consultar médias, pesos e status final;
- garantir padronização e rastreabilidade dos registros.

### 7.4 Administrador do sistema
Perfil responsável por configuração estrutural do portal.

**Necessidades principais:**
- gerenciar usuários e permissões;
- parametrizar disciplinas, pesos e regras;
- manter estrutura e integridade do sistema.

---

## 8. User stories

### 8.1 Avaliador
- Como avaliador, quero acessar apenas as oficinas sob minha responsabilidade para lançar avaliações com rapidez e segurança.
- Como avaliador, quero utilizar checklists técnicos e cronômetros dentro do sistema para registrar a execução de forma padronizada.
- Como avaliador, quero que o sistema calcule automaticamente notas e resultados para evitar erros manuais.
- Como avaliador, quero salvar a avaliação uma única vez e ter certeza de que ela ficará disponível para coordenação imediatamente.

### 8.2 Aluno
- Como aluno, quero acessar apenas meu próprio desempenho para acompanhar minhas notas com clareza.
- Como aluno, quero ver meus resultados por oficina e meu status geral de aptidão.
- Como aluno, quero consultar relatórios individuais de evolução ao longo do curso.

### 8.3 Coordenação
- Como coordenação, quero que toda nota lançada pelos avaliadores alimente automaticamente uma base central para evitar consolidação manual.
- Como coordenação, quero visualizar mapas de notas detalhados por oficina, pelotão e aluno.
- Como coordenação, quero que médias, pesos e aptidão final sejam calculados automaticamente.
- Como coordenação, quero emitir relatórios individuais e consolidados de forma rápida e padronizada.

### 8.4 Administração
- Como administrador, quero controlar perfis de acesso para garantir que cada usuário veja apenas o que deve ver.
- Como administrador, quero parametrizar oficinas, pesos e regras de cálculo sem depender de mudanças improvisadas no código.

---

## 9. Módulos iniciais pretendidos

O portal deve nascer com foco nas oficinas e componentes mais relevantes já identificados, incluindo:

- Escadas
- Poços
- Circuito
- Árvores

O módulo atual de avaliação de motosserra deve ser tratado como referência funcional e possível embrião de uma dessas frentes, especialmente no que diz respeito a:

- checklists técnicos;
- lançamento de penalidades;
- cálculo automático de nota;
- relatórios;
- persistência estruturada.

---

## 10. Requisitos funcionais de alto nível

### 10.1 Autenticação e acesso
- O sistema deve possuir login unificado.
- O sistema deve diferenciar perfis de acesso.
- O avaliador não deve acessar dados administrativos amplos sem permissão.
- O aluno não deve acessar dados de outros alunos.
- A coordenação deve ter visão consolidada do curso.

### 10.2 Avaliação por oficina
- O sistema deve permitir formulários/checklists específicos por oficina.
- O sistema deve permitir registrar tempos, penalidades, observações e notas.
- O sistema deve permitir regras específicas por disciplina.
- O sistema deve calcular automaticamente o resultado da avaliação.

### 10.3 Consolidação
- O sistema deve consolidar automaticamente as notas entre oficinas.
- O sistema deve aplicar pesos conforme regras definidas.
- O sistema deve calcular médias e status final de aptidão.
- O sistema deve manter histórico por aluno e por disciplina.

### 10.4 Relatórios
- O sistema deve gerar relatórios individuais por militar.
- O sistema deve gerar mapas de notas para coordenação.
- O sistema deve permitir filtros por pelotão, oficina, aluno e período.
- O sistema deve permitir exportação de dados em formatos úteis à gestão.

### 10.5 Administração
- O sistema deve permitir gestão de usuários e perfis.
- O sistema deve permitir configuração de oficinas, critérios e pesos.
- O sistema deve garantir integridade e rastreabilidade dos lançamentos.

---

## 11. Requisitos não funcionais de alto nível

- Interface clara, objetiva e operacional.
- Baixo atrito para lançamento em contexto de instrução prática.
- Segurança compatível com dados institucionais e perfis de acesso.
- Rastreabilidade dos registros.
- Facilidade de manutenção e expansão.
- Estrutura preparada para modularização por oficina.
- Tempo de resposta adequado para uso cotidiano.
- Base centralizada confiável para coordenação.

---

## 12. Restrições e contexto técnico

O ponto de partida do produto não é um projeto totalmente novo. Já existe um sistema funcional focado na avaliação de motosserra, com:

- frontend em React;
- persistência em Supabase;
- lógica de checklist e cálculo de nota;
- relatórios e exportações;
- fluxo operacional já validado em cenário real.

Isso significa que a evolução do produto deve considerar:

- reaproveitamento inteligente do que já funciona;
- preservação do conhecimento operacional já incorporado;
- redução de retrabalho;
- transição gradual para uma arquitetura mais ampla e modular.

---

## 13. Critérios de sucesso do produto

O produto será considerado bem-sucedido quando:

- avaliadores conseguirem lançar avaliações de diferentes oficinas em um único portal;
- alunos conseguirem consultar seu próprio desempenho com autonomia;
- a coordenação deixar de depender de consolidação manual dispersa;
- médias, pesos e aptidão final forem gerados automaticamente;
- relatórios individuais e mapas de notas forem emitidos de forma rápida e confiável;
- o sistema se mostrar escalável para novas oficinas de Salvamento Terrestre.

---

## 14. Riscos de produto

- Crescimento do sistema sem modularização suficiente.
- Regras de cálculo diferentes entre oficinas sem padronização adequada.
- Mistura entre necessidades operacionais imediatas e escopo excessivamente amplo.
- Acoplamento excessivo à estrutura do sistema atual.
- Falhas de permissão entre perfis, caso autenticação e autorização não sejam bem definidas.
- Dependência excessiva de manutenção manual de dados, caso a modelagem não evolua.

---

## 15. Resumo executivo

O produto pretendido é um portal institucional de avaliações de Salvamento Terrestre, com login unificado, perfis distintos de acesso, lançamento técnico por oficina, consolidação automática de médias e pesos, cálculo de aptidão final e geração integrada de relatórios para coordenação e alunos.

O sistema atual de avaliação de motosserra deve ser entendido como o primeiro núcleo funcional dessa evolução, e não como o destino final do projeto. O objetivo estratégico é transformar uma solução operacional pontual em uma plataforma centralizada, escalável e rastreável de gestão de avaliações práticas.