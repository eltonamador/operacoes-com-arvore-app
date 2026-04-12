# 2026-04-11-evolucao-para-portal-unificado.md

## Título
Evolução do sistema atual para portal unificado de avaliações de Salvamento Terrestre

## Data
2026-04-11

## Status
Aceita

## Contexto

O projeto possui atualmente um sistema funcional de avaliação prática de motosserra, construído em React com Supabase, já capaz de registrar avaliações, calcular notas, colher ciência do avaliado, persistir dados e gerar relatórios.

Embora funcional, esse sistema foi concebido para uma necessidade específica e possui limitações estruturais para crescimento amplo, especialmente porque:

- concentra responsabilidades em uma arquitetura frontend centralizada;
- não possui autenticação formal por perfil;
- ainda depende de dados locais em parte do fluxo;
- não foi desenhado originalmente como plataforma multi-oficina.

Ao mesmo tempo, a necessidade institucional evoluiu. O objetivo do projeto passou a ser a centralização das avaliações de Salvamento Terrestre em um único portal, com múltiplos perfis de acesso, múltiplas oficinas e consolidação automática de resultados.

---

## Decisão

Fica estabelecido que o sistema atual de avaliação de motosserra **não será tratado como produto final isolado**, mas como **núcleo funcional inicial** de um futuro portal centralizado de avaliações de Salvamento Terrestre.

A direção oficial do projeto passa a ser a construção progressiva de um portal com:

- login unificado;
- perfis distintos de acesso;
- módulos por oficina;
- cálculo automatizado de notas, médias e pesos;
- status final de aptidão;
- relatórios individuais para alunos;
- mapas de notas e relatórios consolidados para coordenação.

As oficinas inicialmente consideradas para essa evolução incluem:

- Escadas
- Poços
- Circuito
- Árvores

---

## Justificativa

Essa decisão foi tomada porque:

1. o sistema atual já possui valor operacional real e não deve ser descartado;
2. a necessidade institucional ultrapassa uma única oficina ou disciplina;
3. manter soluções separadas tende a aumentar retrabalho e consolidação manual;
4. uma base centralizada melhora rastreabilidade, padronização e gestão;
5. a evolução incremental reduz risco em comparação com uma reescrita total imediata.

---

## Consequências

### Consequências positivas esperadas
- reaproveitamento do conhecimento já embutido no sistema atual;
- redução de desperdício de trabalho já realizado;
- clareza estratégica para decisões futuras;
- base para autenticação, perfis e consolidação centralizada;
- capacidade de expansão para novas oficinas com mais coerência.

### Consequências e custos técnicos
- será necessário modularizar a estrutura atual antes de expandir demais;
- `App.jsx` não poderá continuar sendo o centro de crescimento do sistema;
- será necessário formalizar autenticação e autorização;
- dados hoje mantidos localmente deverão migrar progressivamente para estrutura mais robusta;
- relatórios e regras de cálculo precisarão de padronização e rastreabilidade maiores.

---

## Diretrizes derivadas desta decisão

A partir desta decisão:

- novas mudanças devem considerar se pertencem ao sistema atual ou ao portal-alvo;
- a expansão para novas oficinas não deve ocorrer por simples duplicação desorganizada;
- a modularização da base passa a ser prioridade antes da ampliação ampla de escopo;
- decisões sobre autenticação, perfis, modelo de dados e cálculo consolidado devem ser tratadas como decisões arquiteturais formais;
- a documentação do projeto deve sempre refletir a diferença entre:
  - estado atual do sistema;
  - visão futura do produto;
  - plano técnico de transição.

---

## Alternativas consideradas

### 1. Manter o sistema apenas como app de motosserra
Rejeitada, porque não atende à necessidade maior de centralização das avaliações de Salvamento Terrestre.

### 2. Reescrever tudo do zero imediatamente
Rejeitada, porque aumenta risco, retrabalho e perda de conhecimento operacional já validado.

### 3. Expandir o sistema atual sem reorganização estrutural
Rejeitada, porque tende a aumentar acoplamento, fragilidade e dificuldade de manutenção.

---

## Próximos passos decorrentes

1. manter `current-state.md` como retrato fiel do sistema atual;
2. usar `prd.md` como definição do produto-alvo;
3. usar `spec.md` como plano de transição técnica;
4. priorizar reorganização estrutural mínima antes da expansão ampla;
5. registrar próximas decisões importantes em `docs/decisions/`.

---

## Resumo executivo

O sistema atual de motosserra foi oficialmente enquadrado como o primeiro núcleo funcional de uma futura plataforma centralizada de avaliações de Salvamento Terrestre.

A evolução do projeto será incremental, com reaproveitamento do que já funciona, mas orientada desde já para um portal unificado com múltiplas oficinas, múltiplos perfis e consolidação automática de resultados.