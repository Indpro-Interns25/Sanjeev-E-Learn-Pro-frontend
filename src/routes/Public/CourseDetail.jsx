import { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Badge, Tab, Nav, Card, Alert, Spinner, Modal } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { formatCourseData } from '../../services/courses';
import { getCourseCurriculum } from '../../services/lessons';
import { enrollUserInCourse, getUserEnrollments } from '../../services/enrollment';
import Comments from '../../components/Comments';

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [totalLessons, setTotalLessons] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.warn('🔍 Fetching curriculum for course ID:', courseId);
        
        // Fetch course curriculum (includes course details + lessons)
        const curriculumData = await getCourseCurriculum(parseInt(courseId));
        
        console.warn('📚 Curriculum data received:', curriculumData);
        
        // Set course data
        setCourse(formatCourseData(curriculumData.course));
        
        // Set lessons data
        setLessons(curriculumData.curriculum || []);
        
        // Set total lessons count
        setTotalLessons(curriculumData.totalLessons || curriculumData.curriculum?.length || 0);
        
        // Check enrollment status if user is authenticated
        if (isAuthenticated && user) {
          let userId = user?.id || user?.user_id || user?.ID;
          
          // Fallback for demo purposes
          if (!userId) {
            userId = 1; // Demo user ID
          }
          
          if (userId) {
            try {
              const enrollments = await getUserEnrollments(userId);
              const enrolled = enrollments.some(enrollment => 
                enrollment.course_id === parseInt(courseId)
              );
              setIsEnrolled(enrolled);
              console.warn('📋 Enrollment status:', enrolled);
            } catch (enrollmentError) {
              console.warn('⚠️ Could not check enrollment status:', enrollmentError.message);
              setIsEnrolled(false);
            }
          }
        }
        
        console.warn('✅ Data loaded successfully - Lessons:', curriculumData.curriculum?.length || 0);
        
      } catch (err) {
        console.error('❌ Error fetching course curriculum:', err);
        setError(err.message);
        
        if (err.message === 'Course curriculum not found') {
          navigate('/not-found');
        }
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseData();
    }
  }, [courseId, navigate, isAuthenticated, user]);

  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 4000);
  };

  const handleEnroll = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/courses/${courseId}` } });
      return;
    }
    
    if (isEnrolled) {
      // If already enrolled, navigate to appropriate courses page
      if (isAuthenticated && user?.id) {
        navigate(`/student/my-courses`);
      } else {
        navigate(`/catalog`);
      }
      return;
    }
    
    // Show enrollment modal for confirmation
    setShowEnrollModal(true);
  };

  const confirmEnrollment = async () => {
    // Try to get user ID from different possible fields
    let userId = user?.id || user?.user_id || user?.ID;
    
    // Fallback for demo/testing purposes - use a demo user ID if no user is found
    if (!userId) {
      console.warn('⚠️ No authenticated user found, using demo user ID for testing');
      userId = 1; // Demo user ID
      showAlert('Demo enrollment (no user logged in)', 'info');
    }

    console.warn('🎯 Starting enrollment process...');
    console.warn('User object:', user);
    console.warn('User ID (resolved):', userId);
    console.warn('Course ID:', courseId);

    setEnrolling(true);
    try {
      const result = await enrollUserInCourse(userId, parseInt(courseId));
      console.warn('✅ Enrollment result:', result);
      
      setIsEnrolled(true);
      setShowEnrollModal(false);
      showAlert(`Successfully enrolled in ${course.title}!`, 'success');
      
      // Don't auto-navigate if using demo user
      if (user?.id) {
        setTimeout(() => {
          navigate('/student/my-courses');
        }, 2000);
      } else {
        // If not authenticated, redirect to catalog instead
        setTimeout(() => {
          navigate('/catalog');
        }, 2000);
      }
      
    } catch (err) {
      console.error('❌ Enrollment error:', err);
      showAlert(`Error enrolling in course: ${err.message}`, 'danger');
    } finally {
      setEnrolling(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6} className="text-center">
            <Spinner animation="border" role="status" className="mb-3">
              <span className="visually-hidden">Loading course...</span>
            </Spinner>
            <p>Loading course details...</p>
          </Col>
        </Row>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <Alert variant="danger" className="text-center">
              <h4>Unable to load course</h4>
              <p>{error}</p>
              <Button variant="outline-danger" onClick={() => navigate('/catalog')}>
                Browse Other Courses
              </Button>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  // No course found
  if (!course) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <Alert variant="warning" className="text-center">
              <h4>Course not found</h4>
              <p>The course you&apos;re looking for doesn&apos;t exist.</p>
              <Button variant="outline-primary" onClick={() => navigate('/catalog')}>
                Browse Available Courses
              </Button>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      {alert && (
        <Alert variant={alert.type} dismissible onClose={() => setAlert(null)} className="mb-4">
          {alert.message}
        </Alert>
      )}
      
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
                <img src='https://placehold.co/40x40?text=I' alt={course.instructor?.name || course.instructor_name || 'Instructor'} width="40" height="40" className="rounded-circle me-2 border border-2 border-white" />
                <span className="text-white fw-semibold">{course.instructor?.name || course.instructor_name || 'Instructor'}</span>
              </div>
              <div className="d-flex align-items-center">
                <div className="text-warning">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className={`bi bi-star${i < Math.round(parseFloat(course.rating || 0)) ? '-fill' : ''}`}></i>
                  ))}
                </div>
                <span className="text-white ms-2">{parseFloat(course.rating || 0).toFixed(1)} / 5</span>
                <span className="text-white ms-3">
                  <i className="bi bi-people me-1"></i>
                  {(course.enrolled_count || course.enrolled || 0).toLocaleString()} students
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
              <Nav.Item>
                <Nav.Link eventKey="reviews" className="fw-semibold">Reviews</Nav.Link>
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
                      {totalLessons} lessons • {course.duration || '10 weeks'}
                    </div>
                  </div>

                  {lessons && lessons.length > 0 ? (
                    <div className="list-group">
                      {lessons.map((lesson, index) => (
                        <div key={lesson.id || index} className="list-group-item list-group-item-action d-flex align-items-center gap-3 py-3">
                          <img 
                            src={lesson.thumbnail || lesson.image || `https://placehold.co/80x60?text=Lesson+${lesson.order_sequence || index + 1}`} 
                            alt={lesson.title} 
                            className="rounded shadow-sm" 
                            style={{ width: '80px', height: '60px', objectFit: 'cover' }} 
                          />
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <span className="badge bg-primary">{lesson.order_sequence || index + 1}</span>
                              <h5 className="mb-0">{lesson.title}</h5>
                            </div>
                            <p className="mb-1 text-muted">{lesson.description || `Lesson ${lesson.order_sequence || index + 1} content`}</p>
                            <small className="text-secondary">
                              <i className="bi bi-clock me-1"></i>
                              {lesson.duration || '10 min'}
                            </small>
                          </div>
                          <Button variant="outline-primary" size="sm" onClick={() => {
                            // Allow preview for everyone, no auth required
                            navigate(`/courses/${courseId}/lessons/${lesson.id || index + 1}/preview`);
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

              <Tab.Pane eventKey="reviews">
                <div className="py-3">
                  <Comments courseId={courseId} />
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
                  <h3 className="h2 mb-0 fw-bold text-success">Free</h3>
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
                      variant={isEnrolled ? 'success' : 'primary'}
                      size="lg"
                      className="fw-semibold"
                      onClick={handleEnroll}
                      disabled={enrolling}
                    >
                      {enrolling ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Enrolling...
                        </>
                      ) : (
                        <>
                          <i className={`bi ${isEnrolled ? 'bi-play-circle' : 'bi-cart-plus'} me-2`}></i>
                          {isEnrolled ? 'View My Courses' : 'Enroll Now'}
                        </>
                      )}
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
                    {(course.enrolled_count || course.enrolled || 0).toLocaleString()} students
                  </div>
                  <div className="text-warning">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className={`bi bi-star${i < Math.round(parseFloat(course.rating || 0)) ? '-fill' : ''}`}></i>
                    ))}
                    <span className="ms-1">{parseFloat(course.rating || 0).toFixed(1)}</span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>

      {/* Enrollment Confirmation Modal */}
      <Modal show={showEnrollModal} onHide={() => setShowEnrollModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-bookmark-plus me-2"></i>
            Enroll in Course
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {course && (
            <>
              <div className="text-center mb-4">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="img-fluid rounded"
                  style={{ maxHeight: '120px', objectFit: 'cover' }}
                />
              </div>
              
              <h5 className="text-center mb-3">{course.title}</h5>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Course Level:</span>
                  <Badge bg={course.level === 'beginner' ? 'success' : 
                            course.level === 'intermediate' ? 'warning' : 'info'}>
                    {course.level}
                  </Badge>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Duration:</span>
                  <span>{course.duration}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Lessons:</span>
                  <span>{totalLessons} lessons</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Price:</span>
                  <span className="text-success fw-bold">Free</span>
                </div>
              </div>

              <Alert variant="info" className="mb-3">
                <i className="bi bi-info-circle me-2"></i>
                By enrolling, you&apos;ll get lifetime access to all course materials and updates.
              </Alert>

              <p className="text-muted text-center">
                Ready to start your learning journey?
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEnrollModal(false)} disabled={enrolling}>
            Cancel
          </Button>
          <Button variant="primary" onClick={confirmEnrollment} disabled={enrolling}>
            {enrolling ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Enrolling...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle me-2"></i>
                Confirm Enrollment
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
