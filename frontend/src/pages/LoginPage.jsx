import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

function LoginPage() {
  const [soDienThoai, setSoDienThoai] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await authService.login(soDienThoai, matKhau);
      login(data.token, data.user);
      const routes = { ADMIN: '/admin', PT: '/pt', HOIVIEN: '/member' };
      navigate(routes[data.user.vaiTro] || '/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <span className="logo-icon">⚡</span>
        </div>
        <h1 className="login-title">Đăng nhập hệ thống</h1>
        <p className="login-subtitle">Hệ thống đặt lịch tập Onus</p>
        {error && <div className="login-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Số điện thoại</label>
            <input
              className="input"
              type="text"
              placeholder="Nhập số điện thoại"
              value={soDienThoai}
              onChange={(e) => setSoDienThoai(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Mật khẩu</label>
            <input
              className="input"
              type="password"
              placeholder="Nhập mật khẩu"
              value={matKhau}
              onChange={(e) => setMatKhau(e.target.value)}
              required
            />
          </div>
          <button className="btn btn-primary login-btn" type="submit" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </form>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
        }
        .login-card {
          background: white;
          border-radius: 16px;
          padding: 100px;
          width: 600px;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
        }
        .login-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }
        .login-logo .logo-icon {
          width: 56px;
          height: 56px;
          background: var(--color-primary);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 26px;
        }
        .login-title {
          text-align: center;
          margin-bottom: 8px;
          font-size: 25px;
          font-weight: 700;
          color: #000000;
        }
        .login-subtitle {
          text-align: center;
          margin-bottom: 28px;
          font-size: 12px;
          color: #b2b6bc;
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
        .login-btn {
          width: 100%;
          padding: 12px;
          margin-top: 50px;
          font-size: 16px;
          font-weight: 400;
          justify-content: center;
        }
        .login-error {
          background: #FEE2E2;
          color: #DC2626;
          padding: 10px 14px;
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}

export default LoginPage;
