import { useState } from 'react';
import { Container, Row, Col, Form, Card } from 'react-bootstrap';
import { mockCourses } from '../../data/mockCourses';
import CourseCard from '../../components/CourseCard';

const CATEGORIES = ['All', 'Web Development', 'JavaScript', 'Data Science'];
const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export default function Catalog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');

  const filteredCourses = mockCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'All' || course.level === selectedLevel.toLowerCase();

    return matchesSearch && matchesCategory && matchesLevel;
  });

  return (
    <Container className="py-5">
      <h1 className="mb-4">Course Catalog</h1>

      <Row className="mb-4">
        <Col md={4}>
          <Form.Control
            type="search"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
        <Col md={4}>
          <Form.Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {CATEGORIES.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </Form.Select>
        </Col>
        <Col md={4}>
          <Form.Select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
          >
            {LEVELS.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      {filteredCourses.length > 0 ? (
        <Row xs={1} md={2} lg={3} className="g-4">
          {filteredCourses.map(course => (
            <Col key={course.id}>
              <CourseCard course={course} />
            </Col>
          ))}
        </Row>
      ) : (
        <Card body className="text-center py-5">
          <div className="text-muted">
            <i className="bi bi-search display-4"></i>
            <h3 className="mt-3">No match found</h3>
            <p>Try a different search or category.</p>
          </div>
        </Card>
      )}
    </Container>
  );
}
