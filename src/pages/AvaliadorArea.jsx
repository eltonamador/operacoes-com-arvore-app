import { Link } from 'react-router-dom'

export default function AvaliadorArea() {
  return (
    <div style={{ padding: '32px', fontFamily: 'sans-serif' }}>
      <h1>Área do Avaliador</h1>
      <p style={{ color: '#888', marginBottom: '16px' }}>
        [Em construção — módulos de oficinas serão listados aqui]
      </p>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '320px' }}>
        <Link to="/avaliador/motosserra">Avaliação de Motosserra (CFSD-26)</Link>
        <Link to="/">← Voltar ao Portal</Link>
      </nav>
    </div>
  )
}
