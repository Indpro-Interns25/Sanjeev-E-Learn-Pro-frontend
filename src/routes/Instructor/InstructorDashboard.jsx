import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { mockCourses } from '../../data/mockCourses';
import DashboardLayout from '../../components/DashboardLayout';

export default function InstructorDashboard() {
  const { user } = useAuth();

  // In a real app, this would be filtered by instructor ID
  const instructorCourses = mockCourses.filter(course => course.instructor.id === user.id);

  const stats = {
    totalCourses: instructorCourses.length,
    totalStudents: instructorCourses.reduce((acc, course) => acc + course.enrolled, 0),
    totalLessons: instructorCourses.reduce((acc, course) => acc + course.lessons.length, 0),
    averageRating: instructorCourses.reduce((acc, course) => acc + course.rating, 0) / instructorCourses.length
  };

  return (
    <DashboardLayout title="Instructor Dashboard">
    <Container className="py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
        <div className="d-flex align-items-center gap-3">
          <img src={user.avatar || 'https://placehold.co/48x48?text=I'} alt={user.name} width="48" height="48" className="rounded-circle border border-2 border-primary" />
          <h1 className="mb-0">Instructor Dashboard</h1>
        </div>
        <Link to="/instructor/courses/new" className="btn btn-primary btn-lg">
          <i className="bi bi-plus-circle me-2"></i>Create New Course
        </Link>
      </div>

      <Row className="mb-4 g-3">
        <Col xs={6} md={3}>
          <Card className="h-100 border-0 shadow stats-card bg-primary text-white text-center rounded-4">
            <Card.Body>
              <i className="bi bi-journal-code display-6 mb-2"></i>
              <h6 className="mb-1">Total Courses</h6>
              <h3 className="fw-bold mb-0">{stats.totalCourses}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="h-100 border-0 shadow stats-card bg-success text-white text-center rounded-4">
            <Card.Body>
              <i className="bi bi-people display-6 mb-2"></i>
              <h6 className="mb-1">Total Students</h6>
              <h3 className="fw-bold mb-0">{stats.totalStudents}</h3>
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
              <i className="bi bi-star-fill display-6 mb-2"></i>
              <h6 className="mb-1">Average Rating</h6>
              <h3 className="fw-bold mb-0">{stats.averageRating.toFixed(1)}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <h2 className="h3 mb-4">Your Courses</h2>

      {instructorCourses.length > 0 ? (
        <Row className="g-4">
          {instructorCourses.map(course => (
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
                  <div className="mb-3">
                    <span className="badge bg-primary me-2">{course.category}</span>
                    <span className="badge bg-secondary">{course.level}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <small className="text-muted">
                      <i className="bi bi-people me-1"></i>
                      {course.enrolled} students
                    </small>
                    <small className="text-warning">
                      <i className="bi bi-star-fill me-1"></i>
                      {course.rating}
                    </small>
                  </div>
                  <div className="d-flex gap-2 flex-wrap">
                    <Button
                      as={Link}
                      to={`/instructor/courses/${course.id}/lectures`}
                      variant="primary"
                      size="sm"
                      className="flex-grow-1"
                    >
                      <i className="bi bi-camera-video me-1"></i>Lectures
                    </Button>
                    <Button
                      as={Link}
                      to={`/instructor/courses/${course.id}/lessons`}
                      variant="outline-secondary"
                      size="sm"
                      className="flex-grow-1"
                    >
                      <i className="bi bi-list-ul me-1"></i>Lessons
                    </Button>
                    <Button
                      as={Link}
                      to={`/instructor/courses/${course.id}/edit`}
                      variant="outline-primary"
                      size="sm"
                      className="flex-grow-1"
                    >
                      <i className="bi bi-pencil me-1"></i>Edit
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Card body className="text-center py-5">
          <div className="text-muted">
            <i className="bi bi-journal-text display-4"></i>
            <h3 className="mt-3">No courses yet</h3>
            <p>Start creating your first course</p>
            <Link to="/instructor/courses/new" className="btn btn-primary">
              Create Course
            </Link>
          </div>
        </Card>
      )}
    </Container>
    </DashboardLayout>
  );
}
