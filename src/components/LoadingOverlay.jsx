import { useContext } from 'react';
import { UiContext } from '../context/ui-context';

export default function LoadingOverlay() {
  const { isLoading } = useContext(UiContext);

  if (!isLoading) return null;

  return (
    <div className="loading-overlay" role="status" aria-label="Loading">
      <div className="loading-spinner-ring" />
      <span style={{ fontSize: '0.9rem', color: '#0d6efd', fontWeight: 500 }}>Loading…</span>
    </div>
  );
}
