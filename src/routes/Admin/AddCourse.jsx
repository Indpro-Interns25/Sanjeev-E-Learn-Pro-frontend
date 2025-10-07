import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import CourseForm from '../../components/forms/CourseForm';
import { createCourseAdmin, updateCourseAdmin } from '../../services/admin';
import { getCourseById } from '../../services/courses';

export default function AddCourse() {
  const navigate = useNavigate();
  const [alert, setAlert] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // If navigated here with state or query param ?id=..., enable edit
  useEffect(() => {
    const idFromQuery = searchParams.get('id');
    const stateId = location.state && location.state.courseId;
    const courseId = stateId || idFromQuery;
    if (courseId) {
      setIsEditMode(true);
      // Fetch course data to prefill form
      (async () => {
        try {
          const data = await getCourseById(courseId);
          setEditingCourse(data);
        } catch (err) {
          console.error('Failed to load course for editing:', err);
          setAlert({ message: 'Failed to load course for editing: ' + (err.message || err), type: 'danger' });
        }
      })();
    }
  }, [location.state, searchParams]);

  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleCourseSubmit = async (courseData) => {
    console.warn('🚀 AddCourse: submit handler called with:', courseData, 'isEditMode=', isEditMode);
    try {
      if (isEditMode && editingCourse && editingCourse.id) {
        const result = await updateCourseAdmin(editingCourse.id, courseData);
        console.warn('🚀 AddCourse: updateCourseAdmin result:', result);
        showAlert('Course updated successfully!', 'success');
      } else {
        const result = await createCourseAdmin(courseData);
        console.warn('🚀 AddCourse: createCourseAdmin result:', result);
        showAlert('Course created successfully!', 'success');
      }

      // Navigate back to admin dashboard courses section after 2 seconds
      setTimeout(() => {
        navigate('/admin-dashboard');
      }, 2000);
    } catch (error) {
      console.error('🚨 AddCourse: course save error:', error);
      // Show detailed message when available
      const detailed = error.response?.data || error.message || String(error);
      showAlert(`Error saving course: ${detailed}`, 'danger');
    }
  };

  const handleCancel = () => {
    navigate('/admin-dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Admin Header */}
      <div className="bg-dark text-white py-3 mb-4">
        <Container>
          <Row>
            <Col>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h4 className="mb-0">
                    <i className="bi bi-mortarboard me-2"></i>
                    Admin Panel - Add New Course
                  </h4>
                </div>
                <div>
                  <Button variant="outline-light" onClick={handleCancel}>
                    <i className="bi bi-arrow-left me-2"></i>
                    Back to Dashboard
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Main Content */}
      <Container>
        {alert && (
          <Alert variant={alert.type} dismissible onClose={() => setAlert(null)}>
            {alert.message}
          </Alert>
        )}

        <Row>
          <Col lg={8} className="mx-auto">
            <Card className="shadow-sm">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">
                  <i className="bi bi-plus-circle me-2"></i>
                  Create New Course
                </h5>
              </Card.Header>
              <Card.Body className="p-4">
                <CourseForm 
                  onSubmit={handleCourseSubmit}
                  isEdit={isEditMode}
                  course={editingCourse}
                />
                
                <div className="mt-4 pt-3 border-top">
                  <div className="d-flex justify-content-end">
                    <Button 
                      variant="secondary" 
                      className="me-3" 
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}