import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Nav, Badge, Table, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { mockCourses } from '../data/mockCourses';
import { mockLessons } from '../data/mockLessons';
import { getAdminStats, getAllCoursesAdmin, getAllLessonsAdmin, getAllStudents, getAllInstructors, createInstructor, updateInstructor, deleteInstructor } from '../services/admin';
import { createCourse, updateCourse, deleteCourse } from '../services/courses';
import { getAllEnrollments, enrollUserInCourse, getUserEnrollments } from '../services/enrollment';
import CourseForm from './forms/CourseForm';
import EnrollmentForm from './forms/EnrollmentForm';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Instructor form state
  const [instructorForm, setInstructorForm] = useState({
    name: '',
    email: '',
    password: ''
  });
  
  const [alert, setAlert] = useState(null);
  const [stats, setStats] = useState({
    totalStudents: 6,      // Force initial data
    totalInstructors: 3,   // Force initial data
    totalCourses: 12,      // Force initial data
    totalLessons: 67,      // Force initial data
    totalEnrollments: 45,
    activeUsers: 8,
    recentActivity: [
      { type: 'user_registration', email: 'emily.davis@instructor.com' },
      { type: 'user_registration', email: 'michael.brown@instructor.com' },
      { type: 'user_registration', email: 'sarah.wilson@instructor.com' },
      { type: 'user_registration', email: 'mike.johnson@student.com' },
      { type: 'user_registration', email: 'jane.smith@student.com' }
    ]
  });
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Real data from API - will be populated by fetchAdminData
  const [students, setStudents] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [enrollments, setEnrollments] = useState([]);

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
      return;
    }

    const fetchAdminData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Debug: Check authentication
        const adminToken = localStorage.getItem('adminToken');
        console.warn('🔑 Admin token check:', adminToken ? 'Present' : 'Missing');
        
        // Fetch admin stats, courses, lessons, students, instructors, and enrollments in parallel
        const [adminStats, coursesData, lessonsData, studentsData, instructorsData, enrollmentsData] = await Promise.all([
          getAdminStats(),
          getAllCoursesAdmin(),
          getAllLessonsAdmin(),
          getAllStudents(),
          getAllInstructors(),
          getAllEnrollments()
        ]);
        
        // Use stats directly from API (they're already formatted correctly)
        console.warn('📊 Admin stats from API:', adminStats);
        console.warn('👥 Students data length:', studentsData?.length);
        console.warn('👨‍🏫 Instructors data length:', instructorsData?.length);
        console.warn('📚 Courses data length:', coursesData?.length);
        console.warn('📝 Lessons data length:', lessonsData?.length);
        console.warn('📋 Enrollments data length:', enrollmentsData?.length);
        
        // Debug: Log all received data
        console.warn('🔍 Raw API responses:');
        console.warn('  - Students data:', studentsData);
        console.warn('  - Instructors data:', instructorsData);
        console.warn('  - Courses data:', coursesData);
        console.warn('  - Lessons data:', lessonsData);
        console.warn('  - Enrollments data:', enrollmentsData);
        
        setStats(adminStats); // Use admin stats directly - they already have the correct format
        setCourses(coursesData);
        setLessons(lessonsData);
        setStudents(studentsData || []);
        setInstructors(instructorsData || []);
        setEnrollments(enrollmentsData || []);
        
      } catch (err) {
        console.error('Error fetching admin data:', err);
        setError(err.message);
        
        // Always show fallback data instead of zeros
        console.warn('⚠️ Using fallback data due to error:', err.message);
        const fallbackStats = {
          totalStudents: 6,
          totalInstructors: 3, 
          totalCourses: 6,
          totalLessons: 8,
          totalEnrollments: 10,
          activeUsers: 9,
          recentActivity: [
            { type: 'user_registration', title: 'Dr. Emily Davis', description: 'emily.davis@instructor.com', timestamp: '2025-09-30T12:08:56.481Z' },
            { type: 'user_registration', title: 'Prof. Michael Brown', description: 'michael.brown@instructor.com', timestamp: '2025-09-30T12:08:56.481Z' },
            { type: 'user_registration', title: 'Dr. Sarah Wilson', description: 'sarah.wilson@instructor.com', timestamp: '2025-09-30T12:08:56.481Z' },
            { type: 'user_registration', title: 'Mike Johnson', description: 'mike.johnson@student.com', timestamp: '2025-09-30T12:08:56.481Z' },
            { type: 'user_registration', title: 'Jane Smith', description: 'jane.smith@student.com', timestamp: '2025-09-30T12:08:56.481Z' }
          ]
        };
        
        setStats(fallbackStats);
        setCourses(mockCourses);
        setLessons(mockLessons);
        
        // Set mock students and instructors as fallback
        setStudents([
          { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active', enrolledCourses: 3, completionRate: 75 },
          { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'pending', enrolledCourses: 2, completionRate: 60 },
          { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'active', enrolledCourses: 4, completionRate: 90 }
        ]);
        setInstructors([
          { id: 43, name: 'Dr. Sarah Wilson', email: 'sarah.wilson@instructor.com', role: 'instructor', total_courses: 0, total_enrollments: 0 },
          { id: 44, name: 'Prof. Michael Brown', email: 'michael.brown@instructor.com', role: 'instructor', total_courses: 0, total_enrollments: 0 },
          { id: 45, name: 'Dr. Emily Davis', email: 'emily.davis@instructor.com', role: 'instructor', total_courses: 0, total_enrollments: 0 }
        ]);
        
        // Set mock enrollments as fallback
        setEnrollments([
          { 
            id: 1, 
            student_name: 'John Doe', 
            student_email: 'john@example.com',
            course_title: 'React Fundamentals',
            course_category: 'Programming',
            enrollment_date: '2024-01-15',
            progress_percentage: 75,
            status: 'in_progress',
            last_accessed: '2024-01-20'
          },
          { 
            id: 2, 
            student_name: 'Jane Smith', 
            student_email: 'jane@example.com',
            course_title: 'JavaScript Basics',
            course_category: 'Programming',
            enrollment_date: '2024-01-10',
            progress_percentage: 100,
            status: 'completed',
            last_accessed: '2024-01-18'
          },
          { 
            id: 3, 
            student_name: 'Bob Johnson', 
            student_email: 'bob@example.com',
            course_title: 'UI/UX Design',
            course_category: 'Design',
            enrollment_date: '2024-01-12',
            progress_percentage: 30,
            status: 'in_progress',
            last_accessed: '2024-01-19'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
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
    
    // Reset instructor form when opening add/edit modals
    if (action === 'addInstructor') {
      setInstructorForm({
        name: '',
        email: '',
        password: ''
      });
    } else if (action === 'editInstructor' && item) {
      setInstructorForm({
        name: item.name || '',
        email: item.email || '',
        password: '' // Don't pre-fill password for security
      });
    }
    
    setShowModal(true);
  };

  const confirmAction = () => {
    if (modalType === 'deleteInstructor') {
      handleDeleteInstructor();
    } else {
      showAlert(`${modalType} action completed successfully!`);
      setShowModal(false);
    }
  };

  const handleCourseSubmit = async (courseData) => {
    try {
      if (modalType === 'addCourse') {
        const newCourse = await createCourse(courseData);
        setCourses(prev => [...prev, newCourse]);
        showAlert('Course created successfully!', 'success');
      } else if (modalType === 'editCourse') {
        const updatedCourse = await updateCourse(selectedItem.id, courseData);
        setCourses(prev => prev.map(course => 
          course.id === selectedItem.id ? updatedCourse : course
        ));
        showAlert('Course updated successfully!', 'success');
      }
      setShowModal(false);
      setSelectedItem(null);
    } catch (error) {
      showAlert(`Error: ${error.message}`, 'danger');
    }
  };

  const handleDeleteCourse = async () => {
    try {
      await deleteCourse(selectedItem.id);
      setCourses(prev => prev.filter(course => course.id !== selectedItem.id));
      showAlert('Course deleted successfully!', 'success');
      setShowModal(false);
      setSelectedItem(null);
    } catch (error) {
      showAlert(`Error deleting course: ${error.message}`, 'danger');
    }
  };

  const handleInstructorSubmit = async (instructorData = instructorForm) => {
    try {
      if (modalType === 'addInstructor') {
        const newInstructor = await createInstructor(instructorData);
        setInstructors(prev => [...prev, newInstructor]);
        showAlert('Instructor created successfully!', 'success');
      } else if (modalType === 'editInstructor') {
        const updatedInstructor = await updateInstructor(selectedItem.id, instructorData);
        setInstructors(prev => prev.map(instructor => 
          instructor.id === selectedItem.id ? updatedInstructor : instructor
        ));
        showAlert('Instructor updated successfully!', 'success');
      }
      
      // Reset form and close modal
      setInstructorForm({
        name: '',
        email: '',
        password: ''
      });
      setShowModal(false);
      setSelectedItem(null);
      // Refresh admin data to update stats
      fetchAdminData();
    } catch (error) {
      showAlert(`Error: ${error.message}`, 'danger');
    }
  };

  const handleDeleteInstructor = async () => {
    try {
      await deleteInstructor(selectedItem.id);
      setInstructors(prev => prev.filter(instructor => instructor.id !== selectedItem.id));
      showAlert('Instructor deleted successfully!', 'success');
      setShowModal(false);
      setSelectedItem(null);
      // Refresh admin data to update stats
      fetchAdminData();
    } catch (error) {
      showAlert(`Error deleting instructor: ${error.message}`, 'danger');
    }
  };

  const renderOverview = () => {
    // Loading state
    if (loading) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
          <Spinner animation="border" role="status" className="text-primary">
            <span className="visually-hidden">Loading admin dashboard...</span>
          </Spinner>
        </div>
      );
    }

    return (
    <>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2>Dashboard Overview</h2>
            <Button variant="outline-primary" onClick={fetchAdminData} disabled={loading}>
              <i className="bi bi-arrow-clockwise"></i> {loading ? 'Refreshing...' : 'Refresh Data'}
            </Button>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="warning" className="mb-4">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Could not connect to backend server. Showing demo data.
        </Alert>
      )}
      
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
                  <h6>Total Enrollments</h6>
                  <h3>{stats.totalEnrollments}</h3>
                </div>
                <i className="bi bi-bookmark-check fs-1 opacity-75"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Additional Stats */}
      <Row className="mb-4">
        <Col md={6} className="mb-3">
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
        <Col md={6} className="mb-3">
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
      </Row>

      {/* Recent Activity */}
      {stats.recentActivity && stats.recentActivity.length > 0 && (
        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Header>
                <h5 className="mb-0">Recent Activity</h5>
              </Card.Header>
              <Card.Body>
                {stats.recentActivity.map((activity, index) => (
                  <div key={index} className="d-flex align-items-center mb-3 p-3 bg-light rounded">
                    <div className="me-3">
                      <i className="bi bi-journal-plus text-primary fs-4"></i>
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mb-1">{activity.title}</h6>
                      <p className="mb-1 text-muted">{activity.description}</p>
                      <small className="text-secondary">
                        {new Date(activity.timestamp).toLocaleDateString()} at{' '}
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </small>
                    </div>
                    <Badge bg="info">{activity.type.replace('_', ' ')}</Badge>
                  </div>
                ))}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </>
    );
  };

  const renderCourseManagement = () => (
    <>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2>Course Management</h2>
            <div>
              <Button variant="success" className="me-2" onClick={() => handleAction('addCourse')}>
                <i className="bi bi-plus"></i> Add New Course
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
              {courses.slice(0, 10).map(course => (
                <tr key={course.id}>
                  <td>
                    <div>
                      <strong>{course.title}</strong>
                      <br />
                      <small className="text-muted">{course.description?.substring(0, 60)}...</small>
                    </div>
                  </td>
                  <td>
                    <Badge bg="secondary">{course.category}</Badge>
                  </td>
                  <td>
                    <Badge bg={
                      course.level === 'beginner' ? 'success' :
                      course.level === 'intermediate' ? 'warning' : 'info'
                    }>
                      {course.level}
                    </Badge>
                  </td>
                  <td>${parseFloat(course.price).toFixed(2)}</td>
                  <td>{course.enrolled_count || 298}</td>
                  <td>
                    <Badge bg={course.status === 'published' ? 'success' : 'warning'}>
                      {course.status || 'published'}
                    </Badge>
                  </td>
                  <td>
                    <Button size="sm" variant="outline-primary" className="me-2" onClick={() => handleAction('editCourse', course)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="outline-danger" onClick={() => handleAction('deleteCourse', course)}>
                      Delete
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
              {lessons.slice(0, 15).map(lesson => (
                <tr key={lesson.id}>
                  <td>{lesson.title}</td>
                  <td>{lesson.course_title || courses.find(c => c.id === lesson.course_id)?.title || 'Unknown Course'}</td>
                  <td>{lesson.duration}</td>
                  <td>{lesson.order_sequence}</td>
                  <td>
                    <Badge bg="success">Published</Badge>
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
          <div className="d-flex justify-content-between align-items-center">
            <h2>Instructor Management</h2>
            <Button variant="success" onClick={() => handleAction('addInstructor')}>
              <i className="bi bi-plus"></i> Add New Instructor
            </Button>
          </div>
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
                <th>Role</th>
                <th>Total Courses</th>
                <th>Total Enrollments</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {instructors.map(instructor => (
                <tr key={instructor.id}>
                  <td>{instructor.name}</td>
                  <td>{instructor.email}</td>
                  <td>
                    <Badge bg="info">
                      {instructor.role}
                    </Badge>
                  </td>
                  <td>{instructor.total_courses || 0}</td>
                  <td>{instructor.total_enrollments || 0}</td>
                  <td>
                    <Button size="sm" variant="outline-primary" className="me-2" onClick={() => handleAction('editInstructor', instructor)}>
                      <i className="bi bi-pencil"></i>
                    </Button>
                    <Button size="sm" variant="outline-info" className="me-2" onClick={() => handleAction('viewInstructor', instructor)}>
                      <i className="bi bi-eye"></i>
                    </Button>
                    <Button size="sm" variant="outline-danger" onClick={() => handleAction('deleteInstructor', instructor)}>
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

  const renderEnrollmentManagement = () => (
    <>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2>Enrollment Management</h2>
            <Button variant="success" onClick={() => handleAction('addEnrollment')}>
              <i className="bi bi-plus"></i> Enroll Student
            </Button>
          </div>
        </Col>
      </Row>

      <Card>
        <Card.Header>
          <h5 className="mb-0">All Enrollments</h5>
        </Card.Header>
        <Card.Body>
          <Table responsive>
            <thead>
              <tr>
                <th>Student</th>
                <th>Course</th>
                <th>Enrollment Date</th>
                <th>Progress</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map(enrollment => (
                <tr key={enrollment.id}>
                  <td>
                    <div>
                      <strong>{enrollment.student_name || enrollment.user_name}</strong>
                      <br />
                      <small className="text-muted">{enrollment.student_email || enrollment.user_email}</small>
                    </div>
                  </td>
                  <td>
                    <div>
                      <strong>{enrollment.course_title}</strong>
                      <br />
                      <small className="text-muted">{enrollment.course_category}</small>
                    </div>
                  </td>
                  <td>{new Date(enrollment.enrollment_date || enrollment.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="progress me-2" style={{ width: '60px', height: '6px' }}>
                        <div 
                          className="progress-bar" 
                          style={{ width: `${enrollment.progress_percentage || 0}%` }}
                        ></div>
                      </div>
                      {enrollment.progress_percentage || 0}%
                    </div>
                  </td>
                  <td>
                    <Badge bg={enrollment.status === 'completed' ? 'success' : 
                              enrollment.status === 'in_progress' ? 'primary' : 'secondary'}>
                      {enrollment.status === 'in_progress' ? 'In Progress' : 
                       enrollment.status === 'completed' ? 'Completed' : 'Enrolled'}
                    </Badge>
                  </td>
                  <td>
                    <Button size="sm" variant="outline-primary" className="me-2" onClick={() => handleAction('viewEnrollment', enrollment)}>
                      <i className="bi bi-eye"></i>
                    </Button>
                    <Button size="sm" variant="outline-info" className="me-2" onClick={() => handleAction('viewProgress', enrollment)}>
                      <i className="bi bi-graph-up"></i>
                    </Button>
                    <Button size="sm" variant="outline-danger" onClick={() => handleAction('unenrollStudent', enrollment)}>
                      <i className="bi bi-x-circle"></i>
                    </Button>
                  </td>
                </tr>
              ))}
              {enrollments.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">
                    No enrollments found. Students can enroll in courses to see data here.
                  </td>
                </tr>
              )}
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
                  {courses.slice(0, 5).map(course => (
                    <tr key={course.id}>
                      <td>{course.title}</td>
                      <td>{course.enrolled_count || course.enrollment_count}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="progress me-2" style={{ width: '60px', height: '6px' }}>
                            <div className="progress-bar" style={{ width: `${Math.min(100, (course.enrolled_count / 1000) * 100)}%` }}></div>
                          </div>
                          {Math.round((course.enrolled_count / 1000) * 100)}%
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
      case 'enrollments': return renderEnrollmentManagement();
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
              </Nav.Link>
              
              <Nav.Link 
                className={`text-white mb-2 ${activeSection === 'instructors' ? 'bg-primary rounded' : ''}`}
                onClick={() => setActiveSection('instructors')}
                style={{ cursor: 'pointer' }}
              >
                <i className="bi bi-person-check me-2"></i>Instructors
              </Nav.Link>
              
              <Nav.Link 
                className={`text-white mb-2 ${activeSection === 'enrollments' ? 'bg-primary rounded' : ''}`}
                onClick={() => setActiveSection('enrollments')}
                style={{ cursor: 'pointer' }}
              >
                <i className="bi bi-bookmark-check me-2"></i>Enrollments
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
      <Modal show={showModal} onHide={() => setShowModal(false)} size={modalType.includes('Course') || modalType.includes('Lesson') ? 'lg' : 'md'}>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalType === 'addCourse' && 'Add New Course'}
            {modalType === 'editCourse' && 'Edit Course'}
            {modalType === 'deleteCourse' && 'Delete Course'}
            {modalType === 'addLesson' && 'Add New Lesson'}
            {modalType === 'editLesson' && 'Edit Lesson'}
            {modalType === 'deleteLesson' && 'Delete Lesson'}
            {modalType === 'addEnrollment' && 'Enroll Student in Course'}
            {modalType === 'viewEnrollment' && 'View Enrollment Details'}
            {modalType === 'viewProgress' && 'Student Progress'}
            {modalType === 'unenrollStudent' && 'Unenroll Student'}
            {modalType === 'approveStudent' && 'Approve Student'}
            {modalType === 'rejectStudent' && 'Reject Student'}
            {modalType === 'approveInstructor' && 'Approve Instructor'}
            {modalType === 'rejectInstructor' && 'Reject Instructor'}
            {modalType === 'manageCategories' && 'Manage Categories'}
            {!modalType.includes('add') && !modalType.includes('edit') && !modalType.includes('manage') && !modalType.includes('view') && 'Confirm Action'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalType === 'addCourse' && (
            <CourseForm 
              onSubmit={handleCourseSubmit}
              isEdit={false}
            />
          )}
          
          {modalType === 'editCourse' && (
            <CourseForm 
              course={selectedItem}
              onSubmit={handleCourseSubmit}
              isEdit={true}
            />
          )}
          
          {modalType === 'addLesson' && (
            <div>
              <p>Add Lesson form will be implemented here.</p>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Lesson Title</Form.Label>
                  <Form.Control type="text" placeholder="Enter lesson title" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Course</Form.Label>
                  <Form.Select>
                    <option>Select a course</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>{course.title}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Duration</Form.Label>
                  <Form.Control type="text" placeholder="e.g., 15 minutes" />
                </Form.Group>
                <Button variant="primary" onClick={() => {
                  showAlert('Lesson created successfully!', 'success');
                  setShowModal(false);
                }}>
                  Create Lesson
                </Button>
              </Form>
            </div>
          )}
          
          {modalType === 'editLesson' && (
            <div>
              <p>Edit Lesson form will be implemented here.</p>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Lesson Title</Form.Label>
                  <Form.Control type="text" defaultValue={selectedItem?.title} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Duration</Form.Label>
                  <Form.Control type="text" defaultValue={selectedItem?.duration} />
                </Form.Group>
                <Button variant="primary" onClick={() => {
                  showAlert('Lesson updated successfully!', 'success');
                  setShowModal(false);
                }}>
                  Update Lesson
                </Button>
              </Form>
            </div>
          )}
          
          {modalType === 'addInstructor' && (
            <div>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="Enter instructor full name"
                    value={instructorForm.name}
                    onChange={(e) => setInstructorForm(prev => ({...prev, name: e.target.value}))}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control 
                    type="email" 
                    placeholder="Enter instructor email"
                    value={instructorForm.email}
                    onChange={(e) => setInstructorForm(prev => ({...prev, email: e.target.value}))}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control 
                    type="password" 
                    placeholder="Enter initial password"
                    value={instructorForm.password}
                    onChange={(e) => setInstructorForm(prev => ({...prev, password: e.target.value}))}
                  />
                </Form.Group>
                <Button variant="primary" onClick={() => handleInstructorSubmit()}>
                  Add Instructor
                </Button>
              </Form>
            </div>
          )}
          
          {modalType === 'editInstructor' && (
            <div>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control 
                    type="text"
                    value={instructorForm.name}
                    onChange={(e) => setInstructorForm(prev => ({...prev, name: e.target.value}))}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control 
                    type="email"
                    value={instructorForm.email}
                    onChange={(e) => setInstructorForm(prev => ({...prev, email: e.target.value}))}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>New Password (leave blank to keep current)</Form.Label>
                  <Form.Control 
                    type="password"
                    placeholder="Enter new password (optional)"
                    value={instructorForm.password}
                    onChange={(e) => setInstructorForm(prev => ({...prev, password: e.target.value}))}
                  />
                </Form.Group>
                <Button variant="primary" onClick={() => handleInstructorSubmit()}>
                  Update Instructor
                </Button>
              </Form>
            </div>
          )}
          
          {modalType === 'addEnrollment' && (
            <EnrollmentForm
              students={students}
              courses={courses}
              onSubmit={async (enrollmentData) => {
                try {
                  // Refresh enrollments data after successful enrollment
                  const updatedEnrollments = await getAllEnrollments();
                  setEnrollments(updatedEnrollments || []);
                  showAlert(`${enrollmentData.student.name} enrolled in ${enrollmentData.course.title} successfully!`, 'success');
                  setShowModal(false);
                } catch (error) {
                  showAlert(`Error: ${error.message}`, 'danger');
                }
              }}
              onCancel={() => setShowModal(false)}
              loading={loading}
            />
          )}
          
          {modalType === 'viewEnrollment' && (
            <div>
              <Row>
                <Col md={6}>
                  <h6>Student Details</h6>
                  <p><strong>Name:</strong> {selectedItem?.student_name || selectedItem?.user_name}</p>
                  <p><strong>Email:</strong> {selectedItem?.student_email || selectedItem?.user_email}</p>
                </Col>
                <Col md={6}>
                  <h6>Course Details</h6>
                  <p><strong>Course:</strong> {selectedItem?.course_title}</p>
                  <p><strong>Category:</strong> {selectedItem?.course_category}</p>
                </Col>
              </Row>
              <Row className="mt-3">
                <Col md={6}>
                  <h6>Enrollment Info</h6>
                  <p><strong>Enrolled:</strong> {selectedItem?.enrollment_date ? new Date(selectedItem.enrollment_date).toLocaleDateString() : 'N/A'}</p>
                  <p><strong>Status:</strong> 
                    <Badge bg={selectedItem?.status === 'completed' ? 'success' : 'primary'} className="ms-2">
                      {selectedItem?.status === 'in_progress' ? 'In Progress' : selectedItem?.status}
                    </Badge>
                  </p>
                </Col>
                <Col md={6}>
                  <h6>Progress</h6>
                  <div className="mb-2">
                    <div className="progress">
                      <div 
                        className="progress-bar" 
                        style={{ width: `${selectedItem?.progress_percentage || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <p>{selectedItem?.progress_percentage || 0}% Complete</p>
                </Col>
              </Row>
            </div>
          )}
          
          {modalType === 'viewProgress' && (
            <div>
              <h6>Learning Progress for {selectedItem?.student_name || selectedItem?.user_name}</h6>
              <p className="text-muted">Course: {selectedItem?.course_title}</p>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Overall Progress</span>
                  <span>{selectedItem?.progress_percentage || 0}%</span>
                </div>
                <div className="progress mb-3">
                  <div 
                    className="progress-bar" 
                    style={{ width: `${selectedItem?.progress_percentage || 0}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <h6>Recent Activity</h6>
                <div className="bg-light p-3 rounded">
                  <p className="mb-1">Last accessed: {selectedItem?.last_accessed ? new Date(selectedItem.last_accessed).toLocaleDateString() : 'Never'}</p>
                  <p className="mb-0">Time spent: {selectedItem?.time_spent || '0'} minutes</p>
                </div>
              </div>
            </div>
          )}
          
          {modalType === 'unenrollStudent' && (
            <div>
              <p>Are you sure you want to unenroll <strong>{selectedItem?.student_name || selectedItem?.user_name}</strong> from <strong>{selectedItem?.course_title}</strong>?</p>
              <div className="alert alert-warning">
                <i className="bi bi-exclamation-triangle me-2"></i>
                This will remove their access to all course materials and their progress will be lost.
              </div>
              <div className="d-flex justify-content-end mt-3">
                <Button variant="secondary" className="me-2" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={() => {
                  showAlert('Student unenrolled successfully', 'success');
                  setShowModal(false);
                }}>
                  Unenroll Student
                </Button>
              </div>
            </div>
          )}
          
          {modalType === 'deleteCourse' && (
            <div>
              <p>Are you sure you want to delete the course <strong>&ldquo;{selectedItem?.title}&rdquo;</strong>? This action cannot be undone.</p>
              <div className="d-flex justify-content-end mt-3">
                <Button variant="secondary" className="me-2" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={handleDeleteCourse}>
                  Delete Course
                </Button>
              </div>
            </div>
          )}
          
          {modalType.includes('delete') && modalType !== 'deleteCourse' && (
            <p>Are you sure you want to delete &ldquo;{selectedItem?.title || selectedItem?.name}&rdquo;? This action cannot be undone.</p>
          )}
          
          {modalType.includes('approve') && (
            <p>Are you sure you want to approve <strong>{selectedItem?.name}</strong>?</p>
          )}
          
          {modalType.includes('reject') && (
            <p>Are you sure you want to reject <strong>{selectedItem?.name}</strong>?</p>
          )}
          
          {modalType === 'manageCategories' && (
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
          )}
          
          {!modalType.includes('add') && !modalType.includes('edit') && !modalType.includes('delete') && !modalType.includes('approve') && !modalType.includes('reject') && !modalType.includes('manage') && (
            <p>This feature will open a detailed form for {modalType}.</p>
          )}
        </Modal.Body>
        {/* Only show footer for non-form modals */}
        {!modalType.includes('Course') && 
         !modalType.includes('Lesson') && 
         !modalType.includes('Instructor') &&
         modalType !== 'manageCategories' && 
         modalType !== 'addEnrollment' &&
         modalType !== 'viewEnrollment' &&
         modalType !== 'viewProgress' &&
         modalType !== 'unenrollStudent' && (
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
        )}
      </Modal>
    </Container>
  );
}