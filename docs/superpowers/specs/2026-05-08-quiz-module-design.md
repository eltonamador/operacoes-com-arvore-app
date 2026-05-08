# Quiz Module Design — Portal de Avaliações CBMAP CFSD-26

**Data:** 2026-05-08
**Status:** Aprovado
**Abordagem:** Módulo React integrado ao SPA (Abordagem A)

---

## 1. Objetivo

Criar um módulo de quiz gamificado (estilo Kahoot) para treino e estudo dos alunos do CFSD-26. O quiz usa exclusivamente as 78 questões do banco de questões oficial (extraído do docx), com experiência interativa, visual e compatível com celular.

O quiz é independente do módulo `teorica` existente. O módulo `teorica` continua sendo usado pelo avaliador para lançar nota manualmente (VC3). O quiz é ferramenta de estudo/treino.

---

## 2. Decisões de design

| Decisão | Escolha |
|---------|---------|
| Relação com módulo teórica | Separado — quiz é treino, teórica é avaliação formal |
| Acesso | Aluno logado via Supabase Auth + PIN para identificação |
| Persistência | Tabela dedicada `quiz_attempts` no Supabase |
| Coordenação | Painel de acompanhamento com ranking, desempenho por aluno e análise por questão |
| Visual | Híbrido — telas de config/resultados seguem o portal; tela de pergunta tem visual gamificado |
| Arquitetura | Módulo React dentro do SPA, mesma estrutura dos módulos existentes |

---

## 3. Estrutura de arquivos

```
src/modules/quiz/
  QuizApp.jsx                    -- orquestrador de telas
  data/
    questions.json               -- 78 questões extraídas do docx
  screens/
    PinEntry.jsx                 -- tela inicial: PIN + boas-vindas
    QuizConfig.jsx               -- configuração do quiz
    QuizGame.jsx                 -- tela gamificada da pergunta
    QuizResults.jsx              -- tela final com resultados
    Ranking.jsx                  -- ranking de tentativas
  hooks/
    useQuizEngine.js             -- estado do quiz: questão atual, pontuação, tempo, respostas
  services/
    quizService.js               -- CRUD quiz_attempts no Supabase
  styles/
    quiz-game.css                -- CSS gamificado isolado (apenas para QuizGame)
```

Componente adicional para coordenação:
```
src/modules/quiz/screens/QuizDashboard.jsx  -- painel da coordenação
```

---

## 4. Rotas

```jsx
// Aluno
<Route path="/aluno/quiz" element={
  <ProtectedRoute roles={['aluno']}>
    <QuizApp />
  </ProtectedRoute>
} />

// Coordenação
<Route path="/coordenacao/quiz" element={
  <ProtectedRoute roles={['coordenacao']}>
    <QuizDashboard />
  </ProtectedRoute>
} />
```

Integração:
- Novo card "Quiz Teórico" em `AlunoArea`
- Novo card "Quiz Teórico" em `CoordenacaoArea`
- Admin tem acesso irrestrito a ambas rotas

---

## 5. Modelo de dados

### Tabela `quiz_attempts`

```sql
CREATE TABLE quiz_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),

  -- identificação do aluno
  nome_aluno VARCHAR(200) NOT NULL,
  numero_ordem INTEGER NOT NULL,
  pelotao VARCHAR(20) NOT NULL,
  user_id UUID REFERENCES auth.users(id),

  -- configuração usada
  nivel VARCHAR(20) NOT NULL,          -- 'basico', 'intermediario', 'avancado', 'misturado'
  total_questoes INTEGER NOT NULL,
  tempo_por_questao INTEGER NOT NULL,  -- segundos (30, 45, 60)

  -- resultados
  acertos INTEGER NOT NULL,
  erros INTEGER NOT NULL,
  pontuacao INTEGER NOT NULL,
  percentual NUMERIC(5,2) NOT NULL,
  tempo_total INTEGER NOT NULL,        -- segundos totais gastos

  -- detalhamento
  respostas JSONB NOT NULL             -- array de objetos (ver estrutura abaixo)
);
```

### Estrutura do JSONB `respostas`

```json
[
  {
    "questao_id": 1,
    "nivel": "basico",
    "resposta_marcada": "A",
    "resposta_correta": "C",
    "acertou": false,
    "tempo_gasto": 18
  }
]
```

### Notas
- `user_id` vincula ao Supabase Auth para RLS futura
- Sem `module_id` — tabela dedicada, separada de `avaliacoes`
- `respostas` JSONB permite mostrar erros na tela final e alimentar relatórios da coordenação

---

## 6. Estrutura do `questions.json`

```json
{
  "id": 1,
  "nivel": "basico",
  "enunciado": "Conforme a Norma Operacional 003/2023-CBMAP...",
  "alternativas": [
    {"letra": "A", "texto": "Em manutenção preventiva..."},
    {"letra": "B", "texto": "Somente quando houver..."},
    {"letra": "C", "texto": "Em situações emergenciais de PQI ou PPQ."},
    {"letra": "D", "texto": "Em qualquer solicitação..."},
    {"letra": "E", "texto": "Exclusivamente em áreas..."}
  ],
  "gabarito": "C",
  "justificativa": "O material estabelece que o serviço de corte..."
}
```

- 78 questões extraídas fielmente do docx
- 3 níveis: basico (~31), intermediario (~22), avancado (~25)
- Gabaritos e justificativas preservados do original
- Nenhuma questão inventada

---

## 7. Fluxo de telas

### 7.1 PinEntry (visual do portal)

1. Aluno já logado via Supabase Auth (perfil `aluno`)
2. Campo para digitar PIN de 4 dígitos
3. Validação contra `students.json` — se válido, carrega nome e exibe boas-vindas
4. Bloqueio após 3 tentativas erradas (cooldown de 60s)
5. Botão "Iniciar Quiz"

### 7.2 QuizConfig (visual do portal)

Opções configuráveis:
- Quantidade de questões: 10, 20, 30 ou todas
- Nível: Básico, Intermediário, Avançado ou Misturado
- Tempo por questão: 30s, 45s ou 60s

Comportamento:
- Questões embaralhadas automaticamente
- Alternativas embaralhadas (gabarito acompanha)
- Botão "Começar"

### 7.3 QuizGame (visual gamificado)

Header:
- Número da questão (ex: "5/20")
- Badge de nível colorida
- Cronômetro regressivo animado

Corpo:
- Enunciado em destaque (fonte grande, fundo contrastante)
- 5 botões de alternativa — grandes, coloridos (vermelho, azul, amarelo, verde, roxo), touch-friendly

Após responder:
- Bloqueia todas as alternativas
- Resposta certa fica verde com checkmark
- Resposta errada fica vermelha com X, certa é destacada
- Exibe justificativa técnica em card abaixo
- Botão "Próxima" aparece (ou avança automático após 5s)

Tempo esgotado:
- Marca como erro
- Revela gabarito + justificativa

### 7.4 Pontuação

| Nível | Base | Bônus velocidade (< 50% do tempo) |
|-------|------|------------------------------------|
| Básico | 100 pts | +50 pts |
| Intermediário | 150 pts | +75 pts |
| Avançado | 200 pts | +100 pts |

Bônus de velocidade concedido quando o aluno responde antes de metade do tempo configurado.

### 7.5 QuizResults (visual do portal)

Exibe:
- Nome do participante
- PIN usado
- Total de questões respondidas
- Acertos e erros
- Percentual de aproveitamento
- Pontuação final

Lista expansível de questões erradas:
- Enunciado
- Resposta marcada
- Resposta correta
- Justificativa técnica

Botões: "Jogar Novamente", "Ver Ranking", "Voltar"

### 7.6 Ranking (visual do portal)

Tabela ordenada por pontuação (desc):
- Posição, nome, pontuação, % acertos, tempo total, data/hora

Filtros: nível, período
Dados da tabela `quiz_attempts` via Supabase

---

## 8. Painel da coordenação (QuizDashboard)

Acessível em `/coordenacao/quiz`. Três visões:

1. **Ranking geral** — mesma tabela do ranking do aluno, com todos os alunos
2. **Desempenho por aluno** — filtro por nome/pelotão, histórico de tentativas, evolução
3. **Análise por questão** — taxa de acerto por questão, questões mais difíceis/fáceis, filtro por nível

---

## 9. Segurança

- Acesso requer login Supabase Auth com perfil `aluno` (ou `admin`)
- PIN validado antes de iniciar — sem PIN válido, sem quiz
- Gabarito não exposto no DOM antes da resposta (alternativas embaralhadas, resposta correta resolvida no momento do feedback)
- Pontuação calculada no `useQuizEngine` — não manipulável por edição simples do HTML
- Tentativa registrada no Supabase ao final do quiz
- Bloqueio de PIN após 3 tentativas erradas

---

## 10. Responsividade e design

- Mobile first — botões grandes, boa leitura em tela pequena
- Tela de pergunta com cores fortes por alternativa (estilo Kahoot sem copiar marca)
- Layout limpo e operacional nas telas de config/resultados
- Compatível com ThemeToggle (claro/escuro) nas telas do portal
- Tela gamificada usa esquema de cores próprio que funciona em ambos os temas
- HTML semântico, CSS organizado, JavaScript claro

---

## 11. Dependências

- Nenhuma dependência nova necessária
- Usa React, react-router-dom, Supabase JS SDK (já presentes)
- CSS vanilla (como o resto do projeto)

---

## 12. Fora de escopo

- Quiz não substitui nem alimenta a nota VC3 do módulo teórica
- Não há modo multiplayer/competição em tempo real
- Não há edição de questões pelo frontend (questões fixas no JSON)
- RLS na tabela `quiz_attempts` é preparação futura (campo `user_id` já presente)
