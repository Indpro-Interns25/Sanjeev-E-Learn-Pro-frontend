import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert, ProgressBar } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';
import { useUi } from '../../hooks/useUi';
import CourseForm from '../../components/forms/CourseForm';
import { createCourseWithFile, getCourseById, updateCourse } from '../../services/courses';
import DashboardLayout from '../../components/DashboardLayout';

export default function InstructorAddCourse() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useUi();
  const [alert, setAlert] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Check if editing mode (via query param or location state)
  useEffect(() => {
    const idFromQuery = searchParams.get('id');
    const stateId = location.state?.courseId;
    const courseId = stateId || idFromQuery;
    
    if (courseId) {
      setIsEditMode(true);
      // Fetch course data
      (async () => {
        try {
          const data = await getCourseById(courseId);
          // Verify instructor owns this course
          if (data.instructor_id !== user.id && data.user_id !== user.id) {
            showToast('You are not authorized to edit this course', 'danger');
            navigate('/instructor/dashboard');
            return;
          }
          setEditingCourse(data);
        } catch (err) {
          console.error('Failed to load course:', err);
          showToast('Failed to load course: ' + err.message, 'danger');
          setAlert({ message: 'Failed to load course: ' + err.message, type: 'danger' });
        }
      })();
    }
  }, [location.state, searchParams, user.id, navigate, showToast]);

  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleCourseSubmit = async (courseData, thumbnailFile) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      if (isEditMode && editingCourse?.id) {
        // For editing, we'll use the regular update endpoint
        // If thumbnailFile is provided, we'd need a separate upload endpoint
        // For now, just update the course data
        await updateCourse(editingCourse.id, courseData);
        showToast('Course updated successfully!', 'success');
        showAlert('Course updated successfully!', 'success');
      } else {
        // Create new course with file upload
        await createCourseWithFile(
          courseData,
          thumbnailFile,
          (progress) => setUploadProgress(progress)
        );
        showToast('Course created successfully!', 'success');
        showAlert('Course created successfully!', 'success');
      }

      // Navigate back to instructor dashboard after 2 seconds
      setTimeout(() => {
        navigate('/instructor/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Course save error:', error);
      const errorMessage = error.message || 'Failed to save course';
      showToast(errorMessage, 'danger');
      showAlert(errorMessage, 'danger');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleCancel = () => {
    navigate('/instructor/dashboard');
  };

  return (
    <DashboardLayout title={isEditMode ? 'Edit Course' : 'Create New Course'}>
      <Container className="py-4">
        {alert && (
          <Alert variant={alert.type} dismissible onClose={() => setAlert(null)} className="mb-4">
            {alert.message}
          </Alert>
        )}

        <Row>
          <Col lg={10} xl={8} className="mx-auto">
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-bottom py-3">
                <div className="d-flex justify-content-between align-items-center">
                  <h4 className="mb-0">
                    <i className={`bi ${isEditMode ? 'bi-pencil-square' : 'bi-plus-circle'} me-2`}></i>
                    {isEditMode ? 'Edit Course' : 'Create New Course'}
                  </h4>
                  <Button variant="outline-secondary" size="sm" onClick={handleCancel}>
                    <i className="bi bi-arrow-left me-2"></i>
                    Back
                  </Button>
                </div>
              </Card.Header>
              
              <Card.Body className="p-4">
                {isUploading && (
                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted small">
                        <i className="bi bi-cloud-upload me-2"></i>
                        Uploading course data...
                      </span>
                      <span className="text-primary fw-semibold">{uploadProgress}%</span>
                    </div>
                    <ProgressBar 
                      now={uploadProgress} 
                      animated 
                      striped 
                      variant="primary"
                    />
                  </div>
                )}

                <CourseForm 
                  onSubmit={handleCourseSubmit}
                  isEdit={isEditMode}
                  course={editingCourse}
                />
                
                <div className="mt-4 pt-3 border-top">
                  <p className="text-muted small mb-0">
                    <i className="bi bi-info-circle me-2"></i>
                    {isEditMode 
                      ? 'Make changes to your course details. Students enrolled in this course will see the updated information.'
                      : 'After creating the course, you can add lectures, videos, and other content from the course management page.'
                    }
                  </p>
                </div>
              </Card.Body>
            </Card>

            {/* Info Cards */}
            <Row className="mt-4 g-3">
              <Col md={4}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body className="text-center">
                    <div className="text-primary mb-2">
                      <i className="bi bi-camera-video display-6"></i>
                    </div>
                    <h6 className="fw-semibold">Add Lectures</h6>
                    <p className="text-muted small mb-0">
                      After course creation, add video lectures and content
                    </p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body className="text-center">
                    <div className="text-success mb-2">
                      <i className="bi bi-people display-6"></i>
                    </div>
                    <h6 className="fw-semibold">Manage Students</h6>
                    <p className="text-muted small mb-0">
                      Track student progress and engagement
                    </p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body className="text-center">
                    <div className="text-warning mb-2">
                      <i className="bi bi-graph-up display-6"></i>
                    </div>
                    <h6 className="fw-semibold">View Analytics</h6>
                    <p className="text-muted small mb-0">
                      Monitor course performance and ratings
                    </p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </DashboardLayout>
  );
}
