import { useState } from 'react';
import { authService } from '../../services/authService';
import SuccessModal from '../../components/SuccessModal';

function ChangePasswordPage() {
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    try {
      await authService.changePassword(form.oldPassword, form.newPassword);
      setShowSuccess(true);
      setForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Lỗi đổi mật khẩu');
    }
  };

  return (
    <div className="profile-container">
      <div className="page-header">
        <h1 className="page-title">Đổi mật khẩu</h1>
        <p className="page-subtitle">Bảo mật tài khoản của bạn</p>
      </div>

      <div className="card" style={{ padding: 32, maxWidth: 500 }}>
        {error && <div style={{ color: '#DC2626', background: '#FEE2E2', padding: '10px 16px', borderRadius: 8, marginBottom: 20, fontSize: 14 }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label>Mật khẩu cũ</label>
            <input className="input" type="password" value={form.oldPassword} onChange={e => setForm({ ...form, oldPassword: e.target.value })} required />
          </div>
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label>Mật khẩu mới</label>
            <input className="input" type="password" value={form.newPassword} onChange={e => setForm({ ...form, newPassword: e.target.value })} required />
          </div>
          <div className="form-group" style={{ marginBottom: 32 }}>
            <label>Xác nhận mật khẩu mới</label>
            <input className="input" type="password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} required />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: 12 }}>Đổi mật khẩu</button>
        </form>
      </div>

      <SuccessModal isOpen={showSuccess} onClose={() => setShowSuccess(false)} message="Đổi mật khẩu thành công!" />
    </div>
  );
}

export default ChangePasswordPage;
