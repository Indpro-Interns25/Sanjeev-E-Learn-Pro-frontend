import { useState, useEffect } from 'react';
import { Container, Card, Button, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import CourseForm from '../../components/forms/CourseForm';
import { getCourseById } from '../../data/mockCourses';
import DashboardLayout from '../../components/DashboardLayout';

export default function CourseManage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [error, setError] = useState(null);
  const isEdit = Boolean(courseId);

  useEffect(() => {
    if (isEdit) {
      const courseData = getCourseById(parseInt(courseId));
      if (!courseData) {
        navigate('/not-found');
        return;
      }
      setCourse(courseData);
    }
  }, [courseId, isEdit, navigate]);

  const handleSubmit = async (formData) => {
    try {
      // In a real app, this would be an API call
      console.warn('Submitting course data:', formData);
      
      if (isEdit) {
        // Update existing course
        // await updateCourse(courseId, formData);
        navigate(`/instructor/courses/${courseId}`);
      } else {
        // Create new course
        // const newCourse = await createCourse(formData);
        navigate('/instructor/dashboard');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <DashboardLayout title={isEdit ? 'Edit Course' : 'New Course'}>
    <Container className="py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <Card className="shadow-lg rounded-4">
            <Card.Header className="bg-primary text-white rounded-top-4">
              <h1 className="h3 mb-0">
                <i className={`bi ${isEdit ? 'bi-pencil-square' : 'bi-plus-circle'} me-2`}></i>
                {isEdit ? 'Edit Course' : 'Create New Course'}
              </h1>
            </Card.Header>
            <Card.Body>
              {error && (
                <Alert variant="danger" dismissible onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}
              <CourseForm
                course={course}
                onSubmit={handleSubmit}
                isEdit={isEdit}
              />
            </Card.Body>
            <Card.Footer className="text-end rounded-bottom-4">
              <Button
                variant="link"
                className="me-2"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
            </Card.Footer>
          </Card>
        </div>
      </div>
    </Container>
    </DashboardLayout>
  );
}
