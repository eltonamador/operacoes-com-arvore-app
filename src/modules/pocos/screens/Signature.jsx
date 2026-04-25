import { calcScore, SECTIONS } from '../data/penalties'
import { useMemo, useState } from 'react'
import studentsData from '../../shared/data/students.json'

/**
 * Tela de assinatura — Prova Poço (avaliação em grupo).
 *
 * Fluxo: cada integrante assina individualmente por PIN, um de cada vez.
 * O cursor (currentSignerIndex) avança a cada confirmação.
 * Quando todos assinaram, confirmMemberSignature() navega automaticamente para 'summary'.
 */
export default function Signature({ state, goTo, confirmMemberSignature }) {
  const [pinDigitado, setPinDigitado] = useState('')
  const [ciencia, setCiencia] = useState(false)
  const [erroPin, setErroPin] = useState('')
  const [tentativas, setTentativas] = useState(0)
  const [bloqueadoAte, setBloqueadoAte] = useState(null)

  const { groupData, checkedItems, itemQuantities = {}, observations, customError, currentSignerIndex } = state
  const integrantes = groupData.integrantes || []

  const currentMember = integrantes[currentSignerIndex] ?? null
  const totalMembers = integrantes.length
  const allSigned = currentSignerIndex >= totalMembers

  const customDiscount = parseFloat(customError?.discount) || 0
  const { totalDiscount, finalScore } = calcScore(checkedItems, customDiscount, itemQuantities)
  const isPassing = finalScore >= 7.0

  // Resolve o PIN do membro atual:
  // integrantes extras têm pin explícito; os demais buscam no students.json por id
  const studentsById = useMemo(() => {
    const map = {}
    for (const s of studentsData?.students || []) map[s.numero] = s
    return map
  }, [])

  const pinEsperado = useMemo(() => {
    if (!currentMember) return null
    if (currentMember.extra && currentMember.pin) return currentMember.pin
    const student = studentsById[Number(currentMember.id)]
    if (student?.pin) return String(student.pin)
    return String(currentMember.id).padStart(4, '0')
  }, [currentMember, studentsById])

  const penalizedItems = useMemo(() => {
    const result = []
    for (const section of SECTIONS) {
      for (const item of section.items) {
        if (checkedItems.has(item.id)) {
          const qty = item.perUnit ? (itemQuantities[item.id] || 1) : 1
          result.push({ ...item, qty, effectiveDiscount: item.discount * qty })
        }
      }
    }
    if (customError?.description?.trim() && customDiscount > 0) {
      result.push({ id: 'EXTRA', description: customError.description, discount: customDiscount, qty: 1, effectiveDiscount: customDiscount })
    }
    return result
  }, [checkedItems, itemQuantities, customError, customDiscount])

  const bloqueado = bloqueadoAte && Date.now() < bloqueadoAte
  const canConfirm =
    ciencia &&
    pinDigitado.trim().length === 4 &&
    /^\d{4}$/.test(pinDigitado) &&
    !bloqueado

  function handleConfirmar() {
    if (bloqueado) { setErroPin('Muitas tentativas inválidas. Aguarde 30 segundos.'); return }
    if (!canConfirm) return

    if (pinDigitado !== pinEsperado) {
      const novas = tentativas + 1
      setTentativas(novas)
      setErroPin('PIN inválido.')
      if (novas >= 3) {
        setBloqueadoAte(Date.now() + 30000)
        setErroPin('Muitas tentativas inválidas. Aguarde 30 segundos.')
        setTentativas(0)
      }
      return
    }

    // PIN correto: registra e avança (hook navega para 'summary' quando todos assinaram)
    setErroPin('')
    confirmMemberSignature(currentSignerIndex)

    // Reset do formulário de assinatura para o próximo membro
    setPinDigitado('')
    setCiencia(false)
    setTentativas(0)
    setBloqueadoAte(null)
  }

  // Segurança: se navegou aqui mas todos já assinaram
  if (allSigned) {
    return (
      <div className="screen-container">
        <div className="screen-content screen-content--centered">
          <div className="card" style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
              Todos os integrantes assinaram
            </div>
            <button className="btn btn-gold" onClick={() => goTo('summary')}>
              Ver Resultado →
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="screen-container">
      <header className="header">
        <div className="header-emblem">🕳️</div>
        <div className="header-titles">
          <span className="header-org">CBMAP</span>
          <span className="header-title">Visto de Prova / Ciência do Resultado</span>
          <span className="header-subtitle">
            {groupData.pelotao} — Grupo {groupData.grupoNum} &nbsp;|&nbsp;
            Assinatura {currentSignerIndex + 1} de {totalMembers}
          </span>
        </div>
        <div className="header-spacer" />
        <button className="btn btn-secondary" onClick={() => goTo('evaluation')}>
          ← Voltar
        </button>
      </header>

      <div className="screen-content">
        {/* Barra de progresso de assinaturas */}
        <div style={{ marginBottom: 20 }}>
          <div style={{
            display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8,
          }}>
            {integrantes.map((m, i) => (
              <div
                key={`${m.id}-${i}`}
                style={{
                  flex: '1 1 auto', minWidth: 60, maxWidth: 120,
                  padding: '6px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                  textAlign: 'center',
                  background: m.signed ? '#0d2e0d' : i === currentSignerIndex ? '#1a1200' : 'var(--bg-card)',
                  border: m.signed
                    ? '1px solid #22c55e'
                    : i === currentSignerIndex
                    ? '1px solid #cc8800'
                    : '1px solid var(--border)',
                  color: m.signed ? '#22c55e' : i === currentSignerIndex ? '#ffbb44' : 'var(--text-muted)',
                }}
              >
                {m.signed ? '✓' : i === currentSignerIndex ? '→' : '○'} {String(m.id).padStart(3, '0')}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {integrantes.filter(m => m.signed).length} de {totalMembers} assinaturas confirmadas
          </div>
        </div>

        <div className="visto-grid">
          {/* Coluna esquerda: resultado + penalidades */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              background: '#1a1200', border: '1px solid #3a2a00', borderRadius: 14, padding: 20,
            }}>
              <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 700, marginBottom: 12 }}>
                Resultado do Grupo
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
            </div>

            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 20,
            }}>
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
                    <div key={item.id} style={{
                      display: 'flex', justifyContent: 'space-between', gap: 12,
                      padding: '10px 12px', border: '1px solid #2a2a2a', borderRadius: 8,
                    }}>
                      <span style={{ color: 'var(--text-primary)' }}>
                        <strong>{item.id}</strong> — {item.description}
                      </span>
                      <span style={{ color: 'var(--red-light)', fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {item.qty > 1
                          ? `${item.qty} × -${item.discount.toFixed(2).replace('.', ',')} = -${item.effectiveDiscount.toFixed(2).replace('.', ',')}`
                          : `-${Number(item.effectiveDiscount).toFixed(2).replace('.', ',')}`
                        }
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
          </div>

          {/* Coluna direita: assinatura do membro atual */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Identificação do membro atual */}
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 20,
            }}>
              <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 700, marginBottom: 12 }}>
                Integrante — Confirmação de Ciência
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>
                {currentMember.nome}
              </div>
              <div style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                <div><strong>Nº:</strong> {currentMember.id}</div>
                <div><strong>Pelotão:</strong> {groupData.pelotao}</div>
                <div><strong>Grupo:</strong> {groupData.grupoNum}</div>
                {currentMember.extra && (
                  <div style={{ marginTop: 8 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: '#ffbb44',
                      background: '#2a1a00', border: '1px solid #cc8800',
                      borderRadius: 4, padding: '2px 8px', letterSpacing: 1,
                    }}>
                      INTEGRANTE EXTRA
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Formulário de assinatura */}
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 20,
            }}>
              <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 700, marginBottom: 16 }}>
                Assinatura por PIN
              </div>

              <label style={{
                display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 18, cursor: 'pointer',
              }}>
                <input
                  type="checkbox"
                  checked={ciencia}
                  onChange={e => setCiencia(e.target.checked)}
                  style={{ marginTop: 4 }}
                />
                <span style={{ color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  Declaro que conferi os erros registrados nesta avaliação e tomei ciência da nota atribuída ao grupo.
                </span>
              </label>

              <div className="form-group" style={{ marginBottom: 18 }}>
                <label className="form-label">PIN de 4 dígitos — <strong>{currentMember.nome}</strong></label>
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
                  <div style={{ marginTop: 8, fontSize: 12, color: '#ff6b6b' }}>{erroPin}</div>
                )}
                {bloqueado && (
                  <div style={{ marginTop: 8, fontSize: 12, color: '#ffbb44' }}>
                    Tente novamente em alguns segundos.
                  </div>
                )}
              </div>

              <button
                className="btn btn-gold"
                style={{ width: '100%', minHeight: 52, fontSize: 16, fontWeight: 800 }}
                disabled={!canConfirm}
                onClick={handleConfirmar}
              >
                {currentSignerIndex + 1 < totalMembers
                  ? `Confirmar Visto ✓  (próximo: ${integrantes[currentSignerIndex + 1]?.nome})`
                  : 'Confirmar Visto ✓  (último integrante)'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
