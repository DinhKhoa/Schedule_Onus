function ConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;

  return (
    <div className="confirm-overlay" onClick={onClose}>
      <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
        <button className="confirm-close-btn" onClick={onClose}>✕</button>
        <h3 className="confirm-title">{title || 'Xác nhận xoá?'}</h3>
        {message && <p className="confirm-message">{message}</p>}
        <div className="confirm-actions">
          <button className="confirm-btn confirm-btn-cancel" onClick={onClose}>Hủy</button>
          <button className="confirm-btn confirm-btn-delete" onClick={onConfirm}>Xoá</button>
        </div>
      </div>

      <style>{`
        .confirm-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1100;
        }
        .confirm-box {
          background: #fff;
          border-radius: 16px;
          padding: 32px;
          min-width: 340px;
          max-width: 400px;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
          animation: confirmFadeIn 0.2s ease;
          position: relative;
        }
        @keyframes confirmFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .confirm-close-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          color: #9ca3af;
          padding: 4px;
          line-height: 1;
        }
        .confirm-close-btn:hover {
          color: #374151;
        }
        .confirm-title {
          font-size: 20px;
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
          margin-top: 20px;
        }
        .confirm-btn {
          padding: 10px 32px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .confirm-btn-cancel {
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #e5e7eb;
        }
        .confirm-btn-cancel:hover {
          background: #e5e7eb;
        }
        .confirm-btn-delete {
          background: #3b5bf5;
          color: #fff;
          border: none;
        }
        .confirm-btn-delete:hover {
          background: #2d4ad4;
        }
      `}</style>
    </div>
  );
}

export default ConfirmModal;
