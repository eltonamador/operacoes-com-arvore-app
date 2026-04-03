import { useMemo } from 'react'
import { SECTIONS } from '../data/penalties'

export default function Signature({
  state,
  setVistoNomeConfirmacao,
  setDeclaracaoCiencia,
  confirmarVisto,
  goTo,
}) {
  const { studentData, checkedItems, criticalErrors, observations, customError, vistoNomeConfirmacao, declaracaoCiencia } = state

  // Calcular desconto total
  const penaltyItems = useMemo(() => {
    const items = []
    SECTIONS.forEach(section => {
      section.items.forEach(item => {
        if (checkedItems.has(item.id)) {
          items.push({ ...item, section: section.id })
        }
      })
    })
    return items
  }, [checkedItems])

  const totalDiscount = penaltyItems.reduce((sum, item) => sum + item.discount, 0) + (customError.discount ? Number(customError.discount) : 0)
  const finalScore = Math.max(0, 10 - totalDiscount)
  const isPassing = finalScore >= 6.0
  const hasCustomError = customError.description && customError.discount

  // Validar: checkbox marcado E nome preenchido
  const isConfirmationValid = declaracaoCiencia && vistoNomeConfirmacao.trim() !== ''

  function handleConfirmVisto() {
    if (!isConfirmationValid) return
    confirmarVisto()
    goTo('summary')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Header */}
      <header className="header">
        <div className="header-emblem">🔥</div>
        <div className="header-titles">
          <span className="header-org">CBMAP – Corpo de Bombeiros Militar do Amapá</span>
          <span className="header-title">Operações de Corte de Árvore com Motosserra</span>
          <span className="header-subtitle">Ciência do Resultado – CFSD 2026</span>
        </div>
        <div className="header-spacer" />
        <div className="header-badge">CFSD 2026</div>
      </header>

      {/* Content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          overflow: 'auto',
        }}
      >
        <div
          style={{
            background: 'var(--bg-card)',
            borderRadius: 14,
            border: '1px solid #2a2a2a',
            padding: '32px 40px',
            width: '100%',
            maxWidth: 800,
            boxShadow: 'var(--shadow)',
          }}
        >
          {/* Título */}
          <div style={{ marginBottom: 28 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 2,
                color: 'var(--gold)',
                textTransform: 'uppercase',
                marginBottom: 6,
              }}
            >
              Confirmação de Resultados
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Visto de Prova – Ciência do Resultado
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 6 }}>
              Confira os dados da avaliação e confirme sua ciência do resultado.
            </p>
          </div>

          {/* Resumo de Dados do Aluno */}
          <div
            style={{
              background: '#161616',
              borderRadius: 8,
              border: '1px solid #2a2a2a',
              padding: '20px',
              marginBottom: 24,
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>ALUNO</span>
              <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: '4px 0 0 0' }}>
                {studentData.nome}
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '16px',
                marginBottom: 16,
              }}
            >
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Nº</span>
                <p style={{ fontSize: 14, color: 'var(--text-primary)', margin: '4px 0 0 0' }}>
                  {studentData.ordem}
                </p>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>PELOTÃO</span>
                <p style={{ fontSize: 14, color: 'var(--text-primary)', margin: '4px 0 0 0' }}>
                  {studentData.pelotao}
                </p>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>DATA</span>
                <p style={{ fontSize: 14, color: 'var(--text-primary)', margin: '4px 0 0 0' }}>
                  {new Date(studentData.data).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
              }}
            >
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>AVALIADOR</span>
                <p style={{ fontSize: 14, color: 'var(--text-primary)', margin: '4px 0 0 0' }}>
                  {studentData.avaliador}
                </p>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>DATA/HORA AVALIAÇÃO</span>
                <p style={{ fontSize: 14, color: 'var(--text-primary)', margin: '4px 0 0 0' }}>
                  {new Date(studentData.data).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </div>

          {/* Resultado Final */}
          <div
            style={{
              background: isPassing ? 'rgba(34, 197, 94, 0.1)' : 'rgba(220, 38, 38, 0.1)',
              border: `2px solid ${isPassing ? '#22c55e' : '#dc2626'}`,
              borderRadius: 8,
              padding: '20px',
              marginBottom: 24,
              textAlign: 'center',
            }}
          >
            <div style={{ marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>NOTA FINAL</span>
            </div>
            <div style={{ fontSize: 48, fontWeight: 900, color: isPassing ? '#22c55e' : '#dc2626', marginBottom: 12 }}>
              {finalScore.toFixed(2)}
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: isPassing ? '#22c55e' : '#dc2626',
              }}
            >
              {isPassing ? 'APROVADO' : 'REPROVADO'}
            </div>

            {criticalErrors && (
              <div
                style={{
                  marginTop: 16,
                  padding: '12px',
                  background: 'rgba(220, 38, 38, 0.2)',
                  borderRadius: 6,
                  fontSize: 13,
                  color: '#ff6b6b',
                  fontWeight: 600,
                }}
              >
                ⚠️ ERROS CRÍTICOS REGISTRADOS – Etapa 1
              </div>
            )}
          </div>

          {/* Resumo de Penalidades */}
          {penaltyItems.length > 0 || hasCustomError ? (
            <div
              style={{
                background: '#1a1a1a',
                borderRadius: 8,
                border: '1px solid #2a2a2a',
                padding: '16px',
                marginBottom: 24,
              }}
            >
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>ITENS PENALIZADOS</span>
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {penaltyItems.map(item => (
                  <div key={item.id} style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    <span style={{ fontWeight: 600, color: '#ff6b6b' }}>−{item.discount.toFixed(2)}</span>
                    {' — '}
                    {item.description}
                  </div>
                ))}
                {hasCustomError && (
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    <span style={{ fontWeight: 600, color: '#ff6b6b' }}>−{Number(customError.discount).toFixed(2)}</span>
                    {' — '}
                    {customError.description}
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Observações */}
          {observations && (
            <div
              style={{
                background: '#1a1a1a',
                borderRadius: 8,
                border: '1px solid #2a2a2a',
                padding: '16px',
                marginBottom: 24,
              }}
            >
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>OBSERVAÇÕES</span>
              <p
                style={{
                  fontSize: 13,
                  color: 'var(--text-secondary)',
                  margin: '8px 0 0 0',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {observations}
              </p>
            </div>
          )}

          {/* Declaração de Ciência */}
          <div
            style={{
              background: 'rgba(255, 215, 0, 0.08)',
              border: '1px solid #3a2a00',
              borderRadius: 8,
              padding: '20px',
              marginBottom: 24,
            }}
          >
            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={declaracaoCiencia}
                onChange={e => setDeclaracaoCiencia(e.target.checked)}
                style={{
                  width: 24,
                  height: 24,
                  minWidth: 24,
                  marginTop: 2,
                  cursor: 'pointer',
                  accent: 'var(--gold)',
                }}
              />
              <span
                style={{
                  fontSize: 14,
                  color: 'var(--text-primary)',
                  lineHeight: 1.6,
                }}
              >
                <strong>Declaro que conferi os erros registrados nesta avaliação e tomei ciência da nota atribuída.</strong>
              </span>
            </label>
          </div>

          {/* Campo de Confirmação */}
          <div
            style={{
              background: '#161616',
              border: '1px solid #2a2a2a',
              borderRadius: 8,
              padding: '20px',
              marginBottom: 28,
            }}
          >
            <label className="form-label">Nome para Confirmação</label>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 12px 0' }}>
              Digite seu nome completo para confirmar a ciência do resultado:
            </p>
            <input
              type="text"
              className="form-input"
              placeholder="Digite seu nome completo..."
              value={vistoNomeConfirmacao}
              onChange={e => setVistoNomeConfirmacao(e.target.value)}
              style={{ textTransform: 'uppercase' }}
            />
          </div>

          {/* Botões */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
            }}
          >
            <button
              className="btn btn-secondary btn-lg"
              onClick={() => goTo('evaluation')}
              style={{ width: '100%' }}
            >
              ← Voltar
            </button>
            <button
              className="btn btn-primary btn-lg"
              onClick={handleConfirmVisto}
              disabled={!isConfirmationValid}
              style={{
                width: '100%',
                opacity: isConfirmationValid ? 1 : 0.5,
                cursor: isConfirmationValid ? 'pointer' : 'not-allowed',
              }}
            >
              Confirmar e Continuar →
            </button>
          </div>

          {/* Dica de Validação */}
          {!isConfirmationValid && (
            <div
              style={{
                marginTop: 16,
                padding: '12px',
                background: 'rgba(220, 38, 38, 0.1)',
                borderRadius: 6,
                fontSize: 13,
                color: '#ff6b6b',
                textAlign: 'center',
              }}
            >
              ✓ Marque a declaração e digite seu nome para continuar.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
