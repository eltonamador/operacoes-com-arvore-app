import { calcScore, SECTIONS } from '../data/penalties'
import { useMemo, useState } from 'react'
import studentsData from '../data/students.json'

export default function Signature({ state, goTo, setVistoData }) {
  const [pinDigitado, setPinDigitado] = useState('')
  const [ciencia, setCiencia] = useState(state.declaracaoCiencia || false)
  const [erroPin, setErroPin] = useState('')
  const [tentativas, setTentativas] = useState(0)
  const [bloqueadoAte, setBloqueadoAte] = useState(null)

  const { studentData, checkedItems, criticalErrors, observations, customError } = state
  const customDiscount = parseFloat(customError?.discount) || 0
  const { totalDiscount, finalScore } = calcScore(checkedItems, customDiscount)
  const isPassing = finalScore >= 7.0 && !criticalErrors

  const students = studentsData?.students || []

  const alunoAtual = students.find(
    student => String(student.numero) === String(studentData.ordem)
  )

  const pinEsperado = alunoAtual
    ? String(alunoAtual.pin || String(alunoAtual.numero).padStart(4, '0'))
    : String(studentData.ordem || '').padStart(4, '0')

  const bloqueado = bloqueadoAte && Date.now() < bloqueadoAte

  const penalizedItems = useMemo(() => {
    const result = []
    for (const section of SECTIONS) {
      for (const item of section.items) {
        if (checkedItems.has(item.id)) {
          result.push(item)
        }
      }
    }
    if (customError?.description?.trim() && customDiscount > 0) {
      result.push({
        id: 'EXTRA',
        description: customError.description,
        discount: customDiscount,
      })
    }
    return result
  }, [checkedItems, customError, customDiscount])

  const canConfirm =
    ciencia &&
    pinDigitado.trim().length === 4 &&
    /^\d{4}$/.test(pinDigitado) &&
    !bloqueado

  function confirmarVisto() {
    if (bloqueado) {
      setErroPin('Muitas tentativas inválidas. Aguarde 30 segundos.')
      return
    }

    if (!canConfirm) return

    if (pinDigitado !== pinEsperado) {
      const novasTentativas = tentativas + 1
      setTentativas(novasTentativas)
      setErroPin('PIN inválido.')

      if (novasTentativas >= 3) {
        setBloqueadoAte(Date.now() + 30000)
        setErroPin('Muitas tentativas inválidas. Aguarde 30 segundos.')
        setTentativas(0)
      }

      return
    }

    setErroPin('')

    setVistoData({
      vistoConfirmado: true,
      vistoPinConfirmado: true,
      vistoDataHora: new Date().toISOString(),
      declaracaoCiencia: true,
      vistoTipo: 'pin',
    })

    goTo('summary')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <header className="header">
        <div className="header-emblem">✅</div>
        <div className="header-titles">
          <span className="header-org">CBMAP</span>
          <span className="header-title">Visto de Prova / Ciência do Resultado</span>
          <span className="header-subtitle">
            {studentData.nome || 'Aluno não informado'} | Ord. {studentData.ordem || '—'}
          </span>
        </div>
        <div className="header-spacer" />
        <button className="btn btn-secondary" onClick={() => goTo('evaluation')}>
          ← Voltar
        </button>
      </header>

      <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
        <div
          style={{
            maxWidth: 980,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1.1fr 1.4fr',
            gap: 24,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 14,
                padding: 20,
              }}
            >
              <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 700, marginBottom: 12 }}>
                Aluno
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>{studentData.nome || '—'}</div>
              <div style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                <div><strong>Nº:</strong> {studentData.ordem || '—'}</div>
                <div><strong>Pelotão:</strong> {studentData.pelotao || '—'}</div>
                <div><strong>Avaliador:</strong> {studentData.avaliador || '—'}</div>
                <div><strong>Data:</strong> {studentData.data || '—'}</div>
              </div>
            </div>

            <div
              style={{
                background: '#1a1200',
                border: '1px solid #3a2a00',
                borderRadius: 14,
                padding: 20,
              }}
            >
              <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 700, marginBottom: 12 }}>
                Resultado
              </div>
              <div style={{ fontSize: 36, fontWeight: 900, color: isPassing ? '#8ddf63' : '#ff6b6b' }}>
                {finalScore.toFixed(2).replace('.', ',')}
              </div>
              <div style={{ marginTop: 6, fontWeight: 700, color: isPassing ? '#8ddf63' : '#ff6b6b' }}>
                {isPassing ? 'APROVADO' : 'REPROVADO'}
              </div>
              <div style={{ marginTop: 10, color: 'var(--text-secondary)' }}>
                Total de descontos: {totalDiscount.toFixed(2).replace('.', ',')}
              </div>
              {criticalErrors && (
                <div style={{ marginTop: 10, color: '#ff6b6b', fontSize: 13 }}>
                  Há erros críticos registrados.
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 14,
                padding: 20,
              }}
            >
              <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 700, marginBottom: 12 }}>
                Erros / Penalidades
              </div>

              {penalizedItems.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Nenhum erro registrado.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {penalizedItems.map(item => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 12,
                        padding: '10px 12px',
                        border: '1px solid #2a2a2a',
                        borderRadius: 8,
                      }}
                    >
                      <span style={{ color: 'var(--text-primary)' }}>
                        <strong>{item.id}</strong> — {item.description}
                      </span>
                      <span style={{ color: 'var(--red-light)', fontWeight: 700 }}>
                        -{Number(item.discount).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {observations?.trim() && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Observações</div>
                  <div style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                    {observations}
                  </div>
                </div>
              )}
            </div>

            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 14,
                padding: 20,
              }}
            >
              <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 700, marginBottom: 16 }}>
                Confirmação de Ciência
              </div>

              <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 18, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={ciencia}
                  onChange={e => setCiencia(e.target.checked)}
                  style={{ marginTop: 4 }}
                />
                <span style={{ color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  Declaro que conferi os erros registrados nesta avaliação e tomei ciência da nota atribuída.
                </span>
              </label>

              <div className="form-group" style={{ marginBottom: 18 }}>
                <label className="form-label">Digite seu PIN de 4 dígitos</label>
                <input
                  className="form-input"
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pinDigitado}
                  onChange={e => {
                    const valor = e.target.value.replace(/\D/g, '')
                    setPinDigitado(valor)
                    setErroPin('')
                  }}
                  placeholder="Digite seu PIN"
                />
                {erroPin && (
                  <div style={{ marginTop: 8, fontSize: 12, color: '#ff6b6b' }}>
                    {erroPin}
                  </div>
                )}
                {bloqueado && (
                  <div style={{ marginTop: 8, fontSize: 12, color: '#ffbb44' }}>
                    Tente novamente em alguns segundos.
                  </div>
                )}
              </div>

              <button
                className="btn btn-gold"
                style={{ width: '100%', minHeight: 52, fontSize: 18, fontWeight: 800 }}
                disabled={!canConfirm}
                onClick={confirmarVisto}
              >
                Confirmar Visto ✓
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}