import { useState, useEffect, useRef } from 'react';
import { Form, Button, Alert, Row, Col } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { getCourseCategories } from '../../services/courses';

const COURSE_STATUS = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' }
];

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
    price: 0,
    thumbnail: '',
    duration: '',
    status: 'draft'
  });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const fileInputRef = useRef(null);
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
        level: course.level || 'beginner',
        price: 0,
        thumbnail: course.thumbnail || '',
        duration: course.duration || '',
        status: course.status || 'draft'
      });
      // Set preview if editing with existing thumbnail
      if (course.thumbnail) {
        setThumbnailPreview(course.thumbnail);
      }
    }
  }, [course, isEdit]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let finalValue = value;

    if (type === 'number') {
      finalValue = parseFloat(value) || 0;
    }

    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should not exceed 5MB');
        return;
      }

      setThumbnailFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Pass both formData and thumbnailFile to parent
      await onSubmit(formData, thumbnailFile);
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

      <Row>
        <Col md={6}>
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
        </Col>

        <Col md={6}>
          <Form.Group className="mb-3" controlId="level">
            <Form.Label>Level <span className="text-danger">*</span></Form.Label>
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
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="price">
            <Form.Label>Price (₹) <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="Enter course price"
              min="0"
              step="1"
              required
            />
            <Form.Text className="text-muted">Set to 0 for free courses</Form.Text>
          </Form.Group>
        </Col>

        <Col md={6}>
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
        </Col>
      </Row>

      <Form.Group className="mb-3" controlId="thumbnail">
        <Form.Label>Course Thumbnail <span className="text-danger">*</span></Form.Label>
        <Form.Control
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          required={!isEdit && !thumbnailPreview}
        />
        <Form.Text className="text-muted">
          Upload an image (JPG, PNG, etc.) Max size: 5MB
        </Form.Text>
        
        {thumbnailPreview && (
          <div className="mt-3">
            <p className="mb-2 text-muted small">Preview:</p>
            <div 
              className="position-relative d-inline-block"
              style={{ maxWidth: '100%' }}
            >
              <img 
                src={thumbnailPreview} 
                alt="Thumbnail preview" 
                className="img-thumbnail"
                style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'cover' }}
              />
              <Button
                variant="danger"
                size="sm"
                className="position-absolute top-0 end-0 m-2"
                onClick={() => {
                  setThumbnailFile(null);
                  setThumbnailPreview(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
              >
                <i className="bi bi-trash" />
              </Button>
            </div>
          </div>
        )}
      </Form.Group>

      <Row>
        <Col md={6}>
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
        </Col>
      </Row>

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
    thumbnail: PropTypes.string,
    duration: PropTypes.string,
    status: PropTypes.string
  }),
  onSubmit: PropTypes.func.isRequired,
  isEdit: PropTypes.bool
};
