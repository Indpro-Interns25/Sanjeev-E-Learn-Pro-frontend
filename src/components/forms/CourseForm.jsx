import { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { getCourseCategories } from '../../services/courses';

const COURSE_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
];

export default function CourseForm({ course, onSubmit, isEdit = false }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    level: 'beginner',
    price: '',
    duration: '',
    thumbnail: ''
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getCourseCategories();
        const categoryNames = categoriesData.map(cat => cat.name);
        setCategories(categoryNames);
        
        // Set default category if form is empty
        if (!formData.category && categoryNames.length > 0) {
          setFormData(prev => ({ ...prev, category: categoryNames[0] }));
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback categories
        const fallbackCategories = [
          'Web Development',
          'Mobile Development',
          'Data Science',
          'Machine Learning',
          'Design',
          'Business'
        ];
        setCategories(fallbackCategories);
        if (!formData.category) {
          setFormData(prev => ({ ...prev, category: fallbackCategories[0] }));
        }
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []); // Only run on mount

  useEffect(() => {
    if (course && isEdit) {
      setFormData({
        title: course.title || '',
        description: course.description || '',
        category: course.category || '',
        level: course.level || 'beginner',
        price: course.price || '',
        duration: course.duration || '',
        thumbnail: course.thumbnail || ''
      });
    }
  }, [course, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const finalValue = name === 'price' ? parseFloat(value) || value : value;

    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Form.Group className="mb-3" controlId="title">
        <Form.Label>Course Title</Form.Label>
        <Form.Control
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter course title"
          required
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="description">
        <Form.Label>Description</Form.Label>
        <Form.Control
          as="textarea"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          placeholder="Enter course description"
          required
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="category">
        <Form.Label>Category</Form.Label>
        <Form.Select
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          disabled={loadingCategories}
        >
          {loadingCategories ? (
            <option>Loading categories...</option>
          ) : (
            categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))
          )}
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3" controlId="level">
        <Form.Label>Level</Form.Label>
        <Form.Select
          name="level"
          value={formData.level}
          onChange={handleChange}
          required
        >
          {COURSE_LEVELS.map(level => (
            <option key={level.value} value={level.value}>
              {level.label}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3" controlId="price">
        <Form.Label>Price ($)</Form.Label>
        <Form.Control
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          step="0.01"
          min="0"
          placeholder="Enter course price"
          required
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="duration">
        <Form.Label>Duration</Form.Label>
        <Form.Control
          type="text"
          name="duration"
          value={formData.duration}
          onChange={handleChange}
          placeholder="e.g., 6 weeks"
          required
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="thumbnail">
        <Form.Label>Thumbnail URL</Form.Label>
        <Form.Control
          type="url"
          name="thumbnail"
          value={formData.thumbnail}
          onChange={handleChange}
          placeholder="Enter thumbnail image URL"
          required
        />
      </Form.Group>

      <Button
        variant="primary"
        type="submit"
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            {isEdit ? 'Updating...' : 'Creating...'}
          </>
        ) : (
          isEdit ? 'Update Course' : 'Create Course'
        )}
      </Button>
    </Form>
  );
}

CourseForm.propTypes = {
  course: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    category: PropTypes.string,
    level: PropTypes.string,
    price: PropTypes.number,
    duration: PropTypes.string,
    thumbnail: PropTypes.string
  }),
  onSubmit: PropTypes.func.isRequired,
  isEdit: PropTypes.bool
};
