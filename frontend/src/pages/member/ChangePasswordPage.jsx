import { useState } from 'react';
import { authService } from '../../services/authService';

function ChangePasswordPage() {
  const [form, setForm] = useState({ matKhauCu: '', matKhauMoi: '', xacNhan: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.matKhauMoi.length < 6) {
      return setError('Mật khẩu mới phải có ít nhất 6 ký tự');
    }
    if (form.matKhauMoi !== form.xacNhan) {
      return setError('Mật khẩu xác nhận không khớp');
    }

    setLoading(true);
    try {
      await authService.changePassword(form.matKhauCu, form.matKhauMoi);
      setSuccess('Đổi mật khẩu thành công!');
      setForm({ matKhauCu: '', matKhauMoi: '', xacNhan: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Đổi mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Đổi mật khẩu</h1>
          <p className="page-subtitle">Cập nhật mật khẩu tài khoản của bạn</p>
        </div>
      </div>

      <div className="change-pw-container">
        <div className="card">
          {error && <div className="pw-error">{error}</div>}
          {success && <div className="pw-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Mật khẩu hiện tại</label>
              <input className="input" type="password" name="matKhauCu" value={form.matKhauCu} onChange={handleChange} required placeholder="Nhập mật khẩu hiện tại" />
            </div>
            <div className="form-group">
              <label>Mật khẩu mới</label>
              <input className="input" type="password" name="matKhauMoi" value={form.matKhauMoi} onChange={handleChange} required placeholder="Nhập mật khẩu mới (≥ 6 ký tự)" />
            </div>
            <div className="form-group">
              <label>Xác nhận mật khẩu mới</label>
              <input className="input" type="password" name="xacNhan" value={form.xacNhan} onChange={handleChange} required placeholder="Nhập lại mật khẩu mới" />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
              {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .change-pw-container {
          max-width: 480px;
        }
        .change-pw-container .card {
          padding: 32px;
        }
        .form-group {
          margin-bottom: 18px;
        }
        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-size: 14px;
          font-weight: 500;
        }
        .pw-error {
          background: #FEE2E2;
          color: #DC2626;
          padding: 10px 14px;
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 14px;
        }
        .pw-success {
          background: #D1FAE5;
          color: #059669;
          padding: 10px 14px;
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}

export default ChangePasswordPage;
