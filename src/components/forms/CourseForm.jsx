import { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { getCourseCategories } from '../../services/courses';

const COURSE_STATUS = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' }
];

export default function CourseForm({ course, onSubmit, isEdit = false }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    thumbnail: '',
    price: '',
    duration: '',
    status: 'draft',
    enrolled_count: 0,
    rating: 0
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
        
        // Set default category if form is empty - only on first load
        setFormData(prev => {
          if (!prev.category && categoryNames.length > 0) {
            return { ...prev, category: categoryNames[0] };
          }
          return prev;
        });
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
        setFormData(prev => {
          if (!prev.category) {
            return { ...prev, category: fallbackCategories[0] };
          }
          return prev;
        });
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
        thumbnail: course.thumbnail || '',
        price: course.price || '',
        duration: course.duration || '',
        status: course.status || 'draft',
        enrolled_count: course.enrolled_count || 0,
        rating: course.rating || 0
      });
    }
  }, [course, isEdit]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let finalValue = value;

    if (type === 'number') {
      finalValue = parseFloat(value) || value;
    }

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
        <Form.Label>Course Title <span className="text-danger">*</span></Form.Label>
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
        <Form.Label>Description <span className="text-danger">*</span></Form.Label>
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
        <Form.Label>Category <span className="text-danger">*</span></Form.Label>
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

      <Form.Group className="mb-3" controlId="thumbnail">
        <Form.Label>Thumbnail URL <span className="text-danger">*</span></Form.Label>
        <Form.Control
          type="url"
          name="thumbnail"
          value={formData.thumbnail}
          onChange={handleChange}
          placeholder="Enter thumbnail image URL"
          required
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="price">
        <Form.Label>Price ($) <span className="text-danger">*</span></Form.Label>
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
        <Form.Label>Duration <span className="text-danger">*</span></Form.Label>
        <Form.Control
          type="text"
          name="duration"
          value={formData.duration}
          onChange={handleChange}
          placeholder="e.g., 6 hours, 3 weeks, etc."
          required
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="status">
        <Form.Label>Status <span className="text-danger">*</span></Form.Label>
        <Form.Select
          name="status"
          value={formData.status}
          onChange={handleChange}
          required
        >
          {COURSE_STATUS.map(status => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3" controlId="enrolled_count">
        <Form.Label>Enrolled Count</Form.Label>
        <Form.Control
          type="number"
          name="enrolled_count"
          value={formData.enrolled_count}
          onChange={handleChange}
          min="0"
          placeholder="Number of enrolled students"
        />
        <Form.Text className="text-muted">
          Number of students currently enrolled (optional, defaults to 0)
        </Form.Text>
      </Form.Group>

      <Form.Group className="mb-3" controlId="rating">
        <Form.Label>Rating</Form.Label>
        <Form.Control
          type="number"
          name="rating"
          value={formData.rating}
          onChange={handleChange}
          step="0.1"
          min="0"
          max="5"
          placeholder="Course rating (0-5)"
        />
        <Form.Text className="text-muted">
          Course rating from 0 to 5 stars (optional, defaults to 0)
        </Form.Text>
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
    thumbnail: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    duration: PropTypes.string,
    status: PropTypes.string,
    enrolled_count: PropTypes.number,
    rating: PropTypes.number
  }),
  onSubmit: PropTypes.func.isRequired,
  isEdit: PropTypes.bool
};
