import { Link } from 'react-router-dom'

export default function AlunoArea() {
  return (
    <div style={{ padding: '32px', fontFamily: 'sans-serif' }}>
      <h1>Área do Aluno</h1>
      <p style={{ color: '#888', marginBottom: '16px' }}>
        [Em construção — consulta de notas e resultado de avaliações será disponibilizada aqui]
      </p>
      <Link to="/">← Voltar ao Portal</Link>
    </div>
  )
}
