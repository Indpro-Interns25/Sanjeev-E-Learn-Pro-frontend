import { useState } from 'react';
import axios from 'axios';
import AdminDashboard from './AdminDashboard';

export default function AdminLogin() {
  const [adminName, setAdminName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Mock authentication for demo purposes
    if (adminName === 'admin' && password === 'admin123') {
      localStorage.setItem('adminToken', 'mock-admin-token-' + Date.now());
      setLoggedIn(true);
      setLoading(false);
      return;
    }
    
    try {
      const res = await axios.post('/admin/login', {
        adminName,
        password,
      });
      localStorage.setItem('adminToken', res.data.token);
      setLoggedIn(true);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loggedIn) {
    return <AdminDashboard />;
  }

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