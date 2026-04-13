import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ROLE_DEFAULT_ROUTE = {
  avaliador: '/avaliador',
  coordenacao: '/coordenacao',
  aluno: '/aluno',
  admin: '/',
}

const EMBLEMA = '/Gemini_Generated_Image_3yvf043yvf043yvf.png'

export default function Login() {
  const { signIn, role, loading } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && role) {
      navigate(ROLE_DEFAULT_ROUTE[role] ?? '/', { replace: true })
    }
  }, [role, loading, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await signIn(email, password)
    } catch {
      setError('E-mail ou senha inválidos.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-page-root" style={s.page}>
      {/* Painel esquerdo — identidade */}
      <div className="login-brand-panel" style={s.brand}>
        <div style={s.emblemaWrap}>
          <img
            src={EMBLEMA}
            alt="Emblema Salvamento Terrestre"
            className="login-emblem"
            style={s.emblema}
          />
          {/* Anel decorativo */}
          <div className="login-emblem-ring" style={s.emblemaRing} />
        </div>

        <div style={s.brandTexts}>
          <span style={s.brandOrg}>CBMAP — CFSD-26</span>
          <h1 style={s.brandTitle}>Portal de Avaliações</h1>
          <p style={s.brandMotto}>"Seja forte e corajoso"</p>
        </div>
      </div>

      {/* Divisor vertical */}
      <div className="login-divider" style={s.divider} />

      {/* Painel direito — formulário */}
      <div className="login-form-panel" style={s.formPanel}>
        <div style={s.formCard}>
          <div style={s.formHeader}>
            <span style={s.formOrg}>Salvamento Terrestre</span>
            <h2 style={s.formTitle}>Acesso ao sistema</h2>
          </div>

          <form onSubmit={handleSubmit} style={s.form}>
            <div className="form-group">
              <label className="form-label">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="form-input"
                placeholder="seu@email.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Senha</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="form-input"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="status-error" style={{ margin: 0 }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-lg"
              style={{ marginTop: '8px', width: '100%' }}
            >
              {submitting ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

/* ===== ESTILOS ===== */
const s = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'stretch',
    background: 'radial-gradient(ellipse at 30% 50%, #1a0505 0%, #0d0d0d 55%, #050510 100%)',
    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
  },

  /* ── Painel de identidade ── */
  brand: {
    flex: '0 0 52%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '32px',
    padding: '48px 40px',
  },

  emblemaWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emblema: {
    width: '300px',
    height: '300px',
    objectFit: 'contain',
    borderRadius: '50%',
    /* reflexo sutil para realçar o acabamento metálico */
    filter: 'drop-shadow(0 0 40px rgba(200,200,200,0.18)) drop-shadow(0 8px 24px rgba(0,0,0,0.7))',
    position: 'relative',
    zIndex: 1,
  },

  emblemaRing: {
    position: 'absolute',
    width: '320px',
    height: '320px',
    borderRadius: '50%',
    border: '1.5px solid rgba(255,215,0,0.18)',
    boxShadow: '0 0 48px rgba(204,0,0,0.12), inset 0 0 48px rgba(204,0,0,0.06)',
    zIndex: 0,
  },

  brandTexts: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    textAlign: 'center',
  },

  brandOrg: {
    fontSize: '11px',
    fontWeight: 800,
    letterSpacing: '3px',
    color: 'var(--gold)',
    textTransform: 'uppercase',
  },

  brandTitle: {
    margin: 0,
    fontSize: '26px',
    fontWeight: 800,
    color: '#ffffff',
    letterSpacing: '-0.5px',
  },

  brandMotto: {
    margin: 0,
    fontSize: '13px',
    color: 'rgba(255,255,255,0.38)',
    fontStyle: 'italic',
    letterSpacing: '0.5px',
  },

  /* ── Divisor ── */
  divider: {
    width: '1px',
    background: 'linear-gradient(to bottom, transparent 0%, rgba(255,215,0,0.25) 30%, rgba(204,0,0,0.3) 70%, transparent 100%)',
    alignSelf: 'stretch',
    margin: '48px 0',
    flexShrink: 0,
  },

  /* ── Painel do formulário ── */
  formPanel: {
    flex: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 40px',
  },

  formCard: {
    width: '100%',
    maxWidth: '360px',
    display: 'flex',
    flexDirection: 'column',
    gap: '28px',
  },

  formHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },

  formOrg: {
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '2px',
    color: 'var(--gold)',
    textTransform: 'uppercase',
  },

  formTitle: {
    margin: 0,
    fontSize: '22px',
    fontWeight: 700,
    color: '#ffffff',
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
}
