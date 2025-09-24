import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Button } from 'react-bootstrap';

export default function SimpleTest() {
  return (
    <Container className="mt-5">
      <Row>
        <Col>
          <h1 className="text-center mb-4">EduLearn Pro - Simple Test</h1>
          <p className="lead text-center">If you can see this, Bootstrap and React are working!</p>
          <div className="text-center">
            <Button variant="primary" className="me-2">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
}