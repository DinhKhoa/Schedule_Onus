import React from 'react';
import { useAuth } from '../../context/AuthContext';

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div style={{ padding: '20px' }}>
      <div className="page-header">
        <h1 className="page-title">Hồ sơ Huấn luyện viên</h1>
        <p className="page-subtitle">Thông tin cá nhân và tài khoản</p>
      </div>

      <div className="card" style={{ maxWidth: '600px', marginTop: '20px', padding: '24px' }}>
        <div style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', color: '#6B7280', fontSize: '14px', marginBottom: '4px' }}>Họ và tên</label>
            <div style={{ fontSize: '16px', fontWeight: '500' }}>{user?.hoTen || 'Chưa cập nhật'}</div>
          </div>
          
          <div>
            <label style={{ display: 'block', color: '#6B7280', fontSize: '14px', marginBottom: '4px' }}>Số điện thoại</label>
            <div style={{ fontSize: '16px', fontWeight: '500' }}>{user?.soDienThoai || 'Chưa cập nhật'}</div>
          </div>

          <div>
             <label style={{ display: 'block', color: '#6B7280', fontSize: '14px', marginBottom: '4px' }}>Vai trò</label>
             <span className="badge" style={{ background: '#EEF2FF', color: '#4F46E5' }}>{user?.role}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
