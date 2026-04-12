import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ROLE_LABELS = {
  admin: 'Administrador',
  avaliador: 'Avaliador',
  coordenacao: 'Coordenação',
  aluno: 'Aluno',
}

export default function PortalLayout({ children, title }) {
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
    <div style={styles.wrapper}>
      {/* Header bar */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.portalName}>Portal de Avaliações — CBMAP</span>
        </div>
        <div style={styles.headerRight}>
          {displayName && (
            <span style={styles.userInfo}>
              {displayName}
              {role && (
                <span style={styles.roleTag}>
                  {ROLE_LABELS[role] ?? role}
                </span>
              )}
            </span>
          )}
          <button onClick={handleSignOut} style={styles.signOutBtn}>
            Sair
          </button>
        </div>
      </header>

      {/* Optional page title below header */}
      {title && (
        <div style={styles.titleBar}>
          <h1 style={styles.pageTitle}>{title}</h1>
        </div>
      )}

      {/* Page content */}
      <main style={styles.content}>
        {children}
      </main>
    </div>
  )
}

const styles = {
  wrapper: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    color: '#1a1a1a',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 24px',
    backgroundColor: '#ffffff',
    borderBottom: '2px solid #1a1a2e',
    flexShrink: 0,
    gap: '16px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  portalName: {
    fontSize: '17px',
    fontWeight: '700',
    color: '#1a1a2e',
    letterSpacing: '0.2px',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexShrink: 0,
  },
  userInfo: {
    fontSize: '14px',
    color: '#333',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  roleTag: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#ffffff',
    backgroundColor: '#1a1a2e',
    padding: '2px 8px',
    borderRadius: '3px',
    letterSpacing: '0.3px',
  },
  signOutBtn: {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '600',
    backgroundColor: '#ffffff',
    color: '#c0392b',
    border: '1.5px solid #c0392b',
    borderRadius: '5px',
    cursor: 'pointer',
    minHeight: '36px',
  },
  titleBar: {
    padding: '16px 24px 0 24px',
    backgroundColor: '#f5f5f5',
  },
  pageTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '700',
    color: '#1a1a2e',
  },
  content: {
    flex: 1,
    padding: '0',
  },
}
