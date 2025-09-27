import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Nav, Badge, Table, Modal, Form, Alert } from 'react-bootstrap';
import { mockCourses } from '../data/mockCourses';
import { mockLessons } from '../data/mockLessons';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [alert, setAlert] = useState(null);

  // Mock data for demonstration
  const [students] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active', enrolledCourses: 3, completionRate: 75 },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'pending', enrolledCourses: 2, completionRate: 60 },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'active', enrolledCourses: 4, completionRate: 90 }
  ]);

  const [instructors] = useState([
    { id: 1, name: 'Alice Wilson', email: 'alice@example.com', status: 'active', courses: 2, rating: 4.8 },
    { id: 2, name: 'Mike Brown', email: 'mike@example.com', status: 'pending', courses: 1, rating: 4.5 },
    { id: 3, name: 'Sarah Davis', email: 'sarah@example.com', status: 'active', courses: 3, rating: 4.9 }
  ]);

  const [categories] = useState([
    { id: 1, name: 'Programming', courseCount: 8 },
    { id: 2, name: 'Design', courseCount: 5 },
    { id: 3, name: 'Business', courseCount: 4 },
    { id: 4, name: 'Marketing', courseCount: 3 }
  ]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin-login', { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin-login', { replace: true });
  };

  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const handleAction = (action, item = null) => {
    setModalType(action);
    setSelectedItem(item);
    setShowModal(true);
  };

  const confirmAction = () => {
    showAlert(`${modalType} action completed successfully!`);
    setShowModal(false);
  };

  // Quick stats calculation
  const stats = {
    totalStudents: students.length,
    totalInstructors: instructors.length,
    totalCourses: mockCourses.length,
    totalLessons: mockLessons.length,
    pendingApprovals: students.filter(s => s.status === 'pending').length + instructors.filter(i => i.status === 'pending').length,
    activeUsers: students.filter(s => s.status === 'active').length,
    revenue: 15420 // Mock revenue
  };

  const renderOverview = () => (
    <>
      <Row className="mb-4">
        <Col>
          <h2>Dashboard Overview</h2>
        </Col>
      </Row>
      
      {/* Quick Stats Cards */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="bg-primary text-white h-100">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h6>Total Students</h6>
                  <h3>{stats.totalStudents}</h3>
                </div>
                <i className="bi bi-people fs-1 opacity-75"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="bg-success text-white h-100">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h6>Total Instructors</h6>
                  <h3>{stats.totalInstructors}</h3>
                </div>
                <i className="bi bi-person-check fs-1 opacity-75"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="bg-info text-white h-100">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h6>Total Courses</h6>
                  <h3>{stats.totalCourses}</h3>
                </div>
                <i className="bi bi-journal-bookmark fs-1 opacity-75"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="bg-warning text-white h-100">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h6>Pending Approvals</h6>
                  <h3>{stats.pendingApprovals}</h3>
                </div>
                <i className="bi bi-exclamation-circle fs-1 opacity-75"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Additional Stats */}
      <Row className="mb-4">
        <Col md={4} className="mb-3">
          <Card className="h-100">
            <Card.Body>
              <h6 className="text-muted">Total Lessons</h6>
              <h4>{stats.totalLessons}</h4>
              <small className="text-success">
                <i className="bi bi-arrow-up"></i> Active content
              </small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="h-100">
            <Card.Body>
              <h6 className="text-muted">Active Users</h6>
              <h4>{stats.activeUsers}</h4>
              <small className="text-info">
                <i className="bi bi-graph-up"></i> This month
              </small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="h-100">
            <Card.Body>
              <h6 className="text-muted">Revenue</h6>
              <h4>${stats.revenue.toLocaleString()}</h4>
              <small className="text-primary">
                <i className="bi bi-currency-dollar"></i> Total earnings
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );

  const renderCourseManagement = () => (
    <>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2>Course Management</h2>
            <div>
              <Button variant="success" className="me-2" onClick={() => handleAction('addCourse')}>
                <i className="bi bi-plus"></i> Add Course
              </Button>
              <Button variant="outline-primary" onClick={() => handleAction('manageCategories')}>
                <i className="bi bi-tags"></i> Manage Categories
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      <Card>
        <Card.Header>
          <h5 className="mb-0">All Courses</h5>
        </Card.Header>
        <Card.Body>
          <Table responsive>
            <thead>
              <tr>
                <th>Course Name</th>
                <th>Instructor</th>
                <th>Category</th>
                <th>Status</th>
                <th>Students</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockCourses.slice(0, 10).map(course => (
                <tr key={course.id}>
                  <td>{course.title}</td>
                  <td>{course.instructor.name}</td>
                  <td>
                    <Badge bg="secondary">{course.category}</Badge>
                  </td>
                  <td>
                    <Badge bg="success">Active</Badge>
                  </td>
                  <td>{course.enrolled}</td>
                  <td>
                    <Badge bg="success">Free</Badge>
                  </td>
                  <td>
                    <Button size="sm" variant="outline-primary" className="me-2" onClick={() => handleAction('editCourse', course)}>
                      <i className="bi bi-pencil"></i>
                    </Button>
                    <Button size="sm" variant="outline-danger" onClick={() => handleAction('deleteCourse', course)}>
                      <i className="bi bi-trash"></i>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </>
  );

  const renderLessonManagement = () => (
    <>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2>Lesson Management</h2>
            <Button variant="success" onClick={() => handleAction('addLesson')}>
              <i className="bi bi-plus"></i> Add Lesson
            </Button>
          </div>
        </Col>
      </Row>

      <Card>
        <Card.Header>
          <h5 className="mb-0">All Lessons</h5>
        </Card.Header>
        <Card.Body>
          <Table responsive>
            <thead>
              <tr>
                <th>Lesson Title</th>
                <th>Course</th>
                <th>Duration</th>
                <th>Order</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockLessons.slice(0, 15).map(lesson => (
                <tr key={lesson.id}>
                  <td>{lesson.title}</td>
                  <td>{mockCourses.find(c => c.id === lesson.courseId)?.title}</td>
                  <td>{lesson.duration}</td>
                  <td>{lesson.order}</td>
                  <td>
                    <Badge bg="success">Approved</Badge>
                  </td>
                  <td>
                    <Button size="sm" variant="outline-primary" className="me-2" onClick={() => handleAction('editLesson', lesson)}>
                      <i className="bi bi-pencil"></i>
                    </Button>
                    <Button size="sm" variant="outline-warning" className="me-2" onClick={() => handleAction('reorderLesson', lesson)}>
                      <i className="bi bi-arrow-up-down"></i>
                    </Button>
                    <Button size="sm" variant="outline-danger" onClick={() => handleAction('deleteLesson', lesson)}>
                      <i className="bi bi-trash"></i>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </>
  );

  const renderStudentManagement = () => (
    <>
      <Row className="mb-4">
        <Col>
          <h2>Student Management</h2>
        </Col>
      </Row>

      <Card>
        <Card.Header>
          <h5 className="mb-0">All Students</h5>
        </Card.Header>
        <Card.Body>
          <Table responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Enrolled Courses</th>
                <th>Completion Rate</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.id}>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>
                    <Badge bg={student.status === 'active' ? 'success' : 'warning'}>
                      {student.status}
                    </Badge>
                  </td>
                  <td>{student.enrolledCourses}</td>
                  <td>{student.completionRate}%</td>
                  <td>
                    {student.status === 'pending' && (
                      <>
                        <Button size="sm" variant="outline-success" className="me-2" onClick={() => handleAction('approveStudent', student)}>
                          <i className="bi bi-check"></i>
                        </Button>
                        <Button size="sm" variant="outline-danger" className="me-2" onClick={() => handleAction('rejectStudent', student)}>
                          <i className="bi bi-x"></i>
                        </Button>
                      </>
                    )}
                    <Button size="sm" variant="outline-primary" className="me-2" onClick={() => handleAction('viewStudent', student)}>
                      <i className="bi bi-eye"></i>
                    </Button>
                    <Button size="sm" variant="outline-warning" onClick={() => handleAction('suspendStudent', student)}>
                      <i className="bi bi-pause"></i>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </>
  );

  const renderInstructorManagement = () => (
    <>
      <Row className="mb-4">
        <Col>
          <h2>Instructor Management</h2>
        </Col>
      </Row>

      <Card>
        <Card.Header>
          <h5 className="mb-0">All Instructors</h5>
        </Card.Header>
        <Card.Body>
          <Table responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Courses</th>
                <th>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {instructors.map(instructor => (
                <tr key={instructor.id}>
                  <td>{instructor.name}</td>
                  <td>{instructor.email}</td>
                  <td>
                    <Badge bg={instructor.status === 'active' ? 'success' : 'warning'}>
                      {instructor.status}
                    </Badge>
                  </td>
                  <td>{instructor.courses}</td>
                  <td>
                    <div className="d-flex align-items-center">
                      <span className="me-2">{instructor.rating}</span>
                      <div className="text-warning">
                        {[...Array(5)].map((_, i) => (
                          <i key={i} className={`bi bi-star${i < Math.round(instructor.rating) ? '-fill' : ''}`}></i>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td>
                    {instructor.status === 'pending' && (
                      <>
                        <Button size="sm" variant="outline-success" className="me-2" onClick={() => handleAction('approveInstructor', instructor)}>
                          <i className="bi bi-check"></i>
                        </Button>
                        <Button size="sm" variant="outline-danger" className="me-2" onClick={() => handleAction('rejectInstructor', instructor)}>
                          <i className="bi bi-x"></i>
                        </Button>
                      </>
                    )}
                    <Button size="sm" variant="outline-primary" className="me-2" onClick={() => handleAction('viewInstructor', instructor)}>
                      <i className="bi bi-eye"></i>
                    </Button>
                    <Button size="sm" variant="outline-warning" onClick={() => handleAction('suspendInstructor', instructor)}>
                      <i className="bi bi-pause"></i>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </>
  );

  const renderReportsAnalytics = () => (
    <>
      <Row className="mb-4">
        <Col>
          <h2>Reports & Analytics</h2>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6} className="mb-3">
          <Card>
            <Card.Header>
              <h6>Course Enrollment</h6>
            </Card.Header>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Enrolled</th>
                    <th>Completion Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {mockCourses.slice(0, 5).map(course => (
                    <tr key={course.id}>
                      <td>{course.title}</td>
                      <td>{course.enrolled}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="progress me-2" style={{ width: '60px', height: '6px' }}>
                            <div className="progress-bar" style={{ width: `${Math.random() * 100}%` }}></div>
                          </div>
                          {Math.round(Math.random() * 100)}%
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} className="mb-3">
          <Card>
            <Card.Header>
              <h6>User Activity</h6>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <small className="text-muted">Daily Active Users</small>
                <h4>1,234</h4>
              </div>
              <div className="mb-3">
                <small className="text-muted">Weekly Active Users</small>
                <h4>5,678</h4>
              </div>
              <div className="mb-3">
                <small className="text-muted">Monthly Active Users</small>
                <h4>12,345</h4>
              </div>
              <div>
                <small className="text-muted">Revenue This Month</small>
                <h4>${stats.revenue.toLocaleString()}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );

  const renderSystemSettings = () => (
    <>
      <Row className="mb-4">
        <Col>
          <h2>System Settings</h2>
        </Col>
      </Row>

      <Row>
        <Col md={8} className="mb-4">
          <Card>
            <Card.Header>
              <h5>Site Configuration</h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Site Name</Form.Label>
                  <Form.Control type="text" defaultValue="EduLearn Pro" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Site Description</Form.Label>
                  <Form.Control as="textarea" rows={3} defaultValue="Professional online learning platform" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Contact Email</Form.Label>
                  <Form.Control type="email" defaultValue="admin@edulearn.com" />
                </Form.Group>
                <Button variant="primary">Save Settings</Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-4">
          <Card>
            <Card.Header>
              <h5>Admin Roles</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <Badge bg="primary" className="me-2">Super Admin</Badge>
                <small className="text-muted">Full access</small>
              </div>
              <div className="mb-3">
                <Badge bg="info" className="me-2">Moderator</Badge>
                <small className="text-muted">Content management</small>
              </div>
              <div className="mb-3">
                <Badge bg="secondary" className="me-2">Support</Badge>
                <small className="text-muted">User assistance</small>
              </div>
              <Button size="sm" variant="outline-primary">
                <i className="bi bi-plus"></i> Add Role
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );

  const renderSupport = () => (
    <>
      <Row className="mb-4">
        <Col>
          <h2>Support & Feedback</h2>
        </Col>
      </Row>

      <Row>
        <Col md={6} className="mb-4">
          <Card>
            <Card.Header>
              <h5>Recent Feedback</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3 p-3 bg-light rounded">
                <div className="d-flex justify-content-between">
                  <strong>John Doe</strong>
                  <small className="text-muted">2 hours ago</small>
                </div>
                <p className="mb-1">Great platform! Love the video quality.</p>
                <Badge bg="success">Positive</Badge>
              </div>
              <div className="mb-3 p-3 bg-light rounded">
                <div className="d-flex justify-content-between">
                  <strong>Jane Smith</strong>
                  <small className="text-muted">5 hours ago</small>
                </div>
                <p className="mb-1">Need more advanced courses in React.</p>
                <Badge bg="info">Suggestion</Badge>
              </div>
              <div className="mb-3 p-3 bg-light rounded">
                <div className="d-flex justify-content-between">
                  <strong>Bob Wilson</strong>
                  <small className="text-muted">1 day ago</small>
                </div>
                <p className="mb-1">Video player not working on mobile.</p>
                <Badge bg="warning">Issue</Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} className="mb-4">
          <Card>
            <Card.Header>
              <h5>Contact Form Submissions</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive size="sm">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Subject</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Alice Johnson</td>
                    <td>Course Inquiry</td>
                    <td><Badge bg="warning">Pending</Badge></td>
                    <td>Today</td>
                  </tr>
                  <tr>
                    <td>Mike Brown</td>
                    <td>Technical Issue</td>
                    <td><Badge bg="success">Resolved</Badge></td>
                    <td>Yesterday</td>
                  </tr>
                  <tr>
                    <td>Sarah Davis</td>
                    <td>Billing Question</td>
                    <td><Badge bg="info">In Progress</Badge></td>
                    <td>2 days ago</td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'overview': return renderOverview();
      case 'courses': return renderCourseManagement();
      case 'lessons': return renderLessonManagement();
      case 'students': return renderStudentManagement();
      case 'instructors': return renderInstructorManagement();
      case 'reports': return renderReportsAnalytics();
      case 'settings': return renderSystemSettings();
      case 'support': return renderSupport();
      default: return renderOverview();
    }
  };

  return (
    <Container fluid className="p-0">
      <Row className="g-0">
        {/* Sidebar */}
        <Col md={2} className="bg-dark text-white min-vh-100">
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
                {stats.pendingApprovals > 0 && (
                  <Badge bg="warning" className="ms-2">{stats.pendingApprovals}</Badge>
                )}
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
              
              <Nav.Link 
                className={`text-white mb-2 ${activeSection === 'support' ? 'bg-primary rounded' : ''}`}
                onClick={() => setActiveSection('support')}
                style={{ cursor: 'pointer' }}
              >
                <i className="bi bi-headset me-2"></i>Support
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
        <Col md={10} className="p-4">
          {alert && (
            <Alert variant={alert.type} dismissible onClose={() => setAlert(null)}>
              {alert.message}
            </Alert>
          )}
          
          {renderContent()}
        </Col>
      </Row>

      {/* Action Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalType === 'addCourse' && 'Add New Course'}
            {modalType === 'editCourse' && 'Edit Course'}
            {modalType === 'deleteCourse' && 'Delete Course'}
            {modalType === 'addLesson' && 'Add New Lesson'}
            {modalType === 'editLesson' && 'Edit Lesson'}
            {modalType === 'deleteLesson' && 'Delete Lesson'}
            {modalType === 'approveStudent' && 'Approve Student'}
            {modalType === 'rejectStudent' && 'Reject Student'}
            {modalType === 'approveInstructor' && 'Approve Instructor'}
            {modalType === 'rejectInstructor' && 'Reject Instructor'}
            {modalType === 'manageCategories' && 'Manage Categories'}
            {!modalType.includes('add') && !modalType.includes('edit') && !modalType.includes('manage') && 'Confirm Action'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalType.includes('delete') ? (
            <p>Are you sure you want to delete &ldquo;{selectedItem?.title || selectedItem?.name}&rdquo;? This action cannot be undone.</p>
          ) : modalType.includes('approve') ? (
            <p>Are you sure you want to approve {selectedItem?.name}?</p>
          ) : modalType.includes('reject') ? (
            <p>Are you sure you want to reject {selectedItem?.name}?</p>
          ) : modalType === 'manageCategories' ? (
            <div>
              <h6>Current Categories:</h6>
              {categories.map(cat => (
                <div key={cat.id} className="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
                  <span>{cat.name} ({cat.courseCount} courses)</span>
                  <Button size="sm" variant="outline-danger">
                    <i className="bi bi-trash"></i>
                  </Button>
                </div>
              ))}
              <Form className="mt-3">
                <Form.Group>
                  <Form.Label>Add New Category</Form.Label>
                  <Form.Control type="text" placeholder="Category name" />
                </Form.Group>
              </Form>
            </div>
          ) : (
            <p>This feature will open a detailed form for {modalType}.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button 
            variant={modalType.includes('delete') || modalType.includes('reject') ? 'danger' : 'primary'} 
            onClick={confirmAction}
          >
            {modalType.includes('delete') ? 'Delete' : 
             modalType.includes('reject') ? 'Reject' :
             modalType.includes('approve') ? 'Approve' : 'Confirm'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}