import { Container, Row, Col, Card } from 'react-bootstrap';

export default function Contact() {
  const contacts = [
    {
      name: 'Sanjeev Sangam',
      role: 'Support Lead',
      email: 'sanjeevsangam807@gmail.com',
      phone: '8073078328',
      avatar: 'https://ui-avatars.com/api/?name=Sanjeev+Sangam&background=4F8EF7&color=fff',
      desc: 'For any queries or support, feel free to reach out to Sanjeev.'
    },
    {
      name: 'Priya Sharma',
      role: 'Community Manager',
      email: 'priya@edulearnpro.com',
      phone: '9876543210',
      avatar: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=FFD700&color=222',
      desc: 'Connect for events, webinars, and community support.'
    },
    {
      name: 'Rahul Verma',
      role: 'Technical Support',
      email: 'rahul@edulearnpro.com',
      phone: '9123456780',
      avatar: 'https://ui-avatars.com/api/?name=Rahul+Verma&background=198754&color=fff',
      desc: 'Facing technical issues? Rahul is here to help.'
    }
  ];

  return (
    <Container className="py-5 contact-hero">
      <h1 className="mb-4 fw-bold text-center">Contact Us</h1>
      <p className="lead text-center mb-5">We&apos;re here to help! Reach out to our team for support, feedback, or partnership opportunities.</p>
      <Row className="g-4 justify-content-center mb-4">
        {contacts.map((c, i) => (
          <Col key={c.email} xs={12} sm={6} md={4} className="d-flex align-items-stretch">
            <Card className="contact-card w-100 text-center shadow-sm border-0 animate__animated animate__fadeInUp" style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
              <Card.Body>
                <img src={c.avatar} alt={c.name} className="rounded-circle mb-3 shadow contact-avatar" width={72} height={72} />
                <Card.Title className="mb-1 fw-semibold">{c.name}</Card.Title>
                <div className="text-primary small mb-1">{c.role}</div>
                <Card.Text className="mb-2 text-muted small">{c.desc}</Card.Text>
                <div className="mb-2">
                  <a href={`mailto:${c.email}`} className="d-inline-block me-2 text-decoration-none text-dark contact-link">
                    <i className="bi bi-envelope-fill me-1"></i>{c.email}
                  </a>
                  <br />
                  <a href={`tel:${c.phone}`} className="d-inline-block text-decoration-none text-dark contact-link">
                    <i className="bi bi-telephone-fill me-1"></i>{c.phone}
                  </a>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      <Row className="justify-content-center mb-4">
        <Col xs={12} md={8} className="text-center">
          <h5 className="mb-3">Connect With Us</h5>
          <div className="d-flex justify-content-center gap-3 mb-2">
            <a href="#" className="text-primary contact-social" aria-label="Facebook">
              <i className="bi bi-facebook fs-3"></i>
            </a>
            <a href="#" className="text-info contact-social" aria-label="Twitter">
              <i className="bi bi-twitter fs-3"></i>
            </a>
            <a href="#" className="text-primary contact-social" aria-label="LinkedIn">
              <i className="bi bi-linkedin fs-3"></i>
            </a>
            <a href="#" className="text-danger contact-social" aria-label="Instagram">
              <i className="bi bi-instagram fs-3"></i>
            </a>
          </div>
          <div className="text-muted small">For more information, visit our social media or reach out via email.</div>
        </Col>
      </Row>
      {/* Removed Start Learning Now button as requested */}
    </Container>
  );
}
