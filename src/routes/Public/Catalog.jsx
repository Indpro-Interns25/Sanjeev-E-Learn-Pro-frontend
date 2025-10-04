import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Card, Spinner, Alert } from 'react-bootstrap';
import { getAllCourses, getCourseCategories, formatCoursesData } from '../../services/courses';
import { getUserEnrollments } from '../../services/enrollment';
import { useAuth } from '../../hooks/useAuth';
import CourseCard from '../../components/CourseCard';

const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export default function Catalog() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [courses, setCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]); // Store all courses before filtering
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searching, setSearching] = useState(false);

  // Listen for enrollment changes (localStorage updates)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'enrollments') {
        console.warn('🔄 Enrollment storage changed, refreshing enrolled courses...');
        // Re-fetch enrolled courses when enrollments change
        if (user?.id) {
          getUserEnrollments(user.id).then(enrollments => {
            const enrolledIds = enrollments.map(enrollment => enrollment.course_id);
            console.warn('🔄 Updated enrolled course IDs:', enrolledIds);
            setEnrolledCourseIds(enrolledIds);
          }).catch(error => {
            console.warn('❌ Failed to refresh enrollments:', error);
          });
        }
      }
    };

    // Listen for storage events (from other tabs/windows)
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for custom enrollment events (from same tab)
    const handleEnrollmentChange = () => {
      console.warn('🔄 Custom enrollment event detected, refreshing...');
      if (user?.id) {
        getUserEnrollments(user.id).then(enrollments => {
          const enrolledIds = enrollments.map(enrollment => enrollment.course_id);
          console.warn('🔄 Updated enrolled course IDs:', enrolledIds);
          setEnrolledCourseIds(enrolledIds);
        }).catch(error => {
          console.warn('❌ Failed to refresh enrollments:', error);
        });
      }
    };
    
    window.addEventListener('enrollmentChanged', handleEnrollmentChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('enrollmentChanged', handleEnrollmentChange);
    };
  }, [user?.id]);

  // Fetch enrolled courses for current user
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!user?.id) {
        console.warn('🚫 No user found for enrollment check');
        setEnrolledCourseIds([]);
        return;
      }

      try {
        console.warn('📚 Fetching enrolled courses for user:', user.id);
        const enrollments = await getUserEnrollments(user.id);
        const enrolledIds = enrollments.map(enrollment => enrollment.course_id);
        console.warn('✅ Enrolled course IDs:', enrolledIds);
        setEnrolledCourseIds(enrolledIds);
      } catch (error) {
        console.warn('❌ Failed to fetch enrollments:', error);
        setEnrolledCourseIds([]);
      }
    };

    fetchEnrolledCourses();
  }, [user?.id]);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch courses and categories simultaneously
        const [coursesResponse, categoriesResponse] = await Promise.allSettled([
          getAllCourses({ sortBy: 'rating', sortOrder: 'desc' }),
          getCourseCategories()
        ]);
        
        // Handle courses
        if (coursesResponse.status === 'fulfilled') {
          const formattedCourses = formatCoursesData(coursesResponse.value);
          setAllCourses(formattedCourses);
          
          // Show all courses regardless of enrollment status
          console.warn('📋 Total courses:', formattedCourses.length);
          console.warn('📋 Enrolled courses:', enrolledCourseIds);
          
          setCourses(formattedCourses);
        } else {
          console.error('Failed to fetch courses:', coursesResponse.reason);
        }
        
        // Handle categories
        if (categoriesResponse.status === 'fulfilled') {
          const categoryNames = categoriesResponse.value.map(cat => cat.name);
          setCategories(['All', ...categoryNames]);
        } else {
          console.warn('Failed to fetch categories, using fallback categories');
          // Fallback categories based on the API response examples
          setCategories(['All', 'Web Development', 'Mobile Development', 'Data Science', 'Database Management']);
        }
        
      } catch (err) {
        setError(err.message);
        console.error('Error fetching initial data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [enrolledCourseIds]); // Re-fetch when enrolled courses change

  // Filter courses based on search and filters
  useEffect(() => {
    const filterCourses = async () => {
      if (!searchTerm && selectedCategory === 'All' && selectedLevel === 'All') {
        // No search filters, show all courses
        setCourses(allCourses);
        return;
      }

      try {
        setSearching(true);
        
        const filters = {};
        
        if (searchTerm) {
          filters.search = searchTerm;
        }
        
        if (selectedCategory !== 'All') {
          filters.category = selectedCategory;
        }
        
        if (selectedLevel !== 'All') {
          filters.level = selectedLevel.toLowerCase();
        }
        
        // Add sorting
        filters.sortBy = 'rating';
        filters.sortOrder = 'desc';
        
        const filteredCourses = await getAllCourses(filters);
        const formattedCourses = formatCoursesData(filteredCourses);
        
        // Show all courses regardless of enrollment status
        console.warn('🔍 Search results:', formattedCourses.length);
        console.warn('🔍 Available courses (all):', formattedCourses.length);
        
        setCourses(formattedCourses);
        
      } catch (err) {
        console.error('Error filtering courses:', err);
        setError(err.message);
      } finally {
        setSearching(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(filterCourses, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCategory, selectedLevel, allCourses, enrolledCourseIds]);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" className="mb-3">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p>Loading courses...</p>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h1 className="mb-4">Course Catalog</h1>

      {error && (
        <Alert variant="danger" className="mb-4">
          <Alert.Heading>Error Loading Courses</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}

      <Row className="mb-4">
        <Col md={4}>
          <Form.Control
            type="search"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={loading}
          />
        </Col>
        <Col md={4}>
          <Form.Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            disabled={loading}
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </Form.Select>
        </Col>
        <Col md={4}>
          <Form.Select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            disabled={loading}
          >
            {LEVELS.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      {searching && (
        <div className="text-center mb-4">
          <Spinner animation="border" size="sm" className="me-2" />
          <span>Searching courses...</span>
        </div>
      )}

      {!loading && !error && courses.length > 0 ? (
        <Row xs={1} md={2} lg={3} className="g-4">
          {courses.map(course => (
            <Col key={course.id}>
              <CourseCard course={course} />
            </Col>
          ))}
        </Row>
      ) : !loading && !error && courses.length === 0 ? (
        <Card body className="text-center py-5">
          <div className="text-muted">
            <i className="bi bi-search display-4"></i>
            <h3 className="mt-3">No courses found</h3>
            <p>Try adjusting your search criteria or browse different categories.</p>
          </div>
        </Card>
      ) : null}
    </Container>
  );
}
