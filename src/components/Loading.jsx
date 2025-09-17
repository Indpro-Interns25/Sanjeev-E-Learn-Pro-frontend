import PropTypes from 'prop-types';

const Loading = ({ message = 'Loading...' }) => {
  return (
    <div className="d-flex justify-content-center align-items-center p-5">
      <div className="spinner-border text-primary me-2" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <span>{message}</span>
    </div>
  );
};

Loading.propTypes = {
  message: PropTypes.string,
};

export default Loading;
