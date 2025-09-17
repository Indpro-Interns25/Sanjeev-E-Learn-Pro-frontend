
import { useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import RegisterForm from '../../components/forms/RegisterForm';


export default function Register() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleRegisterSuccess = () => {
    navigate('/login', { state: { message: 'Registration successful! Please sign in.' } });
  };

  return (
    <div className="d-flex flex-column justify-content-center align-items-center min-vh-100">
      <Card className="shadow-lg border-0 rounded-4" style={{ maxWidth: 400, width: '100%' }}>
        <Card.Body className="p-4">
          <h3 className="text-center fw-bold mb-2">Create Account</h3>
          <p className="text-center text-muted mb-4">Join EduLearn Pro to start learning</p>
          {error && (
            <div className="text-center text-danger mb-3" style={{ fontWeight: 500 }}>{error}</div>
          )}
          <RegisterForm onSuccess={handleRegisterSuccess} onError={setError} />
          <div className="text-center">
            <span>Already have an account? </span>
            <Button variant="link" className="p-0 fw-bold" onClick={() => navigate('/login')}>Sign in</Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
