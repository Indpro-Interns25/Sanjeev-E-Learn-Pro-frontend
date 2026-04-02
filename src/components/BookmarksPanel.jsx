import { useState, useEffect } from 'react';
import { Card, Button, Form, Alert, Spinner, Badge, Modal, ListGroup } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { createBookmark, deleteBookmark, updateBookmark } from '../services/bookmarks';
import '../styles/bookmarks-panel.css';

export default function BookmarksPanel({
  lectureId,
  userId,
  currentTimestamp = 0,
  bookmarks = [],
  onBookmarkClick = null,
  isEnrolled = false,
  onBookmarksChange = null
}) {
  const [bookmarksList, setBookmarksList] = useState(bookmarks);
  const [loading, setLoading] = useState(false);
  const [newBookmarkTitle, setNewBookmarkTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    setBookmarksList(bookmarks);
  }, [bookmarks]);

  const handleAddBookmark = async (e) => {
    e.preventDefault();
    if (!newBookmarkTitle.trim()) {
      setError('Bookmark title cannot be empty');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const newBookmark = await createBookmark(
        lectureId,
        userId,
        currentTimestamp,
        newBookmarkTitle.trim()
      );
      const updated = [newBookmark, ...bookmarksList];
      setBookmarksList(updated);
      setNewBookmarkTitle('');
      onBookmarksChange?.(updated);
    } catch (err) {
      console.error('Error creating bookmark:', err);
      setError('Failed to create bookmark');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateBookmark = async (bookmarkId) => {
    if (!editTitle.trim()) {
      setError('Title cannot be empty');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const updated = await updateBookmark(bookmarkId, currentTimestamp, editTitle.trim());
      const newList = bookmarksList.map((b) =>
        b.id === bookmarkId ? updated : b
      );
      setBookmarksList(newList);
      setEditingId(null);
      setEditTitle('');
      onBookmarksChange?.(newList);
    } catch (err) {
      console.error('Error updating bookmark:', err);
      setError('Failed to update bookmark');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBookmark = async (bookmarkId) => {
    setSubmitting(true);
    setError(null);

    try {
      await deleteBookmark(bookmarkId);
      const newList = bookmarksList.filter((b) => b.id !== bookmarkId);
      setBookmarksList(newList);
      setShowDeleteConfirm(null);
      onBookmarksChange?.(newList);
    } catch (err) {
      console.error('Error deleting bookmark:', err);
      setError('Failed to delete bookmark');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (bookmark) => {
    setEditingId(bookmark.id);
    setEditTitle(bookmark.title);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const hours = Math.floor(mins / 60);
    
    if (hours > 0) {
      return `${hours}:${(mins % 60).toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isEnrolled) {
    return (
      <Card className="bookmarks-panel">
        <Card.Body className="text-center text-muted py-4">
          <i className="bi bi-lock-fill" style={{ fontSize: '2rem' }}></i>
          <p className="mt-2">Enroll in this course to bookmark timestamps</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="bookmarks-panel">
      <Card.Header className="bg-info text-white">
        <div className="d-flex align-items-center justify-content-between">
          <h5 className="mb-0">
            <i className="bi bi-bookmark-fill"></i> Bookmarks ({bookmarksList.length})
          </h5>
          <Badge bg="light" text="dark">
            {bookmarksList.length} saved
          </Badge>
        </div>
      </Card.Header>

      <Card.Body className="bookmarks-body">
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-3">
            {error}
          </Alert>
        )}

        {/* Bookmark Input Form */}
        <Form onSubmit={handleAddBookmark} className="mb-4">
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small">Bookmark This Moment</Form.Label>
            <div className="input-group input-group-sm">
              <Form.Control
                placeholder="Bookmark title (e.g., Important concept)"
                value={newBookmarkTitle}
                onChange={(e) => setNewBookmarkTitle(e.target.value)}
                disabled={submitting}
                maxLength={100}
              />
              <span className="input-group-text small text-muted">
                {formatTime(currentTimestamp)}
              </span>
            </div>
            <small className="text-muted d-block mt-1">
              {newBookmarkTitle.length} / 100 characters
            </small>
          </Form.Group>
          <Button
            variant="info"
            size="sm"
            type="submit"
            disabled={submitting || !newBookmarkTitle.trim()}
            className="w-100"
          >
            {submitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Saving...
              </>
            ) : (
              <>
                <i className="bi bi-bookmark-plus"></i> Add Bookmark
              </>
            )}
          </Button>
        </Form>

        {/* Bookmarks List */}
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" size="sm" className="me-2" />
            Loading bookmarks...
          </div>
        ) : bookmarksList.length === 0 ? (
          <div className="text-center text-muted py-4">
            <i className="bi bi-bookmark" style={{ fontSize: '2rem' }}></i>
            <p className="mt-2">No bookmarks yet. Create your first bookmark!</p>
          </div>
        ) : (
          <ListGroup variant="flush">
            {bookmarksList.map((bookmark) => (
              <div key={bookmark.id} className="bookmark-item p-3 border-bottom">
                {editingId === bookmark.id ? (
                  // Edit Mode
                  <>
                    <Form.Control
                      placeholder="Bookmark title"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      disabled={submitting}
                      maxLength={100}
                      className="mb-2 input-sm"
                    />
                    <div className="d-flex gap-2">
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleUpdateBookmark(bookmark.id)}
                        disabled={submitting}
                      >
                        <i className="bi bi-check-circle"></i> Save
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={cancelEdit}
                        disabled={submitting}
                      >
                        <i className="bi bi-x-circle"></i> Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  // View Mode
                  <>
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <div className="fw-semibold text-break">{bookmark.title}</div>
                        <small className="text-muted">
                          <i className="bi bi-clock"></i> {formatTime(bookmark.timestamp)}
                          {bookmark.created_at && (
                            <> • {formatDate(bookmark.created_at)}</>
                          )}
                        </small>
                      </div>
                      <div className="bookmark-actions d-flex gap-2 ms-2">
                        {onBookmarkClick && (
                          <Button
                            variant="link"
                            size="sm"
                            className="text-primary p-0"
                            onClick={() => onBookmarkClick(bookmark.timestamp)}
                            title="Jump to bookmark"
                          >
                            <i className="bi bi-skip-forward-fill"></i>
                          </Button>
                        )}
                        <Button
                          variant="link"
                          size="sm"
                          className="text-info p-0"
                          onClick={() => startEdit(bookmark)}
                          title="Edit"
                        >
                          <i className="bi bi-pencil-square"></i>
                        </Button>
                        <Button
                          variant="link"
                          size="sm"
                          className="text-danger p-0"
                          onClick={() => setShowDeleteConfirm(bookmark.id)}
                          title="Delete"
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm === bookmark.id && (
                  <Modal show onHide={() => setShowDeleteConfirm(null)} centered size="sm">
                    <Modal.Header closeButton>
                      <Modal.Title>Delete Bookmark?</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      Delete "{bookmark.title}"? This action cannot be undone.
                    </Modal.Body>
                    <Modal.Footer>
                      <Button variant="secondary" onClick={() => setShowDeleteConfirm(null)}>
                        Cancel
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleDeleteBookmark(bookmark.id)}
                        disabled={submitting}
                      >
                        {submitting ? 'Deleting...' : 'Delete'}
                      </Button>
                    </Modal.Footer>
                  </Modal>
                )}
              </div>
            ))}
          </ListGroup>
        )}
      </Card.Body>
    </Card>
  );
}

BookmarksPanel.propTypes = {
  lectureId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  currentTimestamp: PropTypes.number,
  bookmarks: PropTypes.array,
  onBookmarkClick: PropTypes.func,
  isEnrolled: PropTypes.bool,
  onBookmarksChange: PropTypes.func
};
