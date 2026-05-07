import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Modal, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getAllCourses } from '../../services/courses';
import { getUserEnrollments, enrollUserInCourse, canUserAccessLesson } from '../../services/enrollment';
import { getAllLessons } from '../../services/lessons';

function toDisplayText(value, fallback = 'N/A') {
  if (value == null) return fallback;
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) {
    const parts = value.map((item) => toDisplayText(item, '')).filter(Boolean);
    return parts.length ? parts.join(', ') : fallback;
  }
  if (typeof value === 'object') {
    return value?.name || value?.title || value?._id || value?.id || fallback;
  }
  return fallback;
}

export default function StudentCourses() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchData();
    }
  }, [isAuthenticated, user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch courses, user enrollments, and lessons in parallel
      const [coursesData, enrollmentsData, lessonsData] = await Promise.all([
        getAllCourses(),
        getUserEnrollments(user.id),
        getAllLessons()
      ]);

      setCourses(coursesData || []);
      setEnrollments(enrollmentsData || []);
      setLessons(lessonsData || []);

    } catch (err) {
      console.error('Error fetching student course data:', err);
      setError(err.message);
      
      // Set fallback data
      setCourses([
        {
          id: 1,
          title: 'React Fundamentals',
          description: 'Learn the basics of React framework',
          category: 'Programming',
          level: 'beginner',
          price: '49.99',
          instructor: 'John Smith',
          duration: '4 hours',
          lesson_count: 12
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
          lesson_count: 18
        },
        {
          id: 3,
          title: 'UI/UX Design Principles',
          description: 'Learn professional design principles',
          category: 'Design',
          level: 'intermediate',
          price: '59.99',
          instructor: 'Mike Johnson',
          duration: '5 hours',
          lesson_count: 15
        }
      ]);
      
      setEnrollments([
        { course_id: 1, status: 'in_progress', progress_percentage: 75 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const handleEnrollment = async (courseId) => {
    if (!user) {
      showAlert('Please log in to enroll in courses', 'warning');
      return;
    }

    setEnrolling(courseId);
    try {
      await enrollUserInCourse(user.id, courseId);
      
      // Refresh enrollments
      const updatedEnrollments = await getUserEnrollments(user.id);
      setEnrollments(updatedEnrollments || []);
      
      const courseName = courses.find(c => c.id === courseId)?.title;
      showAlert(`Successfully enrolled in ${courseName}!`, 'success');
      
    } catch (err) {
      console.error('Enrollment error:', err);
      showAlert(`Error enrolling in course: ${err.message}`, 'danger');
    } finally {
      setEnrolling(null);
    }
  };

  const isEnrolled = (courseId) => {
    return enrollments.some(enrollment => enrollment.course_id === courseId);
  };

  const getEnrollmentProgress = (courseId) => {
    const enrollment = enrollments.find(e => e.course_id === courseId);
    return enrollment?.progress_percentage || 0;
  };

  const handleLessonAccess = async (lesson) => {
    try {
      const hasAccess = await canUserAccessLesson(user.id, lesson.id);
      if (hasAccess) {
        // Navigate to lesson player
        window.location.href = `/student/lesson/${lesson.id}`;
      } else {
        showAlert('You need to enroll in this course to access lessons', 'warning');
      }
    } catch (err) {
      console.error('Access check error:', err);
      showAlert('Error checking lesson access', 'danger');
    }
  };

  const viewCourseDetails = (course) => {
    setSelectedCourse(course);
    setShowModal(true);
  };

  const getCourseLessons = (courseId) => {
    return lessons.filter(lesson => lesson.course_id === courseId);
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
          <Spinner animation="border" role="status" className="text-primary">
            <span className="visually-hidden">Loading courses...</span>
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
              <h1>Available Courses</h1>
              <p className="text-muted">Explore and enroll in courses to start your learning journey</p>
            </div>
            <Button variant="outline-success" onClick={() => navigate('/student/my-courses')}>
              <i className="bi bi-bookmark-check me-2"></i>
              My Enrolled Courses
            </Button>
          </div>
        </Col>
      </Row>

      {alert && (
        <Alert variant={alert.type} dismissible onClose={() => setAlert(null)} className="mb-4">
          {alert.message}
        </Alert>
      )}

      {error && (
        <Alert variant="warning" className="mb-4">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Could not connect to server. Showing demo courses.
        </Alert>
      )}

      <Row>
        {courses.map(course => {
          const enrolled = isEnrolled(course.id);
          const progress = getEnrollmentProgress(course.id);
          
          return (
            <Col key={course.id} lg={4} md={6} className="mb-4">
              <Card className="h-100 shadow-sm">
                <Card.Body className="d-flex flex-column">
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <Badge bg={course.level === 'beginner' ? 'success' : 
                                course.level === 'intermediate' ? 'warning' : 'info'}>
                        {toDisplayText(course.level, 'Beginner')}
                      </Badge>
                      <span className="text-muted">{toDisplayText(course.category, 'General')}</span>
                    </div>
                    
                    <h5 className="card-title">{toDisplayText(course.title, 'Course')}</h5>
                    <p className="card-text text-muted">{toDisplayText(course.description, '')}</p>
                  </div>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between text-sm">
                      <span><i className="bi bi-person me-1"></i>{toDisplayText(course.instructor, course.instructor_name || 'Unknown Instructor')}</span>
                      <span><i className="bi bi-clock me-1"></i>{course.duration_display || (course.duration_number || course.duration_number === 0 ? `${course.duration_number} minutes` : course.duration)}</span>
                    </div>
                    <div className="d-flex justify-content-between text-sm mt-1">
                      <span><i className="bi bi-play-circle me-1"></i>{course.lesson_count} lessons</span>
                      <span className="fw-bold">
                        {course.isFree === true
                          ? <span className="text-success">Free</span>
                          : <span className="text-success">Free</span>
                        }
                      </span>
                    </div>
                  </div>

                  {enrolled && (
                    <div className="mb-3">
                      <div className="d-flex justify-content-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="progress" style={{ height: '6px' }}>
                        <div 
                          className="progress-bar" 
                          role="progressbar" 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <div className="mt-auto">
                    {enrolled ? (
                      <div className="d-grid gap-2">
                        <Button 
                          variant="success" 
                          onClick={() => viewCourseDetails(course)}
                        >
                          <i className="bi bi-play-circle me-2"></i>
                          Continue Learning
                        </Button>
                        <Badge bg="success" className="text-center py-2">
                          <i className="bi bi-check-circle me-1"></i>
                          Enrolled
                        </Badge>
                      </div>
                    ) : (
                      <div className="d-grid gap-2">
                        <Button 
                          variant="outline-primary" 
                          onClick={() => viewCourseDetails(course)}
                        >
                          <i className="bi bi-eye me-2"></i>
                          View Details
                        </Button>
                        <Button 
                          variant="primary" 
                          onClick={() => handleEnrollment(course.id)}
                          disabled={enrolling === course.id}
                        >
                          {enrolling === course.id ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              Enrolling...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-bookmark-plus me-2"></i>
                              Enroll Now
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      {courses.length === 0 && !loading && (
        <Row className="py-5">
          <Col className="text-center">
            <i className="bi bi-journal-bookmark display-1 text-muted"></i>
            <h3 className="mt-3">No Courses Available</h3>
            <p className="text-muted">Check back later for new courses!</p>
          </Col>
        </Row>
      )}

      {/* Course Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
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
                    <h3>
                      {selectedCourse.isFree === true
                        ? <span className="text-success">Free</span>
                        : <span className="text-success">Free</span>
                      }
                    </h3>
                    <p className="text-muted mb-1">
                      <i className="bi bi-person me-1"></i>{toDisplayText(selectedCourse.instructor, selectedCourse.instructor_name || 'Unknown Instructor')}
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
                {getCourseLessons(selectedCourse.id).map((lesson, index) => {
                  const enrolled = isEnrolled(selectedCourse.id);
                  
                  return (
                    <div 
                      key={lesson.id} 
                      className={`list-group-item list-group-item-action ${!enrolled ? 'disabled' : ''}`}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1">
                            {index + 1}. {toDisplayText(lesson.title, 'Untitled Lesson')}
                          </h6>
                          <p className="mb-1 text-muted">{toDisplayText(lesson.description, '')}</p>
                          <small className="text-muted">
                            <i className="bi bi-clock me-1"></i>{lesson.duration_display || (lesson.duration_number || lesson.duration_number === 0 ? `${lesson.duration_number} minutes` : lesson.duration)}
                          </small>
                        </div>
                        <div>
                          {enrolled ? (
                            <Button 
                              size="sm" 
                              variant="outline-primary"
                              onClick={() => handleLessonAccess(lesson)}
                            >
                              <i className="bi bi-play-circle me-1"></i>
                              Watch
                            </Button>
                          ) : (
                            <i className="bi bi-lock text-muted"></i>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                
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
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          {selectedCourse && !isEnrolled(selectedCourse.id) && (
            <Button 
              variant="primary" 
              onClick={() => {
                handleEnrollment(selectedCourse.id);
                setShowModal(false);
              }}
              disabled={enrolling === selectedCourse.id}
            >
              {enrolling === selectedCourse.id ? 'Enrolling...' : 'Enroll Now'}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
}