import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Card, Spinner, Alert, Pagination, Button, ButtonGroup } from 'react-bootstrap';
import { getAllCourses, getCourseCategories, formatCoursesData } from '../../services/courses';
import { getUserEnrollments } from '../../services/enrollment';
import { useAuth } from '../../hooks/useAuth';
import CourseCard from '../../components/CourseCard';

const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced'];
const COURSES_PER_PAGE = 8;
const VIEW_MODES = { GRID: 'grid', LIST: 'list' };

export default function Catalog() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');

  const [allCourses, setAllCourses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [viewMode, setViewMode] = useState(VIEW_MODES.GRID);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError('');

        const requests = [
          getAllCourses({ sortBy: 'rating', sortOrder: 'desc' }),
          getCourseCategories(),
          user?.id ? getUserEnrollments(user.id) : Promise.resolve([])
        ];

        const [coursesResponse, categoriesResponse, enrollmentsResponse] = await Promise.allSettled(requests);

        const enrolledIds =
          enrollmentsResponse.status === 'fulfilled'
            ? enrollmentsResponse.value
                .map((enrollment) => enrollment?.course_id)
                .filter((id) => id !== null && id !== undefined)
            : [];

        setEnrolledCourseIds(enrolledIds);

        if (coursesResponse.status === 'fulfilled') {
          const formattedCourses = formatCoursesData(coursesResponse.value || []);
          setAllCourses(formattedCourses);
          setCourses(formattedCourses.filter((course) => !enrolledIds.includes(course.id)));
        } else {
          setAllCourses([]);
          setCourses([]);
          setError(coursesResponse.reason?.message || 'Failed to fetch courses');
        }

        if (categoriesResponse.status === 'fulfilled') {
          const categoryNames = (categoriesResponse.value || []).map((cat) => cat.name);
          setCategories(['All', ...categoryNames]);
        } else {
          setCategories(['All', 'Web Development', 'Mobile Development', 'Data Science', 'Database Management']);
        }
      } catch (err) {
        setError(err.message || 'Failed to load catalog data');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [user?.id]);

  useEffect(() => {
    const applyFilters = () => {
      setSearching(true);

      let filteredCourses = allCourses.filter((course) => !enrolledCourseIds.includes(course.id));

      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        const searchWords = searchLower.split(' ').filter((word) => word.length > 0);
        filteredCourses = filteredCourses.filter((course) => {
          const haystack = [
            course.title,
            course.description,
            course.category,
            course.instructor_name
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

          return haystack.includes(searchLower) || searchWords.some((word) => haystack.includes(word));
        });
      }

      if (selectedCategory !== 'All') {
        filteredCourses = filteredCourses.filter((course) => course.category === selectedCategory);
      }

      if (selectedLevel !== 'All') {
        filteredCourses = filteredCourses.filter(
          (course) => (course.difficulty_level || course.level || 'beginner').toLowerCase() === selectedLevel.toLowerCase()
        );
      }

      setCourses(filteredCourses);
      setCurrentPage(1);
      setSearching(false);
    };

    const timeoutId = setTimeout(applyFilters, 250);
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

  // Pagination logic
  const totalPages = Math.ceil(courses.length / COURSES_PER_PAGE);
  const paginatedCourses = courses.slice((currentPage - 1) * COURSES_PER_PAGE, currentPage * COURSES_PER_PAGE);

  return (
    <Container className="py-5">
      <h1 className="mb-4">Course Catalog</h1>

      {error && (
        <Alert variant="danger" className="mb-4">
          <Alert.Heading>Error Loading Courses</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}

      <Row className="mb-4 align-items-end">
        <Col md={4} className="mb-2 mb-md-0">
          <Form.Control
            type="search"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={loading}
          />
        </Col>
        <Col md={3} className="mb-2 mb-md-0">
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
        <Col md={3} className="mb-2 mb-md-0">
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
        <Col md={2} className="text-end">
          <ButtonGroup>
            <Button
              variant={viewMode === VIEW_MODES.GRID ? 'primary' : 'outline-primary'}
              onClick={() => setViewMode(VIEW_MODES.GRID)}
              aria-label="Grid view"
            >
              <i className="bi bi-grid-3x3-gap-fill"></i>
            </Button>
            <Button
              variant={viewMode === VIEW_MODES.LIST ? 'primary' : 'outline-primary'}
              onClick={() => setViewMode(VIEW_MODES.LIST)}
              aria-label="List view"
            >
              <i className="bi bi-list-ul"></i>
            </Button>
          </ButtonGroup>
        </Col>
      </Row>

      {searching && (
        <div className="text-center mb-4">
          <Spinner animation="border" size="sm" className="me-2" />
          <span>Searching courses...</span>
        </div>
      )}

      {!loading && !error && paginatedCourses.length > 0 ? (
        viewMode === VIEW_MODES.GRID ? (
          <Row xs={1} md={2} lg={3} xl={4} className="g-4">
            {paginatedCourses.map(course => (
              <Col key={course.id}>
                <CourseCard course={course} />
              </Col>
            ))}
          </Row>
        ) : (
          <div className="course-list-view">
            {paginatedCourses.map(course => (
              <div key={course.id} className="mb-4">
                <CourseCard course={course} />
              </div>
            ))}
          </div>
        )
      ) : !loading && !error && paginatedCourses.length === 0 ? (
        <Card body className="text-center py-5">
          <div className="text-muted">
            <i className="bi bi-search display-4"></i>
            <h3 className="mt-3">No courses found</h3>
            <p>Try adjusting your search criteria or browse different categories.</p>
          </div>
        </Card>
      ) : null}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination>
            <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
            <Pagination.Prev onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} />
            {Array.from({ length: totalPages }, (_, i) => (
              <Pagination.Item
                key={i + 1}
                active={currentPage === i + 1}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} />
            <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
          </Pagination>
        </div>
      )}
    </Container>
  );
}
