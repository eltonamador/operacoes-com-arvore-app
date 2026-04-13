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
 *   - não autenticado      → redireciona para /login
 *   - role não permitida   → redireciona para / (acesso negado)
 *   - autorizado           → renderiza children
 */
export default function ProtectedRoute({ children, roles = [] }) {
  const { session, role, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f0f0f',
        color: '#aaaaaa',
        fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
        fontSize: '15px',
        letterSpacing: '0.5px',
      }}>
        Carregando...
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
