import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserInfo from './UserInfo';
import thunderIcon from '../icon/thunder.png';
import khoatapIcon from '../icon/khoatap.png';
import dangkykhoatapIcon from '../icon/dangkykhoatap.png';
import taikhoanIcon from '../icon/taikhoan.png';
import lichIcon from '../icon/lich.png';
import menuIcon from '../icon/menu.png';
import userIcon from '../icon/user.png';

const menuConfig = {
  ADMIN: [
    { path: '/admin/khoa-tap', label: 'Quản lý khóa tập', iconImg: khoatapIcon },
    { path: '/admin/dang-ky-khoa', label: 'Quản lý đăng ký khoá', iconImg: dangkykhoatapIcon },
    { path: '/admin/tai-khoan', label: 'Quản lý tài khoản', iconImg: taikhoanIcon },
    { path: '/admin/lich-tap', label: 'Quản lý lịch', iconImg: lichIcon }
  ],
  PT: [
    { path: '/pt', label: 'Lịch dạy', iconImg: menuIcon },
    { path: '/pt/profile', label: 'Thông tin cá nhân', iconImg: userIcon }
  ],
  HOIVIEN: [
    { path: '/member', label: 'Trang chủ', iconImg: menuIcon },
    { path: '/member/schedule', label: 'Lịch tập', iconImg: lichIcon },
    { path: '/member/profile', label: 'Hồ sơ', iconImg: userIcon }
  ]
};

function Sidebar() {
  const { user } = useAuth();
  const items = menuConfig[user?.vaiTro] || [];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-icon"><img src={thunderIcon} alt="logo" style={{ width: 20, height: 20, filter: 'brightness(0) invert(1)' }} /></span>
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
            <span className="sidebar-icon">
              {item.iconImg ? <img src={item.iconImg} alt="" className="sidebar-icon-img" /> : item.icon}
            </span>
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
          padding: 0 24px;
          height: var(--topbar-height);
          font-size: 20px;
          font-weight: 700;
          border-bottom: 1px solid var(--color-border);
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
          padding: 12px 12px;
        }
        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: var(--radius);
          text-decoration: none;
          color: #4b5563;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
          margin-bottom: 4px;
        }
        .sidebar-link .sidebar-icon-img {
          width: 20px;
          height: 20px;
          transition: all 0.2s;
          filter: brightness(0) saturate(100%) invert(32%) sepia(12%) saturate(776%) hue-rotate(176deg) brightness(95%) contrast(90%) drop-shadow(0.3px 0px 0px rgba(0,0,0,0.1));
        }
        .sidebar-link:hover {
          background: #eff6ff;
          color: #2563eb;
        }
        .sidebar-link:hover .sidebar-icon-img {
          filter: brightness(0) saturate(100%) invert(33%) sepia(93%) saturate(1636%) hue-rotate(213deg) brightness(97%) contrast(93%) drop-shadow(0.3px 0px 0px #2563eb);
        }
        .sidebar-link.active {
          background: #eff6ff;
          color: #2563eb;
        }
        .sidebar-link.active .sidebar-icon-img {
          filter: brightness(0) saturate(100%) invert(33%) sepia(93%) saturate(1636%) hue-rotate(213deg) brightness(97%) contrast(93%) drop-shadow(0.5px 0px 0px #2563eb);
        }
        .sidebar-icon {
          font-size: 14px;
          display: flex;
          align-items: center;
        }
      `}</style>
    </aside>
  );
}

export default Sidebar;
