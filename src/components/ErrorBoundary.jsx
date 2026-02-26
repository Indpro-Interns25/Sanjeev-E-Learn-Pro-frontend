import { Component } from 'react';
import PropTypes from 'prop-types';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error?.message || 'Unknown error' };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="d-flex flex-column align-items-center justify-content-center"
          style={{ minHeight: '60vh', padding: '2rem', textAlign: 'center' }}
        >
          <div
            className="rounded-circle d-flex align-items-center justify-content-center mb-4"
            style={{ width: 80, height: 80, background: '#fee2e2' }}
          >
            <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: '2rem', color: '#ef4444' }} />
          </div>
          <h3 className="fw-bold mb-2">Something went wrong</h3>
          <p className="text-muted mb-1" style={{ maxWidth: 420 }}>
            An unexpected error occurred. The error has been logged automatically.
          </p>
          {this.state.errorMessage && (
            <code
              className="d-block mb-4 text-danger"
              style={{ fontSize: '0.8rem', maxWidth: 500, wordBreak: 'break-word' }}
            >
              {this.state.errorMessage}
            </code>
          )}
          <div className="d-flex gap-3 flex-wrap justify-content-center">
            <button
              className="btn btn-primary"
              onClick={() => this.setState({ hasError: false, errorMessage: '' })}
            >
              <i className="bi bi-arrow-clockwise me-2" />Try Again
            </button>
            <button
              className="btn btn-outline-secondary"
              onClick={() => (window.location.href = '/')}
            >
              <i className="bi bi-house me-2" />Go Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ErrorBoundary;

