import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getUserEnrollments } from '../../services/enrollment';
import { getCourseById } from '../../services/courses';
import DashboardLayout from '../../components/DashboardLayout';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [stats, setStats] = useState({
    coursesInProgress: 0,
    completedCourses: 0,
    totalLessons: 0,
    completedLessons: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.warn('🚀 StudentDashboard useEffect triggered');
    const fetchDashboardData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        console.warn('📥 Starting to fetch dashboard data...');
        setLoading(true);
        setError(null);
        
        // Fetch user enrollments first
        const enrollments = await getUserEnrollments(user.id);
        console.warn('📚 User enrollments:', enrollments);
        
        // Fetch course details for each enrollment
        const coursePromises = enrollments.map(async (enrollment) => {
          try {
            const course = await getCourseById(enrollment.course_id);
            return {
              ...course,
              enrollment_id: enrollment.id,
              enrolled_at: enrollment.enrolled_at,
              progress_percentage: enrollment.progress || 0,
              status: enrollment.status || 'active',
              completed_lessons: Math.floor((enrollment.progress || 0) / 100 * (course.lesson_count || 5)),
              total_lessons: course.lesson_count || 5
            };
          } catch (error) {
            console.error(`Failed to fetch course ${enrollment.course_id}:`, error);
            return null;
          }
        });

        const coursesWithDetails = await Promise.all(coursePromises);
        const validCourses = coursesWithDetails.filter(course => course !== null);
        
        setEnrolledCourses(validCourses);
        
        // Calculate stats from enrolled courses
        const activeEnrollments = validCourses.filter(course => course.status === 'active');
        const completedEnrollments = validCourses.filter(course => course.progress_percentage >= 100);
        const totalLessons = validCourses.reduce((sum, course) => sum + (course.total_lessons || 0), 0);
        const completedLessons = validCourses.reduce((sum, course) => sum + (course.completed_lessons || 0), 0);
        
        setStats({
          coursesInProgress: activeEnrollments.length,
          completedCourses: completedEnrollments.length,
          totalLessons: totalLessons,
          completedLessons: completedLessons
        });
        
        console.warn('✅ Dashboard data loaded successfully');
        
      } catch (err) {
        console.error('❌ Error fetching dashboard data:', err);
        setError(err.message);
        
        // Reset to empty state on error
        setEnrolledCourses([]);
        setStats({
          coursesInProgress: 0,
          completedCourses: 0,
          totalLessons: 0,
          completedLessons: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Loading state
  if (loading) {
    return (
      <DashboardLayout title="Student Dashboard">
        <Container className="py-4">
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
            <Spinner animation="border" role="status" className="text-primary">
              <span className="visually-hidden">Loading dashboard...</span>
            </Spinner>
          </div>
        </Container>
      </DashboardLayout>
    );
  }

  const overallProgress = enrolledCourses.length
    ? Math.round(
        enrolledCourses.reduce((s, c) => s + (c.progress_percentage || 0), 0) /
          enrolledCourses.length
      )
    : 0;

  return (
    <DashboardLayout title="Student Dashboard">
      <Container className="py-4">
        {error && (
          <Alert variant="warning" className="mb-4">
            <i className="bi bi-exclamation-triangle me-2" />
            Could not connect to backend server. Showing demo data.
          </Alert>
        )}

        {/* Welcome header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
          <div>
            <h1 className="h3 fw-bold mb-1">
              Welcome back, <span className="text-primary">{user?.name?.split(' ')[0] || 'Student'}!</span> 👋
            </h1>
            <p className="text-muted mb-0">Here's your learning summary for today.</p>
          </div>
          <Link to="/catalog" className="btn btn-primary">
            <i className="bi bi-search me-2" />Browse Courses
          </Link>
        </div>

        {/* Stats cards */}
        <Row className="mb-4 g-3">
          {[
            { label: 'In Progress',        value: stats.coursesInProgress, icon: 'bi-journal-code',    color: 'primary' },
            { label: 'Completed Courses',  value: stats.completedCourses,  icon: 'bi-check2-circle',   color: 'success' },
            { label: 'Total Lessons',      value: stats.totalLessons,      icon: 'bi-book',            color: 'info'    },
            { label: 'Lessons Done',       value: stats.completedLessons,  icon: 'bi-bar-chart-steps', color: 'warning' },
          ].map((s) => (
            <Col key={s.label} xs={6} md={3}>
              <Card className={`h-100 border-0 shadow-sm text-center rounded-4 bg-${s.color} bg-opacity-10`}>
                <Card.Body>
                  <i className={`bi ${s.icon} fs-2 text-${s.color} mb-2 d-block`} />
                  <h3 className="fw-bold mb-1">{s.value}</h3>
                  <p className="text-muted small mb-0">{s.label}</p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Overall progress */}
        {enrolledCourses.length > 0 && (
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between mb-1">
                <span className="fw-semibold">Overall Learning Progress</span>
                <span className="text-primary fw-bold">{overallProgress}%</span>
              </div>
              <ProgressBar now={overallProgress} variant="primary" style={{ height: 10, borderRadius: 8 }} />
              <small className="text-muted">
                {stats.completedLessons} of {stats.totalLessons} lessons completed
              </small>
            </Card.Body>
          </Card>
        )}

        {/* Courses heading */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="h4 fw-bold mb-0">Your Courses</h2>
          <Link to="/student/my-courses" className="btn btn-sm btn-outline-primary">
            View All
          </Link>
        </div>

        {enrolledCourses.length > 0 ? (
          <Row className="g-4">
            {enrolledCourses.map((course) => (
              <Col md={6} lg={4} key={course.id}>
                <Card className="h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                  <Card.Img
                    variant="top"
                    src={course.thumbnail || 'https://placehold.co/300x160?text=Course'}
                    alt={course.title}
                    style={{ height: 160, objectFit: 'cover' }}
                  />
                  <Card.Body className="d-flex flex-column">
                    <Card.Title as="h6" className="fw-bold">{course.title}</Card.Title>
                    <Card.Text className="text-muted small mb-3 flex-grow-1">
                      {course.description?.slice(0, 80)}
                      {course.description?.length > 80 ? '…' : ''}
                    </Card.Text>

                    {/* Progress */}
                    <div className="mb-3">
                      <div className="d-flex justify-content-between mb-1">
                        <small className="text-muted">Progress</small>
                        <small className="fw-semibold text-primary">{course.progress_percentage || 0}%</small>
                      </div>
                      <ProgressBar
                        now={course.progress_percentage || 0}
                        variant="primary"
                        style={{ height: 6, borderRadius: 8 }}
                      />
                      <small className="text-muted">
                        {course.completed_lessons || 0} / {course.total_lessons || 0} lessons
                      </small>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mt-auto">
                      <div>
                        <span className="badge bg-primary me-1">{course.category}</span>
                        <small className="text-muted">
                          <i className="bi bi-star-fill text-warning me-1" />
                          {parseFloat(course.rating || 0).toFixed(1)}
                        </small>
                      </div>
                      <Link to={`/student/courses/${course.id}`} className="btn btn-outline-primary btn-sm">
                        <i className="bi bi-play-circle me-1" />Continue
                      </Link>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Card body className="text-center py-5 border-0 shadow-sm">
            <i className="bi bi-journal-text display-4 text-muted mb-3 d-block" />
            <h5>No courses yet</h5>
            <p className="text-muted">Start learning by enrolling in a course</p>
            <Link to="/catalog" className="btn btn-primary">Browse Courses</Link>
          </Card>
        )}
      </Container>
    </DashboardLayout>
  );
}

