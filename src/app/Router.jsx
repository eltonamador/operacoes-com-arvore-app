import { BrowserRouter, Routes, Route } from 'react-router-dom'
import PortalHome from '../pages/PortalHome'
import AvaliadorArea from '../pages/AvaliadorArea'
import CoordenacaoArea from '../pages/CoordenacaoArea'
import AlunoArea from '../pages/AlunoArea'
import MotosserraApp from '../modules/motosserra/MotosserraApp'
import EscadasApp from '../modules/escadas/EscadasApp'

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PortalHome />} />
        <Route path="/avaliador" element={<AvaliadorArea />} />
        <Route path="/avaliador/motosserra" element={<MotosserraApp />} />
        <Route path="/avaliador/escadas" element={<EscadasApp />} />
        <Route path="/coordenacao" element={<CoordenacaoArea />} />
        <Route path="/aluno" element={<AlunoArea />} />
      </Routes>
    </BrowserRouter>
  )
}
