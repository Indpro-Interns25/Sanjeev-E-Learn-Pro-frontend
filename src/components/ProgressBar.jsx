import { ProgressBar as BootstrapProgress } from 'react-bootstrap';
import PropTypes from 'prop-types';

export default function ProgressBar({ 
  value, 
  total, 
  variant = "primary",
  showLabel = true,
  height = null,
  animated = false
}) {
  const percentage = Math.round((value / total) * 100);
  
  return (
    <div className="progress-wrapper">
      {showLabel && (
        <div className="d-flex justify-content-between mb-1">
          <small>{`${value} of ${total} completed`}</small>
          <small>{`${percentage}%`}</small>
        </div>
      )}
      
      <BootstrapProgress
        now={percentage}
        variant={variant}
        style={height ? { height } : undefined}
        animated={animated}
      />
    </div>
  );
}

ProgressBar.propTypes = {
  value: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  variant: PropTypes.string,
  showLabel: PropTypes.bool,
  height: PropTypes.string,
  animated: PropTypes.bool
};
