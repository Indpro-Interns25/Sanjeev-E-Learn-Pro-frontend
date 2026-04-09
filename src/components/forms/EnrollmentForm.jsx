import { useState, useEffect } from 'react';
import { Form, Button, Alert, Row, Col, Card } from 'react-bootstrap';
import { enrollUserInCourse } from '../../services/enrollment';

export default function EnrollmentForm({ 
  students = [], 
  courses = [], 
  onSubmit, 
  onCancel,
  loading = false 
}) {
  const [formData, setFormData] = useState({
    studentId: '',
    courseId: ''
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Update selected items when form data changes
  useEffect(() => {
    if (formData.studentId) {
      const student = students.find(s => s.id.toString() === formData.studentId);
      setSelectedStudent(student || null);
    } else {
      setSelectedStudent(null);
    }
  }, [formData.studentId, students]);

  useEffect(() => {
    if (formData.courseId) {
      const course = courses.find(c => c.id.toString() === formData.courseId);
      setSelectedCourse(course || null);
    } else {
      setSelectedCourse(null);
    }
  }, [formData.courseId, courses]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.studentId) {
      setError('Please select a student');
      return;
    }
    if (!formData.courseId) {
      setError('Please select a course');
      return;
    }

    setSubmitting(true);
    try {
      // Call the enrollment service
      const result = await enrollUserInCourse(
        parseInt(formData.studentId),
        parseInt(formData.courseId)
      );

      console.log('Enrollment result:', result);
      
      // Call the parent onSubmit callback
      if (onSubmit) {
        await onSubmit({
          studentId: parseInt(formData.studentId),
          courseId: parseInt(formData.courseId),
          student: selectedStudent,
          course: selectedCourse
        });
      }

      // Reset form
      setFormData({ studentId: '', courseId: '' });
      
    } catch (err) {
      console.error('Enrollment error:', err);
      setError(err.message || 'Failed to enroll student in course');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(''); // Clear error when user makes changes
  };

  return (
    <Form onSubmit={handleSubmit}>
      {error && (
        <Alert variant="danger" className="mb-3">
          <i className="bi bi-exclamation-circle me-2"></i>
          {error}
        </Alert>
      )}

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Select Student</Form.Label>
            <Form.Select
              value={formData.studentId}
              onChange={(e) => handleChange('studentId', e.target.value)}
              disabled={loading || submitting}
            >
              <option value="">Choose a student...</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.email})
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {selectedStudent && (
            <Card className="mb-3">
              <Card.Body>
                <h6>Student Details</h6>
                <p className="mb-1"><strong>Name:</strong> {selectedStudent.name}</p>
                <p className="mb-1"><strong>Email:</strong> {selectedStudent.email}</p>
                <p className="mb-0"><strong>Status:</strong> 
                  <span className={`badge ms-2 ${selectedStudent.status === 'active' ? 'bg-success' : 'bg-warning'}`}>
                    {selectedStudent.status}
                  </span>
                </p>
              </Card.Body>
            </Card>
          )}
        </Col>

        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Select Course</Form.Label>
            <Form.Select
              value={formData.courseId}
              onChange={(e) => handleChange('courseId', e.target.value)}
              disabled={loading || submitting}
            >
              <option value="">Choose a course...</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.title} - {course.isFree === true ? 'Free' : 'Free'}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {selectedCourse && (
            <Card className="mb-3">
              <Card.Body>
                <h6>Course Details</h6>
                <p className="mb-1"><strong>Title:</strong> {selectedCourse.title}</p>
                <p className="mb-1"><strong>Category:</strong> {selectedCourse.category}</p>
                <p className="mb-1"><strong>Level:</strong> {selectedCourse.level}</p>
                <p className="mb-0">
                  <strong>Price:</strong> {selectedCourse.isFree === true ? 'Free' : 'Free'}
                </p>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      {formData.studentId && formData.courseId && (
        <Alert variant="info" className="mb-3">
          <i className="bi bi-info-circle me-2"></i>
          Ready to enroll <strong>{selectedStudent?.name}</strong> in <strong>{selectedCourse?.title}</strong>
        </Alert>
      )}

      <div className="d-flex justify-content-end">
        <Button 
          variant="secondary" 
          className="me-2" 
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button 
          variant="primary" 
          type="submit"
          disabled={loading || submitting || !formData.studentId || !formData.courseId}
        >
          {submitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Enrolling...
            </>
          ) : (
            <>
              <i className="bi bi-bookmark-plus me-2"></i>
              Enroll Student
            </>
          )}
        </Button>
      </div>
    </Form>
  );
}