import { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Badge, Tab, Nav, Card } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getCourseById } from '../../data/mockCourses';
import { getLessonsByCourse } from '../../data/mockLessons';

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    const courseData = getCourseById(parseInt(courseId));
    if (!courseData) {
      navigate('/not-found');
      return;
    }
    setCourse(courseData);
    setLessons(getLessonsByCourse(parseInt(courseId)));
  }, [courseId, navigate]);

  const handleEnroll = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/courses/${courseId}` } });
      return;
    }
    // In a real app, this would make an API call to enroll
    navigate(`/student/courses/${courseId}`);
    
  };

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
    <Container className="py-5">
      <Row>
        <Col lg={8}>
          <div className="position-relative mb-4 rounded-4 overflow-hidden shadow-lg">
            <img
              src={course.thumbnail}
              alt={course.title}
              className="img-fluid w-100"
              style={{ height: '400px', objectFit: 'cover', filter: 'brightness(0.6)' }}
            />
            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-end p-4" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.8) 100%)', pointerEvents: 'none' }}>
              <h1 className="text-white fw-bold mb-2" style={{ textShadow: '0 2px 8px #000' }}>{course.title}</h1>
              <div className="d-flex gap-2 mb-2">
                <Badge bg="primary" className="fs-6 px-3 py-1 rounded-pill">{course.category}</Badge>
                <Badge bg="secondary" className="fs-6 px-3 py-1 rounded-pill">{course.level}</Badge>
              </div>
              <div className="d-flex align-items-center mb-2">
                <img src={course.instructor.avatar || 'https://placehold.co/40x40?text=I'} alt={course.instructor.name} width="40" height="40" className="rounded-circle me-2 border border-2 border-white" />
                <span className="text-white fw-semibold">{course.instructor.name}</span>
              </div>
              <div className="d-flex align-items-center">
                <div className="text-warning">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className={`bi bi-star${i < Math.round(course.rating) ? '-fill' : ''}`}></i>
                  ))}
                </div>
                <span className="text-white ms-2">{course.rating.toFixed(1)} / 5</span>
                <span className="text-white ms-3">
                  <i className="bi bi-people me-1"></i>
                  {course.enrolled.toLocaleString()} students
                </span>
              </div>
            </div>
          </div>

          <Tab.Container defaultActiveKey="overview">
            <Nav variant="tabs" className="mb-3 rounded-3 overflow-auto">
              <Nav.Item>
                <Nav.Link eventKey="overview" className="fw-semibold">Overview</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="curriculum" className="fw-semibold">Curriculum</Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content>
              <Tab.Pane eventKey="overview">
                <div className="py-3">
                  <h4 className="fw-bold mb-3"><i className="bi bi-info-circle me-2"></i>About This Course</h4>
                  <p className="fs-5 text-muted">{course.description}</p>

                  <h4 className="fw-bold mt-4 mb-3"><i className="bi bi-lightbulb me-2"></i>What You&apos;ll Learn</h4>
                  <ul className="mb-4">
                    <li>Learn the fundamentals of the subject</li>
                    <li>Apply your knowledge to real-world projects</li>
                    <li>Gain practical experience through hands-on exercises</li>
                    <li>Master advanced concepts and techniques</li>
                  </ul>

                  <h4 className="fw-bold mb-3"><i className="bi bi-clipboard-check me-2"></i>Requirements</h4>
                  <ul>
                    <li>Basic understanding of the subject</li>
                    <li>Computer with internet connection</li>
                    <li>Willingness to learn and practice</li>
                  </ul>
                </div>
              </Tab.Pane>

              <Tab.Pane eventKey="curriculum">
                <div className="py-3">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="mb-0 fw-bold"><i className="bi bi-list-ol me-2"></i>Course Content</h4>
                    <div className="text-muted">
                      {lessons.length} lessons • {course.duration}
                    </div>
                  </div>

                  {lessons.length > 0 ? (
                    <div className="list-group">
                      {lessons.map(lesson => (
                        <div key={lesson.id} className="list-group-item list-group-item-action d-flex align-items-center gap-3 py-3">
                          <img src={lesson.image || `https://placehold.co/80x60?text=Lesson`} alt={lesson.title} className="rounded shadow-sm" style={{ width: '80px', height: '60px', objectFit: 'cover' }} />
                          <div className="flex-grow-1">
                            <h5 className="mb-1">{lesson.title}</h5>
                            <p className="mb-1 text-muted">{lesson.description}</p>
                            <small className="text-secondary"><i className="bi bi-clock me-1"></i>{lesson.duration}</small>
                          </div>
                          <Button variant="outline-primary" size="sm" onClick={() => {
                            // Allow preview for everyone, no auth required
                            navigate(`/courses/${courseId}/lessons/${lesson.id}/preview`);
                          }}>
                            <i className="bi bi-play-circle me-1"></i>Preview
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <i className="bi bi-journal-text display-4 text-muted"></i>
                      <h3 className="mt-3">No lessons available</h3>
                      <p>Check back soon for new content!</p>
                    </div>
                  )}
                </div>
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Col>

        <Col lg={4}>
          <div className="position-sticky" style={{ top: '2rem' }}>
            <Card className="shadow-lg rounded-4 border-0">
              <Card.Body>
                <div className="mb-3 text-center">
                  <h3 className="h2 mb-0 fw-bold text-primary">₹{course.price}</h3>
                </div>

                <div className="d-grid gap-2 mb-3">
                  {isAuthenticated && user?.role === 'instructor' ? (
                    <Button
                      variant="outline-primary"
                      size="lg"
                      className="fw-semibold"
                      onClick={() => navigate(`/instructor/courses/${courseId}/edit`)}
                    >
                      <i className="bi bi-pencil-square me-2"></i>Edit Course
                    </Button>
                  ) : (
                    <Button
                      variant={user?.enrolledCourses?.includes(course.id) ? 'success' : 'primary'}
                      size="lg"
                      className="fw-semibold"
                      onClick={handleEnroll}
                    >
                      <i className={`bi ${user?.enrolledCourses?.includes(course.id) ? 'bi-play-circle' : 'bi-cart-plus'} me-2`}></i>
                      {user?.enrolledCourses?.includes(course.id) ? 'Continue Learning' : 'Enroll Now'}
                    </Button>
                  )}
                </div>

                <div className="mb-3">
                  <h5 className="fw-bold mb-3">This course includes:</h5>
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <i className="bi bi-play-circle me-2 text-primary"></i>
                      {course.duration} of on-demand video
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-file-earmark-arrow-down me-2 text-info"></i>
                      Downloadable resources
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-patch-check me-2 text-success"></i>
                      Certificate of completion
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-infinity me-2 text-warning"></i>
                      Full lifetime access
                    </li>
                  </ul>
                </div>

                <hr />

                <div className="d-flex justify-content-between text-muted small">
                  <div>
                    <i className="bi bi-people me-1"></i>
                    {course.enrolled.toLocaleString()} students
                  </div>
                  <div className="text-warning">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className={`bi bi-star${i < Math.round(course.rating) ? '-fill' : ''}`}></i>
                    ))}
                    <span className="ms-1">{course.rating.toFixed(1)}</span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
