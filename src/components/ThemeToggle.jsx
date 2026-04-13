import { useTheme } from '../contexts/ThemeContext'

/**
 * Botão de alternância Light / Dark.
 *
 * Props:
 *   floating — quando true, renderiza fixo no canto inferior direito da viewport.
 *              Usado nos módulos de avaliação, onde não há PortalLayout.
 *              Default: false (inline, para uso no header do portal).
 */
export default function ThemeToggle({ floating = false }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
      className="btn btn-secondary btn-sm"
      style={floating ? floatingStyle : undefined}
    >
      {isDark ? '☀' : '🌙'}
    </button>
  )
}

const floatingStyle = {
  position: 'fixed',
  bottom: '16px',
  right: '16px',
  zIndex: 1000,
  boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
  borderRadius: '50%',
  width: '44px',
  height: '44px',
  padding: 0,
  fontSize: '18px',
  minHeight: 'unset',
}
