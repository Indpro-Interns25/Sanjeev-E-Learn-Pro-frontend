import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getUserEnrollments } from '../../services/enrollment';
import { getAllCourses } from '../../services/courses';
import { getAllLessons } from '../../services/lessons';

export default function MyEnrolledCourses() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get user ID (with fallbacks)
        const userId = user?.id || user?.user_id || user?.ID;

        console.warn('🎯 Fetching enrolled courses for user:', userId);

        // Fetch user enrollments, all courses, and lessons in parallel
        const [enrollments, allCourses, allLessons] = await Promise.all([
          getUserEnrollments(userId),
          getAllCourses(),
          getAllLessons()
        ]);

        console.warn('📚 Enrollments:', enrollments);
        console.warn('📖 All courses:', allCourses);

        // Check if we have any enrollments (from API or localStorage)
        if (!enrollments || enrollments.length === 0) {
          console.warn('� No enrollments found for this user');
          setEnrolledCourses([]);
          setLoading(false);
          return;
        }

        // Get the course IDs from enrollments
        const enrolledCourseIds = enrollments.map(enrollment => enrollment.course_id);
        
        // Filter courses to only show enrolled ones
        const enrolledCoursesData = allCourses.filter(course => 
          enrolledCourseIds.includes(course.id)
        );

        // Add enrollment info to courses
        const coursesWithEnrollmentInfo = enrolledCoursesData.map(course => {
          const enrollment = enrollments.find(e => e.course_id === course.id);
          return {
            ...course,
            enrollment: enrollment,
            progress: enrollment?.progress_percentage || enrollment?.progress || 0,
            enrolled_date: enrollment?.enrolled_at || enrollment?.enrollment_date || enrollment?.created_at
          };
        });

        setEnrolledCourses(coursesWithEnrollmentInfo);
        setLessons(allLessons);

        console.warn('✅ Enrolled courses loaded:', coursesWithEnrollmentInfo);

      } catch (err) {
        console.error('Error fetching enrolled courses:', err);
        setError(err.message);
        // Show empty state on error - only use backend data
        setEnrolledCourses([]);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user) {
      fetchEnrolledCourses();
    } else {
      // If not authenticated, show empty state
      setEnrolledCourses([]);
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const getCourseLessons = (courseId) => {
    return lessons.filter(lesson => 
      lesson.course_id === courseId || lesson.courseId === courseId
    );
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
          <Spinner animation="border" role="status" className="text-primary">
            <span className="visually-hidden">Loading your courses...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1>My Enrolled Courses</h1>
              <p className="text-muted">Continue your learning journey</p>
            </div>
            <div className="d-flex gap-2">
              <Button variant="outline-primary" onClick={() => navigate('/student/courses')}>
                <i className="bi bi-plus-circle me-2"></i>
                Browse More Courses
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="warning" className="mb-4">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Could not connect to server. Please try again later.
        </Alert>
      )}

      {enrolledCourses.length === 0 ? (
        <Row className="py-5">
          <Col className="text-center">
            <i className="bi bi-journal-bookmark display-1 text-muted"></i>
            <h3 className="mt-3">No Enrolled Courses</h3>
            <p className="text-muted mb-4">You haven&apos;t enrolled in any courses yet. Start your learning journey!</p>
            <Button variant="primary" onClick={() => navigate('/student/courses')}>
              <i className="bi bi-search me-2"></i>
              Browse Available Courses
            </Button>
          </Col>
        </Row>
      ) : (
        <div className="enrolled-courses">
          {enrolledCourses.map((course, index) => {
            const courseLessons = getCourseLessons(course.id);

            return (
              <div key={course.id} className="mb-5">
                <Row>
                  <Col lg={9}>
                    {/* Course Header */}
                    <div className="mb-4">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <h2 className="h3 mb-2">{course.title}</h2>
                          <nav aria-label="breadcrumb">
                            <ol className="breadcrumb">
                              <li className="breadcrumb-item">
                                <Button variant="link" className="p-0" onClick={() => navigate('/student/my-courses')}>
                                  My Courses
                                </Button>
                              </li>
                              <li className="breadcrumb-item active" aria-current="page">
                                {course.title}
                              </li>
                            </ol>
                          </nav>
                        </div>
                        <div className="d-flex gap-2">
                          <Badge bg={course.level === 'beginner' ? 'success' : 
                                    course.level === 'intermediate' ? 'warning' : 'info'}>
                            {course.level}
                          </Badge>
                          <Badge bg="secondary">{course.category}</Badge>
                        </div>
                      </div>

                      {/* Course Info Card */}
                      <Card className="mb-4">
                        <Card.Body>
                          <Row className="align-items-center">
                            <Col md={8}>
                              <p className="mb-2">{course.description}</p>
                              <div className="d-flex gap-4 text-muted small">
                                <span><i className="bi bi-person me-1"></i>{course.instructor || course.instructor_name}</span>
                                <span><i className="bi bi-clock me-1"></i>{course.duration}</span>
                                <span><i className="bi bi-calendar-check me-1"></i>Enrolled: {course.enrolled_date ? new Date(course.enrolled_date).toLocaleDateString() : 'Recently'}</span>
                              </div>
                            </Col>
                            <Col md={4}>
                              <div className="text-end">
                                <div className="mb-2">
                                  <span className="h4 text-primary">{course.progress || 0}%</span>
                                  <small className="text-muted ms-2">Complete</small>
                                </div>
                                <div className="progress mb-2" style={{ height: '8px' }}>
                                  <div 
                                    className="progress-bar bg-primary"
                                    style={{ width: `${course.progress || 0}%` }}
                                  ></div>
                                </div>
                                <Button variant="primary" onClick={() => navigate(`/courses/${course.id}`)}>
                                  <i className="bi bi-play-circle me-2"></i>
                                  Continue Learning
                                </Button>
                              </div>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    </div>
                  </Col>

                  <Col lg={3}>
                    {/* Course Content Sidebar */}
                    <div className="sticky-top" style={{ top: '2rem' }}>
                      <Card>
                        <Card.Header>
                          <h5 className="mb-0">
                            <i className="bi bi-list-ol me-2"></i>
                            Course Content
                          </h5>
                          <small className="text-muted">{courseLessons.length} lessons</small>
                        </Card.Header>
                        <Card.Body className="p-0">
                          <div style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                            {courseLessons.length > 0 ? (
                              courseLessons.map((lesson, lessonIndex) => (
                                <Button
                                  key={lesson.id}
                                  variant="link"
                                  className="w-100 text-start px-3 py-3 border-bottom text-decoration-none"
                                  onClick={() => navigate(`/courses/${course.id}/lessons/${lesson.id}/preview`)}
                                >
                                  <div className="d-flex align-items-center">
                                    <div className="me-3">
                                      <span className="badge bg-primary rounded-circle">
                                        {lessonIndex + 1}
                                      </span>
                                    </div>
                                    <div className="flex-grow-1">
                                      <div className="fw-medium text-dark mb-1">
                                        {lesson.title}
                                      </div>
                                      <small className="text-muted d-block">
                                        <i className="bi bi-clock me-1"></i>
                                        {lesson.duration}
                                      </small>
                                    </div>
                                    <div>
                                      <i className="bi bi-play-circle text-primary"></i>
                                    </div>
                                  </div>
                                </Button>
                              ))
                            ) : (
                              <div className="p-3 text-center text-muted">
                                <i className="bi bi-journal-text display-4 mb-2"></i>
                                <p className="mb-0">No lessons available yet</p>
                              </div>
                            )}
                          </div>
                        </Card.Body>
                      </Card>
                    </div>
                  </Col>
                </Row>

                {/* Separator between courses */}
                {index < enrolledCourses.length - 1 && (
                  <hr className="my-5" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </Container>
  );
}