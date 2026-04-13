import { useNavigate } from 'react-router-dom';
import { Button, Alert, ProgressBar, Spinner } from 'react-bootstrap';
import { useUi } from '../context/ui-context';
import PropTypes from 'prop-types';
import '../styles/quiz-unlock-button.css';

/**
 * Quiz Unlock Button Component
 * Shows quiz button with lock state based on video progress
 * Enables when 90% of video is watched
 */
export default function QuizUnlockButton({
  courseId,
  lessonId,
  videoProgress, // { percentage, isUnlocked, currentTime, duration }
  onQuizClick = null, // Optional callback instead of navigation
  loading = false,
  disabled = false,
  showProgressBar = true,
}) {
  const navigate = useNavigate();
  const { showToast } = useUi();

  // Calculate progress display
  const progressPercent = videoProgress?.percentage || 0;
  const isUnlocked = videoProgress?.isUnlocked || false;
  const duration = videoProgress?.duration || 0;
  const remainingPercent = Math.max(0, 90 - progressPercent);

  const handleQuizClick = () => {
    if (disabled || loading) return;

    if (!isUnlocked) {
      showToast(
        `Please complete this lesson to unlock the quiz. You're ${remainingPercent}% away!`,
        'warning'
      );
      return;
    }

    if (onQuizClick) {
      onQuizClick();
    } else {
      // Navigate to lesson-specific quiz page
      navigate(`/student/courses/${courseId}/lessons/${lessonId}/quiz`);
    }
  };

  return (
    <div className="quiz-unlock-button-container">
      {/* Progress Bar */}
      {showProgressBar && (
        <div className="quiz-progress-section mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="small fw-semibold text-muted">
              Lesson Progress
            </span>
            <span className="small fw-bold text-primary">
              {progressPercent}%
            </span>
          </div>
          <ProgressBar
            now={progressPercent}
            label={`${progressPercent}%`}
            variant={isUnlocked ? 'success' : 'primary'}
            striped={!isUnlocked}
            animated={!isUnlocked}
            className="quiz-progress-bar"
            style={{ height: '8px' }}
          />
          {!isUnlocked && (
            <div className="mt-1">
              <small className="text-muted">
                Watch {remainingPercent}% more to unlock quiz
              </small>
            </div>
          )}
        </div>
      )}

      {/* Quiz Button */}
      <Button
        className={`quiz-unlock-btn w-100 ${isUnlocked ? 'unlocked' : 'locked'}`}
        variant={isUnlocked ? 'success' : 'outline-secondary'}
        onClick={handleQuizClick}
        disabled={!isUnlocked || disabled || loading}
        size="lg"
      >
        {loading ? (
          <>
            <Spinner animation="border" size="sm" className="me-2" />
            Loading...
          </>
        ) : isUnlocked ? (
          <>
            <i className="bi bi-unlock-fill me-2"></i>
            Take Quiz ✅
          </>
        ) : (
          <>
            <i className="bi bi-lock-fill me-2"></i>
            Complete video to unlock quiz
          </>
        )}
      </Button>

      {/* Unlock Status Info */}
      {!isUnlocked && duration > 0 && (
        <Alert variant="info" className="mt-3 py-2 px-3 small mb-0">
          <i className="bi bi-info-circle me-2"></i>
          Continue watching to unlock the quiz at 90% completion ({remainingPercent}% remaining)
        </Alert>
      )}

      {isUnlocked && (
        <Alert variant="success" className="mt-3 py-2 px-3 small mb-0">
          <i className="bi bi-check-circle-fill me-2"></i>
          Quiz unlocked! Click the button to start your assessment.
        </Alert>
      )}
    </div>
  );
}

QuizUnlockButton.propTypes = {
  courseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  lessonId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  videoProgress: PropTypes.shape({
    percentage: PropTypes.number,
    isUnlocked: PropTypes.bool,
    currentTime: PropTypes.number,
    duration: PropTypes.number,
  }),
  onQuizClick: PropTypes.func,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  showProgressBar: PropTypes.bool,
};
