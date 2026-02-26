/**
 * LectureList.jsx
 * Reusable lecture list used by both instructor and student views.
 *
 * Instructor mode  – drag-and-drop reorder, edit / delete buttons.
 * Student mode     – shows completion state, locked lectures, current highlight.
 *
 * Props:
 *   lectures       – array of lecture objects sorted by order_number
 *   activeLectureId – id of the currently-playing lecture (student view)
 *   completedIds   – array of completed lecture ids (student view)
 *   isInstructor   – boolean
 *   isEnrolled     – boolean (student view; non-enrolled can only see free previews)
 *   loading        – boolean – show skeleton rows
 *   onSelect       – (lecture) => void  called when student clicks a lecture
 *   onEdit         – (lecture) => void  called when instructor clicks edit
 *   onDelete       – (lecture) => void  called when instructor clicks delete
 *   onReorder      – (newOrderedLectures) => void  called after drag-and-drop
 */
import { useState, useRef } from 'react';
import { Badge, Spinner } from 'react-bootstrap';

// ── Skeleton placeholder ───────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="d-flex align-items-center gap-3 px-3 py-3 border-bottom">
      <div className="rounded-circle bg-secondary bg-opacity-25 flex-shrink-0" style={{ width: 32, height: 32 }} />
      <div className="flex-grow-1">
        <div className="rounded bg-secondary bg-opacity-25 mb-1" style={{ height: 12, width: '60%' }} />
        <div className="rounded bg-secondary bg-opacity-10" style={{ height: 10, width: '40%' }} />
      </div>
    </div>
  );
}

export default function LectureList({
  lectures = [],
  activeLectureId = null,
  completedIds = [],
  isInstructor = false,
  isEnrolled = false,
  loading = false,
  onSelect,
  onEdit,
  onDelete,
  onReorder,
}) {
  // ── Drag state ───────────────────────────────────────────────────────────────
  const dragIndex = useRef(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [localOrder, setLocalOrder] = useState(null); // transient while dragging

  const displayLectures = localOrder ?? lectures;

  // ── Drag handlers (HTML5 native) ─────────────────────────────────────────────
  function handleDragStart(e, index) {
    dragIndex.current = index;
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e, index) {
    e.preventDefault();
    if (dragIndex.current === null || dragIndex.current === index) return;
    setDragOverIndex(index);

    // Build reordered array for live preview
    const reordered = [...displayLectures];
    const [moved] = reordered.splice(dragIndex.current, 1);
    reordered.splice(index, 0, moved);
    dragIndex.current = index;
    setLocalOrder(reordered);
  }

  function handleDragEnd() {
    setDragOverIndex(null);
    if (!localOrder) return;
    // Assign new order_number values
    const reordered = localOrder.map((l, i) => ({ ...l, order_number: i + 1 }));
    setLocalOrder(null);
    dragIndex.current = null;
    onReorder?.(reordered);
  }

  // ── Student: decide if lecture is accessible ──────────────────────────────────
  function isAccessible(lecture) {
    return isEnrolled || lecture.is_free_preview;
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div>
        {[1, 2, 3].map((k) => <SkeletonRow key={k} />)}
      </div>
    );
  }

  if (displayLectures.length === 0) {
    return (
      <div className="text-center py-5 text-muted">
        <i className="bi bi-camera-video" style={{ fontSize: '2.5rem', opacity: 0.3 }} />
        <p className="mt-3 mb-0">No lectures yet.</p>
        {isInstructor && (
          <small>Use the form above to add your first lecture.</small>
        )}
      </div>
    );
  }

  return (
    <div>
      {displayLectures.map((lecture, index) => {
        const isActive    = lecture.id === activeLectureId;
        const isDone      = completedIds.includes(lecture.id);
        const accessible  = isInstructor || isAccessible(lecture);
        const isDragTarget = dragOverIndex === index;

        return (
          <div
            key={lecture.id}
            draggable={isInstructor}
            onDragStart={isInstructor ? (e) => handleDragStart(e, index) : undefined}
            onDragOver={isInstructor ? (e) => handleDragOver(e, index) : undefined}
            onDragEnd={isInstructor ? handleDragEnd : undefined}
            className={`d-flex align-items-center gap-3 px-3 border-bottom
              ${isActive ? 'bg-primary bg-opacity-10' : 'bg-transparent'}
              ${isDragTarget ? 'border-primary border-start border-3' : ''}
            `}
            style={{
              cursor: isInstructor ? 'grab' : accessible ? 'pointer' : 'not-allowed',
              transition: 'background 0.15s, border 0.12s',
              minHeight: 64,
            }}
            onClick={() => {
              if (!isInstructor && accessible) onSelect?.(lecture);
            }}
          >
            {/* Drag handle (instructor only) */}
            {isInstructor && (
              <span
                className="text-muted flex-shrink-0"
                style={{ cursor: 'grab', fontSize: '1rem', userSelect: 'none' }}
                title="Drag to reorder"
              >
                <i className="bi bi-grip-vertical" />
              </span>
            )}

            {/* Status icon */}
            <span className="flex-shrink-0">
              {isInstructor ? (
                <span
                  className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                  style={{ width: 28, height: 28, background: '#6366f1', fontSize: '0.75rem' }}
                >
                  {index + 1}
                </span>
              ) : isDone ? (
                <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '1.2rem' }} />
              ) : isActive ? (
                <i className="bi bi-play-circle-fill text-primary" style={{ fontSize: '1.2rem' }} />
              ) : accessible ? (
                <i className="bi bi-circle text-muted" style={{ fontSize: '1.2rem' }} />
              ) : (
                <i className="bi bi-lock-fill text-muted" style={{ fontSize: '1rem' }} />
              )}
            </span>

            {/* Lecture info */}
            <div className="flex-grow-1 py-2 overflow-hidden">
              <p
                className={`mb-0 small fw-semibold text-truncate ${
                  isActive ? 'text-primary' : isDone ? 'text-muted text-decoration-line-through' : ''
                } ${!accessible && !isInstructor ? 'text-muted' : ''}`}
                style={{ lineHeight: 1.35 }}
              >
                {lecture.title}
              </p>
              <div className="d-flex align-items-center gap-2 flex-wrap mt-1">
                {lecture.duration && (
                  <small className="text-muted">
                    <i className="bi bi-clock me-1" style={{ fontSize: '0.7rem' }} />
                    {lecture.duration}
                  </small>
                )}
                {lecture.is_free_preview && (
                  <Badge
                    bg="success"
                    style={{ fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.03em' }}
                  >
                    FREE
                  </Badge>
                )}
                {!accessible && !isInstructor && (
                  <Badge bg="secondary" style={{ fontSize: '0.62rem' }}>Enroll to watch</Badge>
                )}
              </div>
            </div>

            {/* Instructor controls */}
            {isInstructor && (
              <div
                className="d-flex gap-1 flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="btn btn-sm btn-light rounded-pill px-2 py-1"
                  style={{ fontSize: '0.78rem' }}
                  title="Edit"
                  onClick={() => onEdit?.(lecture)}
                >
                  <i className="bi bi-pencil text-warning" />
                </button>
                <button
                  className="btn btn-sm btn-light rounded-pill px-2 py-1"
                  style={{ fontSize: '0.78rem' }}
                  title="Delete"
                  onClick={() => onDelete?.(lecture)}
                >
                  <i className="bi bi-trash text-danger" />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
