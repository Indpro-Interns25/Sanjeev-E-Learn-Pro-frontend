/**
 * AddLectureForm.jsx
 * Reusable form for creating or editing a lecture.
 * Handles video file selection and shows a real-time upload progress bar.
 *
 * Props:
 *  courseId      – (string|number) target course
 *  lecture       – existing lecture object when editing, null when adding
 *  onSuccess     – callback(savedLecture) called after save
 *  onCancel      – callback() when the user cancels
 */
import { useState, useRef, useEffect } from 'react';
import {
  Card,
  Form,
  Button,
  ProgressBar,
  Badge,
  Spinner,
  Alert,
} from 'react-bootstrap';
import { createLectureWithVideo, updateLecture, uploadLectureVideo } from '../services/lectures';

const ACCEPTED_VIDEO = 'video/mp4,video/webm,video/ogg,video/quicktime,.mp4,.webm,.ogg,.mov';
const MAX_FILE_MB = 500;

export default function AddLectureForm({ courseId, lecture = null, onSuccess, onCancel }) {
  const isEdit = Boolean(lecture);

  const [title, setTitle]           = useState(lecture?.title || '');
  const [description, setDesc]      = useState(lecture?.description || '');
  const [isFreePreview, setFree]    = useState(lecture?.is_free_preview ?? false);
  const [videoFile, setVideoFile]   = useState(null);
  const [preview, setPreview]       = useState(lecture?.video_url || '');
  const [uploadPct, setUploadPct]   = useState(0);
  const [uploading, setUploading]   = useState(false);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState(null);
  const [dragOver, setDragOver]     = useState(false);

  const fileInputRef = useRef();

  // Reset when the lecture prop changes (switching between editing different lectures)
  useEffect(() => {
    setTitle(lecture?.title || '');
    setDesc(lecture?.description || '');
    setFree(lecture?.is_free_preview ?? false);
    setVideoFile(null);
    setPreview(lecture?.video_url || '');
    setUploadPct(0);
    setError(null);
  }, [lecture]);

  // ── File helpers ────────────────────────────────────────────────────────────
  function handleFileSelect(file) {
    if (!file || !file.type.startsWith('video/')) {
      setError('Please select a valid video file (MP4, WebM, MOV).');
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setError(`File size must be under ${MAX_FILE_MB} MB.`);
      return;
    }
    setError(null);
    setVideoFile(file);
    setPreview(URL.createObjectURL(file));
  }

  function handleInputChange(e) {
    handleFileSelect(e.target.files?.[0]);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files?.[0]);
  }

  function handleDragOver(e) {
    e.preventDefault();
    setDragOver(true);
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) { setError('Lecture title is required.'); return; }
    setError(null);

    try {
      let result;
      if (isEdit) {
        setSaving(true);
        result = await updateLecture(courseId, lecture.id, {
          title: title.trim(),
          description: description.trim(),
          is_free_preview: isFreePreview,
        });
        // If a new video was selected, upload it separately
        if (videoFile) {
          setUploading(true);
          setSaving(false);
          await uploadLectureVideo(courseId, lecture.id, videoFile, setUploadPct);
          setUploading(false);
        }
      } else {
        setUploading(true);
        result = await createLectureWithVideo(
          courseId,
          { title: title.trim(), description: description.trim(), is_free_preview: isFreePreview },
          videoFile,
          (pct) => { setUploadPct(pct); }
        );
        setUploading(false);
      }

      // Reset form
      setTitle('');
      setDesc('');
      setFree(false);
      setVideoFile(null);
      setPreview('');
      setUploadPct(0);

      onSuccess?.(result);
    } catch (err) {
      setUploading(false);
      setSaving(false);
      setError(err.message || 'Something went wrong. Please try again.');
    }
  }

  const isWorking = uploading || saving;

  return (
    <Card className="border-0 shadow-sm rounded-4">
      <Card.Header className="bg-transparent border-bottom px-4 pt-4 pb-3">
        <div className="d-flex align-items-center gap-2">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center text-white"
            style={{ width: 36, height: 36, background: isEdit ? '#f59e0b' : '#6366f1', flexShrink: 0 }}
          >
            <i className={`bi ${isEdit ? 'bi-pencil-fill' : 'bi-plus-lg'}`} style={{ fontSize: '0.9rem' }} />
          </div>
          <h5 className="fw-bold mb-0">{isEdit ? 'Edit Lecture' : 'Add New Lecture'}</h5>
        </div>
      </Card.Header>

      <Card.Body className="p-4">
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)} className="rounded-3">
            <i className="bi bi-exclamation-circle me-2" />{error}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          {/* Title */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              Lecture Title <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g. Introduction to React Hooks"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              disabled={isWorking}
              className="rounded-3"
            />
            <Form.Text className="text-muted">{title.length}/120 characters</Form.Text>
          </Form.Group>

          {/* Description */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Brief description of what this lecture covers…"
              value={description}
              onChange={(e) => setDesc(e.target.value)}
              maxLength={500}
              disabled={isWorking}
              className="rounded-3"
            />
            <Form.Text className="text-muted">{description.length}/500 characters</Form.Text>
          </Form.Group>

          {/* Free Preview Toggle */}
          <Form.Group className="mb-4">
            <Form.Check
              type="switch"
              id="free-preview-switch"
              label={
                <span>
                  Free Preview{' '}
                  <Badge bg="success" className="ms-1" style={{ fontSize: '0.7rem' }}>
                    Visible to non-enrolled students
                  </Badge>
                </span>
              }
              checked={isFreePreview}
              onChange={(e) => setFree(e.target.checked)}
              disabled={isWorking}
            />
          </Form.Group>

          {/* Video Upload */}
          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold">
              Lecture Video{' '}
              {isEdit && !videoFile && (
                <Badge bg="secondary" style={{ fontSize: '0.7rem' }}>
                  Leave empty to keep existing
                </Badge>
              )}
            </Form.Label>

            {/* Drag-and-drop zone */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => !isWorking && fileInputRef.current?.click()}
              onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={() => setDragOver(false)}
              className={`rounded-3 border-2 d-flex flex-column align-items-center justify-content-center text-center p-4 ${
                dragOver ? 'border-primary bg-primary bg-opacity-10' : 'border-dashed border-secondary'
              }`}
              style={{
                border: '2px dashed',
                borderColor: dragOver ? '#6366f1' : '#ced4da',
                cursor: isWorking ? 'not-allowed' : 'pointer',
                background: dragOver ? 'rgba(99,102,241,0.06)' : 'transparent',
                transition: 'all 0.2s',
                minHeight: 120,
              }}
            >
              <i
                className={`bi ${videoFile ? 'bi-film' : 'bi-cloud-upload'} mb-2`}
                style={{ fontSize: '2rem', color: videoFile ? '#6366f1' : '#adb5bd' }}
              />
              {videoFile ? (
                <>
                  <span className="fw-semibold text-primary">{videoFile.name}</span>
                  <small className="text-muted mt-1">
                    {(videoFile.size / (1024 * 1024)).toFixed(1)} MB • Click to change
                  </small>
                </>
              ) : (
                <>
                  <span className="fw-semibold">Drag &amp; drop video here</span>
                  <small className="text-muted mt-1">
                    or click to browse • MP4, WebM, MOV up to {MAX_FILE_MB} MB
                  </small>
                </>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_VIDEO}
              className="d-none"
              onChange={handleInputChange}
            />
          </Form.Group>

          {/* Upload progress */}
          {uploading && (
            <div className="mb-4">
              <div className="d-flex justify-content-between mb-1">
                <small className="fw-semibold text-primary">
                  <Spinner animation="border" size="sm" className="me-2" />
                  Uploading video…
                </small>
                <small className="fw-bold">{uploadPct}%</small>
              </div>
              <ProgressBar
                now={uploadPct}
                variant={uploadPct === 100 ? 'success' : 'primary'}
                striped={uploadPct < 100}
                animated={uploadPct < 100}
                className="rounded-pill"
                style={{ height: 10 }}
              />
              {uploadPct === 100 && (
                <small className="text-success mt-1 d-block">
                  <i className="bi bi-check-circle me-1" />Upload complete! Finalising…
                </small>
              )}
            </div>
          )}

          {/* Video preview thumbnail */}
          {preview && !uploading && (
            <div className="mb-4">
              <Form.Label className="fw-semibold small text-muted text-uppercase" style={{ letterSpacing: '0.05em' }}>
                Preview
              </Form.Label>
              <video
                src={preview}
                controls
                className="w-100 rounded-3"
                style={{ maxHeight: 220, background: '#000', objectFit: 'contain' }}
              />
            </div>
          )}

          {/* Actions */}
          <div className="d-flex gap-2 justify-content-end">
            {onCancel && (
              <Button
                variant="outline-secondary"
                className="px-4 rounded-pill"
                onClick={onCancel}
                disabled={isWorking}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              className="px-4 rounded-pill"
              disabled={isWorking}
            >
              {isWorking ? (
                <><Spinner animation="border" size="sm" className="me-2" />{isEdit ? 'Saving…' : 'Uploading…'}</>
              ) : (
                <><i className={`bi ${isEdit ? 'bi-check-lg' : 'bi-plus-lg'} me-2`} />{isEdit ? 'Save Changes' : 'Add Lecture'}</>
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}
