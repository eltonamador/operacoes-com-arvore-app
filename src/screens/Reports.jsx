import { useRef, useEffect, useState } from 'react'

export default function Reports({ savedEvaluations, deleteEvaluation, clearAllEvaluations, goTo, reset }) {
  const sigCanvasRef = useRef(null)
  const [sigEmpty, setSigEmpty] = useState(true)
  const [sigDataUrl, setSigDataUrl] = useState(null)
  const drawing = useRef(false)
  const [confirmClear, setConfirmClear] = useState(false)

  const total = savedEvaluations.length
  const aprovados = savedEvaluations.filter(e => e.isPassing).length
  const reprovados = total - aprovados
  const media = total > 0
    ? (savedEvaluations.reduce((sum, e) => sum + e.finalScore, 0) / total)
    : 0

  function formatDate(dateStr) {
    if (!dateStr) return '—'
    try {
      const [y, m, d] = dateStr.split('-')
      return `${d}/${m}/${y}`
    } catch { return dateStr }
  }

  // ── Signature canvas ────────────────────────────────────────────
  useEffect(() => {
    const canvas = sigCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.strokeStyle = '#1a1a1a'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [])

  function getPos(e, canvas) {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const src = e.touches ? e.touches[0] : e
    return { x: (src.clientX - rect.left) * scaleX, y: (src.clientY - rect.top) * scaleY }
  }

  function sigStart(e) {
    e.preventDefault()
    drawing.current = true
    const canvas = sigCanvasRef.current
    const ctx = canvas.getContext('2d')
    const pos = getPos(e, canvas)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
    setSigEmpty(false)
    setSigDataUrl(null)
  }

  function sigDraw(e) {
    e.preventDefault()
    if (!drawing.current) return
    const canvas = sigCanvasRef.current
    const ctx = canvas.getContext('2d')
    const pos = getPos(e, canvas)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
  }

  function sigStop(e) {
    e.preventDefault()
    drawing.current = false
    if (!sigEmpty) setSigDataUrl(sigCanvasRef.current.toDataURL('image/png'))
  }

  function clearSig() {
    const canvas = sigCanvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setSigEmpty(true)
    setSigDataUrl(null)
  }

  // ── CSV Export ──────────────────────────────────────────────────
  function exportCSV() {
    const header = [
      'Nº', 'Nome do Aluno', 'Nº Ordem', 'Pelotão', 'Data', 'Avaliador',
      'Qtd Erros', 'Desconto Total', 'Nota Final', 'Resultado',
      'Erros Críticos', 'Erro Não Previsto', 'Desconto Extra', 'Observações',
    ]
    const rows = savedEvaluations.map((e, i) => [
      i + 1,
      e.studentData.nome,
      e.studentData.ordem,
      e.studentData.pelotao,
      formatDate(e.studentData.data),
      e.studentData.avaliador,
      e.checkedItems.length,
      e.totalDiscount.toFixed(2).replace('.', ','),
      e.finalScore.toFixed(2).replace('.', ','),
      e.isPassing ? 'APROVADO' : 'REPROVADO',
      e.criticalErrors ? 'SIM' : 'NÃO',
      e.customError?.description || '',
      e.customError?.discount ? String(e.customError.discount).replace('.', ',') : '',
      e.observations || '',
    ])
    const csv = [header, ...rows]
      .map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(';'))
      .join('\r\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `planilha_notas_cfsd2026_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Print ───────────────────────────────────────────────────────
  function handlePrint() {
    if (!sigEmpty && sigCanvasRef.current) {
      setSigDataUrl(sigCanvasRef.current.toDataURL('image/png'))
    }
    setTimeout(() => window.print(), 100)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

      {/* ── Header ── */}
      <header className="header no-print">
        <div className="header-emblem">🔥</div>
        <div className="header-titles">
          <span className="header-org">CBMAP – CFSD 2026</span>
          <span className="header-title">Relatório de Avaliações – Motosserra</span>
          <span className="header-subtitle">{total} avaliação(ões) registrada(s)</span>
        </div>
        <div className="header-spacer" />
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn btn-secondary"
            style={{ fontSize: 13, padding: '10px 18px', minHeight: 44 }}
            onClick={() => goTo('summary')}
          >
            ← Voltar
          </button>
          <button
            className="btn btn-secondary"
            style={{ fontSize: 13, padding: '10px 18px', minHeight: 44 }}
            onClick={handlePrint}
          >
            🖨 Imprimir
          </button>
          <button
            className="btn btn-gold"
            style={{ fontSize: 13, padding: '10px 18px', minHeight: 44 }}
            onClick={exportCSV}
            disabled={total === 0}
          >
            📥 Exportar CSV
          </button>
          <button
            className="btn btn-primary"
            style={{ fontSize: 13, padding: '10px 18px', minHeight: 44 }}
            onClick={reset}
          >
            + Nova Avaliação
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Print header (only visible when printing) */}
        <div className="print-only" style={{ display: 'none', textAlign: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: '2px solid #000' }}>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>
            Corpo de Bombeiros Militar do Amapá – CBMAP
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, marginTop: 8 }}>
            Planilha de Notas – Operações de Corte de Árvore com Motosserra
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>CFSD 2026</div>
          <div style={{ fontSize: 11, marginTop: 8, color: '#555' }}>
            Emitido em: {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        {/* Stats row */}
        {total > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[
              { label: 'Total Avaliados', value: total, color: 'var(--gold)' },
              { label: 'Aprovados', value: aprovados, color: '#4CAF50' },
              { label: 'Reprovados', value: reprovados, color: 'var(--red-light)' },
              { label: 'Média da Turma', value: media.toFixed(2).replace('.', ','), color: media >= 7 ? 'var(--gold)' : 'var(--red-light)' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '14px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  {label}
                </span>
                <span style={{ fontSize: 28, fontWeight: 900, color, lineHeight: 1 }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Grade table */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'var(--gold)', textTransform: 'uppercase' }}>
              Planilha de Notas
            </span>
            {total > 0 && (
              <button
                className="btn btn-danger no-print"
                style={{ marginLeft: 'auto', fontSize: 11, padding: '6px 12px', minHeight: 32 }}
                onClick={() => setConfirmClear(true)}
              >
                Limpar Tudo
              </button>
            )}
          </div>

          {confirmClear && (
            <div style={{
              background: '#1a0000',
              border: '1px solid var(--red)',
              borderRadius: 8,
              padding: '12px 16px',
              margin: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}>
              <span style={{ fontSize: 13, color: '#ff8888', flex: 1 }}>
                ⚠ Remover TODAS as avaliações? Esta ação não pode ser desfeita.
              </span>
              <button className="btn btn-danger" style={{ fontSize: 12, padding: '8px 16px', minHeight: 36 }}
                onClick={() => { clearAllEvaluations(); setConfirmClear(false) }}>
                Confirmar
              </button>
              <button className="btn btn-secondary" style={{ fontSize: 12, padding: '8px 16px', minHeight: 36 }}
                onClick={() => setConfirmClear(false)}>
                Cancelar
              </button>
            </div>
          )}

          {total === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14, fontStyle: 'italic' }}>
              Nenhuma avaliação salva ainda. Finalize uma avaliação e clique em "Salvar e Ver Relatório".
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: 13,
              }}>
                <thead>
                  <tr style={{ background: '#161616', borderBottom: '2px solid var(--red)' }}>
                    {['Nº', 'Nome do Aluno', 'Ord.', 'Pelotão', 'Data', 'Avaliador', 'Erros', 'Desconto', 'Nota Final', 'Resultado', 'Assinatura do Aluno', ''].map(h => (
                      <th key={h} style={{
                        padding: '10px 12px',
                        textAlign: h === 'Nota Final' ? 'center' : 'left',
                        color: 'var(--gold)',
                        fontWeight: 700,
                        fontSize: 11,
                        letterSpacing: 1,
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                        minWidth: h === 'Assinatura do Aluno' ? 100 : undefined,
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {savedEvaluations.map((e, idx) => (
                    <tr key={e.id} style={{
                      borderBottom: '1px solid #222',
                      background: idx % 2 === 0 ? 'transparent' : '#181818',
                      verticalAlign: 'middle',
                    }}>
                      <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 700 }}>{idx + 1}</td>
                      <td style={{ padding: '10px 12px', color: '#fff', fontWeight: 600, minWidth: 160 }}>{e.studentData.nome}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{e.studentData.ordem}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{e.studentData.pelotao}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{formatDate(e.studentData.data)}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', minWidth: 130 }}>{e.studentData.avaliador}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                        {e.checkedItems.length}
                        {e.customError?.description ? ' +1' : ''}
                      </td>
                      <td style={{ padding: '10px 12px', color: 'var(--red-light)', fontWeight: 700, textAlign: 'center' }}>
                        {e.totalDiscount > 0 ? `–${e.totalDiscount.toFixed(2).replace('.', ',')}` : '—'}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <span style={{
                          fontSize: 17,
                          fontWeight: 900,
                          color: e.isPassing ? 'var(--gold)' : 'var(--red-light)',
                        }}>
                          {e.finalScore.toFixed(2).replace('.', ',')}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: 0.5,
                          background: e.isPassing ? '#0a2a00' : '#2a0000',
                          color: e.isPassing ? '#4CAF50' : 'var(--red-light)',
                          border: `1px solid ${e.isPassing ? '#4CAF50' : 'var(--red)'}`,
                          whiteSpace: 'nowrap',
                        }}>
                          {e.isPassing ? '✓ APROVADO' : '✗ REPROVADO'}
                        </span>
                        {e.criticalErrors && (
                          <span style={{ display: 'block', fontSize: 10, color: '#ff8888', marginTop: 3 }}>⚠ Erros críticos</span>
                        )}
                      </td>
                      <td style={{ padding: '6px 8px', textAlign: 'center', minWidth: 100 }}>
                        {e.signatureDataUrl ? (
                          <img
                            src={e.signatureDataUrl}
                            alt="Assinatura"
                            style={{ maxHeight: 50, maxWidth: 90, objectFit: 'contain', border: '1px solid #333', borderRadius: 4 }}
                          />
                        ) : (
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '6px 8px' }} className="no-print">
                        <button
                          onClick={() => deleteEvaluation(e.id)}
                          style={{
                            background: 'transparent',
                            border: '1px solid #3a1a1a',
                            borderRadius: 6,
                            color: '#666',
                            cursor: 'pointer',
                            padding: '4px 8px',
                            fontSize: 12,
                            transition: 'all 0.15s',
                          }}
                          title="Remover esta avaliação"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {total > 1 && (
                  <tfoot>
                    <tr style={{ borderTop: '2px solid var(--red)', background: '#161616' }}>
                      <td colSpan={8} style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--gold)', fontSize: 12, letterSpacing: 1 }}>
                        MÉDIA DA TURMA
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <span style={{
                          fontSize: 17,
                          fontWeight: 900,
                          color: media >= 7 ? 'var(--gold)' : 'var(--red-light)',
                        }}>
                          {media.toFixed(2).replace('.', ',')}
                        </span>
                      </td>
                      <td colSpan={3} style={{ padding: '10px 12px', fontSize: 12, color: 'var(--text-muted)' }}>
                        {aprovados}/{total} aprovados
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}
        </div>

        {/* ── Evaluator signature ── */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '16px 20px',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 14 }}>
            Assinatura do Responsável / Avaliador
          </div>
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              {/* Canvas for digital sig */}
              <div className="sig-canvas-wrapper no-print" style={{ position: 'relative' }}>
                <canvas
                  ref={sigCanvasRef}
                  className="sig-canvas"
                  width={600}
                  height={120}
                  style={{ width: '100%', height: 120 }}
                  onMouseDown={sigStart}
                  onMouseMove={sigDraw}
                  onMouseUp={sigStop}
                  onMouseLeave={sigStop}
                  onTouchStart={sigStart}
                  onTouchMove={sigDraw}
                  onTouchEnd={sigStop}
                />
                {sigEmpty && (
                  <div className="sig-placeholder">✍ Assine aqui com o dedo</div>
                )}
              </div>

              {/* Print version of signature */}
              {sigDataUrl ? (
                <div className="print-only" style={{ display: 'none', background: '#fafafa', padding: 8, borderRadius: 6 }}>
                  <img src={sigDataUrl} alt="Assinatura" style={{ maxHeight: 80, objectFit: 'contain' }} />
                </div>
              ) : (
                <div className="print-only" style={{ display: 'none', height: 80, borderBottom: '1.5px solid #000' }} />
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'center' }} className="no-print">
                <button className="btn btn-danger" style={{ fontSize: 12, padding: '7px 14px', minHeight: 36 }} onClick={clearSig}>
                  ✕ Limpar
                </button>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  {sigEmpty ? 'Campo em branco' : '✓ Assinatura registrada'}
                </span>
              </div>
            </div>

            {/* Identification fields for print */}
            <div style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: 10 }}>Nome / Posto / Graduação</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Ex: Cap. QOBM Silva"
                  style={{ fontSize: 13, padding: '9px 11px', minHeight: 40 }}
                  id="report-signer-name"
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: 10 }}>Função</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Ex: Instrutor de Motosserra"
                  style={{ fontSize: 13, padding: '9px 11px', minHeight: 40 }}
                  id="report-signer-role"
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: 10 }}>Data</label>
                <input
                  className="form-input"
                  type="date"
                  style={{ fontSize: 13, padding: '9px 11px', minHeight: 40, colorScheme: 'dark' }}
                  id="report-signer-date"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom padding */}
        <div style={{ height: 8 }} />
      </div>

      {/* Print styles injected inline */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white !important; color: black !important; font-size: 11pt; }
          .app-root { height: auto !important; overflow: visible !important; }
          header.header { display: none !important; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ccc; padding: 6px 8px; color: black !important; font-size: 10pt; }
          thead tr { background: #f0f0f0 !important; }
          tfoot tr { background: #f0f0f0 !important; font-weight: bold; }
          .score-panel, .critical-box { border: 1px solid #ccc !important; }
        }
      `}</style>
    </div>
  )
}
