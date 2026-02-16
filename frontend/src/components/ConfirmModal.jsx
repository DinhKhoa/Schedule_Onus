function ConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;

  return (
    <div className="confirm-overlay" onClick={onClose}>
      <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-icon-wrapper">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h3 className="confirm-title">{title || 'Xác nhận'}</h3>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button className="confirm-btn confirm-btn-cancel" onClick={onClose}>Hủy</button>
          <button className="confirm-btn confirm-btn-delete" onClick={onConfirm}>Xóa</button>
        </div>
      </div>

      <style>{`
        .confirm-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1100;
        }
        .confirm-box {
          background: #fff;
          border-radius: 16px;
          padding: 32px;
          min-width: 360px;
          max-width: 420px;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
          animation: confirmFadeIn 0.2s ease;
        }
        @keyframes confirmFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .confirm-icon-wrapper {
          width: 56px;
          height: 56px;
          background: #fef2f2;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }
        .confirm-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #1f2937;
        }
        .confirm-message {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 24px;
          line-height: 1.5;
        }
        .confirm-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
        }
        .confirm-btn {
          padding: 10px 28px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
        }
        .confirm-btn-cancel {
          background: #f3f4f6;
          color: #374151;
        }
        .confirm-btn-cancel:hover {
          background: #e5e7eb;
        }
        .confirm-btn-delete {
          background: #ef4444;
          color: #fff;
        }
        .confirm-btn-delete:hover {
          background: #dc2626;
        }
      `}</style>
    </div>
  );
}

export default ConfirmModal;
