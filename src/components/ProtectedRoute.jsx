import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

/**
 * Protege uma rota por autenticação e, opcionalmente, por perfil (role).
 *
 * Props:
 *   children   — elemento a renderizar se autorizado
 *   roles      — array de roles permitidas (e.g. ['avaliador', 'admin'])
 *                omitir ou passar [] para exigir apenas autenticação, sem restrição de role
 *
 * Comportamento:
 *   - carregando sessão    → exibe tela de carregamento (evita flash de redirect)
 *   - loading > 5s         → exibe botão "Tentar novamente" (saída de emergência)
 *   - não autenticado      → redireciona para /login
 *   - role não permitida   → redireciona para / (acesso negado)
 *   - autorizado           → renderiza children
 */
export default function ProtectedRoute({ children, roles = [] }) {
  const { session, role, loading } = useAuth()
  const [showRetry, setShowRetry] = useState(false)

  useEffect(() => {
    if (!loading) {
      setShowRetry(false)
      return
    }

    // Se loading demorar mais de 5s, exibir botão de emergência
    const timer = setTimeout(() => setShowRetry(true), 5000)
    return () => clearTimeout(timer)
  }, [loading])

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        background: '#0f0f0f',
        color: '#aaaaaa',
        fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
        fontSize: '15px',
        letterSpacing: '0.5px',
      }}>
        {/* Spinner animado */}
        <div style={{
          width: '36px',
          height: '36px',
          border: '3px solid #333',
          borderTopColor: '#FFD700',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />

        <span>Conectando ao servidor...</span>

        {showRetry && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            marginTop: '8px',
          }}>
            <span style={{ fontSize: '13px', color: '#666' }}>
              A conexão está demorando mais que o esperado.
            </span>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 24px',
                borderRadius: '8px',
                border: '1px solid #FFD700',
                background: 'transparent',
                color: '#FFD700',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: '0.5px',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,215,0,0.1)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Keyframes inline para o spinner */}
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (roles.length > 0 && !roles.includes(role) && role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return children
}
