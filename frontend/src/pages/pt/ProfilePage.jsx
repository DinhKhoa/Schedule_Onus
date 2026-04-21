import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

function ProfilePage() {
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>Đang tải...</div>;

  const fields = [
    { label: 'Họ và tên', value: profile?.hoTen },
    { label: 'Số điện thoại', value: profile?.soDienThoai },
    { label: 'Giới tính', value: profile?.gioiTinh },
    { label: 'Ngày sinh', value: profile?.ngaySinh ? (() => { const d = new Date(profile.ngaySinh); return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`; })() : '—' },
    { label: 'Vai trò', value: profile?.vaiTro === 'PT' ? 'Huấn luyện viên' : 'Hội viên' },
    { label: 'Trạng thái', value: profile?.trangThai === 'HoatDong' ? 'Hoạt động' : 'Ngưng hoạt động' }
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Hồ sơ cá nhân</h1>
          <p className="page-subtitle">Thông tin tài khoản của bạn</p>
        </div>
      </div>

      <div className="profile-layout">
        {/* Profile card */}
        <div className="profile-card">
          <div className="profile-avatar">
            <span>👤</span>
          </div>
          <h2 style={{ marginTop: 12, fontSize: 20 }}>{profile?.hoTen}</h2>
          <span className="badge badge-member">{profile?.vaiTro === 'PT' ? 'Huấn luyện viên' : 'Hội viên'}</span>

          <div className="profile-fields">
            {fields.map(f => (
              <div key={f.label} className="profile-field">
                <span className="field-label">{f.label}</span>
                <span className="field-value">{f.value || '—'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .profile-layout {
          display: flex;
          justify-content: center;
          align-items: flex-start;
          margin-top: 24px;
        }
        .profile-card {
          background: white;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 28px;
          text-align: center;
          width: 100%;
          max-width: 500px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .profile-avatar {
          width: 80px;
          height: 80px;
          background: #EEF2FF;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          margin: 0 auto;
        }
        .profile-fields {
          margin-top: 24px;
          text-align: left;
        }
        .profile-field {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid var(--color-border);
          font-size: 14px;
        }
        .profile-field:last-child {
          border-bottom: none;
        }
        .field-label {
          color: var(--color-text-light);
        }
        .field-value {
          font-weight: 500;
        }
        .badge-member {
          background: #EEF2FF;
          color: #4F46E5;
          margin-top: 8px;
          display: inline-block;
        }
      `}</style>
    </div>
  );
}

export default ProfilePage;
