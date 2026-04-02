
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../../styles/home-page.css';

export default function Home() {
  return (
    <main className="home-page public-home-clean">
      {/* Hero Section - Enhanced */}
      <section className="hero-section-enhanced">
        <Container className="position-relative z-2">
          <Row className="align-items-center" style={{ minHeight: '90vh' }}>
            <Col lg={6} className="mb-5 mb-lg-0">
              <div className="hero-content-enhanced">
                <div className="hero-badge mb-4">
                  <span className="badge-icon">✨</span>
                  <span className="badge-text">Trusted by 50,000+ learners worldwide</span>
                </div>
                
                <h1 className="hero-title-enhanced mb-4">
                  Transform Your Career with Expert-Led Learning
                </h1>
                
                <p className="hero-subtitle-enhanced mb-6">
                  Access world-class courses from industry professionals. Learn at your own pace with lifetime access and earn recognized certificates.
                </p>
                
                {/* CTA Buttons */}
                <div className="d-flex gap-3 flex-wrap mb-5 hero-buttons">
                  <Button
                    as={Link}
                    to="/register"
                    className="btn-primary-hero-enhanced"
                  >
                    <i className="bi bi-play-circle me-2"></i>
                    Start Learning Free
                  </Button>
                  <Button
                    as={Link}
                    to="/explore"
                    className="btn-secondary-hero-enhanced"
                  >
                    <i className="bi bi-arrow-right me-2"></i>
                    Explore Courses
                  </Button>
                </div>

                <p className="hero-footnote-enhanced">
                  <i className="bi bi-shield-check me-2"></i>
                  No credit card required. Unlimited access for 7 days free.
                </p>
              </div>
            </Col>

            <Col lg={6} className="d-flex justify-content-center">
              <div className="hero-image-container">
                <div className="hero-card-stack">
                  <div className="hero-card card-1">
                    <div className="card-header">
                      <i className="bi bi-book-fill"></i>
                    </div>
                    <p className="card-title">Learn Anywhere</p>
                  </div>
                  <div className="hero-card card-2">
                    <div className="card-header">
                      <i className="bi bi-award-fill"></i>
                    </div>
                    <p className="card-title">Get Certified</p>
                  </div>
                  <div className="hero-card card-3">
                    <div className="card-header">
                      <i className="bi bi-people-fill"></i>
                    </div>
                    <p className="card-title">Join Community</p>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <Container>
          <Row>
            <Col md={4} className="mb-4 mb-md-0">
              <div className="stat-card">
                <div className="stat-number">50K+</div>
                <div className="stat-label">Active Learners</div>
                <p className="stat-description">Join our global community of learners</p>
              </div>
            </Col>
            <Col md={4} className="mb-4 mb-md-0">
              <div className="stat-card">
                <div className="stat-number">1000+</div>
                <div className="stat-label">Expert Courses</div>
                <p className="stat-description">Curated courses from industry leaders</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="stat-card">
                <div className="stat-number">4.8★</div>
                <div className="stat-label">Average Rating</div>
                <p className="stat-description">Highly rated by our learners</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <Container>
          <Row className="mb-5">
            <Col lg={8} className="mx-auto text-center">
              <h2 className="section-title mb-3">Why Choose EduLearn Pro?</h2>
              <p className="section-subtitle">Learn from the best instructors with the most trusted platform</p>
            </Col>
          </Row>

          <Row>
            {[
              {
                icon: '🎓',
                title: 'Expert Instructors',
                description: 'Learn from industry professionals with years of real-world experience.'
              },
              {
                icon: '⏱️',
                title: 'Learn at Your Pace',
                description: 'Study whenever you want with lifetime access to all course materials.'
              },
              {
                icon: '📜',
                title: 'Certificates',
                description: 'Get recognized certificates to boost your professional profile.'
              },
              {
                icon: '🌍',
                title: 'Global Community',
                description: 'Connect with learners and professionals from around the world.'
              },
              {
                icon: '💡',
                title: 'Practical Skills',
                description: 'Master real-world skills with hands-on projects and assignments.'
              },
              {
                icon: '🚀',
                title: 'Career Growth',
                description: 'Advance your career with in-demand skills and knowledge.'
              }
            ].map((feature, index) => (
              <Col md={6} lg={4} key={index} className="mb-4">
                <div className="feature-card">
                  <div className="feature-icon">{feature.icon}</div>
                  <h5 className="feature-title">{feature.title}</h5>
                  <p className="feature-description">{feature.description}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Popular Courses Section */}
      <section className="popular-courses-section">
        <Container>
          <Row className="mb-5">
            <Col lg={8} className="mx-auto text-center">
              <h2 className="section-title mb-3">Popular Courses</h2>
              <p className="section-subtitle">Explore top-rated courses across various categories</p>
            </Col>
          </Row>

          <Row>
            {[
              {
                id: 1,
                title: 'Introduction to React',
                instructor: 'John Anderson',
                rating: 4.8,
                reviews: 2453,
                price: '₹499',
                image: 'https://via.placeholder.com/300x200/4f46e5/4f46e5?text=React'
              },
              {
                id: 2,
                title: 'Web Design Masterclass',
                instructor: 'Sarah Designer',
                rating: 4.9,
                reviews: 1889,
                price: '₹599',
                image: 'https://via.placeholder.com/300x200/7c3aed/7c3aed?text=Design'
              },
              {
                id: 3,
                title: 'Data Science Fundamentals',
                instructor: 'Prof. David',
                rating: 4.7,
                reviews: 3201,
                price: '₹699',
                image: 'https://via.placeholder.com/300x200/2563eb/2563eb?text=Data'
              },
              {
                id: 4,
                title: 'Digital Marketing 101',
                instructor: 'Emily Chen',
                rating: 4.8,
                reviews: 1567,
                price: '₹399',
                image: 'https://via.placeholder.com/300x200/06b6d4/06b6d4?text=Marketing'
              }
            ].map((course) => (
              <Col md={6} lg={3} key={course.id} className="mb-4">
                <div className="course-card">
                  <div className="course-image-wrapper">
                    <img src={course.image} alt={course.title} className="course-image" />
                  </div>
                  <div className="course-content">
                    <h5 className="course-title">{course.title}</h5>
                    <p className="course-instructor">{course.instructor}</p>
                    <div className="course-meta">
                      <span className="course-rating">
                        ⭐ {course.rating} ({course.reviews.toLocaleString()})
                      </span>
                    </div>
                    <div className="course-footer">
                      <span className="course-price">{course.price}</span>
                      <Button as={Link} to="/explore" className="btn-course-action">
                        View Course
                      </Button>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>

          <Row className="mt-5">
            <Col className="text-center">
              <Button as={Link} to="/explore" className="btn-secondary-hero">
                Explore All Courses
              </Button>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <Container>
          <Row className="justify-content-center text-center">
            <Col lg={8}>
              <h2 className="section-title mb-4">Start Learning Today</h2>
              <p className="section-subtitle mb-4">
                Join thousands of students already learning on EduLearn Pro
              </p>
              <Button
                as={Link}
                to="/register"
                className="btn-primary-hero btn-lg"
              >
                Create Free Account
              </Button>
              <p className="cta-note">No credit card required</p>
            </Col>
          </Row>
        </Container>
      </section>
    </main>
  );
}
