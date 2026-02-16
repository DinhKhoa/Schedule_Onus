import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserInfo from './UserInfo';

const menuConfig = {
  ADMIN: [
    { path: '/admin/khoa-tap', label: 'Quản lý khóa tập', icon: '📋' },
    { path: '/admin/dang-ky-khoa', label: 'Quản lý đăng ký khoá', icon: '📝' },
    { path: '/admin/tai-khoan', label: 'Quản lý tài khoản', icon: '👥' },
    { path: '/admin/lich-tap', label: 'Quản lý lịch', icon: '📅' }
  ],
  PT: [
    { path: '/pt', label: 'Lịch dạy', icon: '📅' },
    { path: '/pt/profile', label: 'Thông tin cá nhân', icon: '👤' }
  ],
  HOIVIEN: [
    { path: '/member', label: 'Trang chủ', icon: '🏠' },
    { path: '/member/schedule', label: 'Lịch tập', icon: '📅' },
    { path: '/member/booking', label: 'Đặt lịch', icon: '➕' },
    { path: '/member/profile', label: 'Thông tin cá nhân', icon: '👤' }
  ]
};

function Sidebar() {
  const { user } = useAuth();
  const items = menuConfig[user?.vaiTro] || [];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-icon">⚡</span>
        <span className="logo-text">ONUS</span>
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/member' || item.path === '/pt'}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <UserInfo />

      <style>{`
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          width: var(--sidebar-width);
          height: 100vh;
          background: var(--sidebar-bg);
          border-right: 1px solid var(--color-border);
          display: flex;
          flex-direction: column;
          z-index: 100;
        }
        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 20px 24px;
          font-size: 20px;
          font-weight: 700;
        }
        .logo-icon {
          width: 36px;
          height: 36px;
          background: var(--color-primary);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 18px;
        }
        .logo-text {
          color: var(--color-primary);
        }
        .sidebar-nav {
          flex: 1;
          padding: 8px 12px;
        }
        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: var(--radius);
          text-decoration: none;
          color: var(--color-text);
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
          margin-bottom: 4px;
        }
        .sidebar-link:hover {
          background: var(--color-bg);
        }
        .sidebar-link.active {
          background: var(--sidebar-active-bg);
          color: var(--sidebar-active-text);
        }
        .sidebar-icon {
          font-size: 18px;
        }
      `}</style>
    </aside>
  );
}

export default Sidebar;
