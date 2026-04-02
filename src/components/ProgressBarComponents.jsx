import { ProgressBar as BootstrapProgressBar, Badge } from 'react-bootstrap';
import PropTypes from 'prop-types';
import '../styles/progress-bar.css';

export function CourseProgressBar({ 
  completed = 0, 
  total = 0, 
  showLabel = true,
  size = 'normal'
}) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const variant = percentage === 100 ? 'success' : percentage >= 66 ? 'info' : percentage >= 33 ? 'warning' : 'danger';

  return (
    <div className={`course-progress-container progress-size-${size}`}>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span className="fw-semibold">Progress</span>
        {showLabel && (
          <div className="progress-info">
            <Badge bg={variant} className="me-2">{percentage}%</Badge>
            <span className="text-muted small">{completed} / {total} lectures</span>
          </div>
        )}
      </div>
      <BootstrapProgressBar
        now={percentage}
        variant={variant}
        className="course-progress-bar"
        animated={percentage < 100}
        striped={percentage < 100}
      />
    </div>
  );
}

export function LectureProgressBar({
  currentTime = 0,
  duration = 0,
  showLabel = true,
  onSeek = null
}) {
  const percentage = duration > 0 ? Math.round((currentTime / duration) * 100) : 0;

  const handleClick = (e) => {
    if (!onSeek || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    onSeek(pos * duration);
  };

  return (
    <div className="lecture-progress-container">
      {showLabel && (
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="small text-muted">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          <Badge bg="primary">{percentage}%</Badge>
        </div>
      )}
      <div
        className="lecture-progress-bar-wrapper"
        onClick={handleClick}
        style={{ cursor: onSeek ? 'pointer' : 'default' }}
      >
        <BootstrapProgressBar
          now={percentage}
          variant="primary"
          className="lecture-progress-bar"
        />
      </div>
    </div>
  );
}

export function SkillProgressBar({
  skill = '',
  level = 0,
  targetLevel = 5,
  showLabel = true
}) {
  const percentage = (level / targetLevel) * 100;
  const variant = level === targetLevel ? 'success' : 'info';

  return (
    <div className="skill-progress-container mb-3">
      {showLabel && (
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="fw-semibold small">{skill}</span>
          <span className="text-muted small">
            {level} {level === 1 ? 'lesson' : 'lessons'} completed
          </span>
        </div>
      )}
      <BootstrapProgressBar
        now={percentage}
        variant={variant}
        className="skill-progress-bar"
      />
    </div>
  );
}

export function DashboardProgressCard({
  courseName = '',
  progress = 0,
  enrolled = 0,
  completed = 0,
  onClick = null
}) {
  return (
    <div
      className="dashboard-progress-card p-3 rounded-3 bg-light cursor-pointer transition-all"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      onMouseEnter={(e) => {
        if (onClick) e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        if (onClick) e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div className="d-flex justify-content-between align-items-start mb-2">
        <h6 className="mb-0 flex-grow-1">{courseName}</h6>
        <Badge bg="primary" className="ms-2">{progress}%</Badge>
      </div>
      <BootstrapProgressBar
        now={progress}
        variant={progress === 100 ? 'success' : 'info'}
        className="mb-2"
        animated={progress < 100}
        striped={progress < 100}
      />
      <small className="text-muted d-block">
        {completed} of {enrolled} lectures completed
      </small>
    </div>
  );
}

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const hours = Math.floor(mins / 60);
  
  if (hours > 0) {
    return `${hours}:${(mins % 60).toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

CourseProgressBar.propTypes = {
  completed: PropTypes.number,
  total: PropTypes.number,
  showLabel: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'normal', 'large'])
};

LectureProgressBar.propTypes = {
  currentTime: PropTypes.number,
  duration: PropTypes.number,
  showLabel: PropTypes.bool,
  onSeek: PropTypes.func
};

SkillProgressBar.propTypes = {
  skill: PropTypes.string,
  level: PropTypes.number,
  targetLevel: PropTypes.number,
  showLabel: PropTypes.bool
};

DashboardProgressCard.propTypes = {
  courseName: PropTypes.string,
  progress: PropTypes.number,
  enrolled: PropTypes.number,
  completed: PropTypes.number,
  onClick: PropTypes.func
};
