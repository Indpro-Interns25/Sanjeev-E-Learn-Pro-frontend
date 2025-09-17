import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <Container>
      <Row className="min-vh-100 align-items-center justify-content-center">
        <Col md={6} className="text-center">
          <h1 className="display-1 fw-bold text-primary mb-4">404</h1>
          <h2 className="mb-4">Page Not Found</h2>
          <p className="text-muted mb-4">
            The page you are looking for might have been removed, had its name changed,
            or is temporarily unavailable.
          </p>
          <Button as={Link} to="/" variant="primary">
            Back to Home
          </Button>
        </Col>
      </Row>
    </Container>
  );
}
