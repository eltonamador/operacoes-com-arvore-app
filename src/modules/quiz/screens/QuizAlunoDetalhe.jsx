function fmtDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function normalize(str) {
  return (str || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

export default function QuizAlunoDetalhe({ ranking, detail, selectedKey, onSelect, filtroBusca }) {
  const listaFiltrada = filtroBusca?.trim()
    ? ranking.filter(s => normalize(s.nome).includes(normalize(filtroBusca)))
    : ranking

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
      {/* Lista lateral */}
      <div style={{ flex: '0 0 260px', minWidth: 220 }}>
        <p className="status-muted" style={{ marginBottom: 8 }}>
          {listaFiltrada.length} aluno(s) — selecione um
        </p>
        <div style={{
          maxHeight: 520,
          overflowY: 'auto',
          border: '1px solid var(--border, rgba(255,255,255,0.08))',
          borderRadius: 8,
        }}>
          {listaFiltrada.map(s => {
            const active = s.numero_ordem === selectedKey
            return (
              <button
                key={s.numero_ordem || s.nome}
                onClick={() => onSelect(s.numero_ordem)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 10px',
                  background: active ? 'var(--surface-2, rgba(255,255,255,0.06))' : 'transparent',
                  border: 'none',
                  borderBottom: '1px solid var(--border, rgba(255,255,255,0.06))',
                  color: 'inherit',
                  cursor: 'pointer',
                  fontSize: 13,
                }}>
                <div style={{ fontWeight: 600 }}>{s.posicao}º · {s.nome}</div>
                <div style={{ fontSize: 11, opacity: 0.7 }}>
                  {s.pelotao} · {s.tentativas} tent · {s.percentualGeral}%
                </div>
              </button>
            )
          })}
          {!listaFiltrada.length && (
            <p className="status-muted" style={{ padding: 12 }}>Nenhum aluno.</p>
          )}
        </div>
      </div>

      {/* Detalhe */}
      <div style={{ flex: '1 1 360px', minWidth: 280 }}>
        {!detail && (
          <div className="status-muted" style={{ padding: 12 }}>
            Selecione um aluno para ver os detalhes.
          </div>
        )}
        {detail && (
          <div>
            <h3 style={{ margin: '0 0 4px' }}>{detail.nome}</h3>
            <p className="status-muted" style={{ marginTop: 0 }}>
              {detail.pelotao} · Nº {detail.numero_ordem}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, margin: '12px 0' }}>
              <Mini label="Tentativas" v={detail.tentativas} />
              <Mini label="Acertos" v={detail.acertos} c="var(--success)" />
              <Mini label="Erros" v={detail.erros} c="var(--danger)" />
              <Mini label="% Geral" v={`${detail.percentualGeral}%`} />
              <Mini label="Melhor" v={`${detail.melhorPercentual}%`} />
              <Mini label="Média" v={`${detail.mediaPercentual}%`} />
              <Mini label="Última" v={fmtDate(detail.ultimaData)} />
            </div>

            {/* Evolução */}
            <h4 style={{ margin: '16px 0 6px' }}>Evolução por tentativa</h4>
            <div className="portal-table-wrapper">
              <table className="portal-table">
                <thead>
                  <tr>
                    <th className="center">#</th>
                    <th>Data</th>
                    <th>Nível</th>
                    <th className="center">Acertos</th>
                    <th className="center">%</th>
                    <th className="center">Pontos</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.evolucao.map(e => (
                    <tr key={e.ordem}>
                      <td className="center">{e.ordem}</td>
                      <td>{fmtDate(e.data)}</td>
                      <td>{e.nivel}</td>
                      <td className="center">{e.acertos}/{e.total}</td>
                      <td className="center" style={{ fontWeight: 700 }}>{e.percentual}%</td>
                      <td className="center">{e.pontuacao}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Desempenho por nível */}
            <h4 style={{ margin: '16px 0 6px' }}>Desempenho por nível</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {detail.porNivel.map(n => (
                <div key={n.nivel} style={{
                  flex: '1 1 140px',
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: 'var(--surface-2, rgba(255,255,255,0.04))',
                  border: '1px solid var(--border, rgba(255,255,255,0.08))',
                }}>
                  <div style={{ fontSize: 11, textTransform: 'uppercase', opacity: 0.7 }}>{n.nivel}</div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{n.taxa}%</div>
                  <div style={{ fontSize: 11, opacity: 0.7 }}>{n.acertos}/{n.total}</div>
                </div>
              ))}
            </div>
            {detail.melhorNivel && (
              <p className="status-muted" style={{ marginTop: 8, fontSize: 12 }}>
                Melhor em <b>{detail.melhorNivel.nivel}</b> ({detail.melhorNivel.taxa}%)
                {detail.piorNivel && detail.piorNivel.nivel !== detail.melhorNivel.nivel
                  ? <> · Pior em <b>{detail.piorNivel.nivel}</b> ({detail.piorNivel.taxa}%)</>
                  : null}
              </p>
            )}

            {/* Mais erradas e mais acertadas */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 16 }}>
              <ListaQuestoes title="Mais errou" items={detail.maisErradas} empty="Sem erros." />
              <ListaQuestoes title="Mais acertou" items={detail.maisAcertadas} empty="Sem acertos." />
            </div>

            {/* Respostas detalhadas */}
            <h4 style={{ margin: '20px 0 6px' }}>Respostas detalhadas ({detail.respostasDetalhadas.length})</h4>
            <div className="portal-table-wrapper">
              <table className="portal-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th className="center">ID</th>
                    <th>Questão</th>
                    <th className="center">Nível</th>
                    <th className="center">Marcou</th>
                    <th className="center">Correta</th>
                    <th className="center">Status</th>
                    <th className="center">Tempo</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.respostasDetalhadas.map((r, i) => (
                    <tr key={i}>
                      <td>{fmtDate(r.data)}</td>
                      <td className="center">{r.questao_id}</td>
                      <td title={r.enunciado}>
                        {r.enunciado.length > 60 ? r.enunciado.slice(0, 60) + '...' : r.enunciado}
                      </td>
                      <td className="center">{r.nivel}</td>
                      <td className="center">{r.resposta_marcada || '—'}</td>
                      <td className="center" style={{ fontWeight: 700 }}>{r.resposta_correta || '—'}</td>
                      <td className="center" style={{
                        fontWeight: 700,
                        color: r.acertou ? 'var(--success)' : 'var(--danger)',
                      }}>
                        {r.acertou ? '✓' : '✗'}
                      </td>
                      <td className="center">{r.tempo_gasto}s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Mini({ label, v, c }) {
  return (
    <div style={{
      flex: '0 1 auto',
      padding: '8px 12px',
      borderRadius: 6,
      background: 'var(--surface-2, rgba(255,255,255,0.04))',
      border: '1px solid var(--border, rgba(255,255,255,0.08))',
    }}>
      <div style={{ fontSize: 10, opacity: 0.7, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: c || 'inherit' }}>{v}</div>
    </div>
  )
}

function ListaQuestoes({ title, items, empty }) {
  return (
    <div style={{ flex: '1 1 280px', minWidth: 220 }}>
      <h4 style={{ margin: '0 0 6px' }}>{title}</h4>
      {!items.length && <p className="status-muted">{empty}</p>}
      {items.map(q => (
        <div key={q.id} style={{
          padding: '6px 8px',
          borderBottom: '1px solid var(--border, rgba(255,255,255,0.06))',
          fontSize: 13,
        }}>
          <div style={{ fontWeight: 600 }}>
            #{q.id} · {q.taxa}% acerto · {q.acertos}/{q.total}
          </div>
          <div style={{ opacity: 0.75, fontSize: 12 }}>
            {q.enunciado.length > 80 ? q.enunciado.slice(0, 80) + '...' : q.enunciado}
          </div>
        </div>
      ))}
    </div>
  )
}
