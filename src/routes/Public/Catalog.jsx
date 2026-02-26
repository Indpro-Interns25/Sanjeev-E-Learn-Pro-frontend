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
  // Filter courses based on search and filters, then paginate
  useEffect(() => {
    const filterCourses = async () => {
      let filteredCourses = allCourses.filter(course => !enrolledCourseIds.includes(course.id));

      // Search
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const searchWords = searchLower.split(' ').filter(word => word.length > 0);
        filteredCourses = filteredCourses.filter(course =>
          searchWords.some(word =>
            course.title?.toLowerCase().includes(word) ||
            course.description?.toLowerCase().includes(word) ||
            course.category?.toLowerCase().includes(word) ||
            course.instructor_name?.toLowerCase().includes(word)
          ) ||
          course.title?.toLowerCase().includes(searchLower) ||
          course.description?.toLowerCase().includes(searchLower) ||
          course.category?.toLowerCase().includes(searchLower) ||
          course.instructor_name?.toLowerCase().includes(searchLower)
        );
      }

      // Category filter
      if (selectedCategory !== 'All') {
        filteredCourses = filteredCourses.filter(course => course.category === selectedCategory);
      }

      // Level filter
      if (selectedLevel !== 'All') {
        filteredCourses = filteredCourses.filter(course =>
          (course.difficulty_level || course.level || 'beginner').toLowerCase() === selectedLevel.toLowerCase()
        );
      }

      setCourses(filteredCourses);
      setCurrentPage(1); // Reset to first page on filter/search change
    };

    // Debounce search/filter
    const timeoutId = setTimeout(filterCourses, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCategory, selectedLevel, allCourses, enrolledCourseIds]);
            !enrolledCourseIds.includes(course.id)
          );
          console.warn('📋 Total courses:', formattedCourses.length);
          console.warn('📋 User enrolled courses:', enrolledCourseIds);
          console.warn('📋 Available courses (not enrolled):', availableCourses.length);
          
          setCourses(availableCourses);
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
        // No search filters, show all courses except enrolled ones
        const availableCourses = allCourses.filter(course => 
          !enrolledCourseIds.includes(course.id)
        );
        setCourses(availableCourses);
        return;
      }

      try {
        setSearching(true);
        
        // If we have search term, filter locally first for immediate results
        if (searchTerm) {
          let filteredCourses = allCourses.filter(course => {
            const searchLower = searchTerm.toLowerCase();
            const searchWords = searchLower.split(' ').filter(word => word.length > 0);
            
            // Check if any search word matches in title, description, category, or instructor
            return searchWords.some(word => 
              course.title?.toLowerCase().includes(word) ||
              course.description?.toLowerCase().includes(word) ||
              course.category?.toLowerCase().includes(word) ||
              course.instructor_name?.toLowerCase().includes(word)
            ) || 
            // Also check for exact phrase match
            course.title?.toLowerCase().includes(searchLower) ||
            course.description?.toLowerCase().includes(searchLower) ||
            course.category?.toLowerCase().includes(searchLower) ||
            course.instructor_name?.toLowerCase().includes(searchLower);
          });
          
          // Apply category filter
          if (selectedCategory !== 'All') {
            filteredCourses = filteredCourses.filter(course => 
              course.category === selectedCategory
            );
          }
          
          // Apply level filter
          if (selectedLevel !== 'All') {
            filteredCourses = filteredCourses.filter(course => 
              (course.difficulty_level || course.level || 'beginner').toLowerCase() === selectedLevel.toLowerCase()
            );
          }
          
          // Filter out enrolled courses
          const availableCourses = filteredCourses.filter(course => 
            !enrolledCourseIds.includes(course.id)
          );
          
          console.warn('🔍 Local search results:', filteredCourses.length);
          console.warn('🔍 Available courses (not enrolled):', availableCourses.length);
          console.warn('🔍 Search term:', searchTerm);
          
          setCourses(availableCourses);
          setSearching(false);
          return;
        }
        
        // If no search term, use category/level filters only
        const filters = {};
        
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
        
        // Filter out enrolled courses from search results
        const availableCourses = formattedCourses.filter(course => 
          !enrolledCourseIds.includes(course.id)
        );
        console.warn('🔍 API filter results:', formattedCourses.length);
        console.warn('🔍 Available courses (not enrolled):', availableCourses.length);
        
        setCourses(availableCourses);
        
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
