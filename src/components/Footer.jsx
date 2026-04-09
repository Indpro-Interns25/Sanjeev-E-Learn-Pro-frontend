import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer mt-auto">
      <Container className="py-5">
        <Row className="align-items-start gy-4">
          <Col md={4} className="text-center text-md-start">
            <h5 className="footer-brand-title mb-2">EduLearn Pro</h5>
            <p className="footer-brand-subtitle mb-0">Learn with confidence. Grow with purpose.</p>
          </Col>

          <Col md={4} className="footer-links-col d-flex justify-content-center">
            <ul className="list-unstyled footer-links mb-0 d-inline-block text-start">
              <li><Link to="/about" className="footer-link">About Us</Link></li>
              <li><Link to="/contact" className="footer-link">Contact</Link></li>
              <li><Link to="/terms" className="footer-link">Terms of Service</Link></li>
              <li><Link to="/privacy" className="footer-link">Privacy Policy</Link></li>
            </ul>
          </Col>

          <Col md={4} className="footer-social-col text-start">
            <h6 className="footer-social-title mb-3">Connect With Us</h6>
            <div className="social-links d-flex gap-2">
              <a href="#" className="social-link" aria-label="Facebook">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <i className="bi bi-twitter"></i>
              </a>
              <a href="#" className="social-link" aria-label="LinkedIn">
                <i className="bi bi-linkedin"></i>
              </a>
              <a href="#" className="social-link" aria-label="Instagram">
                <i className="bi bi-instagram"></i>
              </a>
            </div>
          </Col>
        </Row>

        <Row className="mt-4 pt-3 footer-bottom">
          <Col className="text-center">
            <small className="footer-copyright">&copy; {currentYear} EduLearn Pro. All rights reserved.</small>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}
