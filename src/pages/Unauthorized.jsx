import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <Container>
      <Row className="min-vh-100 align-items-center justify-content-center">
        <Col md={7} lg={5} className="text-center py-5">
          {/* Icon */}
          <div
            className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4"
            style={{
              width: 100,
              height: 100,
              background: 'linear-gradient(135deg, #fee2e2 0%, #fca5a5 100%)',
            }}
          >
            <i className="bi bi-shield-lock-fill" style={{ fontSize: '2.5rem', color: '#ef4444' }} />
          </div>

          <h1
            className="fw-black mb-2"
            style={{
              fontSize: 'clamp(3rem, 12vw, 5.5rem)',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1,
            }}
          >
            403
          </h1>
          <h2 className="mb-2 fw-bold" style={{ fontSize: '1.5rem' }}>Access Denied</h2>
          <p className="text-muted mb-4" style={{ maxWidth: 380, margin: '0 auto 1.5rem' }}>
            You don&apos;t have permission to view this page. If you think this is a mistake,
            please contact your administrator.
          </p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Button variant="danger" onClick={() => navigate(-1)}>
              <i className="bi bi-arrow-left me-2" />Go Back
            </Button>
            <Button as={Link} to="/" variant="outline-secondary">
              <i className="bi bi-house me-2" />Home
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

