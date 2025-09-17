import { Modal } from 'react-bootstrap';
import PropTypes from 'prop-types';

export default function AppModal({ show, onHide, children }) {
  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      backdropClassName="modal-blur-bg"
      dialogClassName="modal-dialog-centered modal-lg"
      contentClassName="border-0 rounded-4 shadow-lg"
    >
      {children}
    </Modal>
  );
}

AppModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};
