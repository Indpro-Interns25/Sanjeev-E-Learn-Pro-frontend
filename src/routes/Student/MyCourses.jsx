import { useEffect, useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getCourseById } from '../../data/mockCourses';
import { getLessonsByCourse } from '../../data/mockLessons';
import LessonList from '../../components/LessonList';

export default function MyCourses() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    const courseData = getCourseById(parseInt(courseId));
    if (!courseData) {
      navigate('/not-found');
      return;
    }

    setCourse(courseData);
    const lessonData = getLessonsByCourse(parseInt(courseId));
    setLessons(lessonData);
  }, [courseId, navigate, user.id]);

  if (!course) {
    return (
      <div className="d-flex justify-content-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col lg={10}>
          <Card className="mb-4">
            <Card.Body>
              <h1 className="h2 mb-3">{course.title}</h1>
              <p className="text-muted mb-4">
                <i className="bi bi-person-circle me-2"></i>
                {course.instructor.name}
              </p>

              <LessonList
                lessons={lessons}
                userProgress={{}} // Empty progress object since we're not tracking
                onLessonSelect={(lessonId) => {
                  navigate(`/student/courses/${courseId}/lessons/${lessonId}`);
                }}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
