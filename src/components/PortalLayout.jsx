import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import ThemeToggle from './ThemeToggle'

const ROLE_LABELS = {
  admin: 'Admin',
  avaliador: 'Avaliador',
  coordenacao: 'Coord.',
  aluno: 'Aluno',
}

export default function PortalLayout({ children }) {
  const { displayName, role, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    try {
      await signOut()
    } catch (err) {
      console.error('Erro ao sair:', err.message)
    } finally {
      navigate('/login', { replace: true })
    }
  }

  return (
    <div className="portal-page">
      <header className="header">
        <span className="header-emblem">🔥</span>
        <div className="header-titles">
          <span className="header-org">CBMAP — CFSD-26</span>
          <span className="header-title">Portal de Avaliações</span>
          <span className="header-subtitle">Salvamento Terrestre</span>
        </div>
        <div className="header-spacer" />
        <ThemeToggle />
        {displayName && (
          <div className="header-user-info">
            <span className="header-user-name">{displayName}</span>
            {role && (
              <span className="header-role-tag">{ROLE_LABELS[role] ?? role}</span>
            )}
          </div>
        )}
        <button onClick={handleSignOut} className="btn btn-danger-on-header btn-sm">
          Sair
        </button>
      </header>

      <main className="portal-content">
        <div className="portal-content-inner">
          {children}
        </div>
      </main>
    </div>
  )
}
