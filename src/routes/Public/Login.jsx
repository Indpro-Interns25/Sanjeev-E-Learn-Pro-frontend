
import { useState } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/catalog';
  const sessionExpired = new URLSearchParams(location.search).get('expired') === '1';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password, { remember });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Unable to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column justify-content-center align-items-center min-vh-100">
      <Card className="shadow-lg border-0 rounded-4" style={{ maxWidth: 400, width: '100%' }}>
        <Card.Body className="p-4">
          <h3 className="text-center fw-bold mb-2">Sign In</h3>
          <p className="text-center text-muted mb-4">Access your account</p>
          
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
          <Form onSubmit={handleSubmit} autoComplete="off">
            <Form.Group className="mb-3" controlId="loginEmail">
              <Form.Label>Email <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="loginPassword">
              <Form.Label>Password <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </Form.Group>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <Form.Check
                type="checkbox"
                label="Remember me"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
              />
              <Button variant="link" className="p-0 text-decoration-none" onClick={() => navigate('/forgot-password')}>Forgot Password?</Button>
            </div>
            <Button type="submit" variant="dark" className="w-100 mb-3 fw-semibold" size="lg" disabled={loading}>
              {loading ? 'Signing in...' : 'Login'}
            </Button>
          </Form>
          <div className="text-center">
            <span>Don&apos;t have an account? </span>
            <Button variant="link" className="p-0 fw-bold" onClick={() => navigate('/register')}>Sign up</Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
