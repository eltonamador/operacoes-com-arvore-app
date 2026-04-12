import { Link } from 'react-router-dom'

export default function PortalHome() {
  return (
    <div style={{ padding: '32px', fontFamily: 'sans-serif' }}>
      <h1>Portal de Avaliações — CBMAP</h1>
      <p style={{ color: '#555', marginBottom: '24px' }}>
        Selecione a área de acesso:
      </p>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '320px' }}>
        <Link to="/avaliador/motosserra">Avaliador — Motosserra (CFSD-26)</Link>
        <Link to="/avaliador">Área do Avaliador</Link>
        <Link to="/coordenacao">Área de Coordenação</Link>
        <Link to="/aluno">Área do Aluno</Link>
      </nav>
    </div>
  )
}
