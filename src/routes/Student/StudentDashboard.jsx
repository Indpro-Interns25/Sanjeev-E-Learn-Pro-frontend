import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getEnrolledCourses, getUserStats } from '../../services/user';
import { mockCourses } from '../../data/mockCourses';

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
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch enrolled courses and user stats in parallel
        const [coursesData, statsData] = await Promise.all([
          getEnrolledCourses(),
          getUserStats()
        ]);
        
        setEnrolledCourses(coursesData);
        setStats(statsData);
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message);
        
        // Fallback to mock data if API fails
        setEnrolledCourses(mockCourses.slice(0, 3));
        setStats({
          coursesInProgress: 3,
          completedCourses: 1,
          totalLessons: 15,
          completedLessons: 5
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <Container className="py-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
          <Spinner animation="border" role="status" className="text-primary">
            <span className="visually-hidden">Loading dashboard...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {error && (
        <Alert variant="warning" className="mb-4">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Could not connect to backend server. Showing demo data.
        </Alert>
      )}
      
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
        <div className="d-flex align-items-center gap-3">
          <img src={user.avatar || 'https://placehold.co/48x48?text=U'} alt={user.name} width="48" height="48" className="rounded-circle border border-2 border-primary" />
          <h1 className="mb-0">Welcome back, {user.name}!</h1>
        </div>
        <Link to="/catalog" className="btn btn-primary btn-lg">
          <i className="bi bi-search me-2"></i>Browse Courses
        </Link>
      </div>

      <Row className="mb-4 g-3">
        <Col xs={6} md={3}>
          <Card className="h-100 border-0 shadow stats-card bg-primary text-white text-center rounded-4">
            <Card.Body>
              <i className="bi bi-journal-code display-6 mb-2"></i>
              <h6 className="mb-1">Courses In Progress</h6>
              <h3 className="fw-bold mb-0">{stats.coursesInProgress}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="h-100 border-0 shadow stats-card bg-success text-white text-center rounded-4">
            <Card.Body>
              <i className="bi bi-check2-circle display-6 mb-2"></i>
              <h6 className="mb-1">Completed Courses</h6>
              <h3 className="fw-bold mb-0">{stats.completedCourses}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="h-100 border-0 shadow stats-card bg-info text-white text-center rounded-4">
            <Card.Body>
              <i className="bi bi-book display-6 mb-2"></i>
              <h6 className="mb-1">Total Lessons</h6>
              <h3 className="fw-bold mb-0">{stats.totalLessons}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="h-100 border-0 shadow stats-card bg-warning text-white text-center rounded-4">
            <Card.Body>
              <i className="bi bi-bar-chart-steps display-6 mb-2"></i>
              <h6 className="mb-1">Completed Lessons</h6>
              <h3 className="fw-bold mb-0">{stats.completedLessons}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <h2 className="h3 mb-4">Your Courses</h2>

      {enrolledCourses.length > 0 ? (
        <Row className="g-4">
          {enrolledCourses.map(course => {
            return (
              <Col md={6} lg={4} key={course.id} className="mb-4">
                <Card className="h-100 border-0 shadow rounded-4">
                  <Card.Img
                    variant="top"
                    src={course.thumbnail || 'https://placehold.co/300x160?text=Course'}
                    alt={course.title}
                    style={{ height: '160px', objectFit: 'cover' }}
                  />
                  <Card.Body className="d-flex flex-column">
                    <Card.Title as="h5">{course.title}</Card.Title>
                    <Card.Text className="text-muted small mb-3 flex-grow-1">
                      {course.description?.length > 80 
                        ? `${course.description.substring(0, 80)}...` 
                        : course.description}
                    </Card.Text>
                    
                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <small className="text-muted">Progress</small>
                        <small className="fw-bold text-primary">{course.progress_percentage || 0}%</small>
                      </div>
                      <div className="progress" style={{ height: '6px' }}>
                        <div 
                          className="progress-bar bg-primary" 
                          role="progressbar" 
                          style={{ width: `${course.progress_percentage || 0}%` }}
                        ></div>
                      </div>
                      <small className="text-muted">
                        {course.completed_lessons || 0} of {course.total_lessons || 0} lessons completed
                      </small>
                    </div>
                    
                    <div className="d-flex justify-content-between align-items-center mt-auto">
                      <div className="d-flex flex-column">
                        <span className="badge bg-primary mb-1">{course.category}</span>
                        <small className="text-muted">
                          <i className="bi bi-star-fill text-warning me-1"></i>
                          {parseFloat(course.rating || 0).toFixed(1)}
                        </small>
                      </div>
                      <Link
                        to={`/student/courses/${course.id}`}
                        className="btn btn-outline-primary btn-sm"
                      >
                        <i className="bi bi-play-circle me-1"></i>
                        Continue
                      </Link>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      ) : (
        <Card body className="text-center py-5">
          <div className="text-muted">
            <i className="bi bi-journal-text display-4"></i>
            <h3 className="mt-3">No courses yet</h3>
            <p>Start learning by enrolling in a course</p>
            <Link to="/catalog" className="btn btn-primary">
              Browse Courses
            </Link>
          </div>
        </Card>
      )}
    </Container>
  );
}
