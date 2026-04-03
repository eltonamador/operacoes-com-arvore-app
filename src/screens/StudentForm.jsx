import { useState } from 'react'

export default function StudentForm({ state, updateStudentData, goTo }) {
  const [form, setForm] = useState(state.studentData)

  function handleChange(e) {
    const next = { ...form, [e.target.name]: e.target.value }
    setForm(next)
    updateStudentData(next)
  }

  const isValid = Object.values(form).every(v => v.trim() !== '')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Header */}
      <header className="header">
        <div className="header-emblem">🔥</div>
        <div className="header-titles">
          <span className="header-org">CBMAP – Corpo de Bombeiros Militar do Amapá</span>
          <span className="header-title">Operações de Corte de Árvore com Motosserra</span>
          <span className="header-subtitle">Ficha de Avaliação Prática – CFSD 2026</span>
        </div>
        <div className="header-spacer" />
        <div className="header-badge">CFSD 2026</div>
      </header>

      {/* Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        overflow: 'auto',
      }}>
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 14,
          border: '1px solid #2a2a2a',
          padding: '32px 40px',
          width: '100%',
          maxWidth: 720,
          boxShadow: 'var(--shadow)',
        }}>
          {/* Card header */}
          <div style={{ marginBottom: 28 }}>
            <div style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 2,
              color: 'var(--gold)',
              textTransform: 'uppercase',
              marginBottom: 6,
            }}>
              Identificação
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Dados do Aluno e Avaliador
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 6 }}>
              Preencha todos os campos antes de iniciar a avaliação.
            </p>
          </div>

          {/* Fields grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 28px', marginBottom: 28 }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Nome completo do aluno</label>
              <input
                className="form-input"
                type="text"
                name="nome"
                value={form.nome}
                onChange={handleChange}
                placeholder="Ex: João da Silva Pereira"
                autoComplete="off"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nº de Ordem</label>
              <input
                className="form-input"
                type="text"
                name="ordem"
                value={form.ordem}
                onChange={handleChange}
                placeholder="Ex: 001"
                autoComplete="off"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Data da Avaliação</label>
              <input
                className="form-input"
                type="date"
                name="data"
                value={form.data}
                onChange={handleChange}
                style={{ colorScheme: 'dark' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Pelotão</label>
              <input
                className="form-input"
                type="text"
                name="pelotao"
                value={form.pelotao}
                onChange={handleChange}
                placeholder="Ex: 1º Pelotão"
                autoComplete="off"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nome do Avaliador</label>
              <input
                className="form-input"
                type="text"
                name="avaliador"
                value={form.avaliador}
                onChange={handleChange}
                placeholder="Ex: Sgt. Pedro Souza"
                autoComplete="off"
              />
            </div>
          </div>

          {/* Info box */}
          <div style={{
            background: '#1a1200',
            border: '1px solid #3a2a00',
            borderRadius: 8,
            padding: '12px 16px',
            marginBottom: 24,
            fontSize: 13,
            color: '#ccaa44',
            lineHeight: 1.5,
          }}>
            <strong>ℹ Instruções:</strong> Após iniciar, marque cada erro cometido durante a avaliação.
            Os descontos são calculados automaticamente. Nota inicial: <strong>10,0</strong>.
          </div>

          {/* Button */}
          <button
            className="btn btn-primary btn-lg"
            onClick={() => goTo('evaluation')}
            disabled={!isValid}
            style={{ width: '100%' }}
          >
            Iniciar Avaliação →
          </button>
        </div>
      </div>
    </div>
  )
}
