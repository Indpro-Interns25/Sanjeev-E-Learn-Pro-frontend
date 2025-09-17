import { Container, Row, Col, Card, Accordion } from 'react-bootstrap';

export default function Privacy() {
  const policies = [
    {
      icon: (
        <svg width="32" height="32" fill="none" viewBox="0 0 48 48"><rect x="6" y="10" width="36" height="28" rx="6" fill="#E3F0FF"/><path d="M16 24h16M24 16v16" stroke="#4F8EF7" strokeWidth="2" strokeLinecap="round"/></svg>
      ),
      title: 'Data Protection',
      desc: 'Your personal data is protected and encrypted.'
    },
    {
      icon: (
        <svg width="32" height="32" fill="none" viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="#E3F0FF"/><rect x="16" y="16" width="16" height="16" rx="3" fill="#4F8EF7"/><path d="M20 24l4 4 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
      ),
      title: 'Cookies',
      desc: 'We use cookies for a better user experience.'
    },
    {
      icon: (
        <svg width="32" height="32" fill="none" viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="#E3F0FF"/><path d="M24 16a8 8 0 100 16 8 8 0 000-16zm0 0v-4m0 20v4m8-8h4m-20 0H8" stroke="#4F8EF7" strokeWidth="2" strokeLinecap="round"/></svg>
      ),
      title: 'Data Removal',
      desc: 'Contact us for data removal requests.'
    }
  ];
  const faqs = [
    {
      q: 'What data do you collect?',
      a: 'We collect only necessary information for account creation and course progress.'
    },
    {
      q: 'Can I delete my account?',
      a: 'Yes, you can request account deletion at any time.'
    },
    {
      q: 'Is my data shared?',
      a: 'No, we do not share your data with third parties.'
    }
  ];
  return (
    <Container className="py-5 privacy-hero">
      <h1 className="mb-3 fw-bold text-center animate__animated animate__fadeInDown">Privacy Policy</h1>
      <p className="lead text-center mb-5 animate__animated animate__fadeIn animate__delay-1s">
        EduLearn Pro values your privacy. We collect only necessary information to provide our services and do not share your data with third parties. You can update or delete your account at any time. For questions, contact <a href="mailto:support@edulearnpro.com" className="text-primary text-decoration-underline">support@edulearnpro.com</a>.
      </p>
      <Row className="g-4 justify-content-center mb-4">
        {policies.map((p, i) => (
          <Col key={p.title} xs={12} sm={6} md={4} className="d-flex align-items-stretch">
            <Card className="feature-card w-100 text-center shadow-sm border-0 animate__animated animate__zoomIn" style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
              <div className="feature-icon mx-auto mt-4 mb-2">{p.icon}</div>
              <Card.Body>
                <Card.Title className="mb-2 fw-semibold">{p.title}</Card.Title>
                <Card.Text className="text-muted small">{p.desc}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      <Accordion className="mb-4 animate__animated animate__fadeInUp animate__delay-2s" defaultActiveKey="0">
        <Accordion.Item eventKey="0">
          <Accordion.Header>Frequently Asked Questions</Accordion.Header>
          <Accordion.Body>
            <ul className="mb-0">
              {faqs.map((faq) => (
                <li key={faq.q} className="mb-2">
                  <strong>{faq.q}</strong><br/>{faq.a}
                </li>
              ))}
            </ul>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </Container>
  );
}
