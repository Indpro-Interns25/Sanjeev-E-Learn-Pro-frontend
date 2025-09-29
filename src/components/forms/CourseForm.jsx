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
    thumbnail: '',
    curriculum: '',
    prerequisites: '',
    whatYouWillLearn: '',
    instructor: '',
    language: 'English',
    certificateAvailable: true,
    tags: ''
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
        level: course.level || 'beginner',
        price: course.price || '',
        duration: course.duration || '',
        thumbnail: course.thumbnail || '',
        curriculum: course.curriculum || '',
        prerequisites: course.prerequisites || '',
        whatYouWillLearn: course.whatYouWillLearn || '',
        instructor: course.instructor || '',
        language: course.language || 'English',
        certificateAvailable: course.certificateAvailable !== undefined ? course.certificateAvailable : true,
        tags: course.tags || ''
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

      <Form.Group className="mb-3" controlId="curriculum">
        <Form.Label>Course Curriculum</Form.Label>
        <Form.Control
          as="textarea"
          name="curriculum"
          value={formData.curriculum}
          onChange={handleChange}
          rows={6}
          placeholder="Enter detailed course curriculum (what topics will be covered, module breakdown, etc.)"
          required
        />
        <Form.Text className="text-muted">
          Describe the main topics, modules, and learning path for this course
        </Form.Text>
      </Form.Group>

      <Form.Group className="mb-3" controlId="whatYouWillLearn">
        <Form.Label>What You Will Learn</Form.Label>
        <Form.Control
          as="textarea"
          name="whatYouWillLearn"
          value={formData.whatYouWillLearn}
          onChange={handleChange}
          rows={4}
          placeholder="List the key skills and knowledge students will gain from this course"
          required
        />
        <Form.Text className="text-muted">
          Highlight the main learning outcomes and benefits
        </Form.Text>
      </Form.Group>

      <Form.Group className="mb-3" controlId="prerequisites">
        <Form.Label>Prerequisites</Form.Label>
        <Form.Control
          as="textarea"
          name="prerequisites"
          value={formData.prerequisites}
          onChange={handleChange}
          rows={3}
          placeholder="What should students know before taking this course?"
        />
        <Form.Text className="text-muted">
          List any required knowledge, skills, or previous courses (optional)
        </Form.Text>
      </Form.Group>

      <Form.Group className="mb-3" controlId="instructor">
        <Form.Label>Instructor Name</Form.Label>
        <Form.Control
          type="text"
          name="instructor"
          value={formData.instructor}
          onChange={handleChange}
          placeholder="Enter instructor's full name"
          required
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="language">
        <Form.Label>Course Language</Form.Label>
        <Form.Select
          name="language"
          value={formData.language}
          onChange={handleChange}
          required
        >
          <option value="English">English</option>
          <option value="Spanish">Spanish</option>
          <option value="French">French</option>
          <option value="German">German</option>
          <option value="Hindi">Hindi</option>
          <option value="Chinese">Chinese</option>
          <option value="Japanese">Japanese</option>
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3" controlId="tags">
        <Form.Label>Course Tags</Form.Label>
        <Form.Control
          type="text"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          placeholder="Enter tags separated by commas (e.g., react, javascript, frontend)"
        />
        <Form.Text className="text-muted">
          Add relevant tags to help students find this course
        </Form.Text>
      </Form.Group>

      <Form.Group className="mb-3" controlId="certificateAvailable">
        <Form.Check
          type="checkbox"
          name="certificateAvailable"
          checked={formData.certificateAvailable}
          onChange={(e) => setFormData(prev => ({ ...prev, certificateAvailable: e.target.checked }))}
          label="Certificate of completion available"
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
    thumbnail: PropTypes.string,
    curriculum: PropTypes.string,
    prerequisites: PropTypes.string,
    whatYouWillLearn: PropTypes.string,
    instructor: PropTypes.string,
    language: PropTypes.string,
    certificateAvailable: PropTypes.bool,
    tags: PropTypes.string
  }),
  onSubmit: PropTypes.func.isRequired,
  isEdit: PropTypes.bool
};
