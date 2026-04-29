import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { socketService } from '../../services/socketService';
import ConfirmModal from '../../components/ConfirmModal';
import SuccessModal from '../../components/SuccessModal';

import calendarIcon from '../../icon/calendar.png';
import clockIcon from '../../icon/clock.png';
import userIcon from '../../icon/user.png';
import locationIcon from '../../icon/location.png';

function SchedulePage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

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
    socketService.on('sessionUpdated', fetchBookings);
    return () => {
      socketService.off('slotUpdated');
      socketService.off('sessionCompleted');
      socketService.off('sessionUpdated');
    };
  }, []);

  const fetchBookings = async () => {
    try {
      const { data } = await api.get(`/booking?memberId=${user.id}`);
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

    setBookings(prev => prev.map(b => 
      b._id === cancelId ? { ...b, status: 'Cancelled' } : b
    ));

    try {
      await api.put(`/booking/${cancelId}/cancel`);
      setSuccessMsg('Hủy lịch tập thành công!');
      setSuccessOpen(true);
      fetchBookings();
    } catch (err) {
      setBookings(originalBookings);
      setErrorMsg(err.response?.data?.error || 'Không thể hủy lịch tập');
    } finally {
      setCancelId(null);
    }
  };

  const upcoming = bookings.filter(b => b.status === 'Booked' || b.status === 'PendingTrainerConfirm');
  const history = bookings.filter(b => b.status !== 'Booked' && b.status !== 'PendingTrainerConfirm');

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>Đang tải...</div>;

  const renderCard = (booking, isUpcoming) => {
    const statusLabels = {
      PendingTrainerConfirm: 'Chờ PT xác nhận',
      Booked: 'Đã nhận lịch',
      Completed: 'Hoàn thành',
      Cancelled: 'Đã hủy',
      Rejected: 'PT từ chối'
    };
    const badgeColors = {
      PendingTrainerConfirm: { bg: '#DBEAFE', color: '#1D4ED8' },
      Booked: { bg: '#FEF3C7', color: '#D97706' },
      Completed: { bg: '#D1FAE5', color: '#16a34a' },
      Cancelled: { bg: '#FEE2E2', color: '#DC2626' },
      Rejected: { bg: '#FECACA', color: '#B91C1C' }
    };
    const badgeStyle = badgeColors[booking.status] || badgeColors.Completed;

    return (
      <div key={booking._id} className="ui-card">
        <div className="ui-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="ui-badge" style={{ backgroundColor: badgeStyle.bg, color: badgeStyle.color }}>
              {statusLabels[booking.status]}
            </span>
            <span className="ui-title">{booking.enrollmentId?.packageId?.name || '—'}</span>
          </div>
          {isUpcoming && (
            <button className="ui-cancel-btn" onClick={() => handleCancelClick(booking._id)}>
              Hủy
            </button>
          )}
        </div>
        <div className="ui-card-body">
          <div className="ui-info">
            <img src={calendarIcon} alt="" className="ui-icon-img" /> 
            {booking.trainingDateId?.date ? (() => { 
              const d = new Date(booking.trainingDateId.date); 
              return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`; 
            })() : '—'}
          </div>
          <div className="ui-info">
            <img src={clockIcon} alt="" className="ui-icon-img" /> {booking.timeSlotId?.startTime} - {booking.timeSlotId?.endTime}
          </div>
          <div className="ui-info">
            <img src={userIcon} alt="" className="ui-icon-img" /> HLV: {booking.enrollmentId?.trainerId?.fullName || '—'}
          </div>
          <div className="ui-info">
            <img src={locationIcon} alt="" className="ui-icon-img" /> ONUS
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

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => { setConfirmOpen(false); setCancelId(null); }}
        onConfirm={handleCancelConfirm}
        title="Xác nhận hủy lịch"
        message="Bạn có chắc muốn hủy buổi tập này? Lưu ý: Không thể hủy trong vòng 4 giờ trước buổi tập."
      />

      <SuccessModal
        isOpen={successOpen}
        onClose={() => setSuccessOpen(false)}
        title="Thành công!"
        message={successMsg}
      />

      <style>{`
        .section-title { font-size: 16px; font-weight: 600; color: #374151; margin-bottom: 20px; }
        .empty-state { padding: 32px; text-align: center; color: #6B7280; background: white; border: 1px solid var(--color-border); border-radius: var(--radius-lg); }
        .schedule-list { display: flex; flex-direction: column; gap: 16px; }
        .ui-card { background: white; border: 1px solid #E5E7EB; border-radius: 12px; padding: 24px; }
        .ui-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .ui-badge { padding: 4px 12px; border-radius: 100px; font-size: 13px; font-weight: 600; }
        .ui-title { font-size: 16px; font-weight: 700; color: #111827; }
        .ui-cancel-btn { background: white; border: 1px solid #E5E7EB; color: #EF4444; padding: 6px 16px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .ui-cancel-btn:hover { background: #FEF2F2; border-color: #FECACA; }
        .ui-card-body { display: grid; grid-template-columns: auto auto; gap: 12px 60px; justify-content: start; }
        .ui-info { display: flex; align-items: center; gap: 8px; color: #6B7280; font-size: 14px; }
        .ui-icon-img { width: 18px; height: 18px; object-fit: contain; filter: brightness(0) saturate(100%) invert(48%) sepia(13%) saturate(545%) hue-rotate(182deg) brightness(91%) contrast(85%); }
      `}</style>
    </div>
  );
}

export default SchedulePage;
