import { useRef, useEffect, useState } from 'react'

export default function Signature({ state, setSignature, goTo }) {
  const canvasRef = useRef(null)
  const [isEmpty, setIsEmpty] = useState(true)
  const drawing = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
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
    return {
      x: (src.clientX - rect.left) * scaleX,
      y: (src.clientY - rect.top) * scaleY,
    }
  }

  function startDrawing(e) {
    e.preventDefault()
    drawing.current = true
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const pos = getPos(e, canvas)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
    setIsEmpty(false)
  }

  function draw(e) {
    e.preventDefault()
    if (!drawing.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const pos = getPos(e, canvas)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
  }

  function stopDrawing(e) {
    e.preventDefault()
    drawing.current = false
  }

  function clear() {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setIsEmpty(true)
  }

  function confirm() {
    const canvas = canvasRef.current
    setSignature(canvas.toDataURL('image/png'))
    goTo('summary')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Header */}
      <header className="header">
        <div className="header-emblem">🔥</div>
        <div className="header-titles">
          <span className="header-org">CBMAP</span>
          <span className="header-title">Assinatura Digital do Aluno</span>
          <span className="header-subtitle">
            {state.studentData.nome || '—'} &nbsp;|&nbsp; Ord. {state.studentData.ordem || '—'}
          </span>
        </div>
        <div className="header-spacer" />
        <button
          className="btn btn-secondary"
          style={{ fontSize: 13, padding: '10px 18px', minHeight: 44 }}
          onClick={() => goTo('evaluation')}
        >
          ← Voltar
        </button>
      </header>

      {/* Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px 32px',
        gap: 32,
      }}>

        {/* Left instructions */}
        <div style={{
          width: 240,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid #2a2a2a',
            borderRadius: 'var(--radius)',
            padding: '20px',
          }}>
            <div style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 2,
              color: 'var(--gold)',
              textTransform: 'uppercase',
              marginBottom: 12,
            }}>
              Instrução
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              O aluno deve assinar na área ao lado usando o dedo ou a caneta stylus.
            </p>
            <hr className="divider" style={{ margin: '14px 0' }} />
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              A assinatura confirmará a ciência dos resultados registrados nesta avaliação.
            </p>
          </div>

          {/* Student info recap */}
          <div style={{
            background: '#1a1200',
            border: '1px solid #3a2a00',
            borderRadius: 'var(--radius)',
            padding: '16px',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'var(--gold)', marginBottom: 10, textTransform: 'uppercase' }}>
              Aluno
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
              {state.studentData.nome || '—'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Ord. {state.studentData.ordem} &nbsp;|&nbsp; {state.studentData.pelotao}
            </div>
          </div>
        </div>

        {/* Canvas area */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          maxWidth: 700,
        }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
            Assine dentro da área abaixo
          </div>

          <div className="sig-canvas-wrapper" style={{ position: 'relative' }}>
            <canvas
              ref={canvasRef}
              className="sig-canvas"
              width={680}
              height={280}
              style={{ width: '100%', height: 280 }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            {isEmpty && (
              <div className="sig-placeholder">
                ✍ Assine aqui com o dedo
              </div>
            )}
          </div>

          {/* Line label */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              display: 'inline-block',
              borderTop: '1.5px solid #555',
              width: 300,
              paddingTop: 6,
              fontSize: 12,
              color: 'var(--text-muted)',
              letterSpacing: 1,
            }}>
              Assinatura do Aluno / Candidato
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button
              className="btn btn-danger"
              onClick={clear}
              style={{ minWidth: 140 }}
            >
              ✕ Limpar
            </button>
            <button
              className="btn btn-gold btn-lg"
              onClick={confirm}
              disabled={isEmpty}
              style={{ minWidth: 220 }}
            >
              Confirmar Assinatura ✓
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
