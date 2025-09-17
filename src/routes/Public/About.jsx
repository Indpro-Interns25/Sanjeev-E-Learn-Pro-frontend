
import { Container, Row, Col, Card } from 'react-bootstrap';

export default function About() {
  const features = [
    {
      icon: (
        <svg width="36" height="36" fill="none" viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="#E3F0FF"/><path d="M24 12l7 12h-4v8h-6v-8h-4l7-12z" fill="#4F8EF7"/></svg>
      ),
      title: 'Expert Instructors',
      desc: 'Learn from real-world professionals.'
    },
    {
      icon: (
        <svg width="36" height="36" fill="none" viewBox="0 0 48 48"><rect x="6" y="10" width="36" height="28" rx="6" fill="#E3F0FF"/><rect x="12" y="16" width="24" height="16" rx="3" fill="#4F8EF7"/><path d="M18 24h12" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
      ),
      title: 'Lifetime Access',
      desc: 'Access your courses anytime.'
    },
    {
      icon: (
        <svg width="36" height="36" fill="none" viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="#E3F0FF"/><rect x="16" y="16" width="16" height="16" rx="3" fill="#4F8EF7"/><path d="M20 24l4 4 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
      ),
      title: 'Certificates',
      desc: 'Earn certificates of completion.'
    },
    {
      icon: (
        <svg width="36" height="36" fill="none" viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="#E3F0FF"/><path d="M24 16a8 8 0 100 16 8 8 0 000-16zm0 0v-4m0 20v4m8-8h4m-20 0H8" stroke="#4F8EF7" strokeWidth="2" strokeLinecap="round"/></svg>
      ),
      title: 'Community',
      desc: 'Join an active learner community.'
    },
    {
      icon: (
        <svg width="36" height="36" fill="none" viewBox="0 0 48 48"><rect x="6" y="10" width="36" height="28" rx="6" fill="#E3F0FF"/><path d="M24 18v8m0 0l-4-4m4 4l4-4" stroke="#4F8EF7" strokeWidth="2" strokeLinecap="round"/></svg>
      ),
      title: 'Support',
      desc: 'Get help from our team anytime.'
    }
  ];

  return (
    <Container className="py-5 about-hero">
      <h1 className="mb-3 fw-bold text-center animate__animated animate__fadeInDown">About EduLearn Pro</h1>
      <p className="lead text-center mb-5 animate__animated animate__fadeIn animate__delay-1s">
        EduLearn Pro is a modern e-learning platform designed to help learners unlock their potential and advance their careers.<br/>
        Our mission is to provide high-quality, expert-led courses in technology, business, design, and more.<br/>
        We believe in accessible, self-paced learning for everyone, everywhere.
      </p>
      <Row className="g-4 justify-content-center mb-4">
        {features.map((f, i) => (
          <Col key={f.title} xs={12} sm={6} md={4} lg={3} className="d-flex align-items-stretch">
            <Card className="feature-card w-100 text-center shadow-sm border-0 animate__animated animate__zoomIn" style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
              <div className="feature-icon mx-auto mt-4 mb-2">{f.icon}</div>
              <Card.Body>
                <Card.Title className="mb-2 fw-semibold">{f.title}</Card.Title>
                <Card.Text className="text-muted small">{f.desc}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      <p className="mt-4 text-center animate__animated animate__fadeInUp animate__delay-2s">
        <span className="fw-semibold text-primary">Join thousands of learners</span> and start your journey with <span className="fw-bold">EduLearn Pro</span> today!
      </p>
    </Container>
  );
}
