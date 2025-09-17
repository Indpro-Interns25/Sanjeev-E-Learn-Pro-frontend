import { useState } from 'react';
import { Card, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate async request
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1000);
  };

  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center min-vh-100"
      style={{
        background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
        minHeight: '100vh',
      }}
    >
      <Card className="shadow-lg border-0 rounded-5" style={{ maxWidth: 420, width: '100%', background: 'rgba(255,255,255,0.97)' }}>
        <Card.Body className="p-4 p-md-5">
          <div className="text-center mb-4">
            <i className="bi bi-unlock display-3 text-primary mb-2" style={{ color: '#2575fc' }}></i>
          </div>
          {!submitted ? (
            <>
              <h3 className="fw-bold text-center mb-2" style={{ color: '#222' }}>Forgot your password?</h3>
              <p className="text-secondary text-center mb-4" style={{ lineHeight: 1.6, fontSize: '1.05rem' }}>
                No worries! Enter your email below and we&apos;ll send you a reset link.
              </p>
              <Form onSubmit={handleSubmit} autoComplete="off">
                <Form.Group className="mb-3" controlId="forgotEmail">
                  <Form.Label className="fw-semibold">Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    autoFocus
                    style={{ fontSize: '1.1rem', padding: '0.75rem' }}
                  />
                </Form.Group>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-100 fw-bold py-2 mb-2"
                  style={{ fontSize: '1.1rem', letterSpacing: '0.02em', background: 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)', border: 'none' }}
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Reset Your Password'}
                </Button>
                <Button
                  variant="link"
                  className="w-100 mt-2 text-decoration-none"
                  style={{ color: '#2575fc', fontWeight: 500 }}
                  onClick={() => navigate('/login')}
                >
                  Back to Sign In
                </Button>
              </Form>
            </>
          ) : (
            <div className="text-center py-3">
              <i className="bi bi-envelope-check display-4 text-success mb-3"></i>
              <h4 className="fw-bold mb-2" style={{ color: '#222' }}>Check your email</h4>
              <p className="text-secondary mb-4">
                If an account exists for <strong>{email}</strong>, you&apos;ll receive a password
                reset link shortly.
              </p>
              <Button variant="primary" className="w-100 mb-2 fw-bold py-2" style={{ fontSize: '1.1rem', background: 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)', border: 'none' }} onClick={() => navigate('/login')}>Return to Sign In</Button>
              <Button variant="outline-secondary" className="w-100" onClick={() => { setSubmitted(false); setEmail(''); }}>Use another email</Button>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
