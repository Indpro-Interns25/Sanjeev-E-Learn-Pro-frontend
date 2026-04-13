import { Container, Row, Col, Card, Button, ProgressBar, Badge, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getAllCourses } from '../../services/courses';
import { getCourseVideoProgress } from '../../services/videoProgress';
import networkBg from '../../assets/login.png';
import '../../styles/home-page.css';

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [courseProgress, setCourseProgress] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const courses = await getAllCourses({ limit: 12 });
        
        setEnrolledCourses(courses.slice(0, 3));
        setRecommendedCourses(courses.slice(3, 6));

        // Fetch actual progress for each course
        if (user?.id) {
          const progressData = {};
          for (const course of courses.slice(0, 3)) {
            try {
              const videoProgress = await getCourseVideoProgress(course.id, user.id);
              if (Array.isArray(videoProgress) && videoProgress.length > 0) {
                const totalLessons = videoProgress.length;
                const completedCount = videoProgress.filter(v => v.progress_percentage >= 90).length;
                progressData[course.id] = Math.round((completedCount / totalLessons) * 100);
              } else {
                progressData[course.id] = 0;
              }
            } catch (error) {
              console.warn(`Failed to fetch progress for course ${course.id}:`, error);
              progressData[course.id] = 0;
            }
          }
          setCourseProgress(progressData);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user]);

  if (!isAuthenticated) {
    return (
      <Container className="py-5 text-center">
        <h3>Please log in to access your dashboard</h3>
        <Button as={Link} to="/login" variant="primary" className="mt-3">
          Go to Login
        </Button>
      </Container>
    );
  }

  return (
    <div className="home-page student-home-clean">
      {/* ============ HERO SECTION WITH NETWORK BACKGROUND ============ */}
      <section className="hero-network-section">
        <div className="hero-network-bg">
          <img src={networkBg} alt="Network Background" className="network-bg-image" />
        </div>
        <Container>
          <Row className="align-items-center justify-content-center position-relative z-1" style={{ minHeight: '70vh' }}>
            <Col lg={8} className="text-center">
              <div className="hero-network-content">
                <h1 className="hero-network-title mb-4">Welcome Back</h1>
                <p className="hero-network-subtitle mb-5">
                  Access your learning dashboard and continue where you left off
                </p>
                <div className="hero-network-buttons d-flex gap-3 justify-content-center flex-wrap">
                  <Button 
                    as={Link}
                    to="/explore"
                    className="btn-network-primary"
                  >
                    Start Learning
                  </Button>
                  <Button 
                    className="btn-network-secondary"
                  >
                    <i className="bi bi-play-circle me-2"></i>
                    Explore Dashboard
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ============ ENROLLED COURSES SECTION ============ */}
      <section className="enrolled-courses-section">
        <Container>
          <div className="section-header mb-5">
            <h2 className="section-title">My Learning Journey</h2>
            <p className="section-subtitle">Continue from where you left off</p>
          </div>

          {loading ? (
            <Row className="justify-content-center py-5">
              <Col md={3} className="text-center">
                <Spinner animation="border" variant="primary" className="mb-3" />
                <p className="text-muted">Loading your courses...</p>
              </Col>
            </Row>
          ) : enrolledCourses.length > 0 ? (
            <Row className="g-4 mb-5">
              {enrolledCourses.map((course) => {
                const progress = courseProgress[course.id] || 0;
                return (
                  <Col md={6} lg={4} key={course.id}>
                    <div className="course-card-wrapper">
                      <Card className="h-100 course-card-modern border-0 overflow-hidden">
                        <div className="course-header">
                          <img
                            src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f70a504f9?auto=format&fit=crop&w=400&q=80'}
                            alt={course.title}
                            className="course-image"
                          />
                          <div className="course-badge-primary">
                            <Badge bg="primary" className="fw-bold">
                              <i className="bi bi-lightning-fill me-1"></i>
                              {progress}% Complete
                            </Badge>
                          </div>
                          <div className="course-overlay-modern"></div>
                        </div>
                        <Card.Body className="p-4">
                          <div className="mb-3">
                            <Badge bg="light" text="dark" className="me-2">
                              {course.level || 'Beginner'}
                            </Badge>
                          </div>
                          <h5 className="course-title mb-2">{course.title}</h5>
                          <p className="course-instructor mb-3">
                            <i className="bi bi-person-circle me-2 text-primary"></i>
                            {course.instructor?.name || course.instructor_name || 'Unknown'}
                          </p>
                          
                          <div className="progress-section mb-4">
                            <div className="progress-header mb-2">
                              <small className="fw-semibold">Progress</small>
                              <small className="text-primary fw-bold">{progress}%</small>
                            </div>
                            <ProgressBar 
                              now={progress}
                              className="course-progress-bar"
                            />
                          </div>

                          <Button 
                            as={Link}
                            to={`/courses/${course.id}`}
                            className="btn-continue-learning w-100 fw-bold"
                          >
                            <i className="bi bi-play-fill me-2"></i>
                            Continue Learning
                          </Button>
                        </Card.Body>
                      </Card>
                    </div>
                  </Col>
                );
              })}
            </Row>
          ) : (
            <Row className="justify-content-center py-5">
              <Col md={6} className="text-center">
                <div className="empty-state-icon mb-4">
                  <i className="bi bi-book display-1 text-muted"></i>
                </div>
                <h5 className="fw-bold mb-2">Start Your Learning Journey</h5>
                <p className="text-muted mb-4">No courses yet. Enroll in a course and start learning today!</p>
                <Button as={Link} to="/explore" variant="primary" size="lg" className="px-5">
                  <i className="bi bi-search me-2"></i>
                  Explore Courses
                </Button>
              </Col>
            </Row>
          )}

          <div className="text-center">
            <Button as={Link} to="/explore" variant="outline-primary" size="sm" className="fw-bold">
              <i className="bi bi-plus-lg me-2"></i>
              Explore More Courses
            </Button>
          </div>
        </Container>
      </section>

      {/* ============ LEARNING PROGRESS SECTION ============ */}
      {enrolledCourses.length > 0 && (
        <section className="learning-progress-section">
          <Container>
            <div className="section-header mb-5">
              <h2 className="section-title">Your Learning Progress</h2>
              <p className="section-subtitle">Track your progress across enrolled courses</p>
            </div>
            <Row className="g-4">
              {enrolledCourses.map((course) => {
                const progress = courseProgress[course.id] || 0;
                // Calculate completed lessons based on progress percentage
                const videoData = Array.isArray(courseProgress[`${course.id}_details`]) 
                  ? courseProgress[`${course.id}_details`] 
                  : [];
                const totalLessons = videoData.length || 20;
                const completedLessons = Math.round((progress / 100) * totalLessons);
                
                return (
                  <Col lg={6} key={course.id}>
                    <Card className="progress-card border-0 shadow-sm overflow-hidden h-100">
                      <Card.Body className="p-4">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div className="flex-grow-1">
                            <h6 className="progress-course-title mb-2">{course.title}</h6>
                            <p className="progress-course-info text-muted mb-0">
                              <i className="bi bi-book me-2"></i>
                              <small>{completedLessons} of {totalLessons} lessons completed</small>
                            </p>
                          </div>
                          <div className="progress-badge-group">
                            <Badge bg="primary" className="progress-percentage-badge">
                              {progress}%
                            </Badge>
                          </div>
                        </div>

                        <div className="progress-bar-wrapper mt-4">
                          <ProgressBar
                            now={progress}
                            label={`${progress}%`}
                            className="progress-bar-custom"
                            striped={progress < 100 && progress > 0}
                            animated={progress < 100 && progress > 0}
                          />
                        </div>

                        <div className="progress-footer mt-4 pt-3 border-top">
                          <Button
                            as={Link}
                            to={`/courses/${course.id}`}
                            variant="outline-primary"
                            size="sm"
                            className="w-100 fw-bold"
                          >
                            <i className="bi bi-play-circle me-2"></i>
                            Continue Learning
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </Container>
        </section>
      )}

      {/* ============ RECOMMENDED COURSES SECTION ============ */}
      <section className="recommended-section">
        <Container>
          <div className="section-header mb-5">
            <h2 className="section-title">Recommended For You</h2>
            <p className="section-subtitle">Courses tailored to your interests and learning goals</p>
          </div>

          {recommendedCourses.length > 0 ? (
            <Row className="g-4">
              {recommendedCourses.map((course) => {
                const numericRating = Number.parseFloat(course.rating);
                const rating = Number.isFinite(numericRating) ? numericRating.toFixed(1) : '4.5';
                return (
                  <Col md={6} lg={4} key={course.id}>
                    <Card className="h-100 course-card-recommended border-0 overflow-hidden">
                      <div className="course-header-recommended">
                        <img
                          src={course.thumbnail || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=400&q=80'}
                          alt={course.title}
                          className="course-image-recommended"
                        />
                        <div className="course-rating-badge">
                          <Badge bg="warning" text="dark" className="fw-bold">
                            <i className="bi bi-star-fill"></i> {rating}
                          </Badge>
                        </div>
                      </div>
                      <Card.Body className="p-4">
                        <div className="mb-3">
                          <Badge bg="success" className="me-2">
                            {course.level || 'Beginner'}
                          </Badge>
                          <Badge bg="light" text="dark">
                            {course.duration || '6 weeks'}
                          </Badge>
                        </div>
                        <h5 className="course-title-recommended mb-2">{course.title}</h5>
                        <p className="course-instructor mb-4">
                          <i className="bi bi-person-circle me-2 text-primary"></i>
                          <small>{course.instructor?.name || course.instructor_name || 'Unknown'}</small>
                        </p>

                        <div className="course-footer">
                          <div className="price-section">
                            {course.isFree === true
                              ? <span className="course-price fw-bold text-success">Free</span>
                              : <span className="course-price fw-bold text-success">Free</span>
                            }
                          </div>
                        </div>

                        <Button 
                          as={Link}
                          to={`/courses/${course.id}`}
                          className="btn-enroll w-100 mt-3 fw-bold"
                        >
                          <i className="bi bi-arrow-right me-2"></i>
                          View Course
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          ) : null}
        </Container>
      </section>

      {/* ============ RECENT ACTIVITY SECTION ============ */}
      <section className="activity-section">
        <Container>
          <div className="section-header mb-5">
            <h2 className="section-title">Recent Activity</h2>
            <p className="section-subtitle">Your learning timeline and accomplishments</p>
          </div>
          <Row className="g-4">
            <Col lg={8}>
              <Card className="activity-card border-0 shadow-sm overflow-hidden">
                <Card.Body className="p-4">
                  <div className="activity-timeline">
                    {[
                      { icon: 'bi bi-play-circle', title: 'Started watching lesson', course: enrolledCourses[0]?.title || 'Course lesson', time: '2 hours ago', color: 'primary' },
                      { icon: 'bi bi-check-circle', title: 'Completed assignment', course: enrolledCourses[1]?.title || 'Course assignment', time: '1 day ago', color: 'success' },
                      { icon: 'bi bi-chat-dots', title: 'Participated in discussion', course: enrolledCourses[0]?.title || 'Course discussion', time: '3 days ago', color: 'info' },
                      { icon: 'bi bi-file-earmark', title: 'Downloaded course material', course: enrolledCourses[2]?.title || 'Course material', time: '1 week ago', color: 'warning' }
                    ].map((activity, idx) => (
                      <div key={idx} className="activity-item d-flex gap-4 pb-4">
                        <div className="activity-icon-wrapper">
                          <div className={`activity-icon bg-${activity.color} bg-opacity-10`}>
                            <i className={`${activity.icon} text-${activity.color}`}></i>
                          </div>
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="activity-title fw-bold mb-1">{activity.title}</h6>
                          <p className="activity-meta text-muted small mb-0">
                            <span className="d-block">{activity.course}</span>
                            <span className="d-block">{activity.time}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4}>
              <div className="d-grid gap-3">
                <Card className="motivational-card border-0 shadow-sm text-white overflow-hidden">
                  <div className="motivational-background"></div>
                  <Card.Body className="p-4 position-relative z-1">
                    <h6 className="fw-bold mb-2">
                      <i className="bi bi-fire me-2"></i>Keep Going!
                    </h6>
                    <p className="small mb-3">You're 45% through your learning journey. Keep up the momentum!</p>
                    <div className="motivational-stat">
                      <small className="fw-bold">45% Progress</small>
                    </div>
                  </Card.Body>
                </Card>

                <Card className="quick-links-card border-0 shadow-sm">
                  <Card.Body className="p-4">
                    <h6 className="fw-bold mb-4">
                      <i className="bi bi-lightning-charge me-2 text-warning"></i>Quick Links
                    </h6>
                    <div className="d-grid gap-2">
                      <Button 
                        as={Link} 
                        to="/explore" 
                        variant="outline-primary"
                        size="sm"
                        className="fw-bold text-start"
                      >
                        <i className="bi bi-search me-2"></i>Browse Courses
                      </Button>
                      <Button 
                        as={Link} 
                        to="/student/profile" 
                        variant="outline-primary"
                        size="sm"
                        className="fw-bold text-start"
                      >
                        <i className="bi bi-person me-2"></i>My Profile
                      </Button>
                      <Button 
                        as={Link} 
                        to="/student/progress" 
                        variant="outline-primary"
                        size="sm"
                        className="fw-bold text-start"
                      >
                        <i className="bi bi-bar-chart me-2"></i>View Progress
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
}
