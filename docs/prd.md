# prd.md

## 1. Nome do produto

**Portal de Avaliações de Salvamento Terrestre — CBMAP**

---

## 2. Visão do produto

O produto centraliza, padroniza e consolida as avaliacoes das oficinas e disciplinas praticas de Salvamento Terrestre em um unico portal institucional.

O sistema ja opera em producao com login unificado, controle de acesso por perfil, lancamento tecnico de notas por oficina em 5 modulos funcionais, visao consolidada para coordenacao, motor de calculo de medias, dashboads graficos avancados e mapas de notas integrados. O sistema atende plenamente ao ciclo de lancamento, consulta e gestao academica.

O sistema serve simultaneamente a tres necessidades principais:

- permitir que avaliadores lancem notas e criterios tecnicos com rapidez e seguranca;
- permitir que alunos consultem apenas seu proprio desempenho;
- permitir que a coordenacao visualize, consolide e extraia dados globais do curso.

---

## 3. Problema

Antes deste sistema, avaliacoes praticas de diferentes oficinas ficavam dispersas em controles separados, planilhas, formularios distintos ou registros manuais, o que dificultava:

- padronizacao dos lancamentos;
- consolidacao rapida de notas;
- aplicacao uniforme de pesos e medias;
- rastreabilidade da evolucao individual dos militares;
- visao central da coordenacao;
- emissao agil de mapas de notas;
- seguranca e controle de acesso aos dados.

O portal resolve todos esses problemas com lancamento digital padronizado por oficina, persistencia centralizada, controle de acesso por perfil, motor de consolidacao, exportacao agil e visualizacao gerencial completa (Mapa de Notas).

---

## 4. Objetivo do produto

Manter e evoluir o portal centralizado de avaliacoes de Salvamento Terrestre, no qual:

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

## 6. Fora de escopo

Nao fazem parte do escopo atual:


- criação de aplicativo mobile nativo;
- integração com sistemas externos corporativos não essenciais;
- analytics avançado ou BI completo;
- automações complexas de mensageria;
- módulo acadêmico amplo fora do contexto de avaliação prática;
- suporte offline completo;
- gamificação ou funcionalidades sociais.

Tambem nao e objetivo transformar o portal em um ERP institucional amplo. O foco e a gestao de avaliacoes praticas e teoricas de Salvamento Terrestre.

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

## 9. Modulos em producao

O portal opera com os seguintes modulos de avaliacao:

- **Arvores (Operacoes com Arvore / Corte com Motosserra)** — modulo `motosserra` — operacional
- **Escadas** — modulo `escadas` — operacional, com AdvancedReports
- **Pocos** — modulo `pocos` — operacional
- **Circuito** — modulo `circuito` — operacional
- **Prova Teorica (VC3)** — modulo `teorica` — operacional (lancamento direto de nota 0-10)

O modulo de motosserra foi o nucleo funcional inicial e serviu de referencia arquitetural para os demais em:

- checklists tecnicos;
- lancamento de penalidades;
- calculo automatico de nota;
- relatorios e exportacoes;
- persistencia estruturada com `module_id`.

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

## 12. Contexto tecnico

O produto e um sistema em producao com arquitetura modular consolidada:

- frontend em React 18 + Vite;
- persistencia em Supabase (PostgreSQL) com RLS ativa;
- autenticacao por perfil via Supabase Auth (avaliador, coordenacao, aluno, admin);
- 5 modulos de avaliacao com fluxo completo;
- logica de checklist, calculo de nota e relatorios por modulo;
- camada de servico centralizada;
- fluxo operacional validado em cenario real.

A evolucao do produto deve considerar:

- preservacao do que ja funciona e esta estabilizado;
- evolucao incremental orientada pelo roadmap (Fase 4: consolidacao);
- manutencao da consistencia entre modulos e camadas.

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

O produto e um portal institucional de avaliacoes de Salvamento Terrestre em producao, com login unificado, perfis distintos de acesso, lancamento tecnico por oficina em 5 modulos operacionais, e visao consolidada para coordenacao.

O proximo objetivo estrategico e integrar visualmente a consolidacao automatica de medias e pesos (VC1/VC2/VC3/Media Final), calculo de aptidao final e relatorios individuais avancados — utilizando os servicos ja implementados para evoluir o portal de lancamento e consulta para base central de gestao academica do curso.