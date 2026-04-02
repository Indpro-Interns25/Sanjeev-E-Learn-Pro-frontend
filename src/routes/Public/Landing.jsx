import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <main>
      {/* Hero Section - Main Call to Action */}
      <section
        className="hero-section d-flex flex-column justify-content-center align-items-center text-center position-relative"
        style={{
          minHeight: '90vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
        }}
      >
        <Container className="position-relative z-1 py-5">
          <Row className="justify-content-center">
            <Col lg={10}>
              <h1 className="display-3 fw-bold mb-4" style={{ lineHeight: 1.2 }}>
                Welcome to EduLearn Pro
              </h1>
              <p className="lead mb-5 fs-5" style={{ fontSize: '1.5rem', fontWeight: 300 }}>
                The Ultimate Platform for Learning, Growing, and Succeeding
              </p>
              <p className="mb-5 fs-6" style={{ fontSize: '1.1rem', opacity: 0.95 }}>
                Discover thousands of expert-led courses in tech, business, design, and more. 
                Learn at your own pace and transform your career today.
              </p>
              
              {/* CTA Buttons */}
              <div className="d-flex gap-3 justify-content-center flex-wrap mt-5">
                <Button
                  as={Link}
                  to="/register"
                  variant="light"
                  size="lg"
                  className="px-5 py-3 fw-bold"
                  style={{ fontSize: '1.1rem', minWidth: 200 }}
                >
                  Get Started Free
                </Button>
                <Button
                  as={Link}
                  to="/catalog"
                  variant="outline-light"
                  size="lg"
                  className="px-5 py-3 fw-bold"
                  style={{ fontSize: '1.1rem', minWidth: 200, borderWidth: 2 }}
                >
                  Explore Courses
                </Button>
              </div>

              {/* Trusted By Section */}
              <div className="mt-5 pt-5">
                <p className="small text-uppercase letter-spacing mb-3" style={{ opacity: 0.8 }}>
                  Trusted by learners worldwide
                </p>
                <div className="d-flex justify-content-center gap-4 flex-wrap">
                  <div className="text-center">
                    <h3 className="display-6 fw-bold mb-1">50K+</h3>
                    <p className="small">Active Learners</p>
                  </div>
                  <div className="text-center">
                    <h3 className="display-6 fw-bold mb-1">1K+</h3>
                    <p className="small">Expert Courses</p>
                  </div>
                  <div className="text-center">
                    <h3 className="display-6 fw-bold mb-1">4.8★</h3>
                    <p className="small">Average Rating</p>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Value Proposition Section */}
      <section className="py-5">
        <Container>
          <Row className="justify-content-center mb-5">
            <Col lg={8} className="text-center">
              <h2 className="display-5 fw-bold mb-4">Why Choose EduLearn Pro?</h2>
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
                <div className="p-4 bg-light rounded-3 h-100" style={{ transition: 'all 0.3s ease' }}>
                  <div className="text-center">
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                      {feature.icon}
                    </div>
                    <h5 className="fw-bold mb-3">{feature.title}</h5>
                    <p className="text-muted mb-0">{feature.description}</p>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Social Proof Section */}
      <section className="py-5 bg-dark text-white">
        <Container>
          <Row className="justify-content-center mb-5">
            <Col lg={8} className="text-center">
              <h2 className="display-5 fw-bold mb-4">What Our Learners Say</h2>
            </Col>
          </Row>
          <Row>
            {[
              {
                name: 'Sarah Johnson',
                role: 'Product Designer',
                review: 'EduLearn Pro helped me transition to UX design. The courses are well-structured and the instructors are amazing!',
                rating: '★★★★★'
              },
              {
                name: 'Mike Chen',
                role: 'Software Developer',
                review: 'I completed 5 courses and landed my dream job. Highly recommended for anyone serious about their career.',
                rating: '★★★★★'
              },
              {
                name: 'Emily Rodriguez',
                role: 'Digital Marketer',
                review: 'The practical projects really helped me apply what I learned. Best investment in myself!',
                rating: '★★★★★'
              }
            ].map((testimonial, index) => (
              <Col md={6} lg={4} key={index} className="mb-4">
                <div className="p-4 bg-dark-2 rounded-3 border border-secondary h-100">
                  <div className="mb-3">{testimonial.rating}</div>
                  <p className="mb-4 text-light">"{testimonial.review}"</p>
                  <div>
                    <p className="fw-bold mb-0">{testimonial.name}</p>
                    <p className="text-muted small mb-0">{testimonial.role}</p>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Final CTA Section */}
      <section className="py-5 bg-light">
        <Container>
          <Row className="justify-content-center text-center">
            <Col lg={8}>
              <h2 className="display-5 fw-bold mb-4">Ready to Transform Your Career?</h2>
              <p className="lead mb-5">Join thousands of successful learners on EduLearn Pro today.</p>
              <Button
                as={Link}
                to="/register"
                variant="primary"
                size="lg"
                className="px-5 py-3 fw-bold"
                style={{ fontSize: '1.1rem', minWidth: 250 }}
              >
                Start Your Free Account
              </Button>
              <p className="text-muted mt-3 small">No credit card required. Lifetime access to free courses.</p>
            </Col>
          </Row>
        </Container>
      </section>
    </main>
  );
}
