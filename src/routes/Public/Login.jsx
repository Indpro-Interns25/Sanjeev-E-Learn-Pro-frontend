
import { useState } from 'react';
import { Alert } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import loginBg from '../../assets/login.png';
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
      <div
        className="user-login-bg"
        style={{ backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.3), rgba(0,0,0,0.2)), url(${loginBg})` }}
        aria-hidden="true"
      ></div>
      <div className="user-login-overlay" aria-hidden="true"></div>
      <div className="user-login-card" role="region" aria-label="User login panel">
        <h1 className="user-login-title">Login EduLearn Pro</h1>
        <p className="user-login-subtitle">Access your account to continue learning</p>

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
            <i className="bi bi-envelope user-input-icon" aria-hidden="true"></i>
            <input
              id="loginEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="user-input"
              placeholder="Email Address"
              required
              autoFocus
            />
          </div>

          <div className="user-input-wrap">
            <i className="bi bi-key user-input-icon" aria-hidden="true"></i>
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
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <p className="user-login-footer">
          Don&apos;t have an account?{' '}
          <button type="button" className="user-link-btn" onClick={() => navigate('/register')}>
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
