import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isLight = theme === 'light'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isLight ? 'dark' : 'light'} mode`}
      aria-pressed={isLight}
      title={`Switch to ${isLight ? 'dark' : 'light'} mode`}
      className="theme-toggle"
    >
      <Sun size={14} aria-hidden="true" />
      <span className={`theme-toggle-thumb ${isLight ? 'theme-toggle-thumb-light' : ''}`} />
      <Moon size={14} aria-hidden="true" />
    </button>
  )
}
