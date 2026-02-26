import { useContext } from 'react';
import { UiContext } from '../context/ui-context';

/**
 * A small icon button that toggles dark / light mode.
 * Reads and writes via UiContext.
 */
export default function DarkModeToggle({ className = '' }) {
  const { darkMode, toggleDarkMode } = useContext(UiContext);

  return (
    <button
      className={`dark-mode-toggle ${className}`}
      onClick={toggleDarkMode}
      title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      type="button"
    >
      {darkMode ? (
        <i className="bi bi-sun-fill" style={{ color: '#fbbf24' }} />
      ) : (
        <i className="bi bi-moon-stars-fill" style={{ color: '#6366f1' }} />
      )}
    </button>
  );
}
