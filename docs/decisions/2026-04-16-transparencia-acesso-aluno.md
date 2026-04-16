# Decisão de Design: Transparência Total de Notas (AlunoArea)

**Data:** 2026-04-16
**Status:** Implementada / Decidida

## Contexto

O Portal de Avaliações de Salvamento Terrestre — CFSD-26 possui uma área dedicada ao aluno (`AlunoArea`). Surgiu a questão sobre se o acesso dos alunos deveria ser restrito apenas ao seu próprio desempenho individual ou se deveriam ter acesso à visão consolidada da turma (Mapa de Notas).

## Decisão

Foi decidido que **NÃO haverá privacidade individual de notas** entre os alunos no portal. O sistema deve manter o modelo de transparência total, onde qualquer aluno autenticado na `AlunoArea` pode visualizar:

1.  A lista completa de avaliações de todos os colegas (incluindo notas, avaliadores e datas).
2.  O Mapa de Notas consolidado (VC1, VC2, VC3 e Média Final) de toda a turma.
3.  Gráficos de desempenho coletivo e por pelotão.

## Justificativa

- **Contexto Institucional**: Em cursos de formação militar (CFSD), o desempenho é frequentemente público entre os pares para fins de ranking e acompanhamento de pelotão.
- **Engajamento**: A visualização do Mapa de Notas permite que o aluno acompanhe sua posição relativa e o progresso global da oficina.
- **Simplicidade Técnica**: Evita a necessidade de aplicar filtros complexos de RLS (Row Level Security) ou manipulação de estado baseada em `numero_ordem` para restringir a visualização na `AlunoArea`.

## Consequências

- A `AlunoArea` e a `CoordenacaoArea` permanecem funcionalmente muito similares em termos de visualização de dados.
- Não é necessário implementar a pendência de "Filtro Individual Aluno".
- A segurança do sistema foca em **Quem pode lançar/alterar** (autorização) e não em restringir a visualização entre os avaliados (alunos).
