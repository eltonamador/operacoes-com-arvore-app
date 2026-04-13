import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import PortalLayout from '../components/PortalLayout'

export default function PortalHome() {
  const { displayName, role } = useAuth()

  const isAvaliador = role === 'avaliador' || role === 'admin'
  const isCoordenacao = role === 'coordenacao' || role === 'admin'
  const isAluno = role === 'aluno' || role === 'admin'

  return (
    <PortalLayout>
      {displayName && (
        <p style={{ margin: '0 0 20px', color: 'var(--text-secondary)', fontSize: '15px' }}>
          Bem-vindo, <strong style={{ color: 'var(--text-primary)' }}>{displayName}</strong>
        </p>
      )}
      <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
        Selecione a área de acesso
      </p>
      <nav className="portal-nav-grid">
        {isAvaliador && (
          <>
            <Link to="/avaliador" className="portal-nav-card">
              <h3 className="portal-nav-card-title">Área do Avaliador</h3>
              <p className="portal-nav-card-desc">Acesso aos módulos de avaliação prática</p>
            </Link>
          </>
        )}
        {isCoordenacao && (
          <Link to="/coordenacao" className="portal-nav-card">
            <h3 className="portal-nav-card-title">Área de Coordenação</h3>
            <p className="portal-nav-card-desc">Consulta consolidada de avaliações e resultados</p>
          </Link>
        )}
        {isAluno && (
          <Link to="/aluno" className="portal-nav-card">
            <h3 className="portal-nav-card-title">Área do Aluno</h3>
            <p className="portal-nav-card-desc">Consulta individual de avaliações e notas</p>
          </Link>
        )}
      </nav>
    </PortalLayout>
  )
}
