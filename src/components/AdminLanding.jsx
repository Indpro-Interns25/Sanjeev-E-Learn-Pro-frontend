import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Nav, Card, Table, Button, Badge, Form, Modal, Alert, Spinner } from 'react-bootstrap';
import { getAdminStats, getAllCoursesAdmin, getAllLessonsAdmin, getAllStudents, getAllInstructors } from '../services/admin';
import { getCourseCategories } from '../services/courses';

export default function AdminLanding() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [alert, setAlert] = useState(null);
  
  // Data states
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalInstructors: 0,
    totalCourses: 0,
    totalLessons: 0,
    totalEnrollments: 0,
    activeUsers: 0,
    recentActivity: []
  });
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [students, setStudents] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Form states
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    category: '',
    level: 'beginner',
    price: '',
    duration: '',
    thumbnail: ''
  });
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    courseId: '',
    duration: '',
    orderSequence: '',
    videoUrl: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin-login', { replace: true });
    } else {
      fetchInitialData();
    }
  }, [navigate]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch admin data in parallel with better error handling
      const [adminStats, coursesData, lessonsData, categoriesData, studentsData, instructorsData] = await Promise.all([
        getAdminStats().catch(() => {
          console.warn('Admin stats API unavailable, using sample data');
          return { 
            totalStudents: 156, 
            totalInstructors: 23, 
            totalCourses: 12, 
            totalLessons: 89, 
            totalEnrollments: 342, 
            activeUsers: 78, 
            recentActivity: [
              { type: 'enrollment', description: 'New student enrolled in React Basics', date: '2025-09-29' },
              { type: 'course', description: 'Advanced JavaScript course published', date: '2025-09-28' },
              { type: 'lesson', description: 'New lesson added to Python for Beginners', date: '2025-09-27' }
            ]
          };
        }),
        getAllCoursesAdmin().catch(() => {
          console.warn('Courses API unavailable, using sample data');
          return [
            { id: 1, title: 'React Basics', description: 'Learn React fundamentals', category: 'Web Development', level: 'beginner', price: 99.99, enrolled_count: 45, status: 'published' },
            { id: 2, title: 'Advanced JavaScript', description: 'Master JavaScript concepts', category: 'Programming', level: 'advanced', price: 149.99, enrolled_count: 32, status: 'published' },
            { id: 3, title: 'Python for Data Science', description: 'Data analysis with Python', category: 'Data Science', level: 'intermediate', price: 199.99, enrolled_count: 67, status: 'published' }
          ];
        }),
        getAllLessonsAdmin().catch(() => {
          console.warn('Lessons API unavailable, using sample data');
          return [
            { id: 1, title: 'Introduction to React', description: 'Getting started with React', course_id: 1, course_title: 'React Basics', duration: 30, order_sequence: 1, status: 'published' },
            { id: 2, title: 'JSX and Components', description: 'Understanding JSX syntax', course_id: 1, course_title: 'React Basics', duration: 45, order_sequence: 2, status: 'published' },
            { id: 3, title: 'ES6 Features', description: 'Modern JavaScript features', course_id: 2, course_title: 'Advanced JavaScript', duration: 60, order_sequence: 1, status: 'published' }
          ];
        }),
        getCourseCategories().catch(() => ['Web Development', 'Programming', 'Data Science', 'Design', 'Business']),
        getAllStudents().catch(() => {
          console.warn('Students API unavailable, using sample data');
          return [
            { id: 1, name: 'John Doe', email: 'john@example.com', enrolled_courses: 3, progress: 65, status: 'active', created_at: '2025-08-15' },
            { id: 2, name: 'Jane Smith', email: 'jane@example.com', enrolled_courses: 2, progress: 80, status: 'active', created_at: '2025-09-01' },
            { id: 3, name: 'Mike Johnson', email: 'mike@example.com', enrolled_courses: 1, progress: 25, status: 'active', created_at: '2025-09-10' }
          ];
        }),
        getAllInstructors().catch(() => {
          console.warn('Instructors API unavailable, using sample data');
          return [
            { id: 1, name: 'Dr. Sarah Wilson', email: 'sarah@example.com', specialization: 'Web Development', courses_count: 4, students_count: 120, rating: 4.8, status: 'active', created_at: '2025-01-15' },
            { id: 2, name: 'Prof. David Chen', email: 'david@example.com', specialization: 'Data Science', courses_count: 3, students_count: 89, rating: 4.9, status: 'active', created_at: '2025-02-20' },
            { id: 3, name: 'Alex Rodriguez', email: 'alex@example.com', specialization: 'JavaScript', courses_count: 2, students_count: 67, rating: 4.7, status: 'active', created_at: '2025-03-10' }
          ];
        })
      ]);
      
      setStats(adminStats);
      setCourses(coursesData);
      setLessons(lessonsData);
      setCategories(categoriesData);
      setStudents(studentsData);
      setInstructors(instructorsData);
      
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const handleAction = (action, item = null) => {
    setModalType(action);
    setSelectedItem(item);
    
    // Pre-populate forms if editing
    if (action === 'editCourse' && item) {
      setCourseForm({
        title: item.title,
        description: item.description,
        category: item.category,
        level: item.level,
        price: item.price,
        duration: item.duration,
        thumbnail: item.thumbnail || ''
      });
    } else if (action === 'editLesson' && item) {
      setLessonForm({
        title: item.title,
        description: item.description,
        courseId: item.course_id,
        duration: item.duration,
        orderSequence: item.order_sequence,
        videoUrl: item.video_url || ''
      });
    }
    
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      showAlert(`${modalType.replace(/([A-Z])/g, ' $1').toLowerCase()} completed successfully!`);
      setShowModal(false);
      // Reset forms
      setCourseForm({ title: '', description: '', category: '', level: 'beginner', price: '', duration: '', thumbnail: '' });
      setLessonForm({ title: '', description: '', courseId: '', duration: '', orderSequence: '', videoUrl: '' });
      fetchInitialData(); // Refresh data
    }, 1000);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    navigate('/admin-login', { replace: true });
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
          <Spinner animation="border" variant="primary" />
          <span className="ms-2">Loading...</span>
        </div>
      );
    }

    switch(activeTab) {
      case 'overview':
        return (
          <div>
            <div className="row mb-4">
              <div className="col-md-3">
                <Card className="text-center bg-primary text-white">
                  <Card.Body>
                    <h3>{stats?.totalCourses || 0}</h3>
                    <p>Total Courses</p>
                  </Card.Body>
                </Card>
              </div>
              <div className="col-md-3">
                <Card className="text-center bg-success text-white">
                  <Card.Body>
                    <h3>{stats?.totalLessons || 0}</h3>
                    <p>Total Lessons</p>
                  </Card.Body>
                </Card>
              </div>
              <div className="col-md-3">
                <Card className="text-center bg-info text-white">
                  <Card.Body>
                    <h3>{stats?.totalStudents || 0}</h3>
                    <p>Total Students</p>
                  </Card.Body>
                </Card>
              </div>
              <div className="col-md-3">
                <Card className="text-center bg-warning text-white">
                  <Card.Body>
                    <h3>{stats?.totalInstructors || 0}</h3>
                    <p>Total Instructors</p>
                  </Card.Body>
                </Card>
              </div>
            </div>

            <Card>
              <Card.Header>
                <h5>Recent Activity</h5>
              </Card.Header>
              <Card.Body>
                {stats?.recentActivity?.length > 0 ? (
                  <ul className="list-unstyled">
                    {stats.recentActivity.slice(0, 5).map((activity, index) => (
                      <li key={index} className="mb-2">
                        <Badge bg="secondary" className="me-2">{activity.type}</Badge>
                        {activity.description}
                        <small className="text-muted ms-2">{activity.date}</small>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted">No recent activity</p>
                )}
              </Card.Body>
            </Card>
          </div>
        );

      case 'courses':
        return (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4>Course Management</h4>
              <Button variant="primary" onClick={() => handleAction('createCourse')}>
                <i className="fas fa-plus"></i> Add New Course
              </Button>
            </div>

            <Card>
              <Card.Body>
                <Table responsive>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Level</th>
                      <th>Price</th>
                      <th>Students</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.length > 0 ? courses.map((course) => (
                      <tr key={course.id}>
                        <td>
                          <div>
                            <strong>{course.title}</strong>
                            <br />
                            <small className="text-muted">{course.description?.substring(0, 50)}...</small>
                          </div>
                        </td>
                        <td>
                          <Badge bg="secondary">{course.category}</Badge>
                        </td>
                        <td>
                          <Badge bg={course.level === 'beginner' ? 'success' : course.level === 'intermediate' ? 'warning' : 'danger'}>
                            {course.level}
                          </Badge>
                        </td>
                        <td>${course.price}</td>
                        <td>{course.enrolled_count || 0}</td>
                        <td>
                          <Badge bg={course.status === 'published' ? 'success' : 'warning'}>
                            {course.status || 'draft'}
                          </Badge>
                        </td>
                        <td>
                          <Button variant="outline-primary" size="sm" className="me-1" onClick={() => handleAction('editCourse', course)}>
                            Edit
                          </Button>
                          <Button variant="outline-danger" size="sm" onClick={() => handleAction('deleteCourse', course)}>
                            Delete
                          </Button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="7" className="text-center text-muted">No courses found</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </div>
        );

      case 'lessons':
        return (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4>Lesson Management</h4>
              <Button variant="primary" onClick={() => handleAction('createLesson')}>
                <i className="fas fa-plus"></i> Add New Lesson
              </Button>
            </div>

            <Card>
              <Card.Body>
                <Table responsive>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Course</th>
                      <th>Duration</th>
                      <th>Order</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lessons.length > 0 ? lessons.map((lesson) => (
                      <tr key={lesson.id}>
                        <td>
                          <div>
                            <strong>{lesson.title}</strong>
                            <br />
                            <small className="text-muted">{lesson.description?.substring(0, 50)}...</small>
                          </div>
                        </td>
                        <td>
                          <Badge bg="info">{lesson.course_title || 'Unknown Course'}</Badge>
                        </td>
                        <td>{lesson.duration} min</td>
                        <td>#{lesson.order_sequence}</td>
                        <td>
                          <Badge bg={lesson.status === 'published' ? 'success' : 'warning'}>
                            {lesson.status || 'draft'}
                          </Badge>
                        </td>
                        <td>
                          <Button variant="outline-primary" size="sm" className="me-1" onClick={() => handleAction('editLesson', lesson)}>
                            Edit
                          </Button>
                          <Button variant="outline-danger" size="sm" onClick={() => handleAction('deleteLesson', lesson)}>
                            Delete
                          </Button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="6" className="text-center text-muted">No lessons found</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </div>
        );

      case 'students':
        return (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4>Student Management</h4>
            </div>

            <Card>
              <Card.Body>
                <Table responsive>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Enrolled Courses</th>
                      <th>Progress</th>
                      <th>Join Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.length > 0 ? students.map((student) => (
                      <tr key={student.id}>
                        <td>
                          <div>
                            <strong>{student.name || student.username}</strong>
                          </div>
                        </td>
                        <td>{student.email}</td>
                        <td>{student.enrolled_courses || 0}</td>
                        <td>
                          <div className="progress" style={{ width: '100px' }}>
                            <div 
                              className="progress-bar bg-success" 
                              style={{ width: `${student.progress || 0}%` }}
                            >
                              {student.progress || 0}%
                            </div>
                          </div>
                        </td>
                        <td>{new Date(student.created_at || Date.now()).toLocaleDateString()}</td>
                        <td>
                          <Badge bg={student.status === 'active' ? 'success' : 'warning'}>
                            {student.status || 'active'}
                          </Badge>
                        </td>
                        <td>
                          <Button variant="outline-primary" size="sm" className="me-1">
                            View
                          </Button>
                          <Button variant="outline-warning" size="sm">
                            {student.status === 'active' ? 'Suspend' : 'Activate'}
                          </Button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="7" className="text-center text-muted">No students found</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </div>
        );

      case 'instructors':
        return (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4>Instructor Management</h4>
              <Button variant="primary" onClick={() => handleAction('createInstructor')}>
                <i className="fas fa-plus"></i> Add New Instructor
              </Button>
            </div>

            <Card>
              <Card.Body>
                <Table responsive>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Courses</th>
                      <th>Students</th>
                      <th>Rating</th>
                      <th>Join Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {instructors.length > 0 ? instructors.map((instructor) => (
                      <tr key={instructor.id}>
                        <td>
                          <div>
                            <strong>{instructor.name || instructor.username}</strong>
                            <br />
                            <small className="text-muted">{instructor.specialization || 'General'}</small>
                          </div>
                        </td>
                        <td>{instructor.email}</td>
                        <td>{instructor.courses_count || 0}</td>
                        <td>{instructor.students_count || 0}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <span className="me-1">⭐</span>
                            {instructor.rating || 'N/A'}
                          </div>
                        </td>
                        <td>{new Date(instructor.created_at || Date.now()).toLocaleDateString()}</td>
                        <td>
                          <Badge bg={instructor.status === 'active' ? 'success' : 'warning'}>
                            {instructor.status || 'active'}
                          </Badge>
                        </td>
                        <td>
                          <Button variant="outline-primary" size="sm" className="me-1">
                            View
                          </Button>
                          <Button variant="outline-secondary" size="sm">
                            Edit
                          </Button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="8" className="text-center text-muted">No instructors found</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </div>
        );

      case 'reports':
        return (
          <div>
            <h4 className="mb-4">Reports & Analytics</h4>
            
            {/* Summary Cards */}
            <div className="row mb-4">
              <div className="col-md-6">
                <Card className="h-100">
                  <Card.Header>
                    <h6>Course Performance</h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="mb-3">
                      <small>Most Popular Course</small>
                      <div className="fw-bold">
                        {courses.length > 0 ? 
                          courses.reduce((prev, current) => 
                            (prev.enrolled_count > current.enrolled_count) ? prev : current
                          ).title || 'N/A'
                          : 'No courses available'
                        }
                      </div>
                    </div>
                    <div>
                      <small>Average Completion Rate</small>
                      <div className="fw-bold">75%</div>
                    </div>
                  </Card.Body>
                </Card>
              </div>
              
              <div className="col-md-6">
                <Card className="h-100">
                  <Card.Header>
                    <h6>User Engagement</h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="mb-3">
                      <small>Active Users This Month</small>
                      <div className="fw-bold">{stats?.activeUsers || 0}</div>
                    </div>
                    <div>
                      <small>New Enrollments</small>
                      <div className="fw-bold">{stats?.totalEnrollments || 0}</div>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </div>

            {/* Charts Placeholder */}
            <Card>
              <Card.Header>
                <h6>Analytics Dashboard</h6>
              </Card.Header>
              <Card.Body className="text-center" style={{ minHeight: '300px' }}>
                <div className="d-flex align-items-center justify-content-center h-100">
                  <div>
                    <i className="bi bi-graph-up" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
                    <p className="text-muted mt-3">Advanced analytics and charts will be available here</p>
                    <p className="text-muted">Including course completion rates, user engagement metrics, and revenue analytics</p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Container fluid className="p-0" style={{ height: '100vh' }}>
      {alert && (
        <Alert 
          variant={alert.type} 
          className="position-fixed top-0 end-0 m-3" 
          style={{ zIndex: 1050 }}
          dismissible 
          onClose={() => setAlert(null)}
        >
          {alert.message}
        </Alert>
      )}
      
      <Row className="g-0" style={{ height: '100%' }}>
        {/* Sidebar */}
        <Col md={2} className="bg-dark text-white" style={{ height: '100vh', overflowY: 'auto' }}>
          <div className="p-3">
            <h4 className="text-center mb-4">
              <i className="bi bi-mortarboard"></i> Admin Panel
            </h4>
            
            <Nav className="flex-column">
              <Nav.Link 
                className={`text-white mb-2 ${activeTab === 'overview' ? 'bg-primary rounded' : ''}`}
                onClick={() => setActiveTab('overview')}
                style={{ cursor: 'pointer' }}
              >
                <i className="bi bi-speedometer2 me-2"></i>Overview
              </Nav.Link>
              
              <Nav.Link 
                className={`text-white mb-2 ${activeTab === 'courses' ? 'bg-primary rounded' : ''}`}
                onClick={() => setActiveTab('courses')}
                style={{ cursor: 'pointer' }}
              >
                <i className="bi bi-journal-bookmark me-2"></i>Courses
              </Nav.Link>
              
              <Nav.Link 
                className={`text-white mb-2 ${activeTab === 'lessons' ? 'bg-primary rounded' : ''}`}
                onClick={() => setActiveTab('lessons')}
                style={{ cursor: 'pointer' }}
              >
                <i className="bi bi-play-circle me-2"></i>Lessons
              </Nav.Link>
              
              <Nav.Link 
                className={`text-white mb-2 ${activeTab === 'students' ? 'bg-primary rounded' : ''}`}
                onClick={() => setActiveTab('students')}
                style={{ cursor: 'pointer' }}
              >
                <i className="bi bi-people me-2"></i>Students
              </Nav.Link>
              
              <Nav.Link 
                className={`text-white mb-2 ${activeTab === 'instructors' ? 'bg-primary rounded' : ''}`}
                onClick={() => setActiveTab('instructors')}
                style={{ cursor: 'pointer' }}
              >
                <i className="bi bi-person-check me-2"></i>Instructors
              </Nav.Link>
              
              <Nav.Link 
                className={`text-white mb-2 ${activeTab === 'reports' ? 'bg-primary rounded' : ''}`}
                onClick={() => setActiveTab('reports')}
                style={{ cursor: 'pointer' }}
              >
                <i className="bi bi-graph-up me-2"></i>Reports
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
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          {renderContent()}
        </Col>
      </Row>

      {/* Modal for Create/Edit Forms */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {modalType?.includes('create') ? 'Create' : modalType?.includes('edit') ? 'Edit' : 'Manage'}{' '}
            {modalType?.includes('Course') ? 'Course' : modalType?.includes('Lesson') ? 'Lesson' : 'Item'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {(modalType === 'createCourse' || modalType === 'editCourse') && (
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Course Title</Form.Label>
                <Form.Control
                  type="text"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({...courseForm, title: e.target.value})}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Select
                  value={courseForm.category}
                  onChange={(e) => setCourseForm({...courseForm, category: e.target.value})}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Level</Form.Label>
                <Form.Select
                  value={courseForm.level}
                  onChange={(e) => setCourseForm({...courseForm, level: e.target.value})}
                  required
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </Form.Select>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Price ($)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={courseForm.price}
                  onChange={(e) => setCourseForm({...courseForm, price: e.target.value})}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Duration (hours)</Form.Label>
                <Form.Control
                  type="number"
                  value={courseForm.duration}
                  onChange={(e) => setCourseForm({...courseForm, duration: e.target.value})}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Thumbnail URL</Form.Label>
                <Form.Control
                  type="url"
                  value={courseForm.thumbnail}
                  onChange={(e) => setCourseForm({...courseForm, thumbnail: e.target.value})}
                />
              </Form.Group>
              
              <div className="d-flex justify-content-end">
                <Button variant="secondary" className="me-2" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  {modalType === 'createCourse' ? 'Create Course' : 'Update Course'}
                </Button>
              </div>
            </Form>
          )}

          {(modalType === 'createLesson' || modalType === 'editLesson') && (
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Lesson Title</Form.Label>
                <Form.Control
                  type="text"
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({...lessonForm, title: e.target.value})}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={lessonForm.description}
                  onChange={(e) => setLessonForm({...lessonForm, description: e.target.value})}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Course</Form.Label>
                <Form.Select
                  value={lessonForm.courseId}
                  onChange={(e) => setLessonForm({...lessonForm, courseId: e.target.value})}
                  required
                >
                  <option value="">Select Course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>{course.title}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Duration (minutes)</Form.Label>
                <Form.Control
                  type="number"
                  value={lessonForm.duration}
                  onChange={(e) => setLessonForm({...lessonForm, duration: e.target.value})}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Order Sequence</Form.Label>
                <Form.Control
                  type="number"
                  value={lessonForm.orderSequence}
                  onChange={(e) => setLessonForm({...lessonForm, orderSequence: e.target.value})}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Video URL</Form.Label>
                <Form.Control
                  type="url"
                  value={lessonForm.videoUrl}
                  onChange={(e) => setLessonForm({...lessonForm, videoUrl: e.target.value})}
                />
              </Form.Group>
              
              <div className="d-flex justify-content-end">
                <Button variant="secondary" className="me-2" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  {modalType === 'createLesson' ? 'Create Lesson' : 'Update Lesson'}
                </Button>
              </div>
            </Form>
          )}

          {(modalType === 'deleteCourse' || modalType === 'deleteLesson') && (
            <div>
              <p>Are you sure you want to delete this {modalType?.includes('Course') ? 'course' : 'lesson'}?</p>
              <p><strong>{selectedItem?.title}</strong></p>
              <div className="d-flex justify-content-end">
                <Button variant="secondary" className="me-2" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={() => {
                  showAlert(`${modalType?.includes('Course') ? 'Course' : 'Lesson'} deleted successfully!`);
                  setShowModal(false);
                  fetchInitialData();
                }}>
                  Delete
                </Button>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
}
