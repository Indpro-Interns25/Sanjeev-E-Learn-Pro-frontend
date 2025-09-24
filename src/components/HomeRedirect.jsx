import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Home from '../routes/Public/Home';

export default function HomeRedirect() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for auth to load, then redirect authenticated users
    if (!loading && isAuthenticated) {
      navigate('/catalog', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  // Show loading or landing page for unauthenticated users
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Show landing page only for unauthenticated users
  return !isAuthenticated ? <Home /> : null;
}