import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, ListGroup } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getCourseById } from '../../data/mockCourses';
import { getLessonsByCourse, isLessonComplete } from '../../data/mockLessons';
import LessonList from '../../components/LessonList';
import ProgressBar from '../../components/ProgressBar';

export default function MyCourses() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [userProgress, setUserProgress] = useState({});

  useEffect(() => {
    const courseData = getCourseById(parseInt(courseId));
    if (!courseData) {
      navigate('/not-found');
      return;
    }

    setCourse(courseData);
    const lessonData = getLessonsByCourse(parseInt(courseId));
    setLessons(lessonData);

    // Get completion status for each lesson
    const progress = {};
    lessonData.forEach(lesson => {
      progress[lesson.id] = isLessonComplete(user.id, lesson.id);
    });
    setUserProgress(progress);
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

  const completedLessons = Object.values(userProgress).filter(Boolean).length;
  const totalLessons = lessons.length;

  return (
    <Container className="py-4">
      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Body>
              <h1 className="h2 mb-3">{course.title}</h1>
              <p className="text-muted mb-4">
                <i className="bi bi-person-circle me-2"></i>
                {course.instructor.name}
              </p>

              <div className="mb-4">
                <ProgressBar
                  value={completedLessons}
                  total={totalLessons}
                  variant="success"
                  showLabel={true}
                />
              </div>

              <LessonList
                lessons={lessons}
                userProgress={userProgress}
                onLessonSelect={(lessonId) => {
                  navigate(`/student/courses/${courseId}/lessons/${lessonId}`);
                }}
              />
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="sticky-top" style={{ top: '2rem' }}>
            <Card.Header>
              <h5 className="mb-0">Course Resources</h5>
            </Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <i className="bi bi-file-pdf me-2"></i>
                Course Syllabus
              </ListGroup.Item>
              <ListGroup.Item>
                <i className="bi bi-file-earmark-text me-2"></i>
                Reference Materials
              </ListGroup.Item>
              <ListGroup.Item>
                <i className="bi bi-file-earmark-zip me-2"></i>
                Project Files
              </ListGroup.Item>
            </ListGroup>
            <Card.Footer>
              <small className="text-muted">
                Last updated: {new Date().toLocaleDateString()}
              </small>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
