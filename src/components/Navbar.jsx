
import { Navbar, Container, Nav, NavDropdown, Button, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/globals.css';

export default function AppNavbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dashboardLink =
    user?.role === 'student'    ? '/student/dashboard' :
    user?.role === 'instructor' ? '/instructor/dashboard' :
    user?.role === 'admin'      ? '/admin-dashboard' : '/';

  return (
    <Navbar bg="white" expand="lg" sticky="top" className="border-bottom shadow-sm">
      <Container>
        {/* Brand */}
        <Navbar.Brand as={Link} to="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="logo-animate d-flex align-items-center justify-content-center" style={{ height: 36 }}>
            <svg width="36" height="36" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"
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
          <span className="fw-bold" style={{ fontSize: 22, lineHeight: 1, display: 'flex', alignItems: 'center', height: 36 }}>
            EduLearn Pro
          </span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          {/* Left nav */}
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/catalog">Courses</Nav.Link>
            <Nav.Link as={Link} to="/about">About</Nav.Link>
            <Nav.Link as={Link} to="/contact">Contact</Nav.Link>
            {isAuthenticated && user?.role === 'student' && (
              <Nav.Link as={Link} to="/student/my-learning">My Learning</Nav.Link>
            )}

            {isAuthenticated && user?.role === 'instructor' && (
              <Nav.Link as={Link} to="/instructor/dashboard">Dashboard</Nav.Link>
            )}
          </Nav>

          {/* Right nav */}
          <Nav className="align-items-lg-center gap-1">
            {!isAuthenticated ? (
              <div className="d-flex flex-column flex-lg-row gap-2 align-items-stretch align-items-lg-center">
                <Button as={Link} to="/login" variant="outline-primary" size="sm" className="flex-fill flex-lg-grow-0">
                  Login
                </Button>
                <Button as={Link} to="/register" variant="primary" size="sm" className="flex-fill flex-lg-grow-0">
                  Sign Up
                </Button>
                <Button
                  as={Link}
                  to="/admin-login"
                  variant="outline-dark"
                  size="sm"
                  className="border-2 fw-semibold flex-fill flex-lg-grow-0"
                  style={{ borderRadius: '8px', fontSize: '13px', letterSpacing: '0.5px', textTransform: 'uppercase' }}
                >
                  🔒 Admin
                </Button>
              </div>
            ) : (
              <NavDropdown
                title={
                  <span className="d-flex align-items-center gap-2">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt="avatar"
                        width={28}
                        height={28}
                        className="rounded-circle"
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center bg-primary text-white flex-shrink-0"
                        style={{ width: 28, height: 28, fontSize: 12, fontWeight: 700 }}
                      >
                        {(user?.name?.[0] || 'U').toUpperCase()}
                      </div>
                    )}
                    <span className="d-none d-lg-inline" style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.name || 'Profile'}
                    </span>
                  </span>
                }
                id="profile-dropdown"
                align="end"
              >
                {/* User info header */}
                <div className="px-3 py-2 border-bottom" style={{ minWidth: 200 }}>
                  <div className="fw-semibold" style={{ fontSize: '0.9rem' }}>{user?.name || 'User'}</div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>{user?.email}</div>
                  <Badge bg={user?.role === 'student' ? 'primary' : user?.role === 'instructor' ? 'success' : 'danger'}
                    className="text-capitalize mt-1 px-2 py-1" style={{ fontSize: '0.65rem' }}>
                    {user?.role}
                  </Badge>
                </div>

                <NavDropdown.Item as={Link} to={dashboardLink}>
                  <i className="bi bi-speedometer2 me-2" />Dashboard
                </NavDropdown.Item>

                {user?.role === 'student' && (
                  <>
                    <NavDropdown.Item as={Link} to="/student/profile">
                      <i className="bi bi-person me-2" />Profile
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/student/my-learning">
                      <i className="bi bi-collection-play me-2" />My Learning
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/student/payment-history">
                      <i className="bi bi-receipt me-2" />Payment History
                    </NavDropdown.Item>
                  </>
                )}

                {user?.role === 'instructor' && (
                  <NavDropdown.Item as={Link} to="/instructor/profile">
                    <i className="bi bi-person me-2" />Profile
                  </NavDropdown.Item>
                )}

                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout} className="text-danger">
                  <i className="bi bi-box-arrow-right me-2" />Logout
                </NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

