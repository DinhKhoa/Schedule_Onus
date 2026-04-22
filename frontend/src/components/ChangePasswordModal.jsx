import { useState } from 'react';
import api from '../services/api';

function ChangePasswordModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.newPassword !== formData.confirmPassword) {
      return setError('Mật khẩu xác nhận không khớp');
    }

    // Validation for new password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.newPassword)) {
      return setError('Mật khẩu mới không đạt yêu cầu bảo mật');
    }

    setLoading(true);
    try {
      await api.post('/auth/change-password', {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword
      });
      setSuccess('Đổi mật khẩu thành công!');
      setTimeout(() => {
        onClose();
        setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setSuccess('');
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.error || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2 className="modal-title">Đổi mật khẩu</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-item">
            <label>Mật khẩu hiện tại</label>
            <input 
              type="password"
              required
              value={formData.oldPassword}
              onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
            />
          </div>

          <div className="form-item no-margin">
            <label>Mật khẩu mới</label>
            <input 
              type="password"
              required
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            />
          </div>
          <p className="password-hint">
            Tối thiểu 8 ký tự, gồm chữ hoa, thường, số và ký tự đặc biệt
          </p>

          <div className="form-item">
            <label>Xác nhận mật khẩu mới</label>
            <input 
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            />
          </div>

          {error && <p className="error-text">{error}</p>}
          {success && <p className="success-text">{success}</p>}

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
          z-index: 1100;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.2s ease-out;
        }
        .modal-card {
          background: white;
          border-radius: 24px;
          width: 480px;
          maxWidth: 90%;
          padding: 32px;
          position: relative;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          animation: slideUp 0.3s ease-out;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .modal-close {
          position: absolute;
          top: 24px;
          right: 24px;
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: #9CA3AF;
          transition: color 0.2s;
        }
        .modal-close:hover {
          color: #4B5563;
        }
        .modal-title {
          font-size: 20px;
          font-weight: 700;
          margin: 0 0 28px 0;
          color: #111827;
        }
        .form-item {
          margin-bottom: 24px;
        }
        .form-item.no-margin {
          margin-bottom: 8px;
        }
        .form-item label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
        }
        .form-item input {
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid #E5E7EB;
          background-color: #F9FAFB;
          font-size: 15px;
          font-family: inherit;
          transition: all 0.2s;
          box-sizing: border-box;
        }
        .form-item input:focus {
          outline: none;
          background-color: white;
          border-color: #3B82F6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }
        .password-hint {
          font-size: 13px;
          color: #6B7280;
          line-height: 1.5;
          margin-bottom: 24px;
        }
        .error-text {
          color: #DC2626;
          font-size: 14px;
          margin-bottom: 16px;
          padding: 8px 12px;
          background: #FEF2F2;
          border-radius: 8px;
          border-left: 4px solid #DC2626;
        }
        .success-text {
          color: #059669;
          font-size: 14px;
          margin-bottom: 16px;
          padding: 8px 12px;
          background: #ECFDF5;
          border-radius: 8px;
          border-left: 4px solid #059669;
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 32px;
        }
        .btn-cancel {
          padding: 12px 24px;
          border-radius: 12px;
          border: none;
          background: #F3F4F6;
          color: #374151;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-cancel:hover {
          background: #E5E7EB;
        }
        .btn-submit {
          padding: 12px 24px;
          border-radius: 12px;
          border: none;
          background: #2563EB;
          color: white;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-submit:hover:not(:disabled) {
          background: #1D4ED8;
          box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
        }
        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

export default ChangePasswordModal;
