import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchProfile();
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>Đang tải...</div>;

  const fields = [
    { label: 'Họ và tên', value: profile?.hoTen },
    { label: 'Số điện thoại', value: profile?.soDienThoai },
    { label: 'Giới tính', value: profile?.gioiTinh },
    { label: 'Ngày sinh', value: profile?.ngaySinh ? new Date(profile.ngaySinh).toLocaleDateString('vi-VN') : '—' },
    { label: 'Vai trò', value: 'Huấn luyện viên (PT)' },
    { label: 'Trạng thái', value: profile?.trangThai === 'HoatDong' ? 'Hoạt động' : 'Ngưng hoạt động' }
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Thông tin cá nhân</h1>
          <p className="page-subtitle">Thông tin tài khoản huấn luyện viên</p>
        </div>
      </div>

      <div style={{ maxWidth: 480 }}>
        <div className="card" style={{ padding: 32 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ width: 80, height: 80, background: '#EDE9FE', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto' }}>
              👤
            </div>
            <h2 style={{ marginTop: 12, fontSize: 20 }}>{profile?.hoTen}</h2>
            <span className="badge badge-pt">Huấn luyện viên</span>
          </div>

          {fields.map(f => (
            <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--color-border)', fontSize: 14 }}>
              <span style={{ color: '#6B7280' }}>{f.label}</span>
              <span style={{ fontWeight: 500 }}>{f.value || '—'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
