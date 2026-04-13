import { Link } from 'react-router-dom'
import PortalLayout from '../components/PortalLayout'

const modules = [
  {
    id: 'motosserra',
    title: 'Avaliação de Motosserra',
    description: 'Checklist técnico de operações com motosserra — CFSD-26',
    path: '/avaliador/motosserra',
  },
  {
    id: 'escadas',
    title: 'Avaliação de Escadas',
    description: 'Checklist técnico de operações com escadas — CFSD-26',
    path: '/avaliador/escadas',
  },
]

export default function AvaliadorArea() {
  return (
    <PortalLayout>
      <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
        Área do Avaliador
      </p>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
        Selecione um módulo para iniciar a avaliação:
      </p>
      <div className="portal-nav-grid">
        {modules.map((mod) => (
          <Link key={mod.id} to={mod.path} className="portal-nav-card">
            <h3 className="portal-nav-card-title">{mod.title}</h3>
            <p className="portal-nav-card-desc">{mod.description}</p>
          </Link>
        ))}
      </div>
      <Link to="/" className="portal-back-link">
        ← Voltar ao Portal
      </Link>
    </PortalLayout>
  )
}
