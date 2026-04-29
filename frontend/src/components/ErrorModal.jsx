import Modal from './Modal';

function ErrorModal({ isOpen, onClose, message, title = "Đã có lỗi xảy ra" }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} hideClose={true} centerTitle={true}>
      <div style={{ textAlign: 'center', padding: '10px 0' }}>
        <div style={{ 
          width: 64, 
          height: 64, 
          background: '#FEE2E2', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 20px',
          color: '#DC2626',
          fontSize: 32
        }}>
          ✕
        </div>
        <p style={{ color: '#4B5563', fontSize: 16, lineHeight: 1.5, marginBottom: 24 }}>
          {message}
        </p>
        <button 
          className="btn btn-primary" 
          onClick={onClose}
          style={{ width: '100%', padding: '12px', background: '#DC2626' }}
        >
          Đóng
        </button>
      </div>
    </Modal>
  );
}

export default ErrorModal;
