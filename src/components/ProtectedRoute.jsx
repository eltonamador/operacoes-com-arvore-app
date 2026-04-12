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
 *   - carregando sessão    → exibe indicador mínimo (evita flash de redirect)
 *   - não autenticado      → redireciona para /login
 *   - role não permitida   → redireciona para / (acesso negado)
 *   - autorizado           → renderiza children
 */
export default function ProtectedRoute({ children, roles = [] }) {
  const { session, role, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ padding: '32px', fontFamily: 'sans-serif', color: '#888' }}>
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
