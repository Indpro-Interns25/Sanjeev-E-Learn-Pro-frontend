import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getCourseById } from '../../services/courses';
import { getAllLessons } from '../../services/lessons';
import LessonList from '../../components/LessonList';

export default function MyCourses() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch course data from API
        const courseData = await getCourseById(parseInt(courseId));
        
        if (!courseData) {
          setError('Course not found');
          navigate('/not-found');
          return;
        }

        // Fetch all lessons and filter for this course
        const allLessons = await getAllLessons();
        const courseLessons = allLessons.filter(lesson =>
          lesson.course_id === parseInt(courseId) || lesson.courseId === parseInt(courseId)
        );

        setCourse(courseData);
        setLessons(courseLessons);
        
      } catch (err) {
        console.error('Error fetching course data:', err);
        setError(err.message || 'Failed to load course');
        navigate('/not-found');
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseData();
    }
  }, [courseId, navigate]);

  if (loading) {
    return (
      <Container className="py-5">
        <div className="d-flex justify-content-center">
          <Spinner animation="border" role="status" className="text-primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col lg={8}>
            <Alert variant="danger">
              <h4 className="alert-heading">Course Not Found</h4>
              <p>{error}</p>
              <Button variant="outline-danger" onClick={() => navigate('/student/dashboard')}>
                Go Back to Dashboard
              </Button>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  if (!course) {
    return (
      <Container className="py-5">
        <div className="d-flex justify-content-center p-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col lg={10}>
          <Card className="mb-4">
            <Card.Body>
              <div className="mb-3">
                <Button variant="link" className="p-0" onClick={() => navigate('/student/dashboard')}>
                  <i className="bi bi-arrow-left me-2"></i>Back to Dashboard
                </Button>
              </div>
              <h1 className="h2 mb-3">{course.title}</h1>
              <p className="text-muted mb-4">
                <i className="bi bi-person-circle me-2"></i>
                {course.instructor?.name || course.instructor_name || 'Unknown Instructor'}
              </p>

              {lessons.length > 0 ? (
                <LessonList
                  lessons={lessons}
                  userProgress={{}}
                  onLessonSelect={(lessonId) => {
                    navigate(`/student/courses/${courseId}/lessons/${lessonId}`);
                  }}
                />
              ) : (
                <Alert variant="info">
                  No lessons available for this course yet.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
