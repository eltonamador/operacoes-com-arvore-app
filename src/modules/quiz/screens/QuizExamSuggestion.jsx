import { useMemo, useState } from 'react'
import { suggestExamQuestions, describeDiscrimination } from '../services/quizStatsService'

const CLASS_LABEL = {
  'muito-facil': 'Muito fácil',
  'equilibrada': 'Equilibrada',
  'dificil': 'Difícil',
  'critica': 'Crítica',
  'amostra-insuficiente': 'Sem amostra',
}

export default function QuizExamSuggestion({ questionStats }) {
  const [permitirExtremos, setPermitirExtremos] = useState(false)
  const [minRespostas, setMinRespostas] = useState(10)
  const [tamanho, setTamanho] = useState(10)
  const [cotas, setCotas] = useState({ basico: 4, intermediario: 4, avancado: 2 })
  const [removidas, setRemovidas] = useState(new Set())
  const [substituidas, setSubstituidas] = useState({}) // {oldId: newId}
  const [gerado, setGerado] = useState(false)

  const sugestao = useMemo(
    () => suggestExamQuestions(questionStats, {
      tamanho,
      cotas,
      minRespostas,
      permitirExtremos,
    }),
    [questionStats, tamanho, cotas, minRespostas, permitirExtremos]
  )

  const mapStats = useMemo(() => {
    const m = new Map()
    for (const q of questionStats) m.set(q.id, q)
    return m
  }, [questionStats])

  // Aplica substituições e remoções por cima da seleção inicial
  const lista = useMemo(() => {
    const result = []
    for (const q of sugestao.selecionadas) {
      if (removidas.has(q.id)) continue
      const subId = substituidas[q.id]
      if (subId && mapStats.has(subId)) result.push(mapStats.get(subId))
      else result.push(q)
    }
    return result
  }, [sugestao, removidas, substituidas, mapStats])

  function substituir(qOld) {
    const fila = sugestao.substitutos[qOld.nivel] || []
    const usados = new Set(lista.map(q => q.id))
    const prox = fila.find(id => !usados.has(id) && !removidas.has(id))
    if (prox != null) setSubstituidas(s => ({ ...s, [qOld.id]: prox }))
  }

  function remover(q) {
    setRemovidas(set => new Set(set).add(q.id))
  }

  function reset() {
    setRemovidas(new Set())
    setSubstituidas({})
  }

  function exportarCSV() {
    const linhas = [
      ['#', 'ID', 'Nível', 'Taxa', 'D', 'Classif.', 'Enunciado', 'Gabarito'].join(';'),
      ...lista.map((q, i) => [
        i + 1, q.id, q.nivel, q.taxa, q.discriminacao ?? '', CLASS_LABEL[q.classificacao] || '',
        '"' + (q.enunciado || '').replace(/"/g, '""') + '"', q.gabarito,
      ].join(';')),
    ].join('\n')
    const blob = new Blob(['﻿' + linhas], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sugestao-prova.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div style={{
        padding: 12,
        marginBottom: 12,
        borderRadius: 8,
        border: '1px solid var(--border, rgba(255,255,255,0.08))',
        background: 'var(--surface-2, rgba(255,255,255,0.04))',
      }}>
        <h3 style={{ marginTop: 0 }}>Parâmetros</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
          <Field label="Tamanho">
            <input type="number" min={1} max={50} value={tamanho}
              onChange={e => setTamanho(Number(e.target.value) || 10)}
              className="coord-filter-input" style={{ width: 80 }} />
          </Field>
          <Field label="Mín. respostas">
            <input type="number" min={1} value={minRespostas}
              onChange={e => setMinRespostas(Number(e.target.value) || 1)}
              className="coord-filter-input" style={{ width: 80 }} />
          </Field>
          <Field label="Básico">
            <input type="number" min={0} value={cotas.basico}
              onChange={e => setCotas(c => ({ ...c, basico: Number(e.target.value) || 0 }))}
              className="coord-filter-input" style={{ width: 60 }} />
          </Field>
          <Field label="Intermed.">
            <input type="number" min={0} value={cotas.intermediario}
              onChange={e => setCotas(c => ({ ...c, intermediario: Number(e.target.value) || 0 }))}
              className="coord-filter-input" style={{ width: 60 }} />
          </Field>
          <Field label="Avançado">
            <input type="number" min={0} value={cotas.avancado}
              onChange={e => setCotas(c => ({ ...c, avancado: Number(e.target.value) || 0 }))}
              className="coord-filter-input" style={{ width: 60 }} />
          </Field>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <input type="checkbox" checked={permitirExtremos}
              onChange={e => setPermitirExtremos(e.target.checked)} />
            Permitir 0% / 100%
          </label>
          <button className="filter-btn filter-btn--active" onClick={() => { setGerado(true); reset() }}>
            Gerar sugestão
          </button>
          <button className="filter-btn" onClick={reset}>Resetar ajustes</button>
          <button className="filter-btn" onClick={exportarCSV} disabled={!lista.length}>Exportar CSV</button>
        </div>
      </div>

      {!gerado && (
        <p className="status-muted">
          Ajuste os parâmetros e clique em <b>Gerar sugestão</b> para que o sistema
          escolha as melhores questões com base nas respostas reais (dificuldade + discriminação).
        </p>
      )}

      {gerado && (
        <>
          {!lista.length && (
            <p className="status-muted">
              Não há questões suficientes com a configuração atual. Tente baixar “Mín. respostas”.
            </p>
          )}
          {!!lista.length && (
            <div className="portal-table-wrapper">
              <table className="portal-table">
                <thead>
                  <tr>
                    <th className="center">#</th>
                    <th className="center">ID</th>
                    <th className="center">Nível</th>
                    <th>Enunciado</th>
                    <th className="center">Resp.</th>
                    <th className="center">Taxa</th>
                    <th className="center" title="Índice de discriminação">D</th>
                    <th className="center">Classif.</th>
                    <th className="center">Gabarito</th>
                    <th className="center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {lista.map((q, i) => (
                    <tr key={q.id}>
                      <td className="center">{i + 1}</td>
                      <td className="center">{q.id}</td>
                      <td className="center">
                        <span className={`qg-level-badge qg-level-badge--${q.nivel}`} style={{ fontSize: 10, padding: '2px 6px' }}>
                          {q.nivel}
                        </span>
                      </td>
                      <td title={q.enunciado}>
                        {q.enunciado.length > 90 ? q.enunciado.slice(0, 90) + '...' : q.enunciado}
                      </td>
                      <td className="center">{q.total}</td>
                      <td className="center" style={{ fontWeight: 700 }}>{q.taxa}%</td>
                      <td className="center" title={describeDiscrimination(q.discriminacao)}>
                        {q.discriminacao == null ? '—' : q.discriminacao.toFixed(2)}
                      </td>
                      <td className="center" style={{ fontSize: 11 }}>{CLASS_LABEL[q.classificacao]}</td>
                      <td className="center" style={{ fontWeight: 700, color: 'var(--success)' }}>{q.gabarito}</td>
                      <td className="center" style={{ whiteSpace: 'nowrap' }}>
                        <button className="filter-btn" style={{ padding: '2px 8px', fontSize: 11 }} onClick={() => substituir(q)}>↻</button>
                        <button className="filter-btn" style={{ padding: '2px 8px', fontSize: 11, marginLeft: 4 }} onClick={() => remover(q)}>✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="status-muted" style={{ fontSize: 12, marginTop: 12 }}>
            Parâmetros aplicados — N_min: {sugestao.parametros.minRespostas},
            cotas: {sugestao.parametros.cotas.basico}/{sugestao.parametros.cotas.intermediario}/{sugestao.parametros.cotas.avancado},
            extremos: {sugestao.parametros.permitirExtremos ? 'sim' : 'não'}.
            Score = 0,4 · proximidade de 60% + 0,6 · discriminação.
          </p>
        </>
      )}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="coord-filter-field">
      <label className="coord-filter-label">{label}</label>
      {children}
    </div>
  )
}
