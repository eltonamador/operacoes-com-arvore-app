# 2026-04-12-modelagem-avaliacoes-multi-oficina.md

## Título
Modelagem de persistência para avaliações multi-oficina: tabela única com identificador de módulo

## Data
2026-04-12

## Status
Implementada — `module_id` em producao, 5 modulos operacionais

## Contexto

O projeto atualmente possui dois módulos funcionais de avaliação:
- **Motosserra** (Sprint 1 concluído)
- **Escadas** (já funcional)

Ambos salvam avaliações na mesma tabela `avaliacoes` do Supabase, **sem nenhum campo que identifique a qual oficina pertence cada avaliação**. Isso ocorre porque:

1. O `avaliacoesService.js` centraliza todo acesso ao Supabase e não distingue módulos
2. Ambos `MotosserraApp.jsx` e `EscadasApp.jsx` chamam `fetchAvaliacoes()` e recebem tudo misturado
3. A tabela não possui coluna de identificação de oficina/módulo

Embora o sistema atual funcione para operação isolada de cada módulo, essa limitação criará problemas quando:
- forem adicionadas mais oficinas (poços, circuito, árvores — conforme spec.md Fase 3);
- for implementada a consolidação automática de notas (spec.md Fase 4);
- for necessário gerar relatórios consolidados por coordenação (spec.md, Fase 4);
- for necessário calcular médias, pesos e aptidão final por aluno considerando múltiplas oficinas.

---

## Decisão

**Será adotada modelagem de tabela única com campo `module_id` / `oficina` para persistência de avaliações.**

Isso significa:

1. A tabela `avaliacoes` receberá uma nova coluna:
   ```sql
   ALTER TABLE avaliacoes ADD COLUMN module_id VARCHAR(50) NOT NULL DEFAULT 'motosserra';
   ```

2. O campo `module_id` conterá identificadores como:
   - `'motosserra'` (existente)
   - `'escadas'` (existente)
   - `'pocos'`, `'circuito'`, `'arvores'` (futuro)

3. O serviço `avaliacoesService.js` passará a aceitar e persistir `module_id` em todas as operações:
   ```javascript
   export async function saveAvaliacao(dadosAvaliacao, module_id = 'motosserra')
   ```

4. Ambos `MotosserraApp.jsx` e `EscadasApp.jsx` passarão o `module_id` apropriado ao salvar.

5. As queries de carregamento serão filtradas por módulo:
   ```javascript
   export async function fetchAvaliacoesByModulo(module_id)
   export async function fetchAvaliacoesByDataAndModulo(data, module_id)
   ```

---

## Justificativa

### Por que não usar tabelas separadas por oficina?

Rejeitada porque:
- criaria duplicação de schema (`avaliacoes_motosserra`, `avaliacoes_escadas`, etc.);
- fragmentaria a base de dados e tornaria consolidação futura extremamente complexa;
- violaria o princípio de "base única de dados de avaliações" definido em spec.md;
- aumentaria custo de manutenção e padronização de regras;
- impossibilitaria queries consolidadas eficientes (ex.: "qual é o desempenho de João em todas as oficinas?").

### Por que não usar uma estrutura genérica com tabela de mapeamento?

Rejeitada porque:
- seria overcomplicated para o estágio atual do projeto;
- adicionaria complexidade desnecessária no serviço;
- não justificava o overhead para apenas 4-5 oficinas.

### Por que tabela única com `module_id` é a melhor escolha?

1. **Alinha-se ao spec.md**: a especificação técnica já menciona "base única de dados de avaliações"
2. **Mudança estrutural mínima**: apenas uma coluna, sem reorganização de schema
3. **Compatível com dados existentes**: default 'motosserra' preserva avaliações atuais
4. **Prepara para consolidação**: filtros simples em SQL, sem joins complexos
5. **Escala naturalmente**: adicionar nova oficina é trivial (valores novos de `module_id`)
6. **Mantém integridade**: uma tabela = regras de validação centralizadas
7. **Futuro-proof**: a Fase 4 da spec.md (consolidação acadêmico-operacional) depende disso

---

## Consequências

### Consequências positivas

- ✅ Filtro claro e eficiente de avaliações por oficina
- ✅ Preparação para consolidação automática de notas (spec.md Fase 4)
- ✅ Relatórios consolidados por coordenação agora viáveis
- ✅ Cálculo de aptidão final por aluno viável (considerando múltiplas oficinas)
- ✅ Base de dados permanece coesa e gerenciável
- ✅ Baixo risco de mudança (apenas uma coluna)

### Consequências técnicas e custos

- ⚠️ **Migration necessária**: adicionar coluna com default (operação leve)
- ⚠️ **Atualização de serviço**: `avaliacoesService.js` cresce levemente (3-4 funções novas)
- ⚠️ **Atualização de ambos os módulos**: `MotosserraApp.jsx` e `EscadasApp.jsx` devem passar `module_id`
- ⚠️ **Atualização de utilitários**: qualquer função que acessa diretamente `avaliacoes` precisa passar `module_id`
- ⚠️ **Testes**: validar que filtro por oficina funciona corretamente em relatórios

---

## Estratégia de implementação

### Fase 1: Preparação (sem dados em produção)
1. Executar migration: `ALTER TABLE avaliacoes ADD COLUMN module_id VARCHAR(50) NOT NULL DEFAULT 'motosserra'`
2. Atualizar `avaliacoesService.js` com novas funções de filtro
3. Atualizar `MotosserraApp.jsx` e `EscadasApp.jsx` para passar `module_id = 'motosserra'` e `'escadas'` respectivamente
4. Testar que relatórios filtram corretamente

### Fase 2: Expansão para novas oficinas
1. Adicionar novas rotas no Router.jsx (`/avaliador/pocos`, `/avaliador/circuito`, etc.)
2. Criar módulos `src/modules/pocos/`, `src/modules/circuito/`, etc.
3. Cada módulo novo passa seu próprio `module_id` ao salvar

### Fase 3: Consolidação (Fase 4 da spec.md)
1. Implementar queries que consolidam por aluno e oficina
2. Calcular médias, pesos e aptidão final usando `module_id` como dimensão

---

## Alternativas consideradas

### 1. Continuar sem identificação de oficina
**Rejeitada** porque:
- Impossibilita consolidação futura
- Viola spec.md
- Tornará o sistema inviável com 4+ oficinas

### 2. Usar tabelas separadas por oficina
**Rejeitada** porque:
- Fragmenta dados
- Impossibilita consolidação eficiente
- Aumenta manutenção
- Viola princípio de "base única"

### 3. Usar identificador composto (aluno_id + data + oficina)
**Rejeitada** porque:
- Mais complexo que simples `module_id`
- Não resolve o problema de agregação entre oficinas

---

## Impacto em outras áreas

### `avaliacoesService.js`
- Funções existentes (`fetchAvaliacoes`, `saveAvaliacao`, `deleteAvaliacao`) precisam suportar `module_id`
- Novas funções: `fetchAvaliacoesByModulo(module_id)`, `fetchAvaliacoesByDataAndModulo(data, module_id)`

### `MotosserraApp.jsx` e `EscadasApp.jsx`
- Ao chamar `saveAvaliacao(dados)`, passarão `saveAvaliacao(dados, 'motosserra')` e `saveAvaliacao(dados, 'escadas')`
- Ao carregar relatórios, usarão `fetchAvaliacoesByModulo()` em vez de `fetchAvaliacoes()`

### Utilitários (`vistoProvaReport.js`, relatórios avançados)
- Qualquer função que acessa relatórios precisará filtrar por `module_id`

### RLS (Row-Level Security) do Supabase
- Políticas existentes devem ser revisadas para garantir que não dependem de schema antigo
- Adicionar políticas adicionais se houver controle de acesso por oficina no futuro

---

## Próximos passos

1. ✅ **Análise completa** (este documento)
2. ⏭️ **Executar migration** (ALTER TABLE com default)
3. ⏭️ **Atualizar `avaliacoesService.js`** (adicionar funções de filtro)
4. ⏭️ **Atualizar módulos** (motosserra e escadas passarem `module_id`)
5. ⏭️ **Testar integralmente** (relatórios, filtros, consolidação)
6. ⏭️ **Validar impacto em RLS** (políticas do Supabase)
7. ⏭️ **Registrar em `docs/wake-up.md`** (mudanças realizadas)

---

## Referências

- `docs/spec.md` — Fase 3 (Modularização por oficina)
- `docs/spec.md` — Fase 4 (Consolidação acadêmico-operacional)
- `docs/current-state.md` — Seção 8 (Modelo de dados atual)
- `src/services/avaliacoesService.js` — implementação atual
- `src/modules/motosserra/MotosserraApp.jsx` — exemplo de uso
- `src/modules/escadas/EscadasApp.jsx` — exemplo de uso

---

## Resumo executivo

Motosserra e escadas compartilham a mesma tabela de avaliações sem identificação de oficina. Para preparar o sistema para consolidação futura (spec.md Fases 3 e 4), será adotada modelagem de **tabela única com campo `module_id`**. Mudança estrutural mínima, baixo risco, totalmente alinhada à visão técnica do projeto.
