import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { socketService } from '../../services/socketService';
import ConfirmModal from '../../components/ConfirmModal';
import SuccessModal from '../../components/SuccessModal';

function SchedulePage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelId, setCancelId] = useState(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

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

  const handleCancelClick = (id) => {
    setCancelId(id);
    setConfirmOpen(true);
    setErrorMsg('');
  };

  const handleCancelConfirm = async () => {
    if (!cancelId) return;
    const originalBookings = [...bookings];
    
    setConfirmOpen(false);
    setErrorMsg('');

    // 1. Optimistic Update (Đổi trạng thái sang 'DaHuy' ngay lập tức)
    setBookings(prev => prev.map(b => 
      b._id === cancelId ? { ...b, trangThai: 'DaHuy' } : b
    ));

    try {
      await api.put(`/lich-tap/${cancelId}/cancel`);
      setSuccessMsg('Hủy lịch tập thành công!');
      setSuccessOpen(true);
      // Fetch thực tế để đồng bộ lại
      fetchBookings();
    } catch (err) {
      // Rollback nếu lỗi
      setBookings(originalBookings);
      setErrorMsg(err.response?.data?.error || 'Không thể hủy lịch tập');
    } finally {
      setCancelId(null);
    }
  };

  const upcoming = bookings.filter(b => b.trangThai === 'DaDat');
  const history = bookings.filter(b => b.trangThai !== 'DaDat');

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>Đang tải...</div>;

  const renderCard = (booking, isUpcoming) => {
    const statusLabels = { DaDat: 'Đang chờ', DaHoanThanh: 'Hoàn thành', DaHuy: 'Đã hủy' };
    const badgeColors = {
      DaDat: { bg: '#FEF3C7', color: '#D97706' }, // Yellow/Orange
      DaHoanThanh: { bg: '#D1FAE5', color: '#16a34a' }, // Green
      DaHuy: { bg: '#FEE2E2', color: '#DC2626' } // Red
    };
    const badgeStyle = badgeColors[booking.trangThai] || badgeColors.DaHoanThanh;

    return (
      <div key={booking._id} className="ui-card">
        <div className="ui-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="ui-badge" style={{ backgroundColor: badgeStyle.bg, color: badgeStyle.color }}>
              {statusLabels[booking.trangThai]}
            </span>
            <span className="ui-title">{booking.dangKyKhoaTapId?.khoaTapId?.tenKhoaTap || '—'}</span>
          </div>
          {isUpcoming && (
            <button className="ui-cancel-btn" onClick={() => handleCancelClick(booking._id)}>
              Hủy
            </button>
          )}
        </div>
        <div className="ui-card-body">
          <div className="ui-info">
            <span className="icon">📅</span> 
            {booking.ngayTapId?.ngay ? (() => { 
              const d = new Date(booking.ngayTapId.ngay); 
              return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`; 
            })() : '—'}
          </div>
          <div className="ui-info">
            <span className="icon">🕒</span> {booking.gioTapId?.gioBatDau} - {booking.gioTapId?.gioKetThuc}
          </div>
          <div className="ui-info">
            <span className="icon">👤</span> HLV: {booking.dangKyKhoaTapId?.ptId?.hoTen || '—'}
          </div>
          <div className="ui-info">
            <span className="icon">📍</span> ONUS
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Lịch tập của tôi</h1>
          <p className="page-subtitle">Quản lý lịch tập cá nhân</p>
        </div>
      </div>

      {/* Error message */}
      {errorMsg && (
        <div className="card" style={{ textAlign: 'center', padding: 16, color: '#DC2626', marginBottom: 16, background: '#FEF2F2', border: '1px solid #FECACA' }}>
          {errorMsg}
          <button onClick={() => setErrorMsg('')} style={{ marginLeft: 12, background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', fontWeight: 600 }}>✕</button>
        </div>
      )}

      <div style={{ marginTop: 32 }}>
        <h3 className="section-title">Sắp diễn ra</h3>
        {upcoming.length === 0 ? (
          <div className="empty-state">Không có buổi tập nào sắp diễn ra</div>
        ) : (
          <div className="schedule-list">
            {upcoming.map(b => renderCard(b, true))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 40, borderTop: '1px solid #E5E7EB', paddingTop: 32 }}>
        <h3 className="section-title">Lịch sử tập luyện</h3>
        {history.length === 0 ? (
          <div className="empty-state">Chưa có lịch sử tập luyện</div>
        ) : (
          <div className="schedule-list">
            {history.map(b => renderCard(b, false))}
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => { setConfirmOpen(false); setCancelId(null); }}
        onConfirm={handleCancelConfirm}
        title="Xác nhận hủy lịch"
        message="Bạn có chắc muốn hủy buổi tập này? Lưu ý: Không thể hủy trong vòng 2 giờ trước buổi tập."
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={successOpen}
        onClose={() => setSuccessOpen(false)}
        title="Thành công!"
        message={successMsg}
      />

      <style>{`
        .section-title {
          font-size: 16px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 20px;
        }
        .empty-state {
          padding: 32px;
          text-align: center;
          color: #6B7280;
          background: white;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
        }
        .schedule-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .ui-card {
          background: white;
          border: 1px solid #E5E7EB;
          border-radius: 12px;
          padding: 24px;
        }
        .ui-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .ui-badge {
          padding: 4px 12px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 600;
        }
        .ui-title {
          font-size: 16px;
          font-weight: 700;
          color: #111827;
        }
        .ui-cancel-btn {
          background: white;
          border: 1px solid #E5E7EB;
          color: #EF4444;
          padding: 6px 16px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .ui-cancel-btn:hover {
          background: #FEF2F2;
          border-color: #FECACA;
        }
        .ui-card-body {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px 24px;
        }
        .ui-info {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #6B7280;
          font-size: 14px;
        }
        .ui-info .icon {
          font-size: 16px;
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
}

export default SchedulePage;
