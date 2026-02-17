import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { socketService } from '../../services/socketService';

function BookingPage() {
  const { user } = useAuth();
  const [days, setDays] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    fetchDays();
    socketService.connect();
    socketService.on('slotUpdated', () => selectedDay && fetchSlots(selectedDay));
    socketService.on('slotCreated', () => selectedDay && fetchSlots(selectedDay));
    return () => {
      socketService.off('slotUpdated');
      socketService.off('slotCreated');
    };
  }, []);

  const fetchDays = async () => {
    try {
      const { data } = await api.get('/ngay-tap');
      const upcomingDays = data.filter(d =>
        d.trangThai === 'HoatDong' && new Date(d.ngay) >= new Date().setHours(0, 0, 0, 0)
      );
      setDays(upcomingDays);
      if (upcomingDays.length > 0) {
        setSelectedDay(upcomingDays[0]);
        fetchSlots(upcomingDays[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async (day) => {
    try {
      const { data } = await api.get(`/gio-tap?ngayTapId=${day._id}`);
      setSlots(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectDay = (day) => {
    setSelectedDay(day);
    fetchSlots(day);
  };

  const handleBook = async (slot) => {
    if (slot.trangThai !== 'Trong') return;
    if (!confirm(`Đặt lịch tập khung giờ ${slot.gioBatDau} - ${slot.gioKetThuc}?`)) return;

    setBooking(true);
    try {
      await api.post('/lich-tap', {
        hoiVienId: user.id,
        gioTapId: slot._id,
        ngayTapId: selectedDay._id,
        ptId: selectedDay.ptId?._id || selectedDay.ptId
      });
      alert('Đặt lịch thành công!');
      fetchSlots(selectedDay);
    } catch (err) {
      alert(err.response?.data?.error || 'Đặt lịch thất bại');
    } finally {
      setBooking(false);
    }
  };

  const slotStatusLabels = { Trong: 'Trống', DaDat: 'Đã đặt', DaHoanThanh: 'Hoàn thành', Tat: 'Đã tắt' };
  const slotStatusColors = { Trong: '#22C55E', DaDat: '#3B61F0', DaHoanThanh: '#6B7280', Tat: '#D1D5DB' };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>Đang tải...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Đặt lịch tập</h1>
          <p className="page-subtitle">Chọn ngày và khung giờ để đặt lịch</p>
        </div>
      </div>

      {/* Day selector */}
      <div className="day-selector">
        {days.map(day => {
          const date = new Date(day.ngay);
          const isSelected = selectedDay?._id === day._id;
          return (
            <button
              key={day._id}
              className={`day-btn ${isSelected ? 'active' : ''}`}
              onClick={() => handleSelectDay(day)}
            >
              <div className="day-btn-weekday">
                {date.toLocaleDateString('vi-VN', { weekday: 'short' })}
              </div>
              <div className="day-btn-date">{date.getDate()}</div>
              <div className="day-btn-month">Th{date.getMonth() + 1}</div>
            </button>
          );
        })}
      </div>

      {/* PT info */}
      {selectedDay && (
        <div className="booking-pt-info">
          <span>👤 PT: <strong>{selectedDay.ptId?.hoTen || '—'}</strong></span>
          <span>📅 {(() => { const d = new Date(selectedDay.ngay); return `${d.toLocaleDateString('vi-VN', { weekday: 'long' })} - ${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`; })()}</span>
        </div>
      )}

      {/* Slots grid */}
      <div className="slots-grid">
        {slots.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 40, color: '#6B7280', gridColumn: '1 / -1' }}>
            Không có khung giờ nào
          </div>
        ) : (
          slots.map(slot => (
            <div
              key={slot._id}
              className={`slot-card ${slot.trangThai === 'Trong' ? 'available' : 'unavailable'}`}
              onClick={() => slot.trangThai === 'Trong' && handleBook(slot)}
            >
              <div className="slot-time">
                {slot.gioBatDau} - {slot.gioKetThuc}
              </div>
              <span
                className="badge"
                style={{ background: slotStatusColors[slot.trangThai] + '20', color: slotStatusColors[slot.trangThai] }}
              >
                {slotStatusLabels[slot.trangThai]}
              </span>
            </div>
          ))
        )}
      </div>

      <style>{`
        .day-selector {
          display: flex;
          gap: 10px;
          margin-bottom: 24px;
          overflow-x: auto;
          padding-bottom: 4px;
        }
        .day-btn {
          min-width: 72px;
          padding: 12px 8px;
          border: 2px solid var(--color-border);
          border-radius: var(--radius-lg);
          background: white;
          cursor: pointer;
          text-align: center;
          transition: all 0.2s;
          font-family: var(--font-family);
        }
        .day-btn:hover {
          border-color: var(--color-primary);
        }
        .day-btn.active {
          background: var(--color-primary);
          border-color: var(--color-primary);
          color: white;
        }
        .day-btn-weekday {
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          opacity: 0.7;
        }
        .day-btn-date {
          font-size: 22px;
          font-weight: 700;
          margin: 2px 0;
        }
        .day-btn-month {
          font-size: 11px;
          opacity: 0.7;
        }
        .booking-pt-info {
          display: flex;
          gap: 24px;
          margin-bottom: 20px;
          font-size: 14px;
          color: var(--color-text-light);
        }
        .slots-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }
        .slot-card {
          background: white;
          border: 2px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          transition: all 0.2s;
        }
        .slot-card.available {
          cursor: pointer;
          border-color: #22C55E40;
        }
        .slot-card.available:hover {
          border-color: #22C55E;
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.15);
          transform: translateY(-2px);
        }
        .slot-card.unavailable {
          opacity: 0.55;
          cursor: not-allowed;
        }
        .slot-time {
          font-size: 18px;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}

export default BookingPage;
