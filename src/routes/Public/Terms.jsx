import { Container, Row, Col, Card, Accordion } from 'react-bootstrap';

export default function Terms() {
  const terms = [
    {
      icon: (
        <svg width="32" height="32" fill="none" viewBox="0 0 48 48"><rect x="6" y="10" width="36" height="28" rx="6" fill="#E3F0FF"/><path d="M16 18h16M16 24h10M16 30h8" stroke="#4F8EF7" strokeWidth="2" strokeLinecap="round"/></svg>
      ),
      title: 'Personal Use',
      desc: 'Use courses for your own learning only.'
    },
    {
      icon: (
        <svg width="32" height="32" fill="none" viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="#E3F0FF"/><path d="M16 24h16M24 16v16" stroke="#4F8EF7" strokeWidth="2" strokeLinecap="round"/></svg>
      ),
      title: 'No Sharing',
      desc: 'Do not share paid content without permission.'
    },
    {
      icon: (
        <svg width="32" height="32" fill="none" viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="#E3F0FF"/><path d="M16 32l8-16 8 16" stroke="#4F8EF7" strokeWidth="2" strokeLinecap="round"/></svg>
      ),
      title: 'Respect Community',
      desc: 'Be respectful to other learners and instructors.'
    },
    {
      icon: (
        <svg width="32" height="32" fill="none" viewBox="0 0 48 48"><rect x="6" y="10" width="36" height="28" rx="6" fill="#E3F0FF"/><path d="M24 18v8m0 0l-4-4m4 4l4-4" stroke="#4F8EF7" strokeWidth="2" strokeLinecap="round"/></svg>
      ),
      title: 'Support',
      desc: 'Contact support for any issues.'
    }
  ];
  const faqs = [
    {
      q: 'Can I use my account for others?',
      a: 'No, accounts are for individual use only. Sharing is not allowed.'
    },
    {
      q: 'What happens if I break the rules?',
      a: 'Violations may result in account suspension or removal.'
    },
    {
      q: 'How do I report abuse?',
      a: 'Contact our support team with details. We take reports seriously.'
    }
  ];
  return (
    <Container className="py-5 terms-hero">
      <h1 className="mb-3 fw-bold text-center animate__animated animate__fadeInDown">Terms of Service</h1>
      <p className="lead text-center mb-5 animate__animated animate__fadeIn animate__delay-1s">
        By using EduLearn Pro, you agree to our terms and conditions. All content is for educational purposes. Certificates are awarded upon course completion. Please respect our community guidelines and intellectual property rights.
      </p>
      <Row className="g-4 justify-content-center mb-4">
        {terms.map((t, i) => (
          <Col key={t.title} xs={12} sm={6} md={3} className="d-flex align-items-stretch">
            <Card className="feature-card w-100 text-center shadow-sm border-0 animate__animated animate__zoomIn" style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
              <div className="feature-icon mx-auto mt-4 mb-2">{t.icon}</div>
              <Card.Body>
                <Card.Title className="mb-2 fw-semibold">{t.title}</Card.Title>
                <Card.Text className="text-muted small">{t.desc}</Card.Text>
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
