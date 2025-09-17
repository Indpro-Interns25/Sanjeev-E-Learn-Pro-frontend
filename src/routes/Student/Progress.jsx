import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ListGroup } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';
import { mockCourses } from '../../data/mockCourses';
import { getCourseProgress } from '../../data/mockLessons';
import ProgressBar from '../../components/ProgressBar';

export default function Progress() {
  const { user } = useAuth();
  const [courseProgress, setCourseProgress] = useState([]);

  useEffect(() => {
    // In a real app, this would be an API call
    const enrolledCourses = mockCourses.slice(0, 3);
    const progress = enrolledCourses.map(course => ({
      ...course,
      progress: getCourseProgress(user.id, course.id)
    }));
    setCourseProgress(progress);
  }, [user.id]);

  // Calculate overall statistics
  const totalLessons = courseProgress.reduce((acc, course) => acc + course.progress.total, 0);
  const completedLessons = courseProgress.reduce((acc, course) => acc + course.progress.completed, 0);
  const overallPercentage = totalLessons > 0 
    ? Math.round((completedLessons / totalLessons) * 100) 
    : 0;

  const stats = [
    {
      title: 'Overall Progress',
      value: `${overallPercentage}%`,
      icon: 'bi-graph-up',
      color: 'primary'
    },
    {
      title: 'Courses In Progress',
      value: courseProgress.length,
      icon: 'bi-book',
      color: 'info'
    },
    {
      title: 'Completed Lessons',
      value: completedLessons,
      icon: 'bi-check-circle',
      color: 'success'
    },
    {
      title: 'Total Lessons',
      value: totalLessons,
      icon: 'bi-collection',
      color: 'warning'
    }
  ];

  return (
    <Container className="py-4">
      <h1 className="mb-4">Learning Progress</h1>

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
              <h4 className="mb-0">Course Progress</h4>
            </Card.Header>
            <ListGroup variant="flush">
              {courseProgress.map(course => (
                <ListGroup.Item key={course.id}>
                  <div className="mb-2 d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">{course.title}</h5>
                    <span className="badge bg-primary">
                      {course.progress.percentage}%
                    </span>
                  </div>
                  <ProgressBar
                    value={course.progress.completed}
                    total={course.progress.total}
                    variant="success"
                  />
                  <small className="text-muted">
                    {course.progress.completed} of {course.progress.total} lessons completed
                  </small>
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
                    <h6 className="mb-0">Fast Learner</h6>
                    <small className="text-muted">
                      Completed 5 lessons in one day
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
                    <h6 className="mb-0">Course Pioneer</h6>
                    <small className="text-muted">
                      Completed first course
                    </small>
                  </div>
                </div>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
