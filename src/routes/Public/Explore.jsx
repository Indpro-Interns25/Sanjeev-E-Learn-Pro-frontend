import { Container, Row, Col, Button, Form, InputGroup, Dropdown, Carousel, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { searchCourses, getCourseCategories, getFeaturedCourses, formatCoursesData, getAllCourses } from '../../services/courses';
import coursesHeroBg from '../../assets/Futuristic learning in a digital world.png';

const features = [
  {
    icon: 'bi-collection-play',
    title: 'Expert-Led Courses',
    description: 'Learn from industry professionals with years of experience.'
  },
  {
    icon: 'bi-person-workspace',
    title: 'Self-Paced Learning',
    description: 'Study at your own pace with lifetime access to course content.'
  },
  {
    icon: 'bi-patch-check',
    title: 'Certificates',
    description: 'Earn certificates upon course completion to showcase your skills.'
  },
  {
    icon: 'bi-people',
    title: 'Community',
    description: 'Join a community of learners and share your knowledge.'
  }
];

export default function Explore() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [results, setResults] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(true);

  // Fetch categories, featured courses, and ALL courses on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [categoriesResponse, featuredResponse, allCoursesResponse] = await Promise.allSettled([
          getCourseCategories(),
          getFeaturedCourses(3),
          getAllCourses({ limit: 1000 }) // Fetch up to 1000 courses to show all
        ]);

        if (categoriesResponse.status === 'fulfilled') {
          const categoryNames = categoriesResponse.value.map(cat => cat.name);
          setCategories(categoryNames);
        } else {
          console.warn('Failed to fetch categories:', categoriesResponse.reason);
          setCategories(['Web Development', 'Data Science', 'Mobile Development', 'Database Management']);
        }

        if (featuredResponse.status === 'fulfilled') {
          setFeaturedCourses(formatCoursesData(featuredResponse.value));
        }

        // Load ALL courses by default
        if (allCoursesResponse.status === 'fulfilled') {
          const formattedAllCourses = formatCoursesData(allCoursesResponse.value);
          setAllCourses(formattedAllCourses);
          setResults(formattedAllCourses); // Display all courses by default
          setSearched(true); // Mark as "searched" so they display
        } else {
          console.warn('Failed to fetch all courses:', allCoursesResponse.reason);
        }

      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setLoadingCategories(false);
        setLoadingCourses(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleSearch = async () => {
    try {
      setSearching(true);
      setSearched(true);
      
      // Filter from allCourses based on search term
      let filteredCourses = allCourses;
      
      if (search.trim()) {
        const searchLower = search.toLowerCase();
        filteredCourses = allCourses.filter(course => 
          course.title.toLowerCase().includes(searchLower) ||
          course.description.toLowerCase().includes(searchLower)
        );
      }
      
      // Apply category filter if selected
      if (category) {
        filteredCourses = filteredCourses.filter(course => 
          course.category === category
        );
      }
      
      setResults(filteredCourses);
      setCategory(''); // Clear category after search
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleCategorySelect = async (selectedCategory) => {
    try {
      setSearching(true);
      setSearched(true);
      setSearch(''); // Clear search
      setCategory(selectedCategory);
      
      // Filter from allCourses by category
      const categoryResults = allCourses.filter(course => 
        course.category === selectedCategory
      );
      
      setResults(categoryResults);
    } catch (error) {
      console.error('Category search failed:', error);
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  return (
    <main>
      <section
        className="hero-section d-flex flex-column justify-content-center align-items-center text-center position-relative"
        style={{
          minHeight: '60vh',
          background: `url(${coursesHeroBg}) center/cover no-repeat`,
          color: '#fff',
        }}
      >
        <div className="bg-dark bg-opacity-50 w-100 h-100 position-absolute top-0 start-0"></div>
        <Container className="position-relative z-1 py-5">
          <Row className="justify-content-center">
            <Col lg={8}>
              <h1 className="display-4 fw-bold mb-3">Discover Amazing Courses</h1>
              <p className="lead mb-4">Find and explore thousands of expert-led courses to advance your skills and career.</p>
              <div className="d-flex flex-column align-items-center justify-content-center w-100" style={{maxWidth: 400, margin: '0 auto'}}>
                <span className="fw-semibold text-center mb-2" style={{fontWeight: 700, fontSize: 22, letterSpacing: 0.2, lineHeight: 1.2, width: '100%'}}>
                  Search courses by title or keyword
                </span>
                <InputGroup className="mb-3 mx-auto" style={{ width: 320, maxWidth: '100%' }}>
                  <Form.Control
                    type="text"
                    placeholder="Search courses by title or keyword..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                  <Dropdown onSelect={handleCategorySelect}>
                    <Dropdown.Toggle variant="outline-light" id="category-dropdown" disabled={loadingCategories}>
                      {category || 'Category'}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      {categories.map(cat => (
                        <Dropdown.Item key={cat} eventKey={cat}>{cat}</Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                  <span style={{ width: 12, display: 'inline-block' }}></span>
                  <Button variant="primary" onClick={handleSearch} disabled={searching}>
                    {searching ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-1" />
                        Searching...
                      </>
                    ) : (
                      'Search'
                    )}
                  </Button>
                </InputGroup>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="py-5">
        <Container>
          <h2 className="text-center mb-5">Why Choose EduLearn Pro?</h2>
          <Row>
            {features.map((feature, index) => (
              <Col md={6} lg={3} key={index} className="mb-4">
                <div className="text-center">
                  <i className={`bi ${feature.icon} display-4 text-primary mb-3`}></i>
                  <h3 className="h5 mb-3">{feature.title}</h3>
                  <p className="text-muted">{feature.description}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      <section className="py-5 bg-light">
        <Container>
          <Row className="align-items-center justify-content-center">
            <Col md={6} className="mb-4 mb-md-0">
              <h2>Featured Courses</h2>
              <p className="lead text-muted">
                Check out our most popular and highly-rated courses selected just for you.
              </p>
              <Button
                as={Link}
                to="/catalog"
                variant="primary"
                size="lg"
                className="mt-3"
              >
                View All Courses
              </Button>
            </Col>
            <Col md={6}>
              <Carousel className="w-100" style={{ maxWidth: 600 }}>
                {featuredCourses.length > 0 ? (
                  featuredCourses.map(course => (
                    <Carousel.Item key={course.id} onClick={() => navigate(`/courses/${course.id}`)} style={{ cursor: 'pointer' }}>
                      <img 
                        className="d-block w-100 rounded" 
                        src={course.thumbnail} 
                        alt={course.title} 
                        style={{ height: '400px', objectFit: 'cover' }} 
                      />
                      <Carousel.Caption>
                        <h5>{course.title}</h5>
                        <p>{course.description.length > 100 ? course.description.substring(0, 100) + '...' : course.description}</p>
                        <p className="mb-1">
                          <span className="badge bg-primary me-2">{course.level}</span>
                          <span className="badge bg-success me-2">{course.formattedPrice}</span>
                          <span className="badge bg-warning">⭐ {course.formattedRating}</span>
                        </p>
                      </Carousel.Caption>
                    </Carousel.Item>
                  ))
                ) : (
                  // Fallback content while loading or if no featured courses
                  <>
                    <Carousel.Item>
                      <img className="d-block w-100 rounded" src="https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=800&q=80" alt="Learning" style={{ height: '400px', objectFit: 'cover' }} />
                      <Carousel.Caption>
                        <h5>Expert-Led Learning</h5>
                        <p>Master new skills with hands-on projects and real-world applications.</p>
                      </Carousel.Caption>
                    </Carousel.Item>
                    <Carousel.Item>
                      <img className="d-block w-100 rounded" src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80" alt="Collaboration" style={{ height: '400px', objectFit: 'cover' }} />
                      <Carousel.Caption>
                        <h5>Collaborative Learning</h5>
                        <p>Work together and share knowledge in a modern environment.</p>
                      </Carousel.Caption>
                    </Carousel.Item>
                    <Carousel.Item>
                      <img className="d-block w-100 rounded" src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80" alt="Technology" style={{ height: '400px', objectFit: 'cover' }} />
                      <Carousel.Caption>
                        <h5>Latest Technology</h5>
                        <p>Stay updated with the latest trends and technologies in your field.</p>
                      </Carousel.Caption>
                    </Carousel.Item>
                  </>
                )}
              </Carousel>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Search/Category Results Section */}
      {searched && (
        <section className="py-5">
          <Container>
            <h2 className="mb-4">
              {search ? 'Search Results' : category ? `Courses in ${category}` : 'All Available Courses'}
              {results.length > 0 && <span className="text-muted ms-2">({results.length})</span>}
            </h2>
            {results.length > 0 ? (
              <Row xs={1} md={2} lg={3} className="g-4">
                {results.map(course => (
                  <Col key={course.id}>
                    <div className="card h-100 border-0 shadow-sm rounded-4">
                      <img src={course.thumbnail} alt={course.title} className="card-img-top" style={{ height: '200px', objectFit: 'cover' }} />
                      <div className="card-body d-flex flex-column">
                        <h5 className="card-title">{course.title}</h5>
                        <p className="card-text text-muted">{course.description}</p>
                        <Button as={Link} to={`/courses/${course.id}`} variant="outline-primary" className="mt-auto">View Details</Button>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            ) : loadingCourses ? (
              <div className="text-center py-5">
                <Spinner animation="border" className="text-primary" />
                <p className="mt-3">Loading courses...</p>
              </div>
            ) : (
              <div className="text-center py-5">
                <i className="bi bi-search display-4 text-muted"></i>
                <h3 className="mt-3">No match found</h3>
                <p>Try a different search or category.</p>
              </div>
            )}
          </Container>
        </section>
      )}
    </main>
  );
}
