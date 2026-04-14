
import { useState } from 'react';
import { Alert } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname;
  const sessionExpired = new URLSearchParams(location.search).get('expired') === '1';

  const getRoleDashboardPath = (role) => {
    switch (role) {
      case 'admin':
        return '/admin-dashboard';
      case 'instructor':
        return '/instructor/dashboard';
      case 'student':
      default:
        return '/student/dashboard';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const loggedInUser = await login(email, password, { remember: true });
      const destination = from || getRoleDashboardPath(loggedInUser?.role);
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'Unable to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-login-screen">
      <div className="user-login-bg" style={{ backgroundImage: "url('/images/login.png')" }}></div>
      <div className="user-login-overlay"></div>
      <div className="user-login-card" role="region" aria-label="User login panel">
          <div className="auth-card-header">
            <div className="auth-card-badge">
              <i className="bi bi-shield-lock me-2"></i>Secure Access
            </div>
            <div className="auth-card-mark" aria-hidden="true">
              <i className="bi bi-mortarboard-fill"></i>
            </div>
          </div>
            <h2 className="user-login-title">Welcome Back</h2>
            <p className="user-login-subtitle">Access your learning dashboard and continue where you left off</p>

            {sessionExpired && !error && (
              <Alert variant="warning" className="py-2 mb-3">
                <i className="bi bi-clock-history me-2"></i>
                Your session has expired. Please sign in again.
              </Alert>
            )}
            {location.state?.message && !error && !sessionExpired && (
              <Alert variant="success" className="py-2 mb-3" dismissible onClose={() => navigate('.', { replace: true, state: {} })}>
                {location.state.message}
              </Alert>
            )}
            {error && (
              <Alert variant="danger" className="py-2 mb-3" dismissible onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit} autoComplete="off" className="user-login-form">
              <div className="user-input-wrap">
                <input
                  id="loginEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="user-input"
                  placeholder="Username"
                  required
                  autoFocus
                />
              </div>

              <div className="user-input-wrap">
                <input
                  id="loginPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="user-input user-input-password"
                  placeholder="Password"
                  required
                />
                <button
                  type="button"
                  className="user-password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>

              <button type="submit" className="user-login-submit" disabled={loading}>
                {loading ? 'Signing in...' : 'Log In'}
              </button>
              <div className="auth-support-row">
                <span><i className="bi bi-lock-fill me-1"></i>Encrypted sign in</span>
                <span><i className="bi bi-lightning-charge-fill me-1"></i>Fast dashboard access</span>
              </div>
            </form>

            <p className="user-login-footer">
              <button type="button" className="user-link-btn" onClick={() => navigate('/forgot-password')}>
                Forgot Password?
              </button>
            </p>
            <p className="user-login-footer signup-link">
              New to EduLearn Pro?{' '}
              <button type="button" className="user-link-btn" onClick={() => navigate('/register')}>
                Create Account
              </button>
            </p>
      </div>
      </div>
    
  );
}
