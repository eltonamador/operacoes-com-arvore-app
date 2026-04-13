import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '../contexts/AuthContext'
import { ThemeProvider } from '../contexts/ThemeContext'
import ProtectedRoute from '../components/ProtectedRoute'
import Login from '../pages/Login'
import PortalHome from '../pages/PortalHome'
import AvaliadorArea from '../pages/AvaliadorArea'
import CoordenacaoArea from '../pages/CoordenacaoArea'
import AlunoArea from '../pages/AlunoArea'
import MotosserraApp from '../modules/motosserra/MotosserraApp'
import EscadasApp from '../modules/escadas/EscadasApp'

export default function Router() {
  return (
    <BrowserRouter>
      <ThemeProvider>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Authenticated — any role */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <PortalHome />
              </ProtectedRoute>
            }
          />

          {/* Avaliador + Admin */}
          <Route
            path="/avaliador"
            element={
              <ProtectedRoute roles={['avaliador']}>
                <AvaliadorArea />
              </ProtectedRoute>
            }
          />
          <Route
            path="/avaliador/motosserra"
            element={
              <ProtectedRoute roles={['avaliador']}>
                <MotosserraApp />
              </ProtectedRoute>
            }
          />
          <Route
            path="/avaliador/escadas"
            element={
              <ProtectedRoute roles={['avaliador']}>
                <EscadasApp />
              </ProtectedRoute>
            }
          />

          {/* Coordenacao + Admin */}
          <Route
            path="/coordenacao"
            element={
              <ProtectedRoute roles={['coordenacao']}>
                <CoordenacaoArea />
              </ProtectedRoute>
            }
          />

          {/* Aluno + Admin */}
          <Route
            path="/aluno"
            element={
              <ProtectedRoute roles={['aluno']}>
                <AlunoArea />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
