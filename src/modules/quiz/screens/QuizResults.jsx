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
