import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import PortalLayout from '../components/PortalLayout'

const cardStyle = {
  border: '1px solid #ddd',
  borderRadius: '6px',
  padding: '20px',
  backgroundColor: '#fafafa',
  minWidth: '240px',
  textDecoration: 'none',
  color: 'inherit',
  transition: 'all 0.2s ease',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
}

const cardHoverStyle = {
  ...cardStyle,
  backgroundColor: '#f0f0f0',
  borderColor: '#999',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
}

const cardTitleStyle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#1a1a2e',
  margin: 0,
}

const cardDescStyle = {
  fontSize: '13px',
  color: '#666',
  margin: 0,
}

export default function AvaliadorArea() {
  const [hovered, setHovered] = useState(null)

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

  return (
    <PortalLayout title="Área do Avaliador">
      <div style={{ padding: '24px 32px', fontFamily: 'sans-serif' }}>
        <p style={{ color: '#555', marginBottom: '24px', fontSize: '15px' }}>
          Selecione um módulo para iniciar a avaliação:
        </p>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '32px' }}>
          {modules.map((mod) => (
            <Link
              key={mod.id}
              to={mod.path}
              style={hovered === mod.id ? cardHoverStyle : cardStyle}
              onMouseEnter={() => setHovered(mod.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <h3 style={cardTitleStyle}>{mod.title}</h3>
              <p style={cardDescStyle}>{mod.description}</p>
            </Link>
          ))}
        </div>
        <div style={{ marginTop: '32px', paddingTop: '16px', borderTop: '1px solid #ddd' }}>
          <Link to="/" style={{ fontSize: '14px', color: '#1a1a2e' }}>
            &larr; Voltar ao Portal
          </Link>
        </div>
      </div>
    </PortalLayout>
  )
}
