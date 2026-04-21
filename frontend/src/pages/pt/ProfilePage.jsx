import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get(`/users/${user.id}`);
      setProfile(data);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const roleLabel = (role) => {
    switch (role) {
      case 'PT': return 'Huấn luyện viên';
      case 'HOIVIEN': return 'Hội viên';
      default: return role;
    }
  };

  const statusLabel = (status) => {
    switch (status) {
      case 'HoatDong': return 'Đang hoạt động';
      case 'NgungHoatDong': return 'Ngưng hoạt động';
      default: return status;
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>Đang tải...</div>;

  const data = profile || {};

  const details = [
    { label: 'Họ và tên', value: data.hoTen || user?.hoTen || 'Chưa cập nhật', icon: '👤' },
    { label: 'Số điện thoại', value: data.soDienThoai || 'Chưa cập nhật', icon: '📱' },
    { label: 'Giới tính', value: data.gioiTinh || 'Chưa cập nhật', icon: '⚧' },
    { label: 'Ngày sinh', value: data.ngaySinh ? new Date(data.ngaySinh).toLocaleDateString('vi-VN') : 'Chưa cập nhật', icon: '🎂' },
    { label: 'Vai trò', value: roleLabel(data.vaiTro || user?.vaiTro), icon: '🏷️', isBadge: true },
    { label: 'Trạng thái', value: statusLabel(data.trangThai), icon: '✅', isStatus: true, status: data.trangThai }
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Hồ sơ Huấn luyện viên</h1>
          <p className="page-subtitle">Thông tin cá nhân và tài khoản</p>
        </div>
      </div>

      {/* Profile card */}
      <div className="pt-profile-container">
        <div className="pt-profile-header">
          <div className="pt-profile-avatar">
            {(data.hoTen || user?.hoTen || 'PT').charAt(0).toUpperCase()}
          </div>
          <div className="pt-profile-name-section">
            <h2 className="pt-profile-name">{data.hoTen || user?.hoTen}</h2>
            <span className="badge" style={{ background: '#EEF2FF', color: '#4F46E5', fontSize: 13 }}>
              {roleLabel(data.vaiTro || user?.vaiTro)}
            </span>
          </div>
        </div>

        <div className="card" style={{ marginTop: 24, padding: 0, overflow: 'hidden' }}>
          {details.map((d, i) => (
            <div key={d.label} className="pt-profile-row" style={i === details.length - 1 ? { borderBottom: 'none' } : {}}>
              <span className="pt-profile-row-icon">{d.icon}</span>
              <span className="pt-profile-row-label">{d.label}</span>
              <span className="pt-profile-row-value">
                {d.isBadge ? (
                  <span className="badge" style={{ background: '#EEF2FF', color: '#4F46E5' }}>{d.value}</span>
                ) : d.isStatus ? (
                  <span className="badge" style={{ 
                    background: d.status === 'HoatDong' ? '#F0FDF4' : '#FEF2F2', 
                    color: d.status === 'HoatDong' ? '#16A34A' : '#DC2626' 
                  }}>
                    {d.value}
                  </span>
                ) : d.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .pt-profile-container {
          max-width: 600px;
        }
        .pt-profile-header {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 8px;
        }
        .pt-profile-avatar {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4F46E5, #7C3AED);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          font-weight: 700;
          color: white;
          flex-shrink: 0;
        }
        .pt-profile-name-section {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .pt-profile-name {
          font-size: 22px;
          font-weight: 700;
          margin: 0;
        }
        .pt-profile-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 24px;
          border-bottom: 1px solid var(--color-border);
          font-size: 14px;
        }
        .pt-profile-row-icon {
          font-size: 16px;
          width: 24px;
          text-align: center;
        }
        .pt-profile-row-label {
          color: var(--color-text-light);
          min-width: 120px;
        }
        .pt-profile-row-value {
          font-weight: 500;
          flex: 1;
          text-align: right;
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;
