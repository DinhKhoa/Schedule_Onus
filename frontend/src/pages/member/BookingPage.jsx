import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { socketService } from '../../services/socketService';
import ConfirmModal from '../../components/ConfirmModal';
import SuccessModal from '../../components/SuccessModal';
import ErrorModal from '../../components/ErrorModal';
import clockIcon from '../../icon/clock.png';

function BookingPage() {
  const { user } = useAuth();
  const [days, setDays] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmSlot, setConfirmSlot] = useState(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelSlot, setCancelSlot] = useState(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState({ show: false, message: '' });

  const selectedDayRef = useRef(null);

  const fetchSlots = useCallback(async (day) => {
    if (!day) return;
    try {
      const { data } = await api.get(`/time-slot?trainingDateId=${day._id}&memberId=${user.id}`);
      const filteredSlots = data.filter(s => s.status !== 'Inactive');
      setSlots(filteredSlots);
    } catch (err) {
      console.error(err);
    }
  }, [user.id]);

  useEffect(() => {
    fetchInitialData();
    socketService.connect();

    return () => {
      socketService.off('slotUpdated');
      socketService.off('slotCreated');
      socketService.off('sessionRefunded');
    };
  }, []);

  useEffect(() => {
    selectedDayRef.current = selectedDay;

    socketService.off('slotUpdated');
    socketService.off('slotCreated');
    socketService.off('sessionRefunded');

    const handler = () => {
      if (selectedDayRef.current) fetchSlots(selectedDayRef.current);
    };
    socketService.on('slotUpdated', handler);
    socketService.on('slotCreated', handler);
    socketService.on('sessionRefunded', handler);
  }, [selectedDay, fetchSlots]);

  const fetchInitialData = async () => {
    try {
      const [daysRes, enrollmentsRes] = await Promise.all([
        api.get('/training-date'),
        api.get('/enrollment')
      ]);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dayOfWeek = today.getDay();
      const daysUntilNextMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
      const nextMonday = new Date(today);
      nextMonday.setDate(today.getDate() + daysUntilNextMonday);
      nextMonday.setHours(0, 0, 0, 0);
      const nextSunday = new Date(nextMonday);
      nextSunday.setDate(nextMonday.getDate() + 6);
      nextSunday.setHours(23, 59, 59, 999);

      const upcomingDays = daysRes.data.filter(d =>
        d.status === 'Active' &&
        new Date(d.date) >= nextMonday &&
        new Date(d.date) <= nextSunday
      ).sort((a, b) => new Date(a.date) - new Date(b.date));

      setDays(upcomingDays);

      const myEnrollments = enrollmentsRes.data
        ?.filter(e => {
          const hvId = e.memberId?._id || e.memberId;
          return hvId?.toString() === user.id?.toString() && e.remainingSessions > 0;
        })
        ?.sort((a, b) => new Date(a.registrationDate) - new Date(b.registrationDate) || new Date(a.createdAt) - new Date(b.createdAt));

      if (myEnrollments?.length > 0) {
        setEnrollment(myEnrollments[0]);
      }

      if (upcomingDays.length > 0) {
        setSelectedDay(upcomingDays[0]);
        fetchSlots(upcomingDays[0]);
      }
    } catch (err) {
      console.error('Initial data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDay = (day) => {
    setSelectedDay(day);
    fetchSlots(day);
  };

  const handleSlotClick = (slot) => {
    if (slot.myBookingId && (slot.status === 'Booked' || slot.status === 'PendingTrainerConfirm')) {
      setCancelSlot(slot);
      setCancelOpen(true);
      setError({ show: false, message: '' });
      return;
    }

    if (slot.status !== 'Active') return;
    if (!enrollment) return;

    setConfirmSlot(slot);
    setConfirmOpen(true);
    setError({ show: false, message: '' });
  };

  const handleBookConfirm = async () => {
    if (!confirmSlot || !selectedDay) return;
    const slotId = confirmSlot._id;
    const originalSlots = [...slots];
    const originalEnrollment = enrollment ? { ...enrollment } : null;

    setConfirmOpen(false);
    setBooking(true);

    setSlots(prev => prev.map(s =>
      s._id === slotId ? { ...s, status: 'PendingTrainerConfirm', myBookingId: 'temp-id' } : s
    ));
    if (enrollment) {
      setEnrollment(prev => ({ ...prev, remainingSessions: prev.remainingSessions - 1 }));
    }

    try {
      await api.post('/booking', {
        memberId: user.id,
        timeSlotId: slotId,
        trainingDateId: selectedDay._id
      });
      setSuccessMsg(`Đặt lịch thành công khung giờ ${confirmSlot.startTime} - ${confirmSlot.endTime}!`);
      setSuccessOpen(true);

      fetchSlots(selectedDay);
      const { data } = await api.get('/enrollment');
      const myEnrollments = data?.filter(e => {
          const hvId = e.memberId?._id || e.memberId;
          return hvId?.toString() === user.id?.toString() && e.remainingSessions > 0;
      })?.sort((a, b) => new Date(a.registrationDate) - new Date(b.registrationDate) || new Date(a.createdAt) - new Date(b.createdAt));
      if (myEnrollments?.length > 0) setEnrollment(myEnrollments[0]);

    } catch (err) {
      setSlots(originalSlots);
      setEnrollment(originalEnrollment);
      setError({ show: true, message: err.response?.data?.error || 'Đặt lịch thất bại. Vui lòng thử lại.' });
    } finally {
      setBooking(false);
      setConfirmSlot(null);
    }
  };

  const handleCancelConfirm = async () => {
    if (!cancelSlot) return;
    const slotId = cancelSlot._id;
    const originalSlots = [...slots];
    const originalEnrollment = enrollment ? { ...enrollment } : null;

    setCancelOpen(false);

    setSlots(prev => prev.map(s =>
      s._id === slotId ? { ...s, status: 'Active', myBookingId: null } : s
    ));
    if (enrollment) {
      setEnrollment(prev => ({ ...prev, remainingSessions: prev.remainingSessions + 1 }));
    }

    try {
      await api.put(`/booking/${cancelSlot.myBookingId}/cancel`);
      setSuccessMsg(`Đã hủy lịch tập khung giờ ${cancelSlot.startTime} - ${cancelSlot.endTime} thành công!`);
      setSuccessOpen(true);
      fetchSlots(selectedDay);

      const { data } = await api.get('/enrollment');
      const myEnrollments = data?.filter(e => {
          const hvId = e.memberId?._id || e.memberId;
          return hvId?.toString() === user.id?.toString() && e.remainingSessions > 0;
      })?.sort((a, b) => new Date(a.registrationDate) - new Date(b.registrationDate) || new Date(a.createdAt) - new Date(b.createdAt));
      if (myEnrollments?.length > 0) setEnrollment(myEnrollments[0]);
    } catch (err) {
      setSlots(originalSlots);
      setEnrollment(originalEnrollment);
      setError({ show: true, message: err.response?.data?.error || 'Hủy lịch thất bại.' });
    } finally {
      setCancelSlot(null);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>Đang tải...</div>;

  return (
    <div style={{ paddingBottom: 40 }}>

      {enrollment ? (
        <div className="card" style={{ padding: 32, borderRadius: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, color: '#111827' }}>
            Đăng ký lịch tập mới
          </div>

          <div className="calendar-container">
            <div className="calendar-header">
              <div className="calendar-month">
                Tháng {days.length > 0 ? (() => {
                  const d = new Date(days[0].date);
                  return `${String(d.getMonth() + 1).padStart(2,'0')}/${d.getFullYear()}`
                })() : ''}
              </div>
            </div>

            <div className="calendar-days-row">
              {days.map((day, idx) => {
                const date = new Date(day.date);
                const isSelected = selectedDay?._id === day._id;
                const today = new Date();
                today.setHours(0,0,0,0);
                const isPast = date < today;

                return (
                  <div
                    key={day._id}
                    className={`cal-day-cell ${isSelected ? 'selected' : ''} ${isPast ? 'past' : ''}`}
                    onClick={() => !isPast && handleSelectDay(day)}
                  >
                    <div className="cal-weekday">
                      {['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'][date.getDay()]}
                    </div>
                    <div className={`cal-date-circle ${isSelected ? 'selected' : ''}`}>{date.getDate()}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {selectedDay && (
            <div style={{ marginTop: 24, marginBottom: 20, fontSize: 15, fontWeight: 600, color: '#374151', display: 'flex', alignItems: 'center', gap: 8 }}>
              <img src={clockIcon} alt="" style={{ width: 22, height: 22, filter: "brightness(0) saturate(100%) invert(33%) sepia(93%) saturate(1636%) hue-rotate(213deg) brightness(97%) contrast(93%)" }} />
              Khung giờ trống ngày {(() => { const d = new Date(selectedDay.date); return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`; })()}
            </div>
          )}

          <div className="slots-grid">
            {slots.length === 0 ? (
              <div style={{ padding: 40, color: '#6B7280', gridColumn: '1 / -1', textAlign: 'center' }}>
                Không có khung giờ nào
              </div>
            ) : (
              slots.map(slot => {
                const isMine = !!slot.myBookingId;
                const isAvailable = slot.status === 'Active' && enrollment;
                const isPending = slot.status === 'PendingTrainerConfirm';
                const isConfirmed = slot.status === 'Booked';
                const isCompleted = slot.status === 'Completed';
                const isBooked = isPending || isConfirmed || isCompleted;
                const canClick = isAvailable || (isMine && (isConfirmed || isPending));

                return (
                  <div
                    key={slot._id}
                    className={`slot-card ${isBooked ? 'booked' : ''} ${canClick ? 'clickable' : ''} ${isMine ? 'mine' : ''} ${isMine && isConfirmed ? 'confirmed' : ''} ${isMine && isCompleted ? 'completed' : ''} ${isMine && isPending ? 'pending' : ''}`}
                    onClick={() => canClick && handleSlotClick(slot)}
                  >
                    <div className="slot-time" style={{ color: isBooked && !isMine ? '#9CA3AF' : '#111827' }}>
                      {slot.startTime} - {slot.endTime}
                    </div>
                    {isBooked && !isMine && (
                      <div className="slot-status" style={{ marginTop: 4, color: '#9CA3AF', fontSize: 13 }}>
                        Đã được đặt
                      </div>
                    )}
                    {isMine && isPending && (
                      <div className="slot-status" style={{ marginTop: 4, color: '#D97706', fontSize: 10, fontWeight: 500 }}>
                        CHỜ XÁC NHẬN
                      </div>
                    )}
                    {isMine && isConfirmed && (
                      <div className="slot-status" style={{ marginTop: 4, color: '#2563EB', fontSize: 10, fontWeight: 500 }}>
                        ĐÃ XÁC NHẬN
                      </div>
                    )}
                    {isMine && isCompleted && (
                      <div className="slot-status" style={{ marginTop: 4, color: '#16A34A', fontSize: 10, fontWeight: 500 }}>
                        HOÀN THÀNH
                      </div>
                    )}
                    {isMine && (isConfirmed || isPending) && (
                      <div className="slot-hint cancel">Nhấn để hủy</div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: 24, color: '#EF4444', marginBottom: 20, background: '#FEF2F2', borderColor: '#FECACA' }}>
          ⚠️ Bạn chưa đăng ký khóa tập hoặc đã hết buổi tập. Vui lòng liên hệ quản trị viên.
        </div>
      )}

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => { setConfirmOpen(false); setConfirmSlot(null); }}
        onConfirm={handleBookConfirm}
        title="Xác nhận đặt lịch"
        message={confirmSlot ? `Bạn có muốn đặt lịch tập khung giờ ${confirmSlot.startTime} - ${confirmSlot.endTime}?` : ''}
      />

      <ConfirmModal
        isOpen={cancelOpen}
        onClose={() => { setCancelOpen(false); setCancelSlot(null); }}
        onConfirm={handleCancelConfirm}
        title="Xác nhận hủy lịch"
        message={cancelSlot ? `Bạn có chắc muốn hủy lịch tập khung giờ ${cancelSlot.startTime} - ${cancelSlot.endTime}?` : ''}
      />

      <SuccessModal
        isOpen={successOpen}
        onClose={() => setSuccessOpen(false)}
        title="Thành công!"
        message={successMsg}
      />

      <ErrorModal
        isOpen={error.show}
        onClose={() => setError({ ...error, show: false })}
        message={error.message}
      />

      <style>{`
        .calendar-container { border: 1px solid #E5E7EB; border-radius: 12px; overflow: hidden; }
        .calendar-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 24px; border-bottom: 1px solid #E5E7EB; background: #FAFAFA; }
        .calendar-month { font-size: 16px; font-weight: 700; color: #111827; }
        .calendar-days-row { display: grid; grid-template-columns: repeat(7, 1fr); background: white; border-bottom: 1px solid #E5E7EB; }
        .cal-day-cell { padding: 16px 0; display: flex; flex-direction: column; align-items: center; gap: 8px; border-right: 1px solid #E5E7EB; cursor: pointer; transition: all 0.2s; }
        .cal-day-cell:last-child { border-right: none; }
        .cal-day-cell.selected { background: #EFF6FF; }
        .cal-day-cell.past { background: #E5E7EB; cursor: not-allowed; opacity: 0.6; }
        .cal-weekday { font-size: 13px; font-weight: 500; color: #6B7280; }
        .cal-date-circle { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 700; color: #111827; }
        .cal-date-circle.selected { background: #2563EB; color: white; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3); }
        .slots-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; }
        .slot-card { width: 204.31px; height: 82.4px; box-sizing: border-box; border: 1px solid #E5E7EB; border-radius: 8px; padding: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: white; transition: all 0.2s; position: relative; }
        .slot-card.clickable:hover { border-color: #111827; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .slot-card.mine.pending.clickable:hover { border-color: #F59E0B; box-shadow: 0 4px 6px -1px rgba(245, 158, 11, 0.2); }
        .slot-card.mine.confirmed.clickable:hover { border-color: #2563EB; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2); }
        .slot-card.booked { background: #F9FAFB; border-color: transparent; }
        .slot-card.mine.pending { border-color: #F59E0B; background: #FFFBEB; }
        .slot-card.mine.confirmed { border-color: #2563EB; background: #EFF6FF; }
        .slot-card.mine.completed { border-color: #16A34A; background: #DCFCE7; }
        .slot-time { font-size: 15px; font-weight: 600; }
        .slot-hint.cancel { position: absolute; top: -10px; right: -10px; background: #EF4444; color: white; font-size: 10px; padding: 2px 8px; border-radius: 10px; font-weight: 600; opacity: 0; transition: opacity 0.2s; }
        .slot-card.mine:hover .slot-hint.cancel { opacity: 1; }
      `}</style>
    </div>
  );
}

export default BookingPage;
