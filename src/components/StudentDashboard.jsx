import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert, Tab, Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getUserEnrollments } from '../services/enrollment';
import { getCourseProgress, getResumePoint, getCourseVideoProgress } from '../services/videoProgress';
import { DashboardProgressCard, CourseProgressBar } from './ProgressBarComponents';
import '../styles/student-dashboard.css';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progressData, setProgressData] = useState({});
  const [resumePoints, setResumePoints] = useState({});
  const [activeTab, setActiveTab] = useState('enrolled');

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      navigate('/login');
      return;
    }

    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch enrollments
        const enrollmentsList = await getUserEnrollments(user.id);
        setEnrollments(enrollmentsList || []);

        // Fetch progress for each course
        const progressMap = {};
        const resumeMap = {};

        for (const enrollment of enrollmentsList || []) {
          try {
            const progress = await getCourseProgress(enrollment.course_id, user.id);
            progressMap[enrollment.course_id] = progress;

            const resume = await getResumePoint(enrollment.course_id, user.id);
            if (resume) {
              resumeMap[enrollment.course_id] = resume;
            }
          } catch (err) {
            console.error(`Error loading data for course ${enrollment.course_id}:`, err);
          }
        }

        setProgressData(progressMap);
        setResumePoints(resumeMap);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load your learning data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user, isAuthenticated, navigate]);

  const handleContinueLearning = (enrollment) => {
    const resume = resumePoints[enrollment.course_id];
    if (resume?.lecture_id) {
      navigate(`/student/courses/${enrollment.course_id}/learn/${resume.lecture_id}`);
    } else {
      navigate(`/student/course/${enrollment.course_id}`);
    }
  };

  const sortedEnrollments = [...enrollments].sort((a, b) => {
    const progressA = progressData[a.course_id]?.percentage || 0;
    const progressB = progressData[b.course_id]?.percentage || 0;
    return progressB - progressA; // Recently watched first
  });

  const inProgressCourses = sortedEnrollments.filter(
    (e) => (progressData[e.course_id]?.percentage || 0) < 100 && (progressData[e.course_id]?.percentage || 0) > 0
  );
  const notStartedCourses = sortedEnrollments.filter(
    (e) => (progressData[e.course_id]?.percentage || 0) === 0
  );
  const completedCourses = sortedEnrollments.filter(
    (e) => (progressData[e.course_id]?.percentage || 0) === 100
  );

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" className="mb-3">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p>Loading your learning dashboard...</p>
      </Container>
    );
  }

  return (
    <Container className="py-5 student-dashboard">
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-4">
          {error}
        </Alert>
      )}

      {/* Header Section */}
      <div className="dashboard-header mb-5">
        <h1 className="mb-2">My Learning</h1>
        <p className="text-muted">
          Track your progress and continue learning from where you left off
        </p>
      </div>

      {/* Stats Section */}
      <Row className="mb-5">
        <Col md={3} xs={6} className="mb-3">
          <Card className="stat-card text-center">
            <Card.Body>
              <h2 className="stat-number text-primary">{enrollments.length}</h2>
              <p className="stat-label">Enrolled Courses</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} xs={6} className="mb-3">
          <Card className="stat-card text-center">
            <Card.Body>
              <h2 className="stat-number text-success">{completedCourses.length}</h2>
              <p className="stat-label">Completed</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} xs={6} className="mb-3">
          <Card className="stat-card text-center">
            <Card.Body>
              <h2 className="stat-number text-warning">{inProgressCourses.length}</h2>
              <p className="stat-label">In Progress</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} xs={6} className="mb-3">
          <Card className="stat-card text-center">
            <Card.Body>
              <h2 className="stat-number text-info">
                {Math.round(
                  sortedEnrollments.reduce(
                    (sum, e) => sum + (progressData[e.course_id]?.percentage || 0),
                    0
                  ) / Math.max(sortedEnrollments.length, 1)
                )}%
              </h2>
              <p className="stat-label">Avg. Progress</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Course Tabs */}
      {sortedEnrollments.length > 0 ? (
        <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
          <Nav variant="tabs" className="mb-4">
            <Nav.Item>
              <Nav.Link eventKey="inprogress" className="fw-semibold">
                In Progress ({inProgressCourses.length})
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="enrolled" className="fw-semibold">
                All Courses ({enrollments.length})
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="notstarted" className="fw-semibold">
                Not Started ({notStartedCourses.length})
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="completed" className="fw-semibold">
                Completed ({completedCourses.length})
              </Nav.Link>
            </Nav.Item>
          </Nav>

          <Tab.Content>
            {/* In Progress Tab */}
            <Tab.Pane eventKey="inprogress">
              {inProgressCourses.length > 0 ? (
                <Row xs={1} md={2} lg={3} className="g-4">
                  {inProgressCourses.map((enrollment) => (
                    <Col key={enrollment.id}>
                      <Card className="course-card h-100 course-in-progress">
                        <Card.Body>
                          <div className="mb-3">
                            <Badge bg="warning" className="mb-2">
                              <i className="bi bi-hourglass-split me-1"></i> In Progress
                            </Badge>
                          </div>
                          <Card.Title>{enrollment.course?.title || 'Course'}</Card.Title>

                          <CourseProgressBar
                            completed={progressData[enrollment.course_id]?.completed || 0}
                            total={progressData[enrollment.course_id]?.total || 1}
                            showLabel={true}
                            size="normal"
                          />

                          <div className="mt-3 d-grid gap-2">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleContinueLearning(enrollment)}
                            >
                              <i className="bi bi-play-circle me-1"></i> Continue Learning
                            </Button>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => navigate(`/student/course/${enrollment.course_id}`)}
                            >
                              <i className="bi bi-info-circle me-1"></i> Course Details
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <Card>
                  <Card.Body className="text-center py-5">
                    <i className="bi bi-inbox display-4 text-muted mb-3"></i>
                    <p className="text-muted">No courses in progress. Start learning today!</p>
                    <Button variant="primary" onClick={() => navigate('/catalog')}>
                      Browse Courses
                    </Button>
                  </Card.Body>
                </Card>
              )}
            </Tab.Pane>

            {/* All Courses Tab */}
            <Tab.Pane eventKey="enrolled">
              <Row xs={1} md={2} lg={3} className="g-4">
                {sortedEnrollments.map((enrollment) => {
                  const progress = progressData[enrollment.course_id]?.percentage || 0;
                  const status =
                    progress === 100 ? 'completed' : progress > 0 ? 'in-progress' : 'not-started';

                  return (
                    <Col key={enrollment.id}>
                      <Card className={`course-card h-100 course-${status}`}>
                        <Card.Body>
                          <div className="mb-3">
                            {status === 'completed' && (
                              <Badge bg="success">
                                <i className="bi bi-check-circle-fill me-1"></i> Completed
                              </Badge>
                            )}
                            {status === 'in-progress' && (
                              <Badge bg="warning">
                                <i className="bi bi-hourglass-split me-1"></i> In Progress
                              </Badge>
                            )}
                            {status === 'not-started' && (
                              <Badge bg="secondary">
                                <i className="bi bi-clock me-1"></i> Not Started
                              </Badge>
                            )}
                          </div>
                          <Card.Title className="mb-3">
                            {enrollment.course?.title || 'Course'}
                          </Card.Title>

                          <CourseProgressBar
                            completed={progressData[enrollment.course_id]?.completed || 0}
                            total={progressData[enrollment.course_id]?.total || 1}
                            showLabel={true}
                          />

                          <div className="mt-3 d-grid gap-2">
                            {status === 'completed' ? (
                              <>
                                <Button variant="success" size="sm" disabled>
                                  <i className="bi bi-check-circle me-1"></i> Completed
                                </Button>
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() =>
                                    navigate(`/student/course/${enrollment.course_id}`)
                                  }
                                >
                                  Review Course
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleContinueLearning(enrollment)}
                                >
                                  <i className="bi bi-play-circle me-1"></i> Continue Learning
                                </Button>
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  onClick={() =>
                                    navigate(`/student/course/${enrollment.course_id}`)
                                  }
                                >
                                  View Details
                                </Button>
                              </>
                            )}
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            </Tab.Pane>

            {/* Not Started Tab */}
            <Tab.Pane eventKey="notstarted">
              {notStartedCourses.length > 0 ? (
                <Row xs={1} md={2} lg={3} className="g-4">
                  {notStartedCourses.map((enrollment) => (
                    <Col key={enrollment.id}>
                      <Card className="course-card h-100 course-not-started">
                        <Card.Body>
                          <Badge bg="secondary" className="mb-2">
                            <i className="bi bi-clock me-1"></i> Not Started
                          </Badge>
                          <Card.Title>{enrollment.course?.title || 'Course'}</Card.Title>

                          <div className="mt-3 d-grid gap-2">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() =>
                                navigate(`/student/courses/${enrollment.course_id}/learn`)
                              }
                            >
                              <i className="bi bi-play-circle me-1"></i> Start Learning
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <Card>
                  <Card.Body className="text-center py-5">
                    <i className="bi bi-inbox display-4 text-muted mb-3"></i>
                    <p className="text-muted">No courses to start. Great job catching up!</p>
                  </Card.Body>
                </Card>
              )}
            </Tab.Pane>

            {/* Completed Tab */}
            <Tab.Pane eventKey="completed">
              {completedCourses.length > 0 ? (
                <Row xs={1} md={2} lg={3} className="g-4">
                  {completedCourses.map((enrollment) => (
                    <Col key={enrollment.id}>
                      <Card className="course-card h-100 course-completed">
                        <Card.Body>
                          <Badge bg="success" className="mb-2">
                            <i className="bi bi-check-circle-fill me-1"></i> Completed
                          </Badge>
                          <Card.Title>{enrollment.course?.title || 'Course'}</Card.Title>

                          <div className="mt-3 d-grid gap-2">
                            <Button
                              variant="success"
                              size="sm"
                              disabled
                            >
                              <i className="bi bi-check-circle me-1"></i> Completed
                            </Button>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() =>
                                navigate(`/student/course/${enrollment.course_id}`)
                              }
                            >
                              Review
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <Card>
                  <Card.Body className="text-center py-5">
                    <i className="bi bi-inbox display-4 text-muted mb-3"></i>
                    <p className="text-muted">No completed courses yet. Keep learning!</p>
                  </Card.Body>
                </Card>
              )}
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      ) : (
        <Card>
          <Card.Body className="text-center py-5">
            <i className="bi bi-inbox display-4 text-muted mb-3"></i>
            <h4>You're not enrolled in any courses yet</h4>
            <p className="text-muted mb-3">Start your learning journey by exploring our course catalog</p>
            <Button variant="primary" size="lg" onClick={() => navigate('/catalog')}>
              <i className="bi bi-compass me-2"></i> Browse Courses
            </Button>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}
