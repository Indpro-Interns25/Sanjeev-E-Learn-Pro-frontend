
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterForm from '../../components/forms/RegisterForm';
import './Login.css';
import './Register.css';


export default function Register() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleRegisterSuccess = () => {
    navigate('/login', { state: { message: 'Registration successful! Please sign in.' } });
  };

  return (
    <div className="user-login-screen register-page">
      <div
        className="user-login-bg"
        style={{ backgroundImage: "linear-gradient(to right, rgba(0,0,0,0.3), rgba(0,0,0,0.2)), url('/images/login.png')" }}
        aria-hidden="true"
      ></div>
      <div className="user-login-overlay" aria-hidden="true"></div>

      <div className="user-login-card register-card" role="region" aria-label="User registration panel">
        <div className="auth-card-header">
          <div className="auth-card-badge">
            <i className="bi bi-stars me-2"></i>Start Learning
          </div>
          <div className="auth-card-mark" aria-hidden="true">
            <i className="bi bi-person-plus-fill"></i>
          </div>
        </div>
        <h1 className="user-login-title">Join EduLearn Pro</h1>
        <p className="user-login-subtitle">Create your free account to access expert-led courses and more.</p>

        {error && (
          <div className="text-center text-danger mb-3" style={{ fontWeight: 500 }}>{error}</div>
        )}

        <RegisterForm onSuccess={handleRegisterSuccess} onError={setError} />

        <p className="user-login-footer">
          Already have an account?{' '}
          <button type="button" className="user-link-btn" onClick={() => navigate('/login')}>
            Login
          </button>
        </p>
      </div>
    </div>
  );
}
