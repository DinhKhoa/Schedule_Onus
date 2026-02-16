import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { socketService } from '../../services/socketService';

function SchedulePage() {
  const { user } = useAuth();
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
      const { data } = await api.get(`/lich-tap?hoiVienId=${user.id}`);
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Bạn có chắc muốn hủy buổi tập này?')) return;
    try {
      await api.put(`/lich-tap/${id}/cancel`);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.error || 'Không thể hủy lịch tập');
    }
  };

  const filtered = bookings.filter(b => {
    if (filter === 'all') return true;
    return b.trangThai === filter;
  });

  const statusLabels = { DaDat: 'Đã đặt', DaHoanThanh: 'Đã hoàn thành', DaHuy: 'Đã hủy' };
  const statusColors = { DaDat: '#3B61F0', DaHoanThanh: '#22C55E', DaHuy: '#EF4444' };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>Đang tải...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Lịch tập</h1>
          <p className="page-subtitle">Danh sách các buổi tập đã đặt</p>
        </div>
      </div>

      {/* Filters */}
      <div className="schedule-filters">
        {[
          { key: 'all', label: 'Tất cả' },
          { key: 'DaDat', label: 'Đã đặt' },
          { key: 'DaHoanThanh', label: 'Đã hoàn thành' },
          { key: 'DaHuy', label: 'Đã hủy' }
        ].map(f => (
          <button
            key={f.key}
            className={`filter-btn ${filter === f.key ? 'active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Bookings list */}
      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40, color: '#6B7280' }}>
          Không có buổi tập nào
        </div>
      ) : (
        <div className="schedule-list">
          {filtered.map((booking) => (
            <div key={booking._id} className="schedule-card">
              <div className="schedule-left">
                <div className="schedule-date-box">
                  <div className="schedule-day">
                    {booking.ngayTapId?.ngay ? new Date(booking.ngayTapId.ngay).getDate() : '—'}
                  </div>
                  <div className="schedule-month">
                    {booking.ngayTapId?.ngay ? `Tháng ${new Date(booking.ngayTapId.ngay).getMonth() + 1}` : ''}
                  </div>
                </div>
                <div className="schedule-details">
                  <div className="schedule-time">
                    🕐 {booking.gioTapId?.gioBatDau} - {booking.gioTapId?.gioKetThuc}
                  </div>
                  <div className="schedule-pt">👤 PT: {booking.ptId?.hoTen || '—'}</div>
                  <div className="schedule-date-full">
                    {booking.ngayTapId?.ngay ? new Date(booking.ngayTapId.ngay).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                  </div>
                </div>
              </div>
              <div className="schedule-right">
                <span className="badge" style={{ background: statusColors[booking.trangThai] + '20', color: statusColors[booking.trangThai] }}>
                  {statusLabels[booking.trangThai]}
                </span>
                {booking.trangThai === 'DaDat' && (
                  <button className="btn btn-outline" style={{ fontSize: 13, padding: '6px 14px', color: '#EF4444', borderColor: '#EF4444' }} onClick={() => handleCancel(booking._id)}>
                    Hủy
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .schedule-filters {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
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
        .schedule-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .schedule-card {
          background: white;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .schedule-left {
          display: flex;
          gap: 20px;
          align-items: center;
        }
        .schedule-date-box {
          width: 56px;
          height: 56px;
          background: var(--color-primary);
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
        }
        .schedule-day {
          font-size: 20px;
          font-weight: 700;
          line-height: 1;
        }
        .schedule-month {
          font-size: 10px;
          opacity: 0.85;
        }
        .schedule-time {
          font-weight: 600;
          font-size: 15px;
        }
        .schedule-pt {
          font-size: 13px;
          color: var(--color-text-light);
          margin-top: 2px;
        }
        .schedule-date-full {
          font-size: 12px;
          color: var(--color-text-light);
          margin-top: 2px;
          text-transform: capitalize;
        }
        .schedule-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }
      `}</style>
    </div>
  );
}

export default SchedulePage;
