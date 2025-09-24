import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function SimpleNavbar() {
  return (
    <Navbar bg="white" expand="lg" sticky="top" className="border-bottom shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Interactive Graduation Cap SVG Logo */}
          <span className="logo-animate d-flex align-items-center justify-content-center" style={{ height: 36 }}>
            <svg
              width="36"
              height="36"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ display: 'block', verticalAlign: 'middle', transition: 'transform 0.3s cubic-bezier(.4,2,.6,1)', willChange: 'transform' }}
              className="edu-logo-svg"
            >
              <g>
                <polygon points="32,10 60,22 32,34 4,22 32,10" fill="#4F8EF7" stroke="#222" strokeWidth="2"/>
                <rect x="26" y="34" width="12" height="12" rx="3" fill="#fff" stroke="#4F8EF7" strokeWidth="2"/>
                <rect x="28" y="36" width="8" height="8" rx="2" fill="#4F8EF7" opacity="0.2"/>
                <line x1="32" y1="34" x2="32" y2="54" stroke="#222" strokeWidth="2"/>
                <circle cx="32" cy="56" r="2.5" fill="#FFD700" stroke="#222" strokeWidth="1.5"/>
              </g>
            </svg>
          </span>
          <span className="fw-bold" style={{ fontSize: 24, lineHeight: 1, display: 'flex', alignItems: 'center', height: 36 }}>EduLearn Pro</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/catalog">Courses</Nav.Link>
            <Nav.Link as={Link} to="/about">About</Nav.Link>
            <Nav.Link as={Link} to="/contact">Contact</Nav.Link>
            <Nav.Link as={Link} to="/terms">Terms of Service</Nav.Link>
            <Nav.Link as={Link} to="/privacy">Privacy Policy</Nav.Link>
          </Nav>
          <Nav className="ms-auto">
            <Nav className="d-flex flex-row align-items-center">
              <Button
                as={Link}
                to="/login"
                variant="outline-primary"
                className="me-2"
                style={{ minWidth: '80px' }}
              >
                Login
              </Button>
              <Button
                as={Link}
                to="/register"
                variant="primary"
                style={{ minWidth: '80px' }}
              >
                Sign Up
              </Button>
            </Nav>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}