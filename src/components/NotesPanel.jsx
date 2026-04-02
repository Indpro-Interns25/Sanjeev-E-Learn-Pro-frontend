import { useState, useEffect } from 'react';
import { Card, Button, Form, Alert, Spinner, Badge, Modal } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { createNote, getLectureNotes, updateNote, deleteNote } from '../services/notes';
import '../styles/notes-panel.css';

export default function NotesPanel({
  lectureId,
  userId,
  currentTimestamp = 0,
  isEnrolled = false
}) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newNotesContent, setNewNotesContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [expandedNoteId, setExpandedNoteId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Load notes
  useEffect(() => {
    if (!lectureId || !userId || !isEnrolled) {
      setNotes([]);
      setLoading(false);
      return;
    }

    const loadNotes = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedNotes = await getLectureNotes(lectureId, userId);
        setNotes(fetchedNotes || []);
      } catch (err) {
        console.error('Error loading notes:', err);
        setError('Failed to load notes');
      } finally {
        setLoading(false);
      }
    };

    loadNotes();
  }, [lectureId, userId, isEnrolled]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNotesContent.trim()) {
      setError('Note cannot be empty');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const newNote = await createNote(
        lectureId,
        userId,
        newNotesContent.trim(),
        currentTimestamp
      );
      setNotes([newNote, ...notes]);
      setNewNotesContent('');
    } catch (err) {
      console.error('Error creating note:', err);
      setError('Failed to create note');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditNote = async (noteId) => {
    if (!editContent.trim()) {
      setError('Note cannot be empty');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const updatedNote = await updateNote(noteId, editContent.trim());
      setNotes(
        notes.map((note) => (note.id === noteId ? updatedNote : note))
      );
      setEditingNoteId(null);
      setEditContent('');
    } catch (err) {
      console.error('Error updating note:', err);
      setError('Failed to update note');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    setSubmitting(true);
    setError(null);

    try {
      await deleteNote(noteId);
      setNotes(notes.filter((note) => note.id !== noteId));
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting note:', err);
      setError('Failed to delete note');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (note) => {
    setEditingNoteId(note.id);
    setEditContent(note.content);
    setExpandedNoteId(null);
  };

  const cancelEdit = () => {
    setEditingNoteId(null);
    setEditContent('');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatTimestamp = (seconds) => {
    if (!seconds || isNaN(seconds)) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const hours = Math.floor(mins / 60);
    
    if (hours > 0) {
      return `${hours}:${(mins % 60).toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isEnrolled) {
    return (
      <Card className="notes-panel">
        <Card.Body className="text-center text-muted py-4">
          <i className="bi bi-lock-fill" style={{ fontSize: '2rem' }}></i>
          <p className="mt-2">Enroll in this course to take notes</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="notes-panel">
      <Card.Header className="bg-primary text-white">
        <div className="d-flex align-items-center justify-content-between">
          <h5 className="mb-0">
            <i className="bi bi-notebook"></i> My Notes ({notes.length})
          </h5>
          <Badge bg="light" text="dark">
            {notes.filter(n => !editingNoteId).length} saved
          </Badge>
        </div>
      </Card.Header>

      <Card.Body className="notes-body">
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-3">
            {error}
          </Alert>
        )}

        {/* Note Input Form */}
        <Form onSubmit={handleAddNote} className="mb-4">
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small">Add a New Note</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Write your notes here..."
              value={newNotesContent}
              onChange={(e) => setNewNotesContent(e.target.value)}
              disabled={submitting}
              maxLength={2000}
            />
            <small className="text-muted d-block mt-1">
              {newNotesContent.length} / 2000 characters
              {currentTimestamp > 0 && (
                <> • At {formatTimestamp(currentTimestamp)}</>
              )}
            </small>
          </Form.Group>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            disabled={submitting || !newNotesContent.trim()}
            className="w-100"
          >
            {submitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Saving...
              </>
            ) : (
              <>
                <i className="bi bi-plus-circle"></i> Add Note
              </>
            )}
          </Button>
        </Form>

        {/* Notes List */}
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" size="sm" className="me-2" />
            Loading notes...
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center text-muted py-4">
            <i className="bi bi-inbox" style={{ fontSize: '2rem' }}></i>
            <p className="mt-2">No notes yet. Add your first note!</p>
          </div>
        ) : (
          <div className="notes-list">
            {notes.map((note) => (
              <div key={note.id} className="note-item mb-3 p-3 border rounded-2">
                {editingNoteId === note.id ? (
                  // Edit Mode
                  <>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      disabled={submitting}
                      maxLength={2000}
                      className="mb-2"
                    />
                    <small className="text-muted d-block mb-2">
                      {editContent.length} / 2000 characters
                    </small>
                    <div className="d-flex gap-2">
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleEditNote(note.id)}
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
                    <div className="note-header d-flex justify-content-between align-items-start mb-2">
                      <div className="flex-grow-1">
                        {note.timestamp > 0 && (
                          <Badge bg="info" className="me-2 mb-2">
                            <i className="bi bi-clock"></i> {formatTimestamp(note.timestamp)}
                          </Badge>
                        )}
                        <div className="note-date text-muted small">
                          {formatDate(note.created_at || note.createdAt)}
                        </div>
                      </div>
                      <div className="note-actions d-flex gap-1">
                        <Button
                          variant="link"
                          size="sm"
                          className="text-primary p-0"
                          onClick={() => startEdit(note)}
                          title="Edit"
                        >
                          <i className="bi bi-pencil-square"></i>
                        </Button>
                        <Button
                          variant="link"
                          size="sm"
                          className="text-danger p-0"
                          onClick={() => setShowDeleteConfirm(note.id)}
                          title="Delete"
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </div>
                    </div>

                    <div
                      className={`note-content text-break ${
                        expandedNoteId === note.id ? '' : 'truncated'
                      }`}
                      onClick={() => setExpandedNoteId(
                        expandedNoteId === note.id ? null : note.id
                      )}
                      style={{ cursor: 'pointer' }}
                    >
                      {note.content}
                    </div>

                    {note.content.length > 200 && expandedNoteId !== note.id && (
                      <small className="text-primary d-block mt-1">
                        Click to expand...
                      </small>
                    )}

                    {note.updated_at && note.updated_at !== note.created_at && (
                      <small className="text-muted d-block mt-2">
                        <i className="bi bi-pencil"></i> Edited {formatDate(note.updated_at)}
                      </small>
                    )}
                  </>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm === note.id && (
                  <Modal show onHide={() => setShowDeleteConfirm(null)} centered size="sm">
                    <Modal.Header closeButton>
                      <Modal.Title>Delete Note?</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      Are you sure you want to delete this note? This action cannot be undone.
                    </Modal.Body>
                    <Modal.Footer>
                      <Button variant="secondary" onClick={() => setShowDeleteConfirm(null)}>
                        Cancel
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleDeleteNote(note.id)}
                        disabled={submitting}
                      >
                        {submitting ? 'Deleting...' : 'Delete'}
                      </Button>
                    </Modal.Footer>
                  </Modal>
                )}
              </div>
            ))}
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

NotesPanel.propTypes = {
  lectureId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  currentTimestamp: PropTypes.number,
  isEnrolled: PropTypes.bool
};
