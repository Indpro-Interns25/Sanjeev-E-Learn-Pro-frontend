import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { mockCourses } from '../../data/mockCourses';
import { getCourseProgress } from '../../data/mockLessons';
import ProgressBar from '../../components/ProgressBar';

export default function StudentDashboard() {
  const { user } = useAuth();

  // In a real app, this would come from an API call
  const enrolledCourses = mockCourses.slice(0, 3);

  const stats = {
    coursesInProgress: enrolledCourses.length,
    completedCourses: 1,
    totalLessons: enrolledCourses.reduce((acc, course) => acc + course.lessons.length, 0),
    completedLessons: 5
  };

  return (
    <Container className="py-4">
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
            const progress = getCourseProgress(user.id, course.id);
            return (
              <Col md={6} lg={4} key={course.id} className="mb-4">
                <Card className="h-100 border-0 shadow rounded-4">
                  <Card.Img
                    variant="top"
                    src={course.thumbnail}
                    alt={course.title}
                    style={{ height: '160px', objectFit: 'cover' }}
                  />
                  <Card.Body>
                    <Card.Title as="h5">{course.title}</Card.Title>
                    <Card.Text className="text-muted small mb-3">
                      <i className="bi bi-person-circle me-1"></i>{course.instructor.name}
                    </Card.Text>
                    <ProgressBar
                      value={progress.completed}
                      total={progress.total}
                      variant="success"
                      className="mb-3"
                    />
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        {progress.completed} of {progress.total} lessons
                      </small>
                      <Link
                        to={`/student/courses/${course.id}`}
                        className="btn btn-outline-primary btn-sm"
                      >
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
