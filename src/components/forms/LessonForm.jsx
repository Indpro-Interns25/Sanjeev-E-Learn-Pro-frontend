import { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import PropTypes from 'prop-types';

export default function LessonForm({ lesson, onSubmit, isEdit = false }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    content: '',
    videoUrl: '',
    order: 1,
    resources: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resourceUrl, setResourceUrl] = useState('');
  const [resourceName, setResourceName] = useState('');

  useEffect(() => {
    if (lesson && isEdit) {
      setFormData(lesson);
    }
  }, [lesson, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const finalValue = name === 'order' ? parseInt(value) || value : value;

    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));
  };

  const handleAddResource = (e) => {
    e.preventDefault();
    if (resourceName && resourceUrl) {
      setFormData(prev => ({
        ...prev,
        resources: [...prev.resources, { name: resourceName, url: resourceUrl }]
      }));
      setResourceName('');
      setResourceUrl('');
    }
  };

  const handleRemoveResource = (index) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index)
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
        <Form.Label>Lesson Title</Form.Label>
        <Form.Control
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter lesson title"
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
          rows={2}
          placeholder="Enter lesson description"
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
          placeholder="e.g., 45 minutes"
          required
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="content">
        <Form.Label>Lesson Content</Form.Label>
        <Form.Control
          as="textarea"
          name="content"
          value={formData.content}
          onChange={handleChange}
          rows={6}
          placeholder="Enter lesson content (supports markdown)"
          required
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="videoUrl">
        <Form.Label>Video URL</Form.Label>
        <Form.Control
          type="url"
          name="videoUrl"
          value={formData.videoUrl}
          onChange={handleChange}
          placeholder="Enter video URL"
          required
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="order">
        <Form.Label>Lesson Order</Form.Label>
        <Form.Control
          type="number"
          name="order"
          value={formData.order}
          onChange={handleChange}
          min="1"
          required
        />
      </Form.Group>

      <Form.Group className="mb-4">
        <Form.Label>Resources</Form.Label>
        <div className="mb-2">
          <div className="d-flex gap-2 mb-2">
            <Form.Control
              type="text"
              placeholder="Resource name"
              value={resourceName}
              onChange={(e) => setResourceName(e.target.value)}
            />
            <Form.Control
              type="url"
              placeholder="Resource URL"
              value={resourceUrl}
              onChange={(e) => setResourceUrl(e.target.value)}
            />
            <Button 
              variant="outline-primary" 
              onClick={handleAddResource}
              disabled={!resourceName || !resourceUrl}
            >
              Add
            </Button>
          </div>
          
          {formData.resources.length > 0 && (
            <div className="list-group">
              {formData.resources.map((resource, index) => (
                <div
                  key={index}
                  className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                >
                  <div>
                    <div>{resource.name}</div>
                    <small className="text-muted">{resource.url}</small>
                  </div>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleRemoveResource(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
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
          isEdit ? 'Update Lesson' : 'Create Lesson'
        )}
      </Button>
    </Form>
  );
}

LessonForm.propTypes = {
  lesson: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    duration: PropTypes.string,
    content: PropTypes.string,
    videoUrl: PropTypes.string,
    order: PropTypes.number,
    resources: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        url: PropTypes.string
      })
    )
  }),
  onSubmit: PropTypes.func.isRequired,
  isEdit: PropTypes.bool
};
