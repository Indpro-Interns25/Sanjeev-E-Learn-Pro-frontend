import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../services/auth';
import './AdminLogin.css';

export default function AdminLogin() {
  const [adminName, setAdminName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Clear any existing admin session when accessing login page
  useEffect(() => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    console.warn('Cleared existing admin session, showing login form');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      console.warn('Attempting admin login with:', { adminName, password: '***' });
      const result = await adminLogin(adminName, password);
      console.warn('Admin login successful:', result);
      
      // Store the admin token
      localStorage.setItem('adminToken', result.token);
      localStorage.setItem('adminData', JSON.stringify(result.admin));
      
      // Navigate to admin dashboard
      console.warn('Redirecting to admin dashboard');
      navigate('/admin-dashboard', { replace: true });
      
    } catch (err) {
      console.error('Admin login failed:', err);
      setError(err.message || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-screen">
      <div className="admin-login-overlay" aria-hidden="true"></div>

      <div className="admin-login-card" role="region" aria-label="Admin login panel">
        <div className="admin-brand-row">
          <span className="admin-brand-mark" aria-hidden="true"></span>
          <span className="admin-brand-text">EduLearn Pro</span>
        </div>

        <h1 className="admin-login-title">Admin Portal Login</h1>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-form-group">
            <label htmlFor="adminName">Email Address</label>
            <input
              id="adminName"
              type="text"
              className="admin-form-input"
              value={adminName}
              onChange={e => setAdminName(e.target.value)}
              placeholder="Email address"
              required
              autoFocus
            />
          </div>

          <div className="admin-form-group">
            <div className="admin-password-label-row">
              <label htmlFor="password">Password</label>
              <button
                type="button"
                className="admin-show-password-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide Password' : 'Show Password'}
              </button>
            </div>

            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className="admin-form-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
          </div>

          <a className="admin-forgot-link" href="#" onClick={(e) => e.preventDefault()}>
            Forgot Password?
          </a>

          {error && <div className="admin-error-message">{error}</div>}

          <button
            type="submit"
            className="admin-submit-button"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}