import PropTypes from 'prop-types';
import { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';

const ROLES = [
  { value: 'student', label: 'Student' },
  { value: 'instructor', label: 'Instructor' }
];

export default function RegisterForm({ onSuccess }) {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (formData.name.trim().length < 3) {
      setError('Name must be at least 3 characters long');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(formData.password)) {
      setError('Password must contain uppercase, lowercase, and a number');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!formData.role) {
      setError('Please choose how you want to register');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!validateForm()) return;
    setLoading(true);
    try {
      await register({ ...formData });
      onSuccess?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit} noValidate className="register-form">
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>
      )}
      <Form.Floating className="mb-3">
        <Form.Control
          id="regName"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Full Name"
          required
        />
        <Form.Label htmlFor="regName">Full Name</Form.Label>
      </Form.Floating>

      <Form.Floating className="mb-3">
        <Form.Control
          id="regEmail"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email Address"
          required
        />
        <Form.Label htmlFor="regEmail">Email Address</Form.Label>
      </Form.Floating>

      <Form.Floating className="mb-3">
        <Form.Control
          id="regPassword"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          required
        />
        <Form.Label htmlFor="regPassword">Password</Form.Label>
      </Form.Floating>
      <div className="register-hint">Use at least 6 characters with upper, lower, and a number.</div>

      <Form.Floating className="mb-3">
        <Form.Control
          id="regConfirmPassword"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm Password"
          required
        />
        <Form.Label htmlFor="regConfirmPassword">Confirm Password</Form.Label>
      </Form.Floating>

      <Form.Floating className="mb-3">
        <Form.Select id="regRole" name="role" value={formData.role} onChange={handleChange} required>
          <option value="" disabled>Select your role</option>
          {ROLES.map(r => (<option key={r.value} value={r.value}>{r.label}</option>))}
        </Form.Select>
        <Form.Label htmlFor="regRole">I want to join as</Form.Label>
      </Form.Floating>

      <Button type="submit" variant="primary" className="w-100 auth-submit-btn" disabled={loading}>
        {loading ? 'Creating Account...' : 'Create Account'}
      </Button>
    </Form>
  );
}

RegisterForm.propTypes = {
  onSuccess: PropTypes.func
};
