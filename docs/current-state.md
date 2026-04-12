# current-state.md

## 1. Identificação do sistema

**Nome de referência:** CBMAP CFSD-26 / Avaliação Motosserra  
**Tipo de sistema:** Aplicação web SPA (Single Page Application) frontend-only, com persistência em Supabase.  
**Finalidade atual:** Registrar, calcular, consolidar e exportar avaliações práticas de operações com motosserra no contexto do Curso de Formação de Soldados do CBMAP. :contentReference[oaicite:0]{index=0}

---

## 2. Objetivo operacional atual

O sistema foi construído para digitalizar o processo de avaliação prática dos alunos, permitindo que o avaliador:

- selecione aluno, data e avaliador;
- aplique penalidades previstas em checklist;
- visualize a nota em tempo real;
- registre observações e erros críticos;
- colha a ciência do avaliado por PIN;
- salve a avaliação em banco;
- consulte relatórios, ranking e exportações. :contentReference[oaicite:1]{index=1}

Na prática, o sistema substitui ou reduz controles manuais, aumenta a rastreabilidade das avaliações e facilita a consolidação dos resultados. :contentReference[oaicite:2]{index=2}

---

## 3. Perfil de uso atual

### Usuário principal
- Instrutores / avaliadores

### Usuários secundários
- Coordenação do curso
- Cadeia de comando interessada em relatórios e consolidação de resultados

O sistema foi desenhado para uso operacional direto, com fluxo simples, objetivo e orientado à execução em contexto institucional. :contentReference[oaicite:3]{index=3}

---

## 4. Escopo funcional atual

O sistema atualmente cobre o seguinte fluxo principal:

1. **Seleção inicial**
   - aluno
   - pelotão
   - data
   - avaliador

2. **Avaliação**
   - marcação de penalidades previstas
   - cálculo automático da nota
   - registro de erro não previsto
   - registro de erro crítico
   - observações livres

3. **Ciência do avaliado**
   - confirmação por checkbox
   - validação por PIN de 4 dígitos
   - bloqueio temporário após excesso de tentativas

4. **Resumo e persistência**
   - exibição do resultado final
   - impressão
   - salvamento no Supabase

5. **Relatórios**
   - listagem geral de avaliações
   - filtros por data
   - estatísticas
   - ranking
   - exportação CSV/XLSX
   - geração de relatórios e folhas de visto para impressão. :contentReference[oaicite:4]{index=4}

---

## 5. Arquitetura atual

### Visão geral
O sistema adota uma arquitetura simples e direta:

- **Frontend:** React 18 com Vite
- **Persistência:** Supabase
- **Banco:** PostgreSQL via Supabase
- **Estilo:** CSS vanilla
- **Exportação:** biblioteca `xlsx`

Não existe backend próprio, API própria ou camada server-side dedicada. Toda a lógica de aplicação relevante roda no frontend, e a persistência ocorre diretamente via SDK do Supabase. :contentReference[oaicite:5]{index=5}

### Padrão percebido
A estrutura atual é de um monólito frontend organizado por telas, com estado centralizado no componente raiz.  
Não há divisão formal em camadas como services, repositories, controllers ou estado global dedicado. :contentReference[oaicite:6]{index=6}

---

## 6. Estrutura principal do projeto

### Arquivos e diretórios centrais

- `src/App.jsx`
  - concentra estado global da avaliação em curso
  - controla navegação entre telas
  - executa operações principais no Supabase

- `src/screens/`
  - contém as telas do fluxo:
    - formulário inicial
    - avaliação
    - assinatura
    - resumo
    - relatórios
    - relatórios avançados

- `src/data/`
  - concentra dados estáticos:
    - alunos
    - instrutores
    - penalidades

- `src/lib/supabase.js`
  - inicializa e exporta o client Supabase

- `src/utils/`
  - reúne utilitários de impressão, exportação e geração de relatórios auxiliares

- `src/styles/global.css`
  - concentra praticamente toda a camada visual do sistema. :contentReference[oaicite:7]{index=7}

---

## 7. Regras de negócio atualmente identificadas

As principais regras de negócio observadas são:

- a avaliação é composta por penalidades distribuídas em seções;
- cada penalidade gera desconto;
- a nota final é recalculada em tempo real;
- há possibilidade de registrar erro não previsto com desconto livre;
- erros críticos influenciam o resultado;
- a ciência do aluno exige confirmação e PIN válido;
- a avaliação só segue adiante quando os requisitos mínimos da etapa são cumpridos. :contentReference[oaicite:8]{index=8}

A lógica de penalidades e cálculo está principalmente em `penalties.js`, com parte do comportamento complementado pelas telas de avaliação e assinatura. :contentReference[oaicite:9]{index=9}

---

## 8. Modelo de dados atual

### Dados locais
Os seguintes dados estão atualmente mantidos localmente no projeto:

- alunos
- instrutores
- PIN dos alunos
- estrutura das penalidades

Esses dados são carregados a partir de arquivos estáticos (`JSON` e `JS`) incluídos no frontend. :contentReference[oaicite:10]{index=10}

### Dados persistidos
As avaliações concluídas são persistidas no Supabase, incluindo:

- identificação do aluno
- número de ordem
- pelotão
- avaliador
- data
- nota final
- penalidades
- observações
- estrutura detalhada dos itens avaliados em JSONB. :contentReference[oaicite:11]{index=11}

---

## 9. Stack tecnológica atual

- **Linguagem:** JavaScript (ES Modules)
- **UI:** React 18
- **Build/dev:** Vite
- **Persistência / backend-as-a-service:** Supabase
- **Banco:** PostgreSQL via Supabase
- **Exportação de planilhas:** `xlsx`
- **Estilização:** CSS vanilla
- **Testes:** não identificados
- **Lint/formatter:** não identificados
- **Autenticação de usuários:** não identificada no sistema
- **PWA:** indícios parciais de preparação, sem service worker identificado. :contentReference[oaicite:12]{index=12}

---

## 10. Estado de maturidade atual

O sistema aparenta estar em estágio **intermediário**, com fluxo principal funcional e uso orientado a uma necessidade real já bem definida.

### Indícios de maturidade
- jornada do usuário completa;
- persistência em banco funcionando;
- relatórios e exportações já implementados;
- interface organizada;
- lógica de avaliação operacionalizada. :contentReference[oaicite:13]{index=13}

### Indícios de crescimento rápido / dívida técnica
- centralização excessiva em `App.jsx`;
- ausência de testes;
- ausência de camada de serviço;
- dados críticos mantidos em arquivos locais;
- documentação ainda insuficiente;
- algumas rotinas utilitárias não integradas diretamente à UI. :contentReference[oaicite:14]{index=14}

---

## 11. Pontos fortes atuais

- fluxo operacional claro e coeso;
- nota calculada em tempo real;
- validação de ciência com PIN;
- integração funcional com Supabase;
- múltiplas saídas de dados e impressão;
- estrutura de pastas compreensível;
- stack enxuta e de fácil manutenção inicial. :contentReference[oaicite:15]{index=15}

---

## 12. Fragilidades e limitações atuais

### Arquitetura
- `App.jsx` concentra responsabilidades demais: estado, navegação e persistência;
- falta separação mais clara entre lógica de negócio, acesso a dados e interface;
- utilitários acessam Supabase fora de uma camada central. :contentReference[oaicite:16]{index=16}

### Segurança e integridade
- PINs dos alunos estão em arquivo local distribuído no frontend;
- dependência de políticas corretas de RLS no Supabase, não verificadas neste levantamento;
- inexistência aparente de autenticação formal por usuário. :contentReference[oaicite:17]{index=17}

### Qualidade de engenharia
- ausência de testes automatizados;
- ausência aparente de lint/formatter;
- CSS extenso e centralizado;
- falta de documentação de setup, schema e políticas do banco. :contentReference[oaicite:18]{index=18}

### Operação e manutenção
- atualização de alunos e instrutores depende de alteração manual de arquivos e novo deploy;
- mudanças futuras podem aumentar rapidamente o acoplamento se a estrutura atual for mantida sem ajustes. :contentReference[oaicite:19]{index=19}

---

## 13. Direção de evolução do produto

Embora o sistema atualmente esteja focado na avaliação prática de motosserra, a direção pretendida do projeto é sua evolução para uma plataforma centralizada de avaliações de Salvamento Terrestre.

A visão futura do produto é a criação de um **portal com login unificado**, no qual:

- avaliadores acessem checklists técnicos, cronômetros e instrumentos de lançamento de notas para diferentes oficinas;
- alunos acessem apenas seus relatórios individuais de desempenho e notas;
- o sistema consolide automaticamente médias, pesos e resultados entre disciplinas;
- o status final de aptidão seja calculado de forma instantânea;
- cada lançamento de nota alimente automaticamente o banco de dados da coordenação;
- mapas de notas detalhados e relatórios individuais de evolução possam ser emitidos de forma integrada.

As oficinas inicialmente visadas para essa evolução incluem:

- Escadas
- Poços
- Circuito
- Árvores

Essa direção futura transforma o sistema atual de motosserra em um **módulo inicial** de uma plataforma mais ampla de gestão e consolidação de avaliações práticas de Salvamento Terrestre.

Essa visão futura **não altera o retrato técnico atual do sistema**, mas deve orientar:
- o PRD do produto;
- a futura SPEC de transição arquitetural;
- as próximas decisões de modelagem de dados, autenticação, permissões e modularização.

---

## 14. Implicações arquiteturais da visão futura

A evolução pretendida sugere, no futuro, a necessidade de introduzir capacidades que hoje não estão presentes ou não estão formalizadas, tais como:

- autenticação e autorização por perfil;
- separação entre perfis de avaliador, aluno e coordenação;
- estrutura modular por oficina/disciplina;
- consolidação automática de notas entre módulos;
- cálculo de médias, pesos e aptidão final;
- painel central da coordenação com visão global de desempenho;
- modelo de dados menos dependente de arquivos estáticos locais;
- maior controle de integridade, rastreabilidade e segurança dos acessos.

Esses pontos ainda não descrevem o sistema atual, mas representam o eixo de evolução mais provável e devem ser considerados desde já na documentação estratégica do projeto.

---

## 15. Resumo executivo

O sistema atual é uma aplicação React com Supabase voltada à avaliação prática de motosserra no CFSD-26, já com fluxo funcional de ponta a ponta: entrada de dados, cálculo de nota, confirmação do avaliado, persistência e relatórios. Ele resolve bem o problema operacional imediato e foi construído com stack simples e objetiva. :contentReference[oaicite:20]{index=20}

Ao mesmo tempo, a arquitetura ainda é enxuta e centralizada, adequada ao tamanho atual, mas com sinais claros de que precisará de maior disciplina estrutural para crescer com segurança. Os principais pontos de atenção são centralização em `App.jsx`, ausência de testes, dados sensíveis em arquivos locais e dependência de manutenção manual dos dados-base. :contentReference[oaicite:21]{index=21}

Estratégicamente, o sistema deve ser entendido não apenas como uma aplicação isolada de avaliação de motosserra, mas como o **primeiro núcleo funcional** de uma futura plataforma centralizada de avaliações de Salvamento Terrestre, com login unificado, múltiplas oficinas, cálculo consolidado de desempenho e integração direta com a coordenação.

Este documento deve ser tratado como a **fonte de verdade do estado atual do sistema**, servindo de base para PRD, SPEC, `CLAUDE.md` e futuras sessões de desenvolvimento assistido por IA.