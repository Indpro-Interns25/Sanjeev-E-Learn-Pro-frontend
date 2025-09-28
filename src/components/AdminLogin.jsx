import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../services/auth';

export default function AdminLogin() {
  const [adminName, setAdminName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Clear any existing admin session when accessing login page
  useEffect(() => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    console.warn('🔄 Cleared existing admin session, showing login form');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      console.warn('🔐 Attempting admin login with:', { adminName, password: '***' });
      const result = await adminLogin(adminName, password);
      console.warn('✅ Admin login successful:', result);
      
      // Store the admin token
      localStorage.setItem('adminToken', result.token);
      localStorage.setItem('adminData', JSON.stringify(result.admin));
      
      // Navigate to admin dashboard
      console.warn('🔄 Redirecting to admin dashboard');
      navigate('/admin-dashboard', { replace: true });
      
    } catch (err) {
      console.error('❌ Admin login failed:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="card p-4 shadow" style={{ maxWidth: 400, width: '100%' }}>
        <h3 className="text-center mb-4">Admin Login</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Admin Name</label>
            <input
              type="text"
              className="form-control"
              value={adminName}
              onChange={e => setAdminName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}