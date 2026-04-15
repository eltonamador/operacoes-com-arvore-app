import { Link } from 'react-router-dom'
import PortalLayout from '../components/PortalLayout'

const VC_COLORS = {
  VC1: { bg: 'rgba(91,127,255,0.12)', border: 'rgba(91,127,255,0.4)', text: '#5b7fff' },
  VC2: { bg: 'rgba(204,0,0,0.08)', border: 'rgba(204,0,0,0.4)', text: 'var(--red)' },
  VC3: { bg: 'rgba(149,107,0,0.1)', border: 'rgba(149,107,0,0.4)', text: 'var(--gold)' },
}

const modules = [
  {
    id: 'escadas',
    title: 'Salvamento com Escadas',
    description: 'VC 1.1 — Operações em altura com escadas',
    path: '/avaliador/escadas',
    badge: 'VC1',
    emoji: '🪜',
  },
  {
    id: 'pocos',
    title: 'Salvamento em Espaço Confinado',
    description: 'VC 1.2 — Poço — Resgate em ambientes confinados',
    path: '/avaliador/pocos',
    badge: 'VC1',
    emoji: '🕳️',
  },
  {
    id: 'motosserra',
    title: 'Operações de Corte de Árvores',
    description: 'VC 2.1 — Uso seguro de motosserra em campo',
    path: '/avaliador/motosserra',
    badge: 'VC2',
    emoji: '🪚',
  },
  {
    id: 'circuito',
    title: 'Circuito Operacional',
    description: 'VC 2.2 — Circuito prático integrado',
    path: '/avaliador/circuito',
    badge: 'VC2',
    emoji: '⚙️',
  },
  {
    id: 'teorica',
    title: 'Prova Teórica',
    description: 'VC 3 — Lançamento de nota direta',
    path: '/avaliador/teorica',
    badge: 'VC3',
    emoji: '📝',
  },
]

export default function AvaliadorArea() {
  return (
    <PortalLayout>
      <div style={{ marginBottom: '28px' }}>
        <p className="page-section-label">Área do Avaliador</p>
        <h1 className="page-section-title">Módulos de Avaliação</h1>
        <p className="page-section-desc">
          Selecione um módulo para iniciar ou consultar avaliações práticas.
        </p>
      </div>

      <div className="avaliador-modules-grid">
        {modules.map((mod) => {
          const vc = VC_COLORS[mod.badge] || VC_COLORS['VC1']
          return (
            <Link key={mod.id} to={mod.path} className="avaliador-module-card">
              <div className="avaliador-module-emoji">{mod.emoji}</div>
              <div className="avaliador-module-body">
                <div className="avaliador-module-header">
                  <h3 className="avaliador-module-title">{mod.title}</h3>
                  <span
                    className="avaliador-module-badge"
                    style={{
                      background: vc.bg,
                      border: `1px solid ${vc.border}`,
                      color: vc.text,
                    }}
                  >
                    {mod.badge}
                  </span>
                </div>
                <p className="avaliador-module-desc">{mod.description}</p>
              </div>
              <svg
                className="avaliador-module-arrow"
                width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          )
        })}
      </div>

      <Link to="/" className="portal-back-link">
        ← Voltar ao Portal
      </Link>
    </PortalLayout>
  )
}