import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import PortalLayout from '../components/PortalLayout'

function InstallBanner() {
  const [open, setOpen] = useState(false)
  return (
    <div style={{
      marginTop: 40,
      border: '1px solid var(--border)',
      borderRadius: 12,
      overflow: 'hidden',
      background: 'var(--surface)',
    }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text)',
          fontSize: 14,
          fontWeight: 600,
          gap: 8,
        }}
      >
        <span>📲 Como instalar o app no celular</span>
        <svg
          width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div style={{
          padding: '0 18px 18px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          borderTop: '1px solid var(--border)',
          paddingTop: 16,
        }}>
          <div>
            <p style={{ fontWeight: 700, marginBottom: 8, fontSize: 13 }}>🤖 Android (Chrome)</p>
            <ol style={{ paddingLeft: 18, fontSize: 13, lineHeight: 1.8, color: 'var(--text-muted)', margin: 0 }}>
              <li>Abra o link no <strong>Chrome</strong></li>
              <li>Toque no menu <strong>⋮</strong> (canto superior direito)</li>
              <li>Toque em <strong>"Adicionar à tela inicial"</strong></li>
              <li>Confirme tocando em <strong>"Adicionar"</strong></li>
            </ol>
          </div>
          <div>
            <p style={{ fontWeight: 700, marginBottom: 8, fontSize: 13 }}>🍎 iPhone (Safari)</p>
            <ol style={{ paddingLeft: 18, fontSize: 13, lineHeight: 1.8, color: 'var(--text-muted)', margin: 0 }}>
              <li>Abra o link no <strong>Safari</strong></li>
              <li>Toque no botão <strong>compartilhar ⬆</strong> (parte inferior)</li>
              <li>Role e toque em <strong>"Adicionar à Tela de Início"</strong></li>
              <li>Toque em <strong>"Adicionar"</strong></li>
            </ol>
          </div>
          <div style={{
            gridColumn: '1 / -1',
            fontSize: 12,
            color: 'var(--text-muted)',
            borderTop: '1px solid var(--border)',
            paddingTop: 10,
            marginTop: 4,
          }}>
            O ícone aparece na tela inicial como um app. Não é necessário baixar nada da loja.
          </div>
        </div>
      )}
    </div>
  )
}

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

      <InstallBanner />
    </PortalLayout>
  )
}
