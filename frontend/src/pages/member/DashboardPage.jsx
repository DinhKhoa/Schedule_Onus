import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { socketService } from '../../services/socketService';

function DashboardPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const socket = socketService.connect();
    socketService.on('sessionCompleted', fetchData);
    socketService.on('slotUpdated', fetchData);
    return () => {
      socketService.off('sessionCompleted');
      socketService.off('slotUpdated');
    };
  }, []);

  const fetchData = async () => {
    try {
      const [bookingsRes, enrollmentsRes] = await Promise.all([
        api.get(`/lich-tap?hoiVienId=${user.id}`),
        api.get('/dang-ky-khoa-tap')
      ]);
      setBookings(bookingsRes.data);
      // Find the user's active enrollment (oldest first: by ngayDangKy then createdAt)
      const myEnrollments = enrollmentsRes.data?.filter(e => {
        const hvId = e.hoiVienId?._id || e.hoiVienId;
        return hvId?.toString() === user.id?.toString() && e.soBuoiConLai > 0;
      })?.sort((a, b) => new Date(a.ngayDangKy) - new Date(b.ngayDangKy) || new Date(a.createdAt) - new Date(b.createdAt)) || [];
      
      setEnrollment(myEnrollments.length > 0 ? myEnrollments[0] : null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const upcomingBookings = bookings
    .filter(b => b.trangThai === 'DaDat')
    .slice(0, 5);

  const completedCount = bookings.filter(b => b.trangThai === 'DaHoanThanh').length;

  const statusLabels = {
    DaDat: 'Đã đặt',
    DaHoanThanh: 'Đã hoàn thành',
    DaHuy: 'Đã hủy'
  };

  const statusColors = {
    DaDat: '#3B61F0',
    DaHoanThanh: '#22C55E',
    DaHuy: '#EF4444'
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>Đang tải...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Xin chào, {user?.hoTen} 👋</h1>
          <p className="page-subtitle">Tổng quan lịch tập của bạn</p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#EEF2FF' }}>📅</div>
          <div>
            <div className="stat-value">{upcomingBookings.length}</div>
            <div className="stat-label">Buổi tập sắp tới</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#F0FDF4' }}>✅</div>
          <div>
            <div className="stat-value">{completedCount}</div>
            <div className="stat-label">Đã hoàn thành</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#FFF7ED' }}>🎯</div>
          <div>
            <div className="stat-value">{enrollment?.soBuoiConLai ?? '—'}</div>
            <div className="stat-label">Buổi tập còn lại</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#FDF2F8' }}>📋</div>
          <div>
            <div className="stat-value">{enrollment?.khoaTapId?.tenKhoaTap ?? '—'}</div>
            <div className="stat-label">Khóa tập hiện tại</div>
          </div>
        </div>
      </div>

      {/* Upcoming sessions */}
      <div style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Lịch tập sắp tới</h2>
        {upcomingBookings.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 40, color: '#6B7280' }}>
            Chưa có buổi tập nào được đặt
          </div>
        ) : (
          <div className="upcoming-list">
            {upcomingBookings.map((booking) => (
              <div key={booking._id} className="upcoming-card">
                <div className="upcoming-time">
                  <span className="time-badge">
                    {booking.gioTapId?.gioBatDau} - {booking.gioTapId?.gioKetThuc}
                  </span>
                </div>
                <div className="upcoming-info">
                  <div className="upcoming-date">
                    {booking.ngayTapId?.ngay ? (() => { const d = new Date(booking.ngayTapId.ngay); return `${new Date(booking.ngayTapId.ngay).toLocaleDateString('vi-VN', { weekday: 'long' })} - ${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`; })() : ''}
                  </div>
                  <div className="upcoming-pt">PT: {booking.dangKyKhoaTapId?.ptId?.hoTen || '—'}</div>
                </div>
                <span className="badge" style={{ background: statusColors[booking.trangThai] + '20', color: statusColors[booking.trangThai] }}>
                  {statusLabels[booking.trangThai]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .dashboard-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        .stat-card {
          background: white;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
        }
        .stat-value {
          font-size: 22px;
          font-weight: 700;
          color: var(--color-text);
        }
        .stat-label {
          font-size: 13px;
          color: var(--color-text-light);
          margin-top: 2px;
        }
        .upcoming-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .upcoming-card {
          background: white;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .time-badge {
          background: var(--color-primary);
          color: white;
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          white-space: nowrap;
        }
        .upcoming-info {
          flex: 1;
        }
        .upcoming-date {
          font-weight: 600;
          font-size: 14px;
          text-transform: capitalize;
        }
        .upcoming-pt {
          font-size: 13px;
          color: var(--color-text-light);
          margin-top: 2px;
        }
      `}</style>
    </div>
  );
}

export default DashboardPage;
