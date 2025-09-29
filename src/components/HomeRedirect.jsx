import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function HomeRedirect() {
  const { isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      // Redirect based on user role
      switch (user.role) {
        case 'student':
          navigate('/student/dashboard', { replace: true });
          break;
        case 'instructor':
          navigate('/instructor/dashboard', { replace: true });
          break;
        case 'admin':
          navigate('/admin-dashboard', { replace: true });
          break;
        default:
          navigate('/catalog', { replace: true });
      }
    } else if (!loading && !isAuthenticated) {
      // Redirect unauthenticated users to home
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, user, loading, navigate]);

  // Show loading spinner while determining redirect
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Redirecting...</span>
      </div>
    </div>
  );
}