import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import PortalLayout from '../components/PortalLayout'

export default function PortalHome() {
  const { displayName, role } = useAuth()

  const isAvaliador = role === 'avaliador' || role === 'admin'
  const isCoordenacao = role === 'coordenacao' || role === 'admin'
  const isAluno = role === 'aluno' || role === 'admin'

  return (
    <PortalLayout title="Início">
      <div style={{ padding: '24px 32px', fontFamily: 'sans-serif' }}>
        {displayName && (
          <p style={{ margin: '0 0 20px', color: '#555', fontSize: '15px' }}>
            Bem-vindo, {displayName}
          </p>
        )}
        <p style={{ color: '#555', marginBottom: '20px', fontSize: '15px' }}>
          Selecione a área de acesso:
        </p>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '320px' }}>
          {isAvaliador && (
            <>
              <Link to="/avaliador/motosserra">Avaliador — Motosserra (CFSD-26)</Link>
              <Link to="/avaliador">Área do Avaliador</Link>
            </>
          )}
          {isCoordenacao && (
            <Link to="/coordenacao">Área de Coordenação</Link>
          )}
          {isAluno && (
            <Link to="/aluno">Área do Aluno</Link>
          )}
        </nav>
      </div>
    </PortalLayout>
  )
}
