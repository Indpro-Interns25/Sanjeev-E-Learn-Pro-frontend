import { useState, useEffect } from 'react';
import { Accordion, Badge, Button, Spinner, Tooltip, OverlayTrigger } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { getLectureBookmarks } from '../services/bookmarks';

export default function LectureAccordion({
  lectures = [],
  onSelectLecture,
  activeLectureId = null,
  completedLectureIds = [],
  userId = null,
  lectureProgress = {},
  isEnrolled = false,
  disableLocked = true
}) {
  const [bookmarks, setBookmarks] = useState({});
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);

  // Load bookmarks for all lectures
  useEffect(() => {
    if (!userId || !isEnrolled) return;

    const loadBookmarks = async () => {
      setLoadingBookmarks(true);
      try {
        const bookmarkMap = {};
        for (const lecture of lectures) {
          try {
            const lectureBookmarks = await getLectureBookmarks(lecture.id, userId);
            bookmarkMap[lecture.id] = lectureBookmarks || [];
          } catch (error) {
            console.error(`Error loading bookmarks for lecture ${lecture.id}:`, error);
            bookmarkMap[lecture.id] = [];
          }
        }
        setBookmarks(bookmarkMap);
      } catch (error) {
        console.error('Error loading bookmarks:', error);
      } finally {
        setLoadingBookmarks(false);
      }
    };

    loadBookmarks();
  }, [lectures, userId, isEnrolled]);

  if (lectures.length === 0) {
    return (
      <div className="text-center text-muted py-4">
        <i className="bi bi-inbox" style={{ fontSize: '2rem' }}></i>
        <p className="mt-2">No lectures available</p>
      </div>
    );
  }

  const renderLockIcon = (index, isLocked) => {
    if (!isLocked) return null;
    return (
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip>Complete previous lectures to unlock</Tooltip>}
      >
        <i className="bi bi-lock-fill text-warning ms-2" />
      </OverlayTrigger>
    );
  };

  const renderProgressIndicator = (lecture) => {
    const progress = lectureProgress[lecture.id];
    if (!progress) return null;

    const percentage = progress.progress_percentage || 0;
    return (
      <div className="progress mt-2" style={{ height: '4px' }}>
        <div
          className="progress-bar"
          role="progressbar"
          style={{ width: `${percentage}%` }}
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    );
  };

  return (
    <Accordion className="lecture-accordion">
      {lectures.map((lecture, index) => {
        const isLocked = disableLocked && index > 0 && !completedLectureIds.includes(lectures[index - 1]?.id);
        const isCompleted = completedLectureIds.includes(lecture.id);
        const isActive = activeLectureId === lecture.id;
        const lectureBookmarks = bookmarks[lecture.id] || [];

        return (
          <Accordion.Item
            key={lecture.id}
            eventKey={`lecture-${lecture.id}`}
            className={`lecture-item ${isActive ? 'active-lecture' : ''} ${isCompleted ? 'completed-lecture' : ''}`}
            disabled={isLocked}
          >
            <Accordion.Header
              onClick={() => !isLocked && onSelectLecture?.(lecture)}
              style={{ cursor: isLocked ? 'not-allowed' : 'pointer', opacity: isLocked ? 0.5 : 1 }}
              className="lecture-header"
            >
              <div className="d-flex align-items-center w-100 gap-2">
                <span className="lecture-number text-muted small">
                  {String(index + 1).padStart(2, '0')}
                </span>

                {isCompleted && (
                  <Badge bg="success" className="me-2">
                    <i className="bi bi-check-circle-fill"></i> Completed
                  </Badge>
                )}

                {isLocked && (
                  <Badge bg="warning" className="me-2">
                    <i className="bi bi-lock-fill"></i> Locked
                  </Badge>
                )}

                <div className="flex-grow-1">
                  <div className="lecture-title">{lecture.title || `Lecture ${index + 1}`}</div>
                  {lecture.duration && (
                    <small className="text-muted">
                      <i className="bi bi-clock"></i> {formatDuration(lecture.duration)}
                    </small>
                  )}
                </div>

                {lectureBookmarks.length > 0 && (
                  <Badge bg="info" className="me-2">
                    <i className="bi bi-bookmark-fill"></i> {lectureBookmarks.length}
                  </Badge>
                )}

                {renderLockIcon(index, isLocked)}
              </div>
            </Accordion.Header>

            <Accordion.Body className="lecture-body">
              <div className="mb-3">
                {lecture.description && (
                  <p className="text-muted small">{lecture.description}</p>
                )}

                {renderProgressIndicator(lecture)}

                {lectureBookmarks.length > 0 && (
                  <div className="mt-3">
                    <h6 className="mb-2">
                      <i className="bi bi-bookmark-fill text-info"></i> Bookmarks
                    </h6>
                    <div className="bookmarks-list">
                      {lectureBookmarks.map((bookmark) => (
                        <div key={bookmark.id} className="bookmark-item p-2 mb-2 bg-light rounded">
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="flex-grow-1">
                              <div className="bookmark-title small fw-semibold">
                                {bookmark.title}
                              </div>
                              <div className="bookmark-time text-muted small">
                                at {formatTime(bookmark.timestamp)}
                              </div>
                            </div>
                            <Button
                              variant="link"
                              size="sm"
                              className="text-info p-0"
                              onClick={() => onSelectLecture?.({ ...lecture, resumeAt: bookmark.timestamp })}
                            >
                              <i className="bi bi-skip-forward-fill"></i>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {!isLocked && (
                <Button
                  variant={isActive ? 'primary' : 'outline-primary'}
                  size="sm"
                  onClick={() => onSelectLecture?.(lecture)}
                  className="w-100"
                >
                  {isActive ? (
                    <>
                      <i className="bi bi-play-fill"></i> Currently Watching
                    </>
                  ) : isCompleted ? (
                    <>
                      <i className="bi bi-arrow-clockwise"></i> Rewatch
                    </>
                  ) : (
                    <>
                      <i className="bi bi-play-circle"></i> Watch Lecture
                    </>
                  )}
                </Button>
              )}
            </Accordion.Body>
          </Accordion.Item>
        );
      })}
    </Accordion>
  );
}

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatDuration(duration) {
  if (!duration) return 'N/A';
  if (typeof duration === 'string') {
    return duration;
  }
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

LectureAccordion.propTypes = {
  lectures: PropTypes.array.isRequired,
  onSelectLecture: PropTypes.func,
  activeLectureId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  completedLectureIds: PropTypes.array,
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  lectureProgress: PropTypes.object,
  isEnrolled: PropTypes.bool,
  disableLocked: PropTypes.bool
};
