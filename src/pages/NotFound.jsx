import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/dark-mode.css';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Container>
      <Row className="min-vh-100 align-items-center justify-content-center">
        <Col md={7} lg={5} className="text-center py-5">
          {/* Animated 404 illustration */}
          <div className="mb-4" aria-hidden="true">
            <svg width="180" height="120" viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="20" y="30" width="140" height="80" rx="12" fill="#e7f1ff" stroke="#4F8EF7" strokeWidth="2.5"/>
              <rect x="35" y="48" width="30" height="6" rx="3" fill="#4F8EF7" opacity="0.5"/>
              <rect x="35" y="60" width="55" height="6" rx="3" fill="#4F8EF7" opacity="0.3"/>
              <rect x="35" y="72" width="40" height="6" rx="3" fill="#4F8EF7" opacity="0.2"/>
              <circle cx="130" cy="72" r="20" fill="#FFD700" opacity="0.9" stroke="#f59e0b" strokeWidth="2"/>
              <text x="121" y="78" fontSize="18" fontWeight="bold" fill="#78350f">?</text>
            </svg>
          </div>

          <h1
            className="fw-black mb-2"
            style={{
              fontSize: 'clamp(4rem, 15vw, 7rem)',
              background: 'linear-gradient(135deg, #4F8EF7 0%, #7c3aed 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1,
            }}
          >
            404
          </h1>
          <h2 className="mb-2 fw-bold" style={{ fontSize: '1.5rem' }}>Page Not Found</h2>
          <p className="text-muted mb-4" style={{ maxWidth: 380, margin: '0 auto 1.5rem' }}>
            The page you&apos;re looking for might have been removed, renamed, or is temporarily
            unavailable.
          </p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Button variant="primary" onClick={() => navigate(-1)}>
              <i className="bi bi-arrow-left me-2" />Go Back
            </Button>
            <Button as={Link} to="/" variant="outline-primary">
              <i className="bi bi-house me-2" />Home
            </Button>
            <Button as={Link} to="/catalog" variant="outline-secondary">
              <i className="bi bi-grid me-2" />Browse Courses
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

