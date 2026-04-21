import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { socketService } from '../../services/socketService';

function SchedulePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchBookings();
    socketService.connect();
    socketService.on('slotUpdated', fetchBookings);
    socketService.on('sessionCompleted', fetchBookings);
    return () => {
      socketService.off('slotUpdated');
      socketService.off('sessionCompleted');
    };
  }, []);

  const fetchBookings = async () => {
    try {
      const { data } = await api.get(`/lich-tap?ptId=${user.id}`);
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = bookings.filter(b => {
    if (filter === 'all') return true;
    return b.trangThai === filter;
  });

  const statusLabels = { DaDat: 'Chờ tập', DaHoanThanh: 'Đã hoàn thành', DaHuy: 'Đã hủy' };
  const statusColors = { DaDat: '#F59E0B', DaHoanThanh: '#22C55E', DaHuy: '#EF4444' };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>Đang tải...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Lịch dạy</h1>
          <p className="page-subtitle">Danh sách các buổi tập bạn phụ trách</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="pt-stats">
        <div className="pt-stat-card">
          <strong>{bookings.filter(b => b.trangThai === 'DaDat').length}</strong>
          <span>Chờ tập</span>
        </div>
        <div className="pt-stat-card">
          <strong>{bookings.filter(b => b.trangThai === 'DaHoanThanh').length}</strong>
          <span>Đã hoàn thành</span>
        </div>
        <div className="pt-stat-card">
          <strong>{bookings.length}</strong>
          <span>Tổng buổi</span>
        </div>
      </div>

      {/* Filters */}
      <div className="schedule-filters">
        {[
          { key: 'all', label: 'Tất cả' },
          { key: 'DaDat', label: 'Chờ tập' },
          { key: 'DaHoanThanh', label: 'Đã hoàn thành' },
          { key: 'DaHuy', label: 'Đã hủy' }
        ].map(f => (
          <button key={f.key} className={`filter-btn ${filter === f.key ? 'active' : ''}`} onClick={() => setFilter(f.key)}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Session list */}
      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40, color: '#6B7280' }}>
          Không có buổi tập nào
        </div>
      ) : (
        <div className="pt-session-list">
          {filtered.map(booking => (
            <div key={booking._id} className="pt-session-card" onClick={() => navigate(`/pt/session/${booking._id}`)}>
              <div className="pt-session-left">
                <div className="pt-session-date-box">
                  <div style={{ fontSize: 18, fontWeight: 700 }}>
                    {booking.ngayTapId?.ngay ? new Date(booking.ngayTapId.ngay).getDate() : '—'}
                  </div>
                  <div style={{ fontSize: 10 }}>
                    {booking.ngayTapId?.ngay ? `Th${new Date(booking.ngayTapId.ngay).getMonth() + 1}` : ''}
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>
                    {booking.gioTapId?.gioBatDau} - {booking.gioTapId?.gioKetThuc}
                  </div>
                  <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>
                    Hội viên: {booking.dangKyKhoaTapId?.hoiVienId?.hoTen || '—'}
                  </div>
                  <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2, textTransform: 'capitalize' }}>
                    {booking.ngayTapId?.ngay ? new Date(booking.ngayTapId.ngay).toLocaleDateString('vi-VN', { weekday: 'long' }) : ''}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="badge" style={{ background: (statusColors[booking.trangThai] || '#6B7280') + '20', color: statusColors[booking.trangThai] || '#6B7280' }}>
                  {statusLabels[booking.trangThai]}
                </span>
                <span style={{ color: '#9CA3AF', fontSize: 18 }}>›</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .pt-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }
        .pt-stat-card {
          background: white;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        .pt-stat-card strong {
          font-size: 26px;
          color: var(--color-primary);
        }
        .pt-stat-card span {
          font-size: 13px;
          color: var(--color-text-light);
        }
        .schedule-filters {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
        }
        .filter-btn {
          padding: 8px 18px;
          border-radius: 20px;
          border: 1px solid var(--color-border);
          background: white;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          font-family: var(--font-family);
        }
        .filter-btn.active {
          background: var(--color-primary);
          color: white;
          border-color: var(--color-primary);
        }
        .pt-session-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .pt-session-card {
          background: white;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .pt-session-card:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          border-color: var(--color-primary);
        }
        .pt-session-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .pt-session-date-box {
          width: 50px;
          height: 50px;
          background: #EEF2FF;
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--color-primary);
        }
      `}</style>
    </div>
  );
}

export default SchedulePage;
