import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Nav } from 'react-bootstrap';

export default function AdminLanding() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin-login', { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    navigate('/admin-login', { replace: true });
  };

  const renderContent = () => {
    return (
      <div className="mx-auto" style={{ maxWidth: 900 }}>
        <h2 className="text-center mb-5">Admin Dashboard</h2>
        
        {/* Course Management Section */}
        <div className="mb-5">
          <h4 className="mb-4">Course Management</h4>
          <div className="row g-4">
            <div className="col-md-6">
              <div className="card h-100" style={{ backgroundColor: '#007bff', minHeight: '150px' }}>
                <div className="card-body text-white text-center d-flex flex-column justify-content-center">
                  <h5 className="card-title text-white mb-3">Add Course</h5>
                  <button className="btn btn-light">Create New Course</button>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card h-100" style={{ backgroundColor: '#28a745', minHeight: '150px' }}>
                <div className="card-body text-white text-center d-flex flex-column justify-content-center">
                  <h5 className="card-title text-white mb-3">Add Lessons</h5>
                  <button className="btn btn-light">Create New Lesson</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Student Management Section */}
        <div className="mb-5">
          <h4 className="mb-4">Student Management</h4>
          <div className="row g-4">
            <div className="col-md-6">
              <div className="card h-100" style={{ backgroundColor: '#ffc107', minHeight: '150px' }}>
                <div className="card-body text-dark text-center d-flex flex-column justify-content-center">
                  <h5 className="card-title mb-2">Student Approval</h5>
                  <p className="card-text mb-3">Approve pending student registrations</p>
                  <button className="btn btn-dark">Review Applications</button>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card h-100" style={{ backgroundColor: '#17a2b8', minHeight: '150px' }}>
                <div className="card-body text-white text-center d-flex flex-column justify-content-center">
                  <h5 className="card-title text-white mb-2">Progress Reports</h5>
                  <p className="card-text text-white mb-3">View student progress and analytics</p>
                  <button className="btn btn-light">View Reports</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Container fluid className="p-0" style={{ height: '100vh' }}>
      <Row className="g-0" style={{ height: '100%' }}>
        {/* Sidebar */}
        <Col md={2} className="bg-dark text-white" style={{ height: '100vh', overflowY: 'auto' }}>
          <div className="p-3">
            <h4 className="text-center mb-4">
              <i className="bi bi-mortarboard"></i> Admin Panel
            </h4>
            
            <Nav className="flex-column">
              <Nav.Link 
                className={`text-white mb-2 ${activeSection === 'overview' ? 'bg-primary rounded' : ''}`}
                onClick={() => setActiveSection('overview')}
                style={{ cursor: 'pointer' }}
              >
                <i className="bi bi-speedometer2 me-2"></i>Overview
              </Nav.Link>
              
              <Nav.Link 
                className={`text-white mb-2 ${activeSection === 'courses' ? 'bg-primary rounded' : ''}`}
                onClick={() => setActiveSection('courses')}
                style={{ cursor: 'pointer' }}
              >
                <i className="bi bi-journal-bookmark me-2"></i>Courses
              </Nav.Link>
              
              <Nav.Link 
                className={`text-white mb-2 ${activeSection === 'lessons' ? 'bg-primary rounded' : ''}`}
                onClick={() => setActiveSection('lessons')}
                style={{ cursor: 'pointer' }}
              >
                <i className="bi bi-play-circle me-2"></i>Lessons
              </Nav.Link>
              
              <Nav.Link 
                className={`text-white mb-2 ${activeSection === 'students' ? 'bg-primary rounded' : ''}`}
                onClick={() => setActiveSection('students')}
                style={{ cursor: 'pointer' }}
              >
                <i className="bi bi-people me-2"></i>Students
              </Nav.Link>
              
              <Nav.Link 
                className={`text-white mb-2 ${activeSection === 'instructors' ? 'bg-primary rounded' : ''}`}
                onClick={() => setActiveSection('instructors')}
                style={{ cursor: 'pointer' }}
              >
                <i className="bi bi-person-check me-2"></i>Instructors
              </Nav.Link>
              
              <Nav.Link 
                className={`text-white mb-2 ${activeSection === 'reports' ? 'bg-primary rounded' : ''}`}
                onClick={() => setActiveSection('reports')}
                style={{ cursor: 'pointer' }}
              >
                <i className="bi bi-graph-up me-2"></i>Reports
              </Nav.Link>
              
              <Nav.Link 
                className={`text-white mb-2 ${activeSection === 'settings' ? 'bg-primary rounded' : ''}`}
                onClick={() => setActiveSection('settings')}
                style={{ cursor: 'pointer' }}
              >
                <i className="bi bi-gear me-2"></i>Settings
              </Nav.Link>
              
              <hr className="my-3" />
              
              <Nav.Link 
                className="text-danger"
                onClick={handleLogout}
                style={{ cursor: 'pointer' }}
              >
                <i className="bi bi-box-arrow-right me-2"></i>Logout
              </Nav.Link>
            </Nav>
          </div>
        </Col>

        {/* Main Content */}
        <Col md={10} className="p-4" style={{ height: '100vh', overflowY: 'auto' }}>
          {renderContent()}
        </Col>
      </Row>
    </Container>
  );
}
