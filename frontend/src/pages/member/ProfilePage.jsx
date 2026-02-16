import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const [profileRes, enrollRes] = await Promise.all([
        api.get(`/users/${user.id}`),
        api.get('/dang-ky-khoa-tap')
      ]);
      setProfile(profileRes.data);
      setEnrollments(enrollRes.data?.filter?.(e => e.hoiVienId?._id === user.id) || []);
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
    { label: 'Ngày sinh', value: profile?.ngaySinh ? new Date(profile.ngaySinh).toLocaleDateString('vi-VN') : '—' },
    { label: 'Vai trò', value: profile?.vaiTro === 'HOIVIEN' ? 'Hội viên' : 'PT' },
    { label: 'Trạng thái', value: profile?.trangThai === 'HoatDong' ? 'Hoạt động' : 'Ngưng hoạt động' }
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Thông tin cá nhân</h1>
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
          <span className="badge badge-member">{profile?.vaiTro === 'HOIVIEN' ? 'Hội viên' : 'PT'}</span>

          <div className="profile-fields">
            {fields.map(f => (
              <div key={f.label} className="profile-field">
                <span className="field-label">{f.label}</span>
                <span className="field-value">{f.value || '—'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Enrollments */}
        <div>
          <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 16 }}>Khóa tập đã đăng ký</h3>
          {enrollments.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 32, color: '#6B7280' }}>
              Chưa đăng ký khóa tập nào
            </div>
          ) : (
            <div className="enrollment-list">
              {enrollments.map(e => (
                <div key={e._id} className="enrollment-card">
                  <div className="enrollment-header">
                    <span className="enrollment-name">{e.khoaTapId?.tenKhoaTap || '—'}</span>
                    <span className="badge badge-active">{e.soBuoiConLai} buổi còn lại</span>
                  </div>
                  <div className="enrollment-details">
                    <span>PT: {e.ptId?.hoTen || '—'}</span>
                    <span>Đăng ký: {e.ngayDangKy ? new Date(e.ngayDangKy).toLocaleDateString('vi-VN') : '—'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .profile-layout {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 32px;
          align-items: start;
        }
        .profile-card {
          background: white;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 28px;
          text-align: center;
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
        .enrollment-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .enrollment-card {
          background: white;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 18px 20px;
        }
        .enrollment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .enrollment-name {
          font-weight: 600;
          font-size: 15px;
        }
        .enrollment-details {
          display: flex;
          gap: 20px;
          margin-top: 8px;
          font-size: 13px;
          color: var(--color-text-light);
        }
      `}</style>
    </div>
  );
}

export default ProfilePage;
