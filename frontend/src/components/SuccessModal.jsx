import { useEffect } from 'react';

function SuccessModal({ isOpen, onClose, message }) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="success-overlay" onClick={onClose}>
      <div className="success-box" onClick={(e) => e.stopPropagation()}>
        <button className="success-close-btn" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </button>
        <div className="success-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="12" fill="#16a34a" />
            <path d="M7 12.5l3 3 7-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="success-title">{message || 'Thành công'}</h3>
      </div>

      <style>{`
        .success-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1200;
        }
        .success-box {
          background: #fff;
          border-radius: 16px;
          padding: 40px 48px;
          min-width: 280px;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
          animation: successFadeIn 0.25s ease;
          position: relative;
        }
        @keyframes successFadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .success-close-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .success-close-btn:hover svg {
          stroke: #374151;
        }
        .success-icon {
          margin-bottom: 16px;
        }
        .success-title {
          font-size: 22px;
          font-weight: 600;
          color: #374151;
          margin: 0;
        }
      `}</style>
    </div>
  );
}

export default SuccessModal;
