import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import './styles/global.css'
import Router from './app/Router.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router />
    <Analytics />
  </StrictMode>,
)
