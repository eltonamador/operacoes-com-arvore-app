import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import PortalLayout from '../components/PortalLayout'

const MODULE_ICONS = {
  avaliador: '📋',
  coordenacao: '📊',
  aluno: '🎖️',
}

const ROLE_CARDS = [
  {
    role: 'avaliador',
    path: '/avaliador',
    title: 'Área do Avaliador',
    desc: 'Acesso aos módulos de avaliação prática',
    detail: 'Corte de Árv. · Escadas · Poço · Circuito · Teórica',
    emoji: '📋',
    accentColor: 'var(--red)',
  },
  {
    role: 'coordenacao',
    path: '/coordenacao',
    title: 'Área de Coordenação',
    desc: 'Consulta consolidada de avaliações e resultados',
    detail: 'Gráficos · Filtros · Exportação CSV/XLSX',
    emoji: '📊',
    accentColor: 'var(--gold)',
  },
  {
    role: 'aluno',
    path: '/aluno',
    title: 'Área do Aluno',
    desc: 'Consulta individual de avaliações e notas',
    detail: 'Histórico · Consolidação · Desempenho',
    emoji: '🎖️',
    accentColor: '#5b7fff',
  },
]

function hasAccess(role, cardRole) {
  if (role === 'admin') return true
  if (cardRole === 'avaliador') return role === 'avaliador'
  if (cardRole === 'coordenacao') return role === 'coordenacao'
  if (cardRole === 'aluno') return role === 'aluno'
  return false
}

export default function PortalHome() {
  const { displayName, role } = useAuth()

  const cards = ROLE_CARDS.filter((c) => hasAccess(role, c.role))

  return (
    <PortalLayout>
      <div style={{ marginBottom: '32px' }}>
        <p className="page-section-label">Portal de Avaliações</p>
        <h1 className="page-section-title">
          {displayName ? `Bem-vindo, ${displayName}` : 'Portal CBMAP'}
        </h1>
        <p className="page-section-desc">Selecione a área de acesso abaixo.</p>
      </div>

      <nav className="portal-home-grid">
        {cards.map((card) => (
          <Link key={card.role} to={card.path} className="portal-home-card">
            <div className="portal-home-card-accent" style={{ background: card.accentColor }} />
            <div className="portal-home-card-body">
              <div className="portal-home-card-icon">{card.emoji}</div>
              <div className="portal-home-card-content">
                <h3 className="portal-home-card-title">{card.title}</h3>
                <p className="portal-home-card-desc">{card.desc}</p>
                <p className="portal-home-card-detail">{card.detail}</p>
              </div>
              <svg
                className="portal-home-card-arrow"
                width="18" height="18" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
          </Link>
        ))}
      </nav>

      {cards.length === 0 && (
        <p className="status-muted">
          Nenhuma área disponível para o seu perfil. Entre em contato com a coordenação.
        </p>
      )}
    </PortalLayout>
  )
}
