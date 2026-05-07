import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { mockCourses } from '../../data/mockCourses';
import DashboardLayout from '../../components/DashboardLayout';
import { toDisplayText } from '../../utils/displayValue';

export default function Progress() {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  useEffect(() => {
    // In a real app, this would be an API call
    const courses = mockCourses.slice(0, 3);
    setEnrolledCourses(courses);
  }, [user.id]);

  const stats = [
    {
      title: 'Enrolled Courses',
      value: enrolledCourses.length,
      icon: 'bi-book',
      color: 'primary'
    },
    {
      title: 'Available Courses',
      value: mockCourses.length,
      icon: 'bi-collection',
      color: 'info'
    },
    {
      title: 'Learning Hours',
      value: '24+',
      icon: 'bi-clock',
      color: 'success'
    },
    {
      title: 'Certificates',
      value: '3',
      icon: 'bi-award',
      color: 'warning'
    }
  ];

  return (
    <DashboardLayout title="My Progress">
    <Container className="py-4">
      <h1 className="mb-4">My Learning</h1>

      <Row className="mb-4">
        {stats.map((stat, index) => (
          <Col key={index} md={3} className="mb-3">
            <Card className={`h-100 border-${stat.color}`}>
              <Card.Body>
                <div className="d-flex align-items-center mb-3">
                  <div className={`text-${stat.color} me-3`}>
                    <i className={`bi ${stat.icon} fs-1`}></i>
                  </div>
                  <div>
                    <h6 className="text-muted mb-1">{stat.title}</h6>
                    <h3 className="mb-0">{stat.value}</h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Header>
              <h4 className="mb-0">Your Courses</h4>
            </Card.Header>
            <ListGroup variant="flush">
              {enrolledCourses.map(course => (
                <ListGroup.Item key={course.id}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="mb-1">{course.title}</h5>
                      <p className="text-muted mb-0">
                        <i className="bi bi-person-circle me-1"></i>
                        {toDisplayText(course.instructor?.name || course.instructor, 'Instructor')}
                      </p>
                      <small className="text-muted">
                        {toDisplayText(course.category, 'General')} • {toDisplayText(course.level, 'Beginner')}
                      </small>
                    </div>
                    <Link
                      to={`/student/courses/${course.id}`}
                      className="btn btn-outline-primary btn-sm"
                    >
                      Continue
                    </Link>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>

        <Col lg={4}>
          <Card>
            <Card.Header>
              <h4 className="mb-0">Achievements</h4>
            </Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <div className="d-flex align-items-center">
                  <div className="text-warning me-3">
                    <i className="bi bi-trophy-fill fs-4"></i>
                  </div>
                  <div>
                    <h6 className="mb-0">Course Explorer</h6>
                    <small className="text-muted">
                      Enrolled in multiple courses
                    </small>
                  </div>
                </div>
              </ListGroup.Item>
              <ListGroup.Item>
                <div className="d-flex align-items-center">
                  <div className="text-info me-3">
                    <i className="bi bi-lightning-fill fs-4"></i>
                  </div>
                  <div>
                    <h6 className="mb-0">Quick Start</h6>
                    <small className="text-muted">
                      Enrolled in first course
                    </small>
                  </div>
                </div>
              </ListGroup.Item>
              <ListGroup.Item>
                <div className="d-flex align-items-center">
                  <div className="text-success me-3">
                    <i className="bi bi-check-circle-fill fs-4"></i>
                  </div>
                  <div>
                    <h6 className="mb-0">Learning Journey</h6>
                    <small className="text-muted">
                      Started learning journey
                    </small>
                  </div>
                </div>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </Container>
    </DashboardLayout>
  );
}
