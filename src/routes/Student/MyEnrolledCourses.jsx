import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getUserEnrollments } from '../../services/enrollment';
import { getAllCourses } from '../../services/courses';
import { getAllLessons } from '../../services/lessons';

export default function MyEnrolledCourses() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showCourseModal, setShowCourseModal] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchEnrolledCourses();
    } else {
      // If not authenticated, redirect to login or show demo data
      fetchDemoData();
    }
  }, [isAuthenticated, user]);

  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user ID (with fallbacks)
      const userId = user?.id || user?.user_id || user?.ID || 1; // Demo user fallback

      console.warn('🎯 Fetching enrolled courses for user:', userId);

      // Fetch user enrollments, all courses, and lessons in parallel
      const [enrollments, allCourses, allLessons] = await Promise.all([
        getUserEnrollments(userId),
        getAllCourses(),
        getAllLessons()
      ]);

      console.warn('📚 Enrollments:', enrollments);
      console.warn('📖 All courses:', allCourses);

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
      setCourses(allCourses);
      setLessons(allLessons);

      console.warn('✅ Enrolled courses loaded:', coursesWithEnrollmentInfo);

    } catch (err) {
      console.error('Error fetching enrolled courses:', err);
      setError(err.message);
      fetchDemoData();
    } finally {
      setLoading(false);
    }
  };

  const fetchDemoData = () => {
    // Demo data when backend is not available or user not authenticated
    const demoEnrolledCourses = [
      {
        id: 1,
        title: 'React Fundamentals',
        description: 'Learn the basics of React framework',
        category: 'Programming',
        level: 'beginner',
        price: '49.99',
        instructor: 'John Smith',
        duration: '4 hours',
        lesson_count: 12,
        progress: 75,
        enrolled_date: '2024-01-15'
      },
      {
        id: 2,
        title: 'Advanced JavaScript',
        description: 'Master advanced JavaScript concepts',
        category: 'Programming',
        level: 'advanced',
        price: '79.99',
        instructor: 'Jane Doe',
        duration: '6 hours',
        lesson_count: 18,
        progress: 30,
        enrolled_date: '2024-01-20'
      }
    ];

    setEnrolledCourses(demoEnrolledCourses);
    setLoading(false);
  };

  const viewCourseDetails = (course) => {
    setSelectedCourse(course);
    setShowCourseModal(true);
  };

  const continueLearning = (course) => {
    // Navigate to course lessons or course detail page
    navigate(`/courses/${course.id}`);
  };

  const getCourseLessons = (courseId) => {
    return lessons.filter(lesson => lesson.course_id === courseId);
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
            <Button variant="outline-primary" onClick={() => navigate('/student/courses')}>
              <i className="bi bi-plus-circle me-2"></i>
              Browse More Courses
            </Button>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="warning" className="mb-4">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Could not connect to server. Showing demo courses.
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
        <Row>
          {enrolledCourses.map(course => (
            <Col key={course.id} lg={4} md={6} className="mb-4">
              <Card className="h-100 shadow-sm">
                <Card.Body className="d-flex flex-column">
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <Badge bg={course.level === 'beginner' ? 'success' : 
                                course.level === 'intermediate' ? 'warning' : 'info'}>
                        {course.level}
                      </Badge>
                      <span className="text-muted">{course.category}</span>
                    </div>
                    
                    <h5 className="card-title">{course.title}</h5>
                    <p className="card-text text-muted">{course.description}</p>
                  </div>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between text-sm">
                      <span><i className="bi bi-person me-1"></i>{course.instructor}</span>
                      <span><i className="bi bi-clock me-1"></i>{course.duration}</span>
                    </div>
                    <div className="d-flex justify-content-between text-sm mt-1">
                      <span><i className="bi bi-play-circle me-1"></i>{course.lesson_count} lessons</span>
                      <span className="text-muted">
                        Enrolled: {course.enrolled_date ? new Date(course.enrolled_date).toLocaleDateString() : 'Recently'}
                      </span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div 
                        className="progress-bar" 
                        role="progressbar" 
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="mt-auto d-grid gap-2">
                    <Button 
                      variant="primary" 
                      onClick={() => continueLearning(course)}
                    >
                      <i className="bi bi-play-circle me-2"></i>
                      {course.progress > 0 ? 'Continue Learning' : 'Start Course'}
                    </Button>
                    <Button 
                      variant="outline-secondary" 
                      size="sm"
                      onClick={() => viewCourseDetails(course)}
                    >
                      <i className="bi bi-eye me-2"></i>
                      View Details
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Course Details Modal */}
      <Modal show={showCourseModal} onHide={() => setShowCourseModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selectedCourse?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCourse && (
            <>
              <Row className="mb-4">
                <Col md={8}>
                  <p className="lead">{selectedCourse.description}</p>
                  <div className="mb-3">
                    <Badge bg={selectedCourse.level === 'beginner' ? 'success' : 
                              selectedCourse.level === 'intermediate' ? 'warning' : 'info'} 
                           className="me-2">
                      {selectedCourse.level}
                    </Badge>
                    <Badge bg="secondary">{selectedCourse.category}</Badge>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="text-end">
                    <div className="mb-2">
                      <div className="progress" style={{ height: '10px' }}>
                        <div 
                          className="progress-bar" 
                          style={{ width: `${selectedCourse.progress}%` }}
                        ></div>
                      </div>
                      <small className="text-muted">{selectedCourse.progress}% Complete</small>
                    </div>
                    <p className="text-muted mb-1">
                      <i className="bi bi-person me-1"></i>{selectedCourse.instructor}
                    </p>
                    <p className="text-muted mb-1">
                      <i className="bi bi-clock me-1"></i>{selectedCourse.duration}
                    </p>
                    <p className="text-muted">
                      <i className="bi bi-play-circle me-1"></i>{selectedCourse.lesson_count} lessons
                    </p>
                  </div>
                </Col>
              </Row>

              <h5>Course Lessons</h5>
              <div className="list-group">
                {getCourseLessons(selectedCourse.id).map((lesson, index) => (
                  <div 
                    key={lesson.id} 
                    className="list-group-item list-group-item-action"
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1">
                          {index + 1}. {lesson.title}
                        </h6>
                        <p className="mb-1 text-muted">{lesson.description}</p>
                        <small className="text-muted">
                          <i className="bi bi-clock me-1"></i>{lesson.duration}
                        </small>
                      </div>
                      <div>
                        <Button 
                          size="sm" 
                          variant="outline-primary"
                          onClick={() => navigate(`/courses/${selectedCourse.id}/lessons/${lesson.id}`)}
                        >
                          <i className="bi bi-play-circle me-1"></i>
                          Watch
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {getCourseLessons(selectedCourse.id).length === 0 && (
                  <div className="list-group-item text-center text-muted py-4">
                    No lessons available for this course yet.
                  </div>
                )}
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCourseModal(false)}>
            Close
          </Button>
          <Button 
            variant="primary" 
            onClick={() => {
              continueLearning(selectedCourse);
              setShowCourseModal(false);
            }}
          >
            <i className="bi bi-play-circle me-2"></i>
            Continue Learning
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}