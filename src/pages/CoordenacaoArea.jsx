import { Link } from 'react-router-dom'

export default function CoordenacaoArea() {
  return (
    <div style={{ padding: '32px', fontFamily: 'sans-serif' }}>
      <h1>Área de Coordenação</h1>
      <p style={{ color: '#888', marginBottom: '16px' }}>
        [Em construção — consolidação de notas, mapas e relatórios de coordenação serão disponibilizados aqui]
      </p>
      <Link to="/">← Voltar ao Portal</Link>
    </div>
  )
}
