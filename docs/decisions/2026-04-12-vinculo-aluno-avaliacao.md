# Decisão: Vínculo entre Aluno Autenticado e Avaliações

**Data:** 2026-04-12
**Status:** Aprovada — migration pendente de execução
**Fase:** Fase 2 / Transição para Fase 4 (Consolidação)

---

## Contexto

`AlunoArea` precisa exibir apenas as avaliações do aluno que está autenticado.
O sistema precisa saber "quais linhas de `avaliacoes` pertencem a este usuário".

O fluxo atual funciona assim:
- O avaliador cria a avaliação selecionando o aluno de uma lista (`students.json`)
- O nome do aluno é salvo como texto livre em `avaliacoes.nome_aluno`
- O aluno, ao fazer login, tem um perfil em `profiles` com campo `nome`
- Não existe nenhuma FK entre `profiles` e `avaliacoes`

---

## Problema

Usar `profile.nome = avaliacoes.nome_aluno` como critério de busca é frágil por quatro razões:

1. **Sem integridade referencial:** nenhuma constraint no banco garante que os valores coincidam.
2. **Sensível a variações de texto:** `"JOÃO DA SILVA"` ≠ `"João da Silva"` — a query retorna zero avaliações sem emitir erro.
3. **Homônimos:** dois alunos com nomes similares podem receber as avaliações um do outro.
4. **Sem propagação:** se o nome é corrigido em um lado, o outro lado não atualiza.

---

## Alternativas consideradas

### Alternativa A — match por texto normalizado (`profile.nome` ↔ `nome_aluno`)
Normalizar ambos os lados (lowercase, trim, sem acentos) e comparar.

- Zero mudança no banco
- Ainda frágil: variações legítimas de nome continuam quebrando silenciosamente
- Não resolve homônimos
- **Descartada:** cria bugs silenciosos de difícil diagnóstico em produção

### Alternativa B — `numero_ordem` como chave de match
Adicionar `numero_ordem VARCHAR(20)` em `profiles`. Filtrar avaliações por `avaliacoes.numero_ordem = profiles.numero_ordem`.

- Migration mínima (uma coluna nullable em `profiles`)
- `numero_ordem` é único por turma
- Já existe em `avaliacoes` (preenchido pelo avaliador via `students.json`)
- Sem mudança no fluxo do avaliador
- Admin define `numero_ordem` ao criar conta de aluno
- **Adotada como solução intermediária**

### Alternativa C — `aluno_user_id UUID` FK em `avaliacoes`
Adicionar `aluno_user_id UUID REFERENCES auth.users(id)` em `avaliacoes`. O avaliador, ao salvar, inclui o UUID do aluno avaliado.

- Integridade referencial real
- RLS pode filtrar diretamente por `auth.uid() = aluno_user_id`
- Exige mudança no fluxo do avaliador (lookup `nome → UUID` antes de salvar)
- Exige mudança na tela `StudentForm` e em `saveAvaliacao`
- Complexidade alta para o estágio atual
- **É a solução correta de longo prazo — reservada para Fase 4**

---

## Decisão

Adotar **Alternativa B** como solução intermediária:

> Adicionar `numero_ordem VARCHAR(20)` em `profiles`.
> `AlunoArea` filtra `avaliacoes WHERE numero_ordem = profile.numero_ordem`.

### Justificativas

- Dentro do CFSD-26, `numero_ordem` é único e estável — não está sujeito a variações ortográficas.
- O campo já existe em `avaliacoes` e é preenchido com o mesmo valor do `students.json` que o avaliador usa.
- A migration é de uma linha, não toca dados existentes, não quebra nada.
- O admin já controla a criação de contas de alunos — incluir `numero_ordem` no processo é trivial.

### Limitação explícita

Esta solução depende de correspondência textual entre `avaliacoes.numero_ordem` e `profiles.numero_ordem`. Se os formatos divergirem (`"001"` vs `"1"`), a query falhará silenciosamente. O admin deve garantir consistência de formato ao criar contas.

---

## Solução de longo prazo

**Alternativa C — `aluno_user_id UUID` FK em `avaliacoes`** é a solução arquitetural correta.

Quando implementar:
- Adicionar `aluno_user_id UUID REFERENCES auth.users(id) NULL` em `avaliacoes`
- Modificar `StudentForm` e `saveAvaliacao` para incluir lookup `nome_aluno → profiles.id`
- Atualizar policy RLS de `aluno` para usar `auth.uid() = aluno_user_id` diretamente
- Migrar dados históricos: popular `aluno_user_id` nas linhas existentes via script

Esta mudança deve ser feita quando houver múltiplos cursos ou quando a escala tornar o match por `numero_ordem` insuficiente.

---

## Migration

```sql
-- Adiciona numero_ordem ao perfil do aluno.
-- Nullable: contas existentes não são afetadas.
-- Apenas contas com role='aluno' precisam preencher este campo.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS numero_ordem VARCHAR(20);
```

---

## Consequências

- `AuthContext` deve expor `profile.numero_ordem` — sem mudança estrutural, já expõe `profile` inteiro
- `avaliacoesService` receberá nova função `fetchAvaliacoesByNumeroOrdem(numero_ordem)`
- Policy RLS de `aluno` em `avaliacoes` pode ser ajustada para filtrar por `numero_ordem` se necessário
- `AlunoArea` depende desta coluna estar preenchida nas contas de aluno

---

## Próximos passos

1. Executar a migration no Supabase SQL Editor
2. Preencher `numero_ordem` nas contas de aluno existentes
3. Implementar `AlunoArea` + função de serviço
