
import { useState } from 'react';
import { Alert } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import loginBg from '../../assets/login.png';
import './Login.css';
import './Login-landing.css';

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
    <div className="user-login-screen login-landing-page" style={{ backgroundImage: `url(${loginBg})` }}>
      {/* Navigation Bar */}
      <nav className="login-navbar">
        <div className="navbar-brand">EduLearn Pro</div>
        <div className="navbar-links">
          <a href="#home">Home</a>
          <a href="#courses">Courses</a>
          <a href="#categories">Categories</a>
          <button className="btn-enroll">Enroll Now</button>
          <div className="user-avatar">👤</div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="login-content-wrapper">
        {/* Left Sidebar - Categories */}
        <aside className="login-sidebar-left">
          <div className="category-card">
            <div className="category-icon">📊</div>
            <h4>Data Science</h4>
            <p>Learn how to use quantum computing</p>
          </div>
          <div className="category-card">
            <div className="category-icon">💼</div>
            <h4>Business</h4>
            <p>Find business knowledge, financial...</p>
          </div>
          <div className="category-card">
            <div className="category-icon">🎨</div>
            <h4>Creative Arts</h4>
            <p>Learn more about medicine and cre...</p>
          </div>
          <div className="category-card latest-enrollments">
            <h4>Latest Enrollments</h4>
            <p>Get in touch with new enrollees across all categories</p>
          </div>
        </aside>

        {/* Center - Course Cards */}
        <section className="login-center-courses">
          <div className="course-bubble">
            <span>Introduction to Quantum Computing</span>
          </div>
          <div className="course-bubble">
            <span>Global Financial Markets</span>
          </div>
          <div className="course-bubble">
            <span>Ethical AI and Bias</span>
          </div>
          <div className="course-bubble">
            <span>History of Art</span>
          </div>
          <div className="course-bubble">
            <span>Data Science</span>
          </div>
        </section>

        {/* Right - Login Form */}
        <section className="login-sidebar-right">
          <div className="user-login-card" role="region" aria-label="User login panel">
          <div className="auth-card-header">
            <div className="auth-card-badge">
              <i className="bi bi-shield-lock me-2"></i>Secure Access
            </div>
            <div className="auth-card-mark" aria-hidden="true">
              <i className="bi bi-mortarboard-fill"></i>
            </div>
          </div>
            <h2 className="user-login-title">Access Your Course Portal</h2>
            <p className="user-login-subtitle">Your Learning Potential, Unlocked.</p>

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
        </section>
      </div>
    </div>
  );
}
