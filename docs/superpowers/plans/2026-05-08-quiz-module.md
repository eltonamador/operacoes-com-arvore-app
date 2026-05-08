# Quiz Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a gamified Kahoot-style quiz module for student study/training, integrated into the existing React SPA with Supabase persistence.

**Architecture:** New `src/modules/quiz/` module following the same pattern as existing modules (orchestrator + screens + hook + service). Quiz uses the shared `students.json` for PIN validation, a dedicated `quiz_attempts` Supabase table for persistence, and a `questions.json` data file with 78 questions extracted from the official docx.

**Tech Stack:** React 18, Vite, Supabase JS SDK, CSS vanilla, react-router-dom (all already present)

**Spec:** `docs/superpowers/specs/2026-05-08-quiz-module-design.md`

---

## File Map

### New files to create
| File | Responsibility |
|------|---------------|
| `src/modules/quiz/data/questions.json` | 78 questions extracted from docx with id, nivel, enunciado, alternativas, gabarito, justificativa |
| `src/modules/quiz/services/quizService.js` | CRUD for `quiz_attempts` table in Supabase |
| `src/modules/quiz/hooks/useQuizEngine.js` | Quiz state machine: current question, scoring, timer, answers tracking |
| `src/modules/quiz/screens/PinEntry.jsx` | PIN input, validation against students.json, welcome screen |
| `src/modules/quiz/screens/QuizConfig.jsx` | Quiz configuration: question count, level, time per question |
| `src/modules/quiz/screens/QuizGame.jsx` | Gamified question screen: timer, colored buttons, feedback |
| `src/modules/quiz/screens/QuizResults.jsx` | Results summary: score, percentage, wrong answers review |
| `src/modules/quiz/screens/Ranking.jsx` | Ranking table of quiz attempts |
| `src/modules/quiz/screens/QuizDashboard.jsx` | Coordination panel: ranking, per-student stats, per-question analysis |
| `src/modules/quiz/QuizApp.jsx` | Screen orchestrator (like TeoricaApp) |
| `src/modules/quiz/styles/quiz-game.css` | Gamified CSS for QuizGame only |

### Existing files to modify
| File | Change |
|------|--------|
| `src/app/Router.jsx` | Add routes `/aluno/quiz` and `/coordenacao/quiz` |
| `src/pages/AlunoArea.jsx` | Add "Quiz Teorico" tab |
| `src/pages/CoordenacaoArea.jsx` | Add link/tab to quiz dashboard |

---

## Task 1: Extract questions to JSON

**Files:**
- Create: `src/modules/quiz/data/questions.json`

- [ ] **Step 1: Write Python extraction script**

Create a Python script that reads the docx questions temp file and outputs structured JSON. The questions file has been extracted to `_temp_questions.txt` with the format:
```
line_num: NIVEL BASICO
line_num: 40 questoes
line_num: QUESTAO N. enunciado text
line_num: A) alternative text
line_num: B) alternative text
line_num: C) alternative text
line_num: D) alternative text
line_num: E) alternative text
line_num: Gabarito: X
line_num: Justificativa tecnica: text
```

Script must:
- Parse all 78 questions from `_temp_questions.txt`
- Assign sequential IDs (1-78)
- Detect level from "NIVEL BASICO/INTERMEDIARIO/AVANCADO" headers
- Extract: enunciado, 5 alternatives (A-E), gabarito letter, justificativa
- Handle edge cases: orphaned justificativa lines (lines 19-20 in the file), questions that span levels
- Output valid JSON array to `src/modules/quiz/data/questions.json`

```python
import json
import re

with open('_temp_questions.txt', encoding='utf-8') as f:
    lines = f.readlines()

questions = []
current_level = 'basico'
current_q = None
q_id = 0

for raw_line in lines:
    # Strip the "line_num: " prefix
    parts = raw_line.strip().split(': ', 1)
    if len(parts) < 2:
        continue
    text = parts[1].strip()

    # Detect level headers
    upper = text.upper()
    if 'NÍVEL BÁSICO' in upper or 'NIVEL BASICO' in upper:
        current_level = 'basico'
        continue
    if 'NÍVEL INTERMEDIÁRIO' in upper or 'NIVEL INTERMEDIARIO' in upper:
        current_level = 'intermediario'
        continue
    if 'NÍVEL AVANÇADO' in upper or 'NIVEL AVANCADO' in upper:
        current_level = 'avancado'
        continue

    # Skip count lines like "40 questoes"
    if re.match(r'^\d+ questões?$', text, re.IGNORECASE):
        continue

    # Detect question start
    m = re.match(r'^QUESTÃO\s+(\d+)\.\s*(.+)', text)
    if m:
        if current_q and current_q.get('gabarito'):
            questions.append(current_q)
        q_id += 1
        current_q = {
            'id': q_id,
            'nivel': current_level,
            'enunciado': m.group(2).strip(),
            'alternativas': [],
            'gabarito': '',
            'justificativa': ''
        }
        continue

    if not current_q:
        continue

    # Detect alternatives A) through E)
    alt_match = re.match(r'^([A-E])\)\s*(.+)', text)
    if alt_match:
        current_q['alternativas'].append({
            'letra': alt_match.group(1),
            'texto': alt_match.group(2).strip()
        })
        continue

    # Detect gabarito
    gab_match = re.match(r'^Gabarito:\s*([A-E])', text)
    if gab_match:
        current_q['gabarito'] = gab_match.group(1)
        continue

    # Detect justificativa
    just_match = re.match(r'^Justificativa técnica:\s*(.+)', text)
    if just_match:
        if current_q.get('gabarito'):
            current_q['justificativa'] = just_match.group(1).strip()
        continue

# Don't forget the last question
if current_q and current_q.get('gabarito'):
    questions.append(current_q)

# Validate
for q in questions:
    assert len(q['alternativas']) == 5, f"Q{q['id']} has {len(q['alternativas'])} alternatives"
    assert q['gabarito'] in 'ABCDE', f"Q{q['id']} invalid gabarito: {q['gabarito']}"

with open('src/modules/quiz/data/questions.json', 'w', encoding='utf-8') as f:
    json.dump(questions, f, ensure_ascii=False, indent=2)

print(f"Extracted {len(questions)} questions")
print(f"  basico: {sum(1 for q in questions if q['nivel'] == 'basico')}")
print(f"  intermediario: {sum(1 for q in questions if q['nivel'] == 'intermediario')}")
print(f"  avancado: {sum(1 for q in questions if q['nivel'] == 'avancado')}")
```

- [ ] **Step 2: Create directory and run extraction**

```bash
mkdir -p src/modules/quiz/data
python extract_questions.py
```

Expected: "Extracted 78 questions" with breakdown by level.

- [ ] **Step 3: Validate the JSON manually**

Open `src/modules/quiz/data/questions.json` and spot-check:
- First question (id 1) should be about Norma Operacional 003/2023-CBMAP, gabarito C
- Last question (id ~78) should be the integrated scenario about tree + electrical + analysis, gabarito B
- All questions have exactly 5 alternatives
- No empty enunciados or justificativas

- [ ] **Step 4: Clean up temp files and commit**

```bash
rm extract_questions.py _temp_questions.txt
git add src/modules/quiz/data/questions.json
git commit -m "feat(quiz): add questions.json with 78 questions from official bank"
```

---

## Task 2: Quiz service (Supabase CRUD)

**Files:**
- Create: `src/modules/quiz/services/quizService.js`

- [ ] **Step 1: Create the Supabase table**

Run this SQL in the Supabase SQL editor (or via migration):

```sql
CREATE TABLE quiz_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  nome_aluno VARCHAR(200) NOT NULL,
  numero_ordem INTEGER NOT NULL,
  pelotao VARCHAR(20) NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  nivel VARCHAR(20) NOT NULL,
  total_questoes INTEGER NOT NULL,
  tempo_por_questao INTEGER NOT NULL,
  acertos INTEGER NOT NULL,
  erros INTEGER NOT NULL,
  pontuacao INTEGER NOT NULL,
  percentual NUMERIC(5,2) NOT NULL,
  tempo_total INTEGER NOT NULL,
  respostas JSONB NOT NULL
);
```

- [ ] **Step 2: Write quizService.js**

```javascript
import { supabase } from '../../../lib/supabase'

export async function saveQuizAttempt(attempt) {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .insert([attempt])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function fetchQuizRanking({ nivel, desde } = {}) {
  let query = supabase
    .from('quiz_attempts')
    .select('*')
    .order('pontuacao', { ascending: false })
    .order('percentual', { ascending: false })
    .order('tempo_total', { ascending: true })

  if (nivel && nivel !== 'misturado') {
    query = query.eq('nivel', nivel)
  }
  if (desde) {
    query = query.gte('created_at', desde)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function fetchQuizAttemptsByAluno(numero_ordem) {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('numero_ordem', numero_ordem)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function fetchAllQuizAttempts() {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}
```

- [ ] **Step 3: Commit**

```bash
git add src/modules/quiz/services/quizService.js
git commit -m "feat(quiz): add quizService with Supabase CRUD for quiz_attempts"
```

---

## Task 3: Quiz engine hook

**Files:**
- Create: `src/modules/quiz/hooks/useQuizEngine.js`

- [ ] **Step 1: Write the quiz engine hook**

This hook manages the entire quiz state machine: question selection, shuffling, scoring, timer, and answer tracking.

```javascript
import { useState, useCallback, useRef, useEffect } from 'react'
import allQuestions from '../data/questions.json'

const POINTS = {
  basico: { base: 100, bonus: 50 },
  intermediario: { base: 150, bonus: 75 },
  avancado: { base: 200, bonus: 100 },
}

function shuffle(arr) {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function prepareQuestions(config) {
  let pool = [...allQuestions]

  if (config.nivel !== 'misturado') {
    pool = pool.filter(q => q.nivel === config.nivel)
  }

  pool = shuffle(pool)

  if (config.totalQuestoes !== 'todas' && config.totalQuestoes < pool.length) {
    pool = pool.slice(0, config.totalQuestoes)
  }

  return pool.map(q => ({
    ...q,
    alternativas: shuffle(q.alternativas),
  }))
}

export function useQuizEngine() {
  const [phase, setPhase] = useState('idle')
  const [config, setConfig] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState([])
  const [timeLeft, setTimeLeft] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const timerRef = useRef(null)
  const questionStartRef = useRef(null)

  const currentQuestion = questions[currentIndex] || null
  const totalQuestions = questions.length

  function startQuiz(quizConfig) {
    const prepared = prepareQuestions(quizConfig)
    setConfig(quizConfig)
    setQuestions(prepared)
    setCurrentIndex(0)
    setAnswers([])
    setAnswered(false)
    setSelectedAnswer(null)
    setTimeLeft(quizConfig.tempoPorQuestao)
    questionStartRef.current = Date.now()
    setPhase('playing')
  }

  useEffect(() => {
    if (phase !== 'playing' || answered) {
      clearInterval(timerRef.current)
      return
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          handleTimeout()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timerRef.current)
  }, [phase, currentIndex, answered])

  function handleTimeout() {
    const elapsed = config.tempoPorQuestao
    setAnswered(true)
    setSelectedAnswer(null)
    setAnswers(prev => [...prev, {
      questao_id: currentQuestion.id,
      nivel: currentQuestion.nivel,
      resposta_marcada: null,
      resposta_correta: currentQuestion.gabarito,
      acertou: false,
      tempo_gasto: elapsed,
      pontos: 0,
    }])
  }

  const answerQuestion = useCallback((letra) => {
    if (answered || !currentQuestion) return

    clearInterval(timerRef.current)
    const elapsed = Math.round((Date.now() - questionStartRef.current) / 1000)
    const isCorrect = letra === currentQuestion.gabarito
    let pontos = 0

    if (isCorrect) {
      const pts = POINTS[currentQuestion.nivel] || POINTS.basico
      pontos = pts.base
      if (elapsed < config.tempoPorQuestao / 2) {
        pontos += pts.bonus
      }
    }

    setAnswered(true)
    setSelectedAnswer(letra)
    setAnswers(prev => [...prev, {
      questao_id: currentQuestion.id,
      nivel: currentQuestion.nivel,
      resposta_marcada: letra,
      resposta_correta: currentQuestion.gabarito,
      acertou: isCorrect,
      tempo_gasto: elapsed,
      pontos,
    }])
  }, [answered, currentQuestion, config])

  function nextQuestion() {
    if (currentIndex + 1 >= totalQuestions) {
      setPhase('finished')
      return
    }
    setCurrentIndex(prev => prev + 1)
    setAnswered(false)
    setSelectedAnswer(null)
    setTimeLeft(config.tempoPorQuestao)
    questionStartRef.current = Date.now()
  }

  function resetQuiz() {
    clearInterval(timerRef.current)
    setPhase('idle')
    setConfig(null)
    setQuestions([])
    setCurrentIndex(0)
    setAnswers([])
    setAnswered(false)
    setSelectedAnswer(null)
    setTimeLeft(0)
  }

  const results = phase === 'finished' ? {
    totalQuestoes: totalQuestions,
    acertos: answers.filter(a => a.acertou).length,
    erros: answers.filter(a => !a.acertou).length,
    pontuacao: answers.reduce((sum, a) => sum + a.pontos, 0),
    percentual: Math.round((answers.filter(a => a.acertou).length / totalQuestions) * 100 * 100) / 100,
    tempoTotal: answers.reduce((sum, a) => sum + a.tempo_gasto, 0),
    respostas: answers,
  } : null

  return {
    phase,
    config,
    currentQuestion,
    currentIndex,
    totalQuestions,
    timeLeft,
    answered,
    selectedAnswer,
    answers,
    results,
    startQuiz,
    answerQuestion,
    nextQuestion,
    resetQuiz,
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/quiz/hooks/useQuizEngine.js
git commit -m "feat(quiz): add useQuizEngine hook with scoring, timer, and shuffle"
```

---

## Task 4: PinEntry screen

**Files:**
- Create: `src/modules/quiz/screens/PinEntry.jsx`

- [ ] **Step 1: Write PinEntry component**

```jsx
import { useState, useRef } from 'react'
import studentsData from '../../shared/data/students.json'

const students = studentsData?.students || []

export default function PinEntry({ onValidated }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [student, setStudent] = useState(null)
  const [attempts, setAttempts] = useState(0)
  const [locked, setLocked] = useState(false)
  const lockTimerRef = useRef(null)

  function handleSubmit(e) {
    e.preventDefault()
    if (locked) return

    const found = students.find(s => s.pin === pin)
    if (!found) {
      const next = attempts + 1
      setAttempts(next)
      if (next >= 3) {
        setLocked(true)
        setError('Muitas tentativas incorretas. Aguarde 60 segundos.')
        lockTimerRef.current = setTimeout(() => {
          setLocked(false)
          setAttempts(0)
          setError('')
        }, 60000)
      } else {
        setError(`PIN inválido. Tentativa ${next}/3.`)
      }
      return
    }

    setError('')
    setStudent(found)
  }

  function handleStart() {
    if (student) {
      onValidated({
        nome: student.nome,
        numero_ordem: student.numero,
        pelotao: student.pelotao,
        pin,
      })
    }
  }

  if (student) {
    return (
      <div className="quiz-container">
        <div className="quiz-card">
          <div className="quiz-welcome">
            <p className="quiz-welcome-label">Bem-vindo(a)!</p>
            <h2 className="quiz-welcome-name">{student.nome}</h2>
            <p className="quiz-welcome-info">{student.pelotao} &middot; Nº {student.numero}</p>
          </div>
          <button className="btn btn-primary btn-lg" onClick={handleStart}>
            Iniciar Quiz
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => { setStudent(null); setPin('') }}
          >
            Trocar PIN
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="quiz-container">
      <div className="quiz-card">
        <h2 className="quiz-card-title">Quiz Teórico</h2>
        <p className="quiz-card-subtitle">
          Salvamento Terrestre — CFSD-26
        </p>
        <form onSubmit={handleSubmit}>
          <label className="quiz-label">Insira seu PIN</label>
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            className="quiz-pin-input"
            value={pin}
            onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="****"
            disabled={locked}
            autoFocus
          />
          {error && <p className="quiz-error">{error}</p>}
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={pin.length !== 4 || locked}
          >
            Validar
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/quiz/screens/PinEntry.jsx
git commit -m "feat(quiz): add PinEntry screen with PIN validation and lockout"
```

---

## Task 5: QuizConfig screen

**Files:**
- Create: `src/modules/quiz/screens/QuizConfig.jsx`

- [ ] **Step 1: Write QuizConfig component**

```jsx
import { useState } from 'react'
import allQuestions from '../data/questions.json'

const QUESTION_COUNTS = [10, 20, 30, 'todas']
const LEVELS = [
  { value: 'misturado', label: 'Misturado' },
  { value: 'basico', label: 'Básico' },
  { value: 'intermediario', label: 'Intermediário' },
  { value: 'avancado', label: 'Avançado' },
]
const TIMES = [30, 45, 60]

export default function QuizConfig({ studentData, onStart, onBack }) {
  const [totalQuestoes, setTotalQuestoes] = useState(10)
  const [nivel, setNivel] = useState('misturado')
  const [tempoPorQuestao, setTempoPorQuestao] = useState(45)

  const availableCount = nivel === 'misturado'
    ? allQuestions.length
    : allQuestions.filter(q => q.nivel === nivel).length

  function handleStart() {
    onStart({
      totalQuestoes: totalQuestoes === 'todas' ? availableCount : totalQuestoes,
      nivel,
      tempoPorQuestao,
    })
  }

  return (
    <div className="quiz-container">
      <div className="quiz-card">
        <h2 className="quiz-card-title">Configurar Quiz</h2>
        <p className="quiz-card-subtitle">
          {studentData.nome}
        </p>

        <div className="quiz-config-section">
          <label className="quiz-label">Quantidade de questões</label>
          <div className="quiz-option-group">
            {QUESTION_COUNTS.map(count => {
              const label = count === 'todas' ? `Todas (${availableCount})` : count
              const disabled = count !== 'todas' && count > availableCount
              return (
                <button
                  key={count}
                  className={`quiz-option-btn${totalQuestoes === count ? ' quiz-option-btn--active' : ''}`}
                  onClick={() => setTotalQuestoes(count)}
                  disabled={disabled}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="quiz-config-section">
          <label className="quiz-label">Nível</label>
          <div className="quiz-option-group">
            {LEVELS.map(l => (
              <button
                key={l.value}
                className={`quiz-option-btn${nivel === l.value ? ' quiz-option-btn--active' : ''}`}
                onClick={() => setNivel(l.value)}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <div className="quiz-config-section">
          <label className="quiz-label">Tempo por questão</label>
          <div className="quiz-option-group">
            {TIMES.map(t => (
              <button
                key={t}
                className={`quiz-option-btn${tempoPorQuestao === t ? ' quiz-option-btn--active' : ''}`}
                onClick={() => setTempoPorQuestao(t)}
              >
                {t}s
              </button>
            ))}
          </div>
        </div>

        <button className="btn btn-primary btn-lg" onClick={handleStart}>
          Começar
        </button>
        <button className="btn btn-ghost" onClick={onBack}>
          Voltar
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/quiz/screens/QuizConfig.jsx
git commit -m "feat(quiz): add QuizConfig screen with level, count, and time options"
```

---

## Task 6: QuizGame screen + gamified CSS

**Files:**
- Create: `src/modules/quiz/screens/QuizGame.jsx`
- Create: `src/modules/quiz/styles/quiz-game.css`

- [ ] **Step 1: Write quiz-game.css**

```css
/* ═══════════════════════════════════════════════
   QUIZ GAME — Gamified visual (Kahoot-inspired)
   ═══════════════════════════════════════════════ */

.qg-wrapper {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: #1a1a2e;
  color: #fff;
  font-family: inherit;
}

/* Header bar */
.qg-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(0,0,0,0.3);
}

.qg-progress {
  font-size: 14px;
  font-weight: 700;
  opacity: 0.9;
}

.qg-level-badge {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 4px 10px;
  border-radius: 12px;
}
.qg-level-badge--basico { background: #4caf50; }
.qg-level-badge--intermediario { background: #ff9800; }
.qg-level-badge--avancado { background: #f44336; }

.qg-timer {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  font-size: 20px;
  font-weight: 900;
  background: rgba(255,255,255,0.1);
  border: 3px solid rgba(255,255,255,0.3);
  transition: border-color 0.3s;
}
.qg-timer--warning { border-color: #ff9800; color: #ff9800; }
.qg-timer--danger { border-color: #f44336; color: #f44336; animation: qg-pulse 0.5s infinite alternate; }

@keyframes qg-pulse {
  from { transform: scale(1); }
  to { transform: scale(1.08); }
}

/* Question area */
.qg-question {
  flex: 0 0 auto;
  padding: 24px 16px 16px;
  text-align: center;
}

.qg-enunciado {
  font-size: 18px;
  font-weight: 600;
  line-height: 1.5;
  max-width: 720px;
  margin: 0 auto;
}

/* Alternatives grid */
.qg-alternatives {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  padding: 12px 16px 24px;
  max-width: 720px;
  margin: 0 auto;
  width: 100%;
}

@media (min-width: 600px) {
  .qg-alternatives {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
}

.qg-alt-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  text-align: left;
  line-height: 1.4;
  transition: transform 0.1s, opacity 0.2s, filter 0.2s;
  min-height: 60px;
}

.qg-alt-btn:active:not(:disabled) {
  transform: scale(0.97);
}

.qg-alt-btn:disabled {
  cursor: default;
}

.qg-alt-btn--0 { background: #e21b3c; }
.qg-alt-btn--1 { background: #1368ce; }
.qg-alt-btn--2 { background: #d89e00; }
.qg-alt-btn--3 { background: #26890c; }
.qg-alt-btn--4 { background: #864cbf; }

.qg-alt-letra {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  font-weight: 900;
  font-size: 14px;
}

/* Feedback states */
.qg-alt-btn--correct {
  background: #4caf50 !important;
  animation: qg-correct-pop 0.3s ease;
}

.qg-alt-btn--wrong {
  background: #c62828 !important;
  opacity: 0.9;
}

.qg-alt-btn--dimmed {
  opacity: 0.4;
  filter: grayscale(0.5);
}

@keyframes qg-correct-pop {
  0% { transform: scale(1); }
  50% { transform: scale(1.03); }
  100% { transform: scale(1); }
}

/* Feedback / justificativa */
.qg-feedback {
  padding: 16px;
  max-width: 720px;
  margin: 0 auto;
  width: 100%;
}

.qg-feedback-card {
  background: rgba(255,255,255,0.08);
  border-radius: 12px;
  padding: 16px;
  border-left: 4px solid;
}

.qg-feedback-card--correct { border-left-color: #4caf50; }
.qg-feedback-card--wrong { border-left-color: #f44336; }
.qg-feedback-card--timeout { border-left-color: #ff9800; }

.qg-feedback-title {
  font-weight: 700;
  font-size: 15px;
  margin: 0 0 8px;
}

.qg-feedback-justificativa {
  font-size: 13px;
  line-height: 1.6;
  opacity: 0.85;
  margin: 0;
}

.qg-feedback-points {
  margin-top: 8px;
  font-size: 13px;
  font-weight: 700;
  color: #ffd700;
}

/* Next button */
.qg-next-bar {
  padding: 12px 16px 24px;
  text-align: center;
}

.qg-next-btn {
  background: #fff;
  color: #1a1a2e;
  border: none;
  border-radius: 12px;
  padding: 14px 48px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.1s;
}

.qg-next-btn:active {
  transform: scale(0.97);
}

/* Score bar */
.qg-score-bar {
  padding: 8px 16px;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: #ffd700;
  background: rgba(0,0,0,0.2);
}
```

- [ ] **Step 2: Write QuizGame component**

```jsx
import { useEffect } from 'react'
import '../styles/quiz-game.css'

export default function QuizGame({
  currentQuestion,
  currentIndex,
  totalQuestions,
  timeLeft,
  answered,
  selectedAnswer,
  config,
  answers,
  onAnswer,
  onNext,
}) {
  const timerClass = timeLeft <= 5
    ? 'qg-timer qg-timer--danger'
    : timeLeft <= 10
      ? 'qg-timer qg-timer--warning'
      : 'qg-timer'

  const totalPoints = answers.reduce((sum, a) => sum + a.pontos, 0)

  const isCorrect = answered && selectedAnswer === currentQuestion.gabarito
  const isWrong = answered && selectedAnswer && selectedAnswer !== currentQuestion.gabarito
  const isTimeout = answered && !selectedAnswer

  function getAltClass(alt, index) {
    const base = `qg-alt-btn qg-alt-btn--${index}`
    if (!answered) return base
    if (alt.letra === currentQuestion.gabarito) return `${base} qg-alt-btn--correct`
    if (alt.letra === selectedAnswer && alt.letra !== currentQuestion.gabarito) return `${base} qg-alt-btn--wrong`
    return `${base} qg-alt-btn--dimmed`
  }

  const lastAnswer = answered ? answers[answers.length - 1] : null

  return (
    <div className="qg-wrapper">
      <div className="qg-header">
        <span className="qg-progress">{currentIndex + 1}/{totalQuestions}</span>
        <span className={`qg-level-badge qg-level-badge--${currentQuestion.nivel}`}>
          {currentQuestion.nivel}
        </span>
        <div className={timerClass}>{timeLeft}</div>
      </div>

      <div className="qg-score-bar">
        {totalPoints} pontos
      </div>

      <div className="qg-question">
        <p className="qg-enunciado">{currentQuestion.enunciado}</p>
      </div>

      <div className="qg-alternatives">
        {currentQuestion.alternativas.map((alt, i) => (
          <button
            key={alt.letra}
            className={getAltClass(alt, i)}
            onClick={() => onAnswer(alt.letra)}
            disabled={answered}
          >
            <span className="qg-alt-letra">{alt.letra}</span>
            <span>{alt.texto}</span>
          </button>
        ))}
      </div>

      {answered && (
        <div className="qg-feedback">
          <div className={`qg-feedback-card qg-feedback-card--${isCorrect ? 'correct' : isTimeout ? 'timeout' : 'wrong'}`}>
            <p className="qg-feedback-title">
              {isCorrect ? 'Correto!' : isTimeout ? 'Tempo esgotado!' : 'Incorreto!'}
              {!isCorrect && ` Resposta: ${currentQuestion.gabarito}`}
            </p>
            <p className="qg-feedback-justificativa">{currentQuestion.justificativa}</p>
            {lastAnswer && lastAnswer.pontos > 0 && (
              <p className="qg-feedback-points">+{lastAnswer.pontos} pontos</p>
            )}
          </div>
        </div>
      )}

      {answered && (
        <div className="qg-next-bar">
          <button className="qg-next-btn" onClick={onNext}>
            {currentIndex + 1 >= totalQuestions ? 'Ver Resultado' : 'Próxima'}
          </button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Create styles directory and commit**

```bash
mkdir -p src/modules/quiz/styles
git add src/modules/quiz/screens/QuizGame.jsx src/modules/quiz/styles/quiz-game.css
git commit -m "feat(quiz): add QuizGame screen with gamified CSS and timer"
```

---

## Task 7: QuizResults screen

**Files:**
- Create: `src/modules/quiz/screens/QuizResults.jsx`

- [ ] **Step 1: Write QuizResults component**

```jsx
import { useState } from 'react'
import allQuestions from '../data/questions.json'

function getQuestionById(id) {
  return allQuestions.find(q => q.id === id)
}

export default function QuizResults({ studentData, results, onPlayAgain, onRanking, onBack }) {
  const [expandedId, setExpandedId] = useState(null)
  const wrongAnswers = results.respostas.filter(r => !r.acertou)

  return (
    <div className="quiz-container">
      <div className="quiz-card quiz-card--wide">
        <h2 className="quiz-card-title">Resultado</h2>

        <div className="quiz-results-header">
          <p className="quiz-results-name">{studentData.nome}</p>
          <p className="quiz-results-info">{studentData.pelotao} &middot; Nº {studentData.numero_ordem}</p>
        </div>

        <div className="quiz-stats-grid">
          <div className="quiz-stat">
            <span className="quiz-stat-value">{results.totalQuestoes}</span>
            <span className="quiz-stat-label">Questões</span>
          </div>
          <div className="quiz-stat quiz-stat--success">
            <span className="quiz-stat-value">{results.acertos}</span>
            <span className="quiz-stat-label">Acertos</span>
          </div>
          <div className="quiz-stat quiz-stat--danger">
            <span className="quiz-stat-value">{results.erros}</span>
            <span className="quiz-stat-label">Erros</span>
          </div>
          <div className="quiz-stat">
            <span className="quiz-stat-value">{results.percentual}%</span>
            <span className="quiz-stat-label">Aproveitamento</span>
          </div>
          <div className="quiz-stat quiz-stat--gold">
            <span className="quiz-stat-value">{results.pontuacao}</span>
            <span className="quiz-stat-label">Pontuação</span>
          </div>
          <div className="quiz-stat">
            <span className="quiz-stat-value">{results.tempoTotal}s</span>
            <span className="quiz-stat-label">Tempo Total</span>
          </div>
        </div>

        {wrongAnswers.length > 0 && (
          <div className="quiz-wrong-section">
            <h3 className="quiz-wrong-title">
              Questões erradas ({wrongAnswers.length})
            </h3>
            {wrongAnswers.map(r => {
              const q = getQuestionById(r.questao_id)
              if (!q) return null
              const isExpanded = expandedId === r.questao_id
              return (
                <div key={r.questao_id} className="quiz-wrong-item">
                  <button
                    className="quiz-wrong-toggle"
                    onClick={() => setExpandedId(isExpanded ? null : r.questao_id)}
                  >
                    <span className="quiz-wrong-q-num">Q{r.questao_id}</span>
                    <span className="quiz-wrong-q-text">
                      {q.enunciado.length > 80 ? q.enunciado.slice(0, 80) + '...' : q.enunciado}
                    </span>
                    <span className="quiz-wrong-arrow">{isExpanded ? '▲' : '▼'}</span>
                  </button>
                  {isExpanded && (
                    <div className="quiz-wrong-detail">
                      <p><strong>Enunciado:</strong> {q.enunciado}</p>
                      <p>
                        <strong>Sua resposta:</strong>{' '}
                        {r.resposta_marcada
                          ? `${r.resposta_marcada}) ${q.alternativas.find(a => a.letra === r.resposta_marcada)?.texto || ''}`
                          : 'Tempo esgotado'}
                      </p>
                      <p>
                        <strong>Resposta correta:</strong>{' '}
                        {r.resposta_correta}) {q.alternativas.find(a => a.letra === r.resposta_correta)?.texto || ''}
                      </p>
                      <p className="quiz-wrong-justificativa">
                        <strong>Justificativa:</strong> {q.justificativa}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <div className="quiz-results-actions">
          <button className="btn btn-primary" onClick={onPlayAgain}>
            Jogar Novamente
          </button>
          <button className="btn btn-secondary" onClick={onRanking}>
            Ver Ranking
          </button>
          <button className="btn btn-ghost" onClick={onBack}>
            Voltar
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/quiz/screens/QuizResults.jsx
git commit -m "feat(quiz): add QuizResults screen with score summary and wrong answers review"
```

---

## Task 8: Ranking screen

**Files:**
- Create: `src/modules/quiz/screens/Ranking.jsx`

- [ ] **Step 1: Write Ranking component**

```jsx
import { useEffect, useState } from 'react'
import { fetchQuizRanking } from '../services/quizService'

const LEVEL_OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: 'basico', label: 'Básico' },
  { value: 'intermediario', label: 'Intermediário' },
  { value: 'avancado', label: 'Avançado' },
  { value: 'misturado', label: 'Misturado' },
]

export default function Ranking({ onBack }) {
  const [ranking, setRanking] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroNivel, setFiltroNivel] = useState('todos')

  useEffect(() => {
    loadRanking()
  }, [filtroNivel])

  async function loadRanking() {
    setLoading(true)
    try {
      const opts = filtroNivel !== 'todos' ? { nivel: filtroNivel } : {}
      const data = await fetchQuizRanking(opts)
      setRanking(data)
    } catch (err) {
      console.error('Erro ao carregar ranking:', err)
    } finally {
      setLoading(false)
    }
  }

  function fmtDate(iso) {
    if (!iso) return '—'
    const d = new Date(iso)
    return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="quiz-container">
      <div className="quiz-card quiz-card--wide">
        <h2 className="quiz-card-title">Ranking</h2>

        <div className="quiz-option-group" style={{ marginBottom: 16 }}>
          {LEVEL_OPTIONS.map(l => (
            <button
              key={l.value}
              className={`quiz-option-btn${filtroNivel === l.value ? ' quiz-option-btn--active' : ''}`}
              onClick={() => setFiltroNivel(l.value)}
            >
              {l.label}
            </button>
          ))}
        </div>

        {loading && <p className="status-muted">Carregando ranking...</p>}

        {!loading && ranking.length === 0 && (
          <p className="status-muted">Nenhuma tentativa registrada.</p>
        )}

        {!loading && ranking.length > 0 && (
          <div className="portal-table-wrapper">
            <table className="portal-table">
              <thead>
                <tr>
                  <th className="center">#</th>
                  <th>Nome</th>
                  <th className="center">Pontuação</th>
                  <th className="center">Acertos</th>
                  <th className="center">%</th>
                  <th className="center">Tempo</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((r, i) => (
                  <tr key={r.id}>
                    <td className="center" style={{ fontWeight: i < 3 ? 700 : 400 }}>
                      {i + 1}º
                    </td>
                    <td style={{ fontWeight: i < 3 ? 700 : 400 }}>{r.nome_aluno}</td>
                    <td className="center" style={{ fontWeight: 700, color: 'var(--gold)' }}>
                      {r.pontuacao}
                    </td>
                    <td className="center">{r.acertos}/{r.total_questoes}</td>
                    <td className="center">{Number(r.percentual).toFixed(0)}%</td>
                    <td className="center">{r.tempo_total}s</td>
                    <td>{fmtDate(r.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button className="btn btn-ghost" onClick={onBack} style={{ marginTop: 16 }}>
          Voltar
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/quiz/screens/Ranking.jsx
git commit -m "feat(quiz): add Ranking screen with level filter"
```

---

## Task 9: QuizApp orchestrator

**Files:**
- Create: `src/modules/quiz/QuizApp.jsx`

- [ ] **Step 1: Write QuizApp component**

```jsx
import { useState } from 'react'
import ThemeToggle from '../../components/ThemeToggle'
import { useAuth } from '../../contexts/AuthContext'
import { useQuizEngine } from './hooks/useQuizEngine'
import { saveQuizAttempt } from './services/quizService'
import PinEntry from './screens/PinEntry'
import QuizConfig from './screens/QuizConfig'
import QuizGame from './screens/QuizGame'
import QuizResults from './screens/QuizResults'
import Ranking from './screens/Ranking'

export default function QuizApp() {
  const { user } = useAuth()
  const engine = useQuizEngine()
  const [screen, setScreen] = useState('pin')
  const [studentData, setStudentData] = useState(null)
  const [savedResults, setSavedResults] = useState(null)

  function handlePinValidated(data) {
    setStudentData(data)
    setScreen('config')
  }

  function handleStartQuiz(config) {
    engine.startQuiz(config)
    setScreen('game')
  }

  async function handleQuizFinished() {
    const r = engine.results
    if (!r) return

    try {
      await saveQuizAttempt({
        nome_aluno: studentData.nome,
        numero_ordem: studentData.numero_ordem,
        pelotao: studentData.pelotao,
        user_id: user?.id || null,
        nivel: engine.config.nivel,
        total_questoes: r.totalQuestoes,
        tempo_por_questao: engine.config.tempoPorQuestao,
        acertos: r.acertos,
        erros: r.erros,
        pontuacao: r.pontuacao,
        percentual: r.percentual,
        tempo_total: r.tempoTotal,
        respostas: r.respostas,
      })
    } catch (err) {
      console.error('Erro ao salvar tentativa:', err)
    }

    setSavedResults(r)
    setScreen('results')
  }

  function handlePlayAgain() {
    engine.resetQuiz()
    setSavedResults(null)
    setScreen('config')
  }

  function handleNextInGame() {
    if (engine.currentIndex + 1 >= engine.totalQuestions) {
      handleQuizFinished()
    } else {
      engine.nextQuestion()
    }
  }

  if (screen === 'game') {
    return (
      <QuizGame
        currentQuestion={engine.currentQuestion}
        currentIndex={engine.currentIndex}
        totalQuestions={engine.totalQuestions}
        timeLeft={engine.timeLeft}
        answered={engine.answered}
        selectedAnswer={engine.selectedAnswer}
        config={engine.config}
        answers={engine.answers}
        onAnswer={engine.answerQuestion}
        onNext={handleNextInGame}
      />
    )
  }

  return (
    <div className="app-root">
      <ThemeToggle floating />
      {screen === 'pin' && (
        <PinEntry onValidated={handlePinValidated} />
      )}
      {screen === 'config' && (
        <QuizConfig
          studentData={studentData}
          onStart={handleStartQuiz}
          onBack={() => setScreen('pin')}
        />
      )}
      {screen === 'results' && savedResults && (
        <QuizResults
          studentData={studentData}
          results={savedResults}
          onPlayAgain={handlePlayAgain}
          onRanking={() => setScreen('ranking')}
          onBack={() => setScreen('config')}
        />
      )}
      {screen === 'ranking' && (
        <Ranking onBack={() => setScreen('results')} />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/quiz/QuizApp.jsx
git commit -m "feat(quiz): add QuizApp orchestrator connecting all screens"
```

---

## Task 10: QuizDashboard for coordination

**Files:**
- Create: `src/modules/quiz/screens/QuizDashboard.jsx`

- [ ] **Step 1: Write QuizDashboard component**

```jsx
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchAllQuizAttempts } from '../services/quizService'
import allQuestions from '../data/questions.json'
import PortalLayout from '../../../components/PortalLayout'

function normalize(str) {
  return (str || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function fmtDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export default function QuizDashboard() {
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(true)
  const [aba, setAba] = useState('ranking')
  const [filtroBusca, setFiltroBusca] = useState('')
  const [filtroNivel, setFiltroNivel] = useState('todos')

  useEffect(() => {
    fetchAllQuizAttempts()
      .then(setAttempts)
      .catch(err => console.error('Erro:', err))
      .finally(() => setLoading(false))
  }, [])

  // --- RANKING ---
  const rankingSorted = useMemo(() => {
    let filtered = [...attempts]
    if (filtroNivel !== 'todos') {
      filtered = filtered.filter(a => a.nivel === filtroNivel)
    }
    if (filtroBusca.trim()) {
      const q = normalize(filtroBusca)
      filtered = filtered.filter(a => normalize(a.nome_aluno).includes(q))
    }
    return filtered.sort((a, b) => b.pontuacao - a.pontuacao)
  }, [attempts, filtroNivel, filtroBusca])

  // --- PER-STUDENT ---
  const studentStats = useMemo(() => {
    const map = {}
    for (const a of attempts) {
      const key = a.numero_ordem
      if (!map[key]) {
        map[key] = { nome: a.nome_aluno, pelotao: a.pelotao, numero_ordem: a.numero_ordem, tentativas: [] }
      }
      map[key].tentativas.push(a)
    }
    let list = Object.values(map)
    if (filtroBusca.trim()) {
      const q = normalize(filtroBusca)
      list = list.filter(s => normalize(s.nome).includes(q))
    }
    return list.sort((a, b) => a.nome.localeCompare(b.nome))
  }, [attempts, filtroBusca])

  // --- PER-QUESTION ---
  const questionStats = useMemo(() => {
    const stats = {}
    for (const a of attempts) {
      const respostas = a.respostas || []
      for (const r of respostas) {
        if (!stats[r.questao_id]) {
          stats[r.questao_id] = { total: 0, acertos: 0 }
        }
        stats[r.questao_id].total++
        if (r.acertou) stats[r.questao_id].acertos++
      }
    }
    return allQuestions.map(q => {
      const s = stats[q.id] || { total: 0, acertos: 0 }
      const taxa = s.total > 0 ? Math.round((s.acertos / s.total) * 100) : null
      return { ...q, total: s.total, acertos: s.acertos, taxa }
    }).filter(q => {
      if (filtroNivel !== 'todos' && q.nivel !== filtroNivel) return false
      return true
    }).sort((a, b) => (a.taxa ?? 999) - (b.taxa ?? 999))
  }, [attempts, filtroNivel])

  return (
    <PortalLayout>
      <div style={{ marginBottom: '24px' }}>
        <p className="page-section-label">Coordenação</p>
        <h1 className="page-section-title">Quiz Teórico — Painel</h1>
        <p className="page-section-desc">{attempts.length} tentativa(s) registrada(s)</p>
      </div>

      <div className="filter-bar" style={{ marginBottom: 16 }}>
        {[
          { key: 'ranking', label: 'Ranking' },
          { key: 'alunos', label: 'Por Aluno' },
          { key: 'questoes', label: 'Por Questão' },
        ].map(t => (
          <button
            key={t.key}
            className={`filter-btn${aba === t.key ? ' filter-btn--active' : ''}`}
            onClick={() => setAba(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="coord-filters-card">
        <div className="coord-filter-row">
          <div className="coord-filter-field coord-filter-field--wide">
            <label className="coord-filter-label">Buscar</label>
            <input
              className="coord-filter-input"
              type="text"
              placeholder="Nome do aluno..."
              value={filtroBusca}
              onChange={e => setFiltroBusca(e.target.value)}
            />
          </div>
          {aba !== 'alunos' && (
            <div className="coord-filter-field">
              <label className="coord-filter-label">Nível</label>
              <select
                className="coord-filter-select"
                value={filtroNivel}
                onChange={e => setFiltroNivel(e.target.value)}
              >
                <option value="todos">Todos</option>
                <option value="basico">Básico</option>
                <option value="intermediario">Intermediário</option>
                <option value="avancado">Avançado</option>
                <option value="misturado">Misturado</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {loading && <p className="status-muted">Carregando...</p>}

      {!loading && aba === 'ranking' && (
        <div className="portal-table-wrapper">
          <table className="portal-table">
            <thead>
              <tr>
                <th className="center">#</th>
                <th>Nome</th>
                <th>Pelotão</th>
                <th className="center">Pontuação</th>
                <th className="center">Acertos</th>
                <th className="center">%</th>
                <th className="center">Tempo</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {rankingSorted.map((r, i) => (
                <tr key={r.id}>
                  <td className="center" style={{ fontWeight: i < 3 ? 700 : 400 }}>{i + 1}º</td>
                  <td style={{ fontWeight: i < 3 ? 700 : 400 }}>{r.nome_aluno}</td>
                  <td>{r.pelotao}</td>
                  <td className="center" style={{ fontWeight: 700, color: 'var(--gold)' }}>{r.pontuacao}</td>
                  <td className="center">{r.acertos}/{r.total_questoes}</td>
                  <td className="center">{Number(r.percentual).toFixed(0)}%</td>
                  <td className="center">{r.tempo_total}s</td>
                  <td>{fmtDate(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && aba === 'alunos' && (
        <div className="portal-table-wrapper">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Pelotão</th>
                <th className="center">Tentativas</th>
                <th className="center">Melhor Pontuação</th>
                <th className="center">Melhor %</th>
                <th className="center">Última</th>
              </tr>
            </thead>
            <tbody>
              {studentStats.map(s => {
                const best = s.tentativas.reduce((a, b) => a.pontuacao > b.pontuacao ? a : b)
                const bestPct = s.tentativas.reduce((a, b) => Number(a.percentual) > Number(b.percentual) ? a : b)
                const last = s.tentativas[0]
                return (
                  <tr key={s.numero_ordem}>
                    <td>{s.nome}</td>
                    <td>{s.pelotao}</td>
                    <td className="center">{s.tentativas.length}</td>
                    <td className="center" style={{ fontWeight: 700, color: 'var(--gold)' }}>{best.pontuacao}</td>
                    <td className="center">{Number(bestPct.percentual).toFixed(0)}%</td>
                    <td>{fmtDate(last?.created_at)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {!loading && aba === 'questoes' && (
        <div className="portal-table-wrapper">
          <table className="portal-table">
            <thead>
              <tr>
                <th className="center">ID</th>
                <th className="center">Nível</th>
                <th>Enunciado</th>
                <th className="center">Respostas</th>
                <th className="center">Taxa Acerto</th>
              </tr>
            </thead>
            <tbody>
              {questionStats.map(q => (
                <tr key={q.id}>
                  <td className="center">{q.id}</td>
                  <td className="center">
                    <span className={`qg-level-badge qg-level-badge--${q.nivel}`} style={{ fontSize: 10, padding: '2px 6px' }}>
                      {q.nivel}
                    </span>
                  </td>
                  <td title={q.enunciado}>
                    {q.enunciado.length > 100 ? q.enunciado.slice(0, 100) + '...' : q.enunciado}
                  </td>
                  <td className="center">{q.total}</td>
                  <td className="center" style={{
                    fontWeight: 700,
                    color: q.taxa === null ? 'var(--text-muted)' : q.taxa >= 70 ? 'var(--success)' : q.taxa >= 40 ? 'var(--gold)' : 'var(--danger)',
                  }}>
                    {q.taxa !== null ? `${q.taxa}%` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Link to="/coordenacao" className="portal-back-link" style={{ marginTop: 24 }}>
        ← Voltar à Coordenação
      </Link>
    </PortalLayout>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/quiz/screens/QuizDashboard.jsx
git commit -m "feat(quiz): add QuizDashboard for coordination with ranking, per-student, per-question views"
```

---

## Task 11: Portal integration (Router + AlunoArea + CoordenacaoArea)

**Files:**
- Modify: `src/app/Router.jsx`
- Modify: `src/pages/AlunoArea.jsx`
- Modify: `src/pages/CoordenacaoArea.jsx`

- [ ] **Step 1: Add routes to Router.jsx**

Add imports at the top of `src/app/Router.jsx`:
```jsx
import QuizApp from '../modules/quiz/QuizApp'
import QuizDashboard from '../modules/quiz/screens/QuizDashboard'
```

Add two new Route elements before the closing `</Routes>`:
```jsx
{/* Quiz — Aluno + Admin */}
<Route
  path="/aluno/quiz"
  element={
    <ProtectedRoute roles={['aluno']}>
      <QuizApp />
    </ProtectedRoute>
  }
/>

{/* Quiz Dashboard — Coordenacao + Admin */}
<Route
  path="/coordenacao/quiz"
  element={
    <ProtectedRoute roles={['coordenacao']}>
      <QuizDashboard />
    </ProtectedRoute>
  }
/>
```

- [ ] **Step 2: Add quiz link to AlunoArea.jsx**

In `src/pages/AlunoArea.jsx`, add a "Quiz Teórico" tab button in the `filter-bar` div alongside existing tabs (Avaliações, Consolidação, Ranking):

```jsx
<button
  onClick={() => handleAbaChange('quiz')}
  className={`filter-btn${aba === 'quiz' ? ' filter-btn--active' : ''}`}
>
  Quiz Teórico
</button>
```

And add the rendering for the quiz tab. Since the quiz is its own full-page module at `/aluno/quiz`, use a redirect card:

```jsx
{aba === 'quiz' && (
  <div style={{ textAlign: 'center', padding: '48px 16px' }}>
    <h3 style={{ marginBottom: 8 }}>Quiz Teórico</h3>
    <p className="status-muted" style={{ marginBottom: 24 }}>
      Teste seus conhecimentos com questões de Salvamento Terrestre.
    </p>
    <Link to="/aluno/quiz" className="btn btn-primary" style={{ display: 'inline-block', padding: '12px 32px', textDecoration: 'none' }}>
      Acessar Quiz
    </Link>
  </div>
)}
```

- [ ] **Step 3: Add quiz link to CoordenacaoArea.jsx**

Similar approach — add a tab or link card pointing to `/coordenacao/quiz`. Look for the existing tab structure in CoordenacaoArea and add:

```jsx
<button
  onClick={() => window.location.href = '/coordenacao/quiz'}
  className="filter-btn"
>
  Quiz Teórico
</button>
```

Or preferably use `Link` from react-router-dom if there's a navigation section.

- [ ] **Step 4: Commit**

```bash
git add src/app/Router.jsx src/pages/AlunoArea.jsx src/pages/CoordenacaoArea.jsx
git commit -m "feat(quiz): integrate quiz routes and links in AlunoArea and CoordenacaoArea"
```

---

## Task 12: Quiz portal CSS (non-game screens)

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1: Add quiz-specific CSS to global.css**

Append these styles at the end of `src/styles/global.css`. These cover the quiz screens that follow the portal visual (PinEntry, Config, Results, Ranking), not the gamified QuizGame screen which has its own CSS file.

```css
/* ═══════════════════════════════════════════════
   QUIZ MODULE — Portal-styled screens
   ═══════════════════════════════════════════════ */

.quiz-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 80vh;
  padding: 32px 16px;
}

.quiz-card {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 32px 24px;
  width: 100%;
  max-width: 420px;
  text-align: center;
}

.quiz-card--wide {
  max-width: 720px;
  text-align: left;
}

.quiz-card-title {
  font-size: 22px;
  font-weight: 800;
  margin: 0 0 4px;
  color: var(--text-primary);
}

.quiz-card-subtitle {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0 0 24px;
}

.quiz-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 8px;
  text-align: left;
}

.quiz-pin-input {
  width: 100%;
  padding: 14px;
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  letter-spacing: 12px;
  border: 2px solid var(--border);
  border-radius: 12px;
  background: var(--bg);
  color: var(--text-primary);
  margin-bottom: 12px;
}

.quiz-pin-input:focus {
  outline: none;
  border-color: var(--gold);
}

.quiz-error {
  color: var(--danger);
  font-size: 13px;
  font-weight: 600;
  margin: 0 0 12px;
}

.quiz-welcome {
  margin-bottom: 24px;
}

.quiz-welcome-label {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0 0 4px;
}

.quiz-welcome-name {
  font-size: 20px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 4px;
}

.quiz-welcome-info {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
}

/* Config */
.quiz-config-section {
  margin-bottom: 20px;
  text-align: left;
}

.quiz-option-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quiz-option-btn {
  padding: 8px 16px;
  border: 2px solid var(--border);
  border-radius: 10px;
  background: var(--bg);
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.quiz-option-btn:hover:not(:disabled) {
  border-color: var(--gold);
}

.quiz-option-btn--active {
  background: var(--gold);
  color: #000;
  border-color: var(--gold);
}

.quiz-option-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Results */
.quiz-results-header {
  margin-bottom: 20px;
}

.quiz-results-name {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 2px;
  color: var(--text-primary);
}

.quiz-results-info {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
}

.quiz-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

@media (max-width: 480px) {
  .quiz-stats-grid { grid-template-columns: repeat(2, 1fr); }
}

.quiz-stat {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px;
  text-align: center;
}

.quiz-stat-value {
  display: block;
  font-size: 22px;
  font-weight: 800;
  color: var(--text-primary);
}

.quiz-stat--success .quiz-stat-value { color: var(--success); }
.quiz-stat--danger .quiz-stat-value { color: var(--danger); }
.quiz-stat--gold .quiz-stat-value { color: var(--gold); }

.quiz-stat-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.03em;
  margin-top: 2px;
}

/* Wrong answers */
.quiz-wrong-section {
  margin-bottom: 24px;
}

.quiz-wrong-title {
  font-size: 15px;
  font-weight: 700;
  margin: 0 0 12px;
  color: var(--text-primary);
}

.quiz-wrong-item {
  border: 1px solid var(--border);
  border-radius: 10px;
  margin-bottom: 8px;
  overflow: hidden;
}

.quiz-wrong-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border: none;
  background: var(--bg);
  color: var(--text-primary);
  font-size: 13px;
  cursor: pointer;
  text-align: left;
}

.quiz-wrong-q-num {
  flex-shrink: 0;
  font-weight: 700;
  color: var(--danger);
}

.quiz-wrong-q-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.quiz-wrong-arrow {
  flex-shrink: 0;
  font-size: 10px;
  color: var(--text-muted);
}

.quiz-wrong-detail {
  padding: 12px;
  font-size: 13px;
  line-height: 1.6;
  border-top: 1px solid var(--border);
}

.quiz-wrong-detail p {
  margin: 0 0 8px;
}

.quiz-wrong-justificativa {
  color: var(--text-secondary);
  font-style: italic;
}

.quiz-results-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 24px;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
}

.btn:hover { opacity: 0.85; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-primary {
  background: var(--gold);
  color: #000;
}

.btn-secondary {
  background: var(--border);
  color: var(--text-primary);
}

.btn-ghost {
  background: transparent;
  color: var(--text-muted);
  border: 1px solid var(--border);
}

.btn-lg {
  width: 100%;
  padding: 14px;
  font-size: 16px;
  margin-top: 8px;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/global.css
git commit -m "feat(quiz): add portal-styled CSS for quiz screens"
```

---

## Task 13: Manual smoke test

- [ ] **Step 1: Create the Supabase table**

If not done in Task 2, run the SQL in Supabase dashboard now.

- [ ] **Step 2: Start the dev server**

```bash
npm run dev
```

- [ ] **Step 3: Test PinEntry**

Navigate to `/aluno/quiz` (as a logged-in aluno user). Enter an invalid PIN 3 times — verify lockout. Enter a valid PIN — verify welcome screen shows correct name.

- [ ] **Step 4: Test QuizConfig**

Select different levels and verify available question counts adjust. Select "Avançado" — verify count is ~25. Select "Misturado" — verify count is ~78.

- [ ] **Step 5: Test QuizGame**

Start a quiz with 10 questions, 45s, Misturado. Verify:
- Timer counts down
- Clicking alternative shows feedback (green/red)
- Justificativa appears
- Points accumulate in score bar
- Let one timeout — verify it marks as error

- [ ] **Step 6: Test QuizResults**

After finishing 10 questions, verify results screen shows all stats. Expand a wrong answer — verify enunciado, marked answer, correct answer, justificativa.

- [ ] **Step 7: Test Ranking**

Click "Ver Ranking" — verify the attempt just completed appears. Filter by level.

- [ ] **Step 8: Test QuizDashboard**

Navigate to `/coordenacao/quiz` (as coordenacao user). Verify the 3 tabs (Ranking, Por Aluno, Por Questão) load and show data.

- [ ] **Step 9: Commit any fixes**

```bash
git add -A
git commit -m "fix(quiz): address smoke test issues"
```

---

## Task 14: Clean up and final commit

- [ ] **Step 1: Remove temp files**

```bash
rm -f _temp_questions.txt extract_questions.py
```

- [ ] **Step 2: Verify no broken imports**

Run `npm run build` and check for errors.

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "chore(quiz): clean up temp files and verify build"
```
