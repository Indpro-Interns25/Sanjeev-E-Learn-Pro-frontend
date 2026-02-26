import { useContext } from 'react';
import { UiContext } from '../context/ui-context';

const ICONS = {
  success: 'bi-check-circle-fill',
  error:   'bi-x-circle-fill',
  warning: 'bi-exclamation-triangle-fill',
  info:    'bi-info-circle-fill',
};

export default function GlobalToast() {
  const { toasts, removeToast } = useContext(UiContext);

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="edu-toast-stack" role="region" aria-live="polite" aria-label="Notifications">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`edu-toast-item toast-${t.type || 'info'}`}
          role="alert"
        >
          <i className={`bi ${ICONS[t.type] || ICONS.info} flex-shrink-0`} style={{ fontSize: '1.1rem', marginTop: 1 }} />
          <span className="flex-grow-1">{t.message}</span>
          <button
            type="button"
            onClick={() => removeToast(t.id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              opacity: 0.6,
              padding: 0,
              lineHeight: 1,
              color: 'inherit',
            }}
            aria-label="Dismiss"
          >
            <i className="bi bi-x-lg" style={{ fontSize: '0.9rem' }} />
          </button>
        </div>
      ))}
    </div>
  );
}
