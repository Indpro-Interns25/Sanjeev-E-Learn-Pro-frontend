import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <Container>
      <Row className="min-vh-100 align-items-center justify-content-center">
        <Col md={6} className="text-center">
          <h1 className="display-1 fw-bold text-danger mb-4">401</h1>
          <h2 className="mb-4">Access Denied</h2>
          <p className="text-muted mb-4">
            You do not have permission to access this page.
            Please contact your administrator if you believe this is a mistake.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Button variant="primary" onClick={() => navigate(-1)}>
              Go Back
            </Button>
            <Button as={Link} to="/" variant="outline-primary">
              Home
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
