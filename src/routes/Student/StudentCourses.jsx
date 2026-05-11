import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getAllCourses, formatCoursesData } from '../../services/courses';
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

      // Format courses data to match Explore formatting for consistency
      const formattedCourses = formatCoursesData(coursesData || []);
      
      setCourses(formattedCourses);
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
      console.warn(`🔄 Starting enrollment for user ${user.id} in course ${courseId}...`);
      
      const enrollmentResult = await enrollUserInCourse(user.id, courseId);
      console.warn('✅ Enrollment result:', enrollmentResult);
      
      // Refresh enrollments immediately
      console.warn('🔄 Fetching updated enrollments for this page...');
      const updatedEnrollments = await getUserEnrollments(user.id);
      console.warn('✅ Updated enrollments:', updatedEnrollments);
      setEnrollments(updatedEnrollments || []);
      
      const courseName = courses.find(c => c.id === courseId)?.title;
      showAlert(`Successfully enrolled in ${courseName}!`, 'success');
      console.warn(`✅ Enrollment successful for course ${courseId}`);
      
    } catch (err) {
      console.error('🚨 Enrollment error:', err);
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

      {courses.length > 0 ? (
        <Row xs={1} md={2} lg={3} className="g-4">
          {courses.map(course => {
            const enrolled = isEnrolled(course.id);
            const progress = getEnrollmentProgress(course.id);
            
            return (
              <Col key={course.id}>
                <div className="card h-100 border-0 shadow-sm rounded-4" style={{ overflow: 'hidden', transition: 'transform 0.2s', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {/* Thumbnail Image */}
                  <img 
                    src={course.thumbnail || 'https://images.unsplash.com/photo-1516534775068-bb57e39e054b?auto=format&fit=crop&w=500&q=60'} 
                    alt={toDisplayText(course.title, 'Course')} 
                    className="card-img-top responsive-img"
                    style={{ height: '200px', objectFit: 'cover' }}
                    loading="lazy" 
                  />
                  
                  <div className="card-body d-flex flex-column">
                    {/* Course Header */}
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <Badge bg="primary" className="me-2">
                            {toDisplayText(course.category, 'General')}
                          </Badge>
                          <Badge bg={course.level === 'beginner' ? 'success' : 
                                    course.level === 'intermediate' ? 'warning' : 'info'}>
                            {toDisplayText(course.level, 'Beginner')}
                          </Badge>
                        </div>
                        <div className="d-flex align-items-center">
                          <img
                            src="https://placehold.co/32x32.webp?text=I"
                            alt={toDisplayText(course.instructor_name, 'Instructor')}
                            className="rounded-circle me-2"
                            style={{ width: '32px', height: '32px' }}
                            loading="lazy"
                          />
                          <span className="small text-muted">
                            {toDisplayText(course.instructor_name, 'Instructor')}
                          </span>
                        </div>
                      </div>
                      
                      <h5 className="card-title">{toDisplayText(course.title, 'Course')}</h5>
                      <p className="card-text text-muted" style={{ fontSize: '0.9rem' }}>
                        {toDisplayText(course.description, '').length > 100
                          ? `${toDisplayText(course.description, '').substring(0, 100)}...`
                          : toDisplayText(course.description, '')}
                      </p>
                    </div>

                    {/* Course Meta */}
                    <div className="mb-3">
                      <div className="d-flex justify-content-between text-muted small mb-2">
                        <span>
                          <i className="bi bi-clock me-1"></i>
                          {course.duration || 'Self-paced'}
                        </span>
                        <span>
                          <i className="bi bi-people me-1"></i>
                          {course.enrolled || 0} enrolled
                        </span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong className="h6 mb-0 text-success">
                            {course.isFree === true ? 'Free' : 'Free'}
                          </strong>
                          <div className="text-warning small mt-1">
                            {[...Array(5)].map((_, i) => (
                              <i key={i} className={`bi bi-star${i < Math.round(parseFloat(course.rating || 0)) ? '-fill' : ''}`}></i>
                            ))}
                            <span className="ms-1 text-muted">{parseFloat(course.rating || 0).toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {enrolled && (
                      <div className="mb-3">
                        <div className="d-flex justify-content-between small mb-1">
                          <span>Progress</span>
                          <span className="fw-bold">{progress}%</span>
                        </div>
                        <div className="progress" style={{ height: '6px' }}>
                          <div 
                            className="progress-bar bg-success"
                            role="progressbar" 
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-auto d-flex gap-2 flex-wrap">
                      {enrolled ? (
                        <>
                          <Button 
                            as={Link}
                            to={`/student/courses/${course.id}/learn`}
                            variant="success" 
                            size="sm"
                            className="flex-grow-1 fw-bold"
                          >
                            <i className="bi bi-play-circle me-1"></i>
                            Continue
                          </Button>
                          <Badge bg="success" className="py-2">
                            <i className="bi bi-check-circle me-1"></i>
                            Enrolled
                          </Badge>
                        </>
                      ) : (
                        <>
                          <Button 
                            as={Link}
                            to={`/courses/${course.id}`}
                            variant="outline-primary" 
                            size="sm"
                            className="flex-grow-1 fw-bold"
                          >
                            <i className="bi bi-eye me-1"></i>
                            Details
                          </Button>
                          <Button 
                            variant="primary" 
                            size="sm"
                            className="flex-grow-1 fw-bold"
                            onClick={() => handleEnrollment(course.id)}
                            disabled={enrolling === course.id}
                          >
                            {enrolling === course.id ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-1"></span>
                                Enrolling...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-bookmark-plus me-1"></i>
                                Enroll
                              </>
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>
      ) : !loading ? (
        <Row className="py-5">
          <Col className="text-center">
            <i className="bi bi-journal-bookmark display-1 text-muted"></i>
            <h3 className="mt-3">No Courses Available</h3>
            <p className="text-muted">Check back later for new courses!</p>
          </Col>
        </Row>
      ) : null}

      {/* Modal removed - use Link routing instead */}
    </Container>
  );
}