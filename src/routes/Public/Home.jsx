
import { Container, Row, Col, Button, Form, InputGroup, Dropdown, Carousel, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { searchCourses, getCourseCategories, getFeaturedCourses, formatCoursesData } from '../../services/courses';

// ...existing code...

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

export default function Home() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Fetch categories and featured courses on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [categoriesResponse, featuredResponse] = await Promise.allSettled([
          getCourseCategories(),
          getFeaturedCourses(3)
        ]);

        if (categoriesResponse.status === 'fulfilled') {
          const categoryNames = categoriesResponse.value.map(cat => cat.name);
          setCategories(categoryNames);
        } else {
          console.warn('Failed to fetch categories:', categoriesResponse.reason);
          // Fallback categories based on API response examples
          setCategories(['Web Development', 'Data Science', 'Mobile Development', 'Database Management']);
        }

        if (featuredResponse.status === 'fulfilled') {
          setFeaturedCourses(formatCoursesData(featuredResponse.value));
        }

      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleSearch = async () => {
    try {
      setSearching(true);
      setSearched(true);
      
      const filters = {};
      if (category) {
        filters.category = category;
      }
      
      const searchResults = await searchCourses(search, filters);
      setResults(formatCoursesData(searchResults));
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleCategorySelect = async (selectedCategory) => {
    try {
      setCategory(selectedCategory);
      setSearching(true);
      setSearched(true);
      
      const categoryResults = await searchCourses('', { category: selectedCategory });
      setResults(formatCoursesData(categoryResults));
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
          background: 'url(https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1350&q=80) center/cover no-repeat',
          color: '#fff',
        }}
      >
        <div className="bg-dark bg-opacity-50 w-100 h-100 position-absolute top-0 start-0"></div>
        <Container className="position-relative z-1 py-5">
          <Row className="justify-content-center">
            <Col lg={8}>
              <h1 className="display-4 fw-bold mb-3">Unlock Your Potential with EduLearn Pro</h1>
              <p className="lead mb-4">Access expert-led courses, gain practical skills, and advance your career with our comprehensive learning platform.</p>
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
              <div className="d-flex gap-3 mb-4 justify-content-center" style={{maxWidth: 320, margin: '0 auto'}}>
                <Button
                  as={Link}
                  to="/register"
                  variant="primary"
                  size="sm"
                  className="px-2 fw-semibold"
                  style={{ fontSize: 16, minWidth: 110 }}
                >
                  Start Learning
                </Button>
                <Button
                  as={Link}
                  to="/catalog"
                  variant="outline-light"
                  size="sm"
                  className="px-2 fw-semibold"
                  style={{ fontSize: 16, minWidth: 110 }}
                >
                  Explore Courses
                </Button>
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
              <h2>Ready to Start Learning?</h2>
              <p className="lead text-muted">
                Join thousands of learners already learning on EduLearn Pro.
              </p>
              <Button
                as={Link}
                to="/catalog"
                variant="primary"
                size="lg"
                className="mt-3"
              >
                Explore Courses
              </Button>
            </Col>
            <Col md={6}>
              <Carousel className="w-100" style={{ maxWidth: 600 }}>
                {featuredCourses.length > 0 ? (
                  featuredCourses.map(course => (
                    <Carousel.Item key={course.id}>
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
            <h2 className="mb-4">Search Results</h2>
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
