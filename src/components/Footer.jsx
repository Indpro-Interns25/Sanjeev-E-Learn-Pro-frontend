import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark text-light py-4 mt-auto">
      <Container>
        <Row className="align-items-center">
          <Col md={4} className="text-center text-md-start mb-3 mb-md-0">
            <h5>EduLearn Pro</h5>
            <p className="mb-0">Learn. Grow. Succeed.</p>
          </Col>
          
          <Col md={4} className="text-center mb-3 mb-md-0">
            <h6>Quick Links</h6>
            <ul className="list-unstyled">
              <li><Link to="/about" className="text-light text-decoration-none">About Us</Link></li>
              <li><Link to="/contact" className="text-light text-decoration-none">Contact</Link></li>
              <li><Link to="/terms" className="text-light text-decoration-none">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-light text-decoration-none">Privacy Policy</Link></li>
            </ul>
          </Col>
          
          <Col md={4} className="text-center text-md-end">
            <h6>Connect With Us</h6>
            <div className="social-links">
              <a href="#" className="text-light me-3" aria-label="Facebook">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="#" className="text-light me-3" aria-label="Twitter">
                <i className="bi bi-twitter"></i>
              </a>
              <a href="#" className="text-light me-3" aria-label="LinkedIn">
                <i className="bi bi-linkedin"></i>
              </a>
              <a href="#" className="text-light" aria-label="Instagram">
                <i className="bi bi-instagram"></i>
              </a>
            </div>
          </Col>
        </Row>
        
        <Row className="mt-3">
          <Col className="text-center">
            <small>&copy; {currentYear} EduLearn Pro. All rights reserved.</small>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}
