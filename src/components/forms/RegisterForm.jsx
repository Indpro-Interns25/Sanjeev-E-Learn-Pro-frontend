// Clean restored file
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
    role: 'student'
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
    <Form onSubmit={handleSubmit} noValidate>
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>
      )}
      <Form.Group className="mb-3" controlId="regName">
        <Form.Label>Full Name</Form.Label>
        <Form.Control name="name" value={formData.name} onChange={handleChange} required />
      </Form.Group>
      <Form.Group className="mb-3" controlId="regEmail">
        <Form.Label>Email</Form.Label>
        <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
      </Form.Group>
      <Form.Group className="mb-3" controlId="regPassword">
        <Form.Label>Password</Form.Label>
        <Form.Control type="password" name="password" value={formData.password} onChange={handleChange} required />
      </Form.Group>
      <Form.Group className="mb-3" controlId="regConfirmPassword">
        <Form.Label>Confirm Password</Form.Label>
        <Form.Control type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
      </Form.Group>
      <Form.Group className="mb-3" controlId="regRole">
        <Form.Label>I want to</Form.Label>
        <Form.Select name="role" value={formData.role} onChange={handleChange} required>
          {ROLES.map(r => (<option key={r.value} value={r.value}>Register as a {r.label}</option>))}
        </Form.Select>
      </Form.Group>
      <Button type="submit" variant="primary" className="w-100" disabled={loading}>
        {loading ? 'Creating Account...' : 'Create Account'}
      </Button>
    </Form>
  );
}

RegisterForm.propTypes = {
  onSuccess: PropTypes.func
};
