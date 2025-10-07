import { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { getStudentById, createStudent, updateStudent } from '../../services/admin';

export default function AddStudent() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const courseStateId = location.state?.studentId || params.id || null;

  const [isEdit, setIsEdit] = useState(Boolean(courseStateId));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    enrolled_courses: 0
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (courseStateId) {
      setIsEdit(true);
      setLoading(true);
      getStudentById(courseStateId)
        .then(s => {
          if (s) {
            setForm({
              name: s.name || s.username || '',
              email: s.email || '',
              enrolled_courses: s.enrolled_courses || 0
            });
          }
        })
        .catch(e => setError(e.message || String(e)))
        .finally(() => setLoading(false));
    }
  }, [courseStateId]);

  function onChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'enrolled_courses' ? parseInt(value || 0) : value }));
    // Clear field error as user types
    setFormErrors(prev => ({ ...prev, [name]: null }));
  }

  function validate(student) {
    const errors = {};
    const name = String(student.name || '').trim();
    const email = String(student.email || '').trim().toLowerCase();
    const enrolled = Number(student.enrolled_courses || 0);

    if (!name) errors.name = 'Full name is required';
    if (!email) errors.email = 'Email is required';
    else {
      // basic email regex
      const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/i;
      if (!re.test(email)) errors.email = 'Please enter a valid email address';
    }
    if (!Number.isFinite(enrolled) || enrolled < 0) errors.enrolled_courses = 'Enrolled courses must be 0 or more';

    return errors;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      // client-side validation
      const errors = validate(form);
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        setLoading(false);
        return;
      }

      // sanitize form values
      const payload = {
        ...form,
        name: String(form.name).trim(),
        email: String(form.email).trim().toLowerCase(),
        enrolled_courses: parseInt(form.enrolled_courses || 0)
      };
      if (isEdit && courseStateId) {
        await updateStudent(courseStateId, payload);
        setSuccess('Student updated successfully');
      } else {
        await createStudent(payload);
        setSuccess('Student created successfully');
        setForm({ name: '', email: '', enrolled_courses: 0 });
      }

      // navigate back to students list after a short delay
      setTimeout(() => navigate('/admin/students'), 800);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <Card.Body>
        <h4>{isEdit ? 'Edit Student' : 'Add Student'}</h4>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        <Form onSubmit={onSubmit}>
          <Form.Group className="mb-2" controlId="studentName">
            <Form.Label>Name</Form.Label>
            <Form.Control name="name" value={form.name} onChange={onChange} placeholder="Full name" required isInvalid={!!formErrors.name} />
            <Form.Control.Feedback type="invalid">{formErrors.name}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-2" controlId="studentEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" name="email" value={form.email} onChange={onChange} placeholder="Email address" required isInvalid={!!formErrors.email} />
            <Form.Control.Feedback type="invalid">{formErrors.email}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="enrolledCourses">
            <Form.Label>Enrolled Courses</Form.Label>
            <Form.Control type="number" min={0} name="enrolled_courses" value={form.enrolled_courses} onChange={onChange} isInvalid={!!formErrors.enrolled_courses} />
            <Form.Control.Feedback type="invalid">{formErrors.enrolled_courses}</Form.Control.Feedback>
          </Form.Group>

          <Button type="submit" disabled={loading} variant="primary">
            {isEdit ? 'Save Changes' : 'Create Student'}
          </Button>{' '}
          <Button variant="secondary" onClick={() => navigate('/admin/students')} disabled={loading}>
            Cancel
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}
