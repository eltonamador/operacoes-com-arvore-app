import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ROLE_DEFAULT_ROUTE = {
  avaliador: '/avaliador',
  coordenacao: '/coordenacao',
  aluno: '/aluno',
  admin: '/',
}

export default function Login() {
  const { signIn, role, loading } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Redireciona quando AuthContext terminar de carregar sessão + perfil.
  // Cobre dois casos: login bem-sucedido E usuário já autenticado visitando /login.
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
      // Não navegar aqui. O useEffect acima dispara quando AuthContext
      // terminar fetchProfile e setar role — garantindo que session e
      // profile já estão prontos quando ProtectedRoute verificar.
    } catch (err) {
      setError('E-mail ou senha inválidos.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Portal de Avaliações</h1>
        <p style={styles.subtitle}>CBMAP — Salvamento Terrestre</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            E-mail
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={styles.input}
            />
          </label>

          <label style={styles.label}>
            Senha
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={styles.input}
            />
          </label>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" disabled={submitting} style={styles.button}>
            {submitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f2f5',
    fontFamily: 'sans-serif',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
    padding: '40px 36px',
    width: '100%',
    maxWidth: '380px',
  },
  title: {
    margin: '0 0 4px',
    fontSize: '22px',
    color: '#1a1a2e',
  },
  subtitle: {
    margin: '0 0 28px',
    fontSize: '13px',
    color: '#888',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    fontSize: '14px',
    color: '#333',
  },
  input: {
    padding: '10px 12px',
    fontSize: '15px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    outline: 'none',
  },
  error: {
    margin: '0',
    fontSize: '13px',
    color: '#c0392b',
  },
  button: {
    marginTop: '4px',
    padding: '12px',
    fontSize: '15px',
    fontWeight: '600',
    backgroundColor: '#1a1a2e',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
}
