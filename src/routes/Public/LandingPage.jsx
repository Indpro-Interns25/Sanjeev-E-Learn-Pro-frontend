import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { getAllCourses } from '../../services/courses';
import { getPlatformStats } from '../../services/stats';
import { initScrollAnimations, initHoverEffects } from '../../utils/scrollAnimations';
import '../../styles/landing-page.css';

export default function LandingPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalCourses, setTotalCourses] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [animatedStats, setAnimatedStats] = useState({
    users: 0,
    courses: 0,
    rating: 0
  });
  const hasAnimatedRef = useRef(false);
  const animationFrameRef = useRef(null);

  const formatCount = (value) => `${Math.max(0, Number(value || 0)).toLocaleString()}+`;
  const formatRating = (value) => `${Math.max(0, Number(value || 0)).toFixed(1)}★`;

  useEffect(() => {
    // Initialize scroll animations
    const observer = initScrollAnimations();
    initHoverEffects();

    const fetchCourses = async () => {
      try {
        const data = await getAllCourses({ limit: 6 });
        setCourses(data.slice(0, 6));
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchStats = async () => {
      try {
        const stats = await getPlatformStats();
        setTotalUsers(stats.totalUsers);
        setTotalCourses(stats.totalCourses);
        setAverageRating(stats.averageRating);
      } catch (error) {
        console.error('Error fetching platform stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchCourses();
    fetchStats();

    // Cleanup observer on unmount
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (statsLoading || hasAnimatedRef.current) return;

    const animationDurationMs = 1500;
    let startTimestamp = null;

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const animate = (timestamp) => {
      if (startTimestamp === null) {
        startTimestamp = timestamp;
      }

      const progress = Math.min((timestamp - startTimestamp) / animationDurationMs, 1);
      const easedProgress = easeOutCubic(progress);

      setAnimatedStats({
        users: Math.round(totalUsers * easedProgress),
        courses: Math.round(totalCourses * easedProgress),
        rating: Number((averageRating * easedProgress).toFixed(1))
      });

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      setAnimatedStats({
        users: totalUsers,
        courses: totalCourses,
        rating: Number(averageRating.toFixed(1))
      });

      hasAnimatedRef.current = true;
      animationFrameRef.current = null;
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [statsLoading, totalUsers, totalCourses, averageRating]);

  return (
    <div className="landing-page">
      {/* ============ HERO SECTION ============ */}
      <section className="hero-section-landing py-5 position-relative overflow-hidden">
        <div className="hero-background"></div>
        <Container className="position-relative z-1 py-5">
          <Row className="align-items-center justify-content-center text-center">
            <Col lg={10}>
              <h1 className="hero-title mb-4">
                Learn Without Limits
              </h1>
              <p className="hero-subtitle mb-5">
                Master new skills from industry experts. Access thousands of courses anytime, anywhere.
                <br />
                Start your learning journey today with EduLearn Pro.
              </p>
              <div className="d-flex gap-3 justify-content-center flex-wrap mb-5">
                <Button
                  as={Link}
                  to="/register"
                  variant="primary"
                  size="lg"
                  className="hero-btn fw-bold px-5 py-3"
                >
                  Start Learning Free
                </Button>
                <Button
                  as={Link}
                  to="/login"
                  variant="outline-primary"
                  size="lg"
                  className="hero-btn fw-bold px-5 py-3"
                >
                  Login to Dashboard
                </Button>
              </div>
              <div className="d-flex justify-content-center gap-4 text-muted flex-wrap">
                <div className="stat-box">
                  <h5 className="mb-1 fw-bold text-dark">{statsLoading ? '...' : formatCount(animatedStats.users)}</h5>
                  <small>Active Learners</small>
                </div>
                <div className="stat-box">
                  <h5 className="mb-1 fw-bold text-dark">{statsLoading ? '...' : formatCount(animatedStats.courses)}</h5>
                  <small>Expert Courses</small>
                </div>
                <div className="stat-box">
                  <h5 className="mb-1 fw-bold text-dark">{statsLoading ? '...' : formatRating(animatedStats.rating)}</h5>
                  <small>Average Rating</small>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ============ FEATURES SECTION ============ */}
      <section className="features-section py-5 bg-light">
        <Container>
          <Row className="justify-content-center mb-5">
            <Col lg={8} className="text-center">
              <h2 className="section-title mb-3">Why Choose EduLearn Pro?</h2>
              <p className="section-subtitle text-muted">
                Everything you need to learn, grow, and succeed in your career
              </p>
            </Col>
          </Row>
          <Row className="g-4">
            {[
              {
                icon: '👨‍🏫',
                title: 'Expert Instructors',
                description: 'Learn from industry professionals with years of real-world experience and proven teaching methods.'
              },
              {
                icon: '📜',
                title: 'Online Certification',
                description: 'Earn recognized certificates upon completion to boost your professional profile and credibility.'
              },
              {
                icon: '♾️',
                title: 'Lifetime Access',
                description: 'Once enrolled, access course materials forever. Learn at your own pace, anytime you want.'
              },
              {
                icon: '⏰',
                title: 'Flexible Learning',
                description: 'Study on your schedule. Balance learning with work and personal commitments effortlessly.'
              }
            ].map((feature, idx) => (
              <Col md={6} lg={6} key={idx} className="scroll-fade-in">
                <Card className="feature-card h-100 border-0 shadow-sm rounded-4 glass-effect">
                  <Card.Body className="p-4">
                    <div className="feature-icon mb-3">{feature.icon}</div>
                    <h5 className="fw-bold mb-3">{feature.title}</h5>
                    <p className="text-muted mb-0">{feature.description}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* ============ POPULAR COURSES SECTION ============ */}
      <section className="courses-section py-5">
        <Container>
          <Row className="justify-content-center mb-5">
            <Col lg={8} className="text-center">
              <h2 className="section-title mb-3">Popular Courses</h2>
              <p className="section-subtitle text-muted">
                Explore our most popular and highly-rated courses
              </p>
            </Col>
          </Row>

          {loading ? (
            <Row className="justify-content-center py-5">
              <Col md={6} className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </Col>
            </Row>
          ) : courses.length > 0 ? (
            <Row className="g-4">
              {courses.map((course) => (
                <Col md={6} lg={4} key={course.id} className="scroll-zoom-in">
                  <Card className="course-card h-100 border-0 shadow-sm rounded-4 overflow-hidden course-card-hover">
                    <div className="course-image-wrapper position-relative overflow-hidden image-effect-zoom-on-hover">
                      <img
                        src={course.thumbnail || 'https://via.placeholder.com/400x250'}
                        alt={course.title}
                        className="card-img-top image-effect-grayscale-to-color responsive-img img-ratio-16-9"
                        loading="lazy"
                      />
                      <div className="course-overlay">
                        <Button
                          as={Link}
                          to={`/courses/${course.id}`}
                          variant="primary"
                          className="btn-view-course"
                        >
                          View Course →
                        </Button>
                      </div>
                    </div>
                    <Card.Body className="p-4">
                      <div className="mb-3">
                        <span className="badge bg-primary">{course.level || 'Beginner'}</span>
                      </div>
                      <h5 className="card-title fw-bold mb-2">{course.title}</h5>
                      <p className="text-muted small mb-3">
                        Instructor: {course.instructor?.name || course.instructor_name || 'Unknown'}
                      </p>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-warning">
                          <i className="bi bi-star-fill"></i> {course.rating || 4.5}
                        </span>
                        <span className="fw-bold">
                          {course.isFree === true
                            ? <span className="text-success">Free</span>
                            : <span className="text-success">Free</span>
                          }
                        </span>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Row className="justify-content-center py-5">
              <Col md={6} className="text-center">
                <p className="text-muted">No courses available at the moment</p>
              </Col>
            </Row>
          )}

          <Row className="justify-content-center mt-5">
            <Col md={6} className="text-center">
              <Button
                as={Link}
                to="/explore"
                variant="outline-primary"
                size="lg"
                className="fw-bold"
              >
                Explore All Courses
              </Button>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ============ TESTIMONIALS SECTION ============ */}
      <section className="testimonials-section py-5 bg-light">
        <Container>
          <Row className="justify-content-center mb-5">
            <Col lg={8} className="text-center">
              <h2 className="section-title mb-3">What Students Say</h2>
              <p className="section-subtitle text-muted">
                Join thousands of successful learners who have transformed their careers
              </p>
            </Col>
          </Row>
          <Row className="g-4">
            {[
              {
                name: 'Sarah Johnson',
                role: 'Full Stack Developer',
                review: 'EduLearn Pro helped me transition to tech. The courses are comprehensive and the instructors are incredibly supportive. Highly recommended!',
                rating: 5
              },
              {
                name: 'Mike Chen',
                role: 'Product Manager',
                review: 'I completed 5 courses and landed my dream job within 3 months. The practical projects were invaluable for my interviews.',
                rating: 5
              },
              {
                name: 'Emily Rodriguez',
                role: 'UX Designer',
                review: 'The best online learning platform I\'ve used. Great community, responsive instructors, and lifetime access to materials.',
                rating: 5
              }
            ].map((testimonial, idx) => (
              <Col md={6} lg={4} key={idx} className="scroll-slide-left">
                <Card className="testimonial-card h-100 border-0 shadow-sm rounded-4 bg-white glass-effect">
                  <Card.Body className="p-4">
                    <div className="mb-3">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <i key={i} className="bi bi-star-fill text-warning"></i>
                      ))}
                    </div>
                    <p className="card-text mb-4 text-muted">"{testimonial.review}"</p>
                    <h6 className="fw-bold mb-1">{testimonial.name}</h6>
                    <small className="text-muted">{testimonial.role}</small>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* ============ CTA SECTION ============ */}
      <section className="cta-section py-5 position-relative overflow-hidden">
        <div className="cta-background"></div>
        <Container className="position-relative z-1">
          <Row className="justify-content-center text-center">
            <Col lg={8}>
              <h2 className="section-title mb-4 text-white">Start Learning Skills That Move Your Career Forward</h2>
              <p className="section-subtitle mb-5 text-white">
                Join a growing community of learners and build real-world expertise with guided, project-based courses.
              </p>
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <Button
                  as={Link}
                  to="/register"
                  variant="light"
                  size="lg"
                  className="fw-bold px-5 py-3"
                >
                  Create Free Account
                </Button>
                <Button
                  as={Link}
                  to="/explore"
                  variant="outline-light"
                  size="lg"
                  className="fw-bold px-5 py-3"
                >
                  Browse All Courses
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
}
