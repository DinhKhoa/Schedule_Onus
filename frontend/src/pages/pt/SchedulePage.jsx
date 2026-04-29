import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { socketService } from '../../services/socketService';
import ErrorModal from '../../components/ErrorModal';
import clockIcon from '../../icon/clock.png';

function SchedulePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [days, setDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmSlot, setConfirmSlot] = useState(null);
  const [error, setError] = useState({ show: false, message: '' });

  const fetchInitialData = async () => {
    try {
      const [daysRes, bookingsRes] = await Promise.all([
        api.get('/training-date'),
        api.get(`/booking?trainerId=${user.id}`)
      ]);

      const availableDays = daysRes.data.sort((a, b) => new Date(a.date) - new Date(b.date));

      setDays(availableDays);
      setBookings(bookingsRes.data);

      const todayStr = new Date().toISOString().slice(0, 10);
      const todayDay = availableDays.find(d => new Date(d.date).toISOString().slice(0, 10) === todayStr);
      setSelectedDay(todayDay || { date: new Date().toISOString() });
    } catch (err) {
      console.error('Lỗi tải dữ liệu:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const { data } = await api.get(`/booking?trainerId=${user.id}`);
      setBookings(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInitialData();
    socketService.connect();
    socketService.on('slotUpdated', fetchBookings);
    socketService.on('sessionCompleted', fetchBookings);
    socketService.on('sessionUpdated', fetchBookings);
    return () => {
      socketService.off('slotUpdated');
      socketService.off('sessionCompleted');
      socketService.off('sessionUpdated');
    };
  }, [user.id]);

  const handleSelectDay = (day) => {
    setSelectedDay(day);
  };

  const handleCompleteConfirm = async () => {
    if (!confirmSlot) return;
    try {
      await api.put(`/booking/${confirmSlot._id}/complete`);
      fetchBookings();
    } catch (error) {
      setError({ show: true, message: error.response?.data?.error || 'Lỗi cập nhật' });
    } finally {
      setConfirmOpen(false);
      setConfirmSlot(null);
    }
  };

  const currentDayBookings = bookings.filter(b => {
    if (selectedDay?._id) return b.trainingDateId?._id === selectedDay._id;
    if (b.trainingDateId?.date && selectedDay?.date) {
      return new Date(b.trainingDateId.date).toDateString() === new Date(selectedDay.date).toDateString();
    }
    return false;
  });

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>Đang tải...</div>;

  const todayHelper = new Date();
  todayHelper.setHours(0, 0, 0, 0);
  const dayOfWeek = todayHelper.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const mondayThisWeek = new Date(todayHelper);
  mondayThisWeek.setDate(todayHelper.getDate() + diffToMonday + (weekOffset * 7));

  const currentWeekDates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(mondayThisWeek);
    d.setDate(mondayThisWeek.getDate() + i);
    return d;
  });
  
  const displayMonth = currentWeekDates[0];

  return (
    <div style={{ paddingBottom: 40 }}>
      <div className="card" style={{ padding: 32, borderRadius: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, color: '#111827' }}>
          Lịch dạy cá nhân
        </div>

        <div className="calendar-container">
          <div className="calendar-header">
            <div className="calendar-month">
               Tháng {`${String(displayMonth.getMonth() + 1).padStart(2,'0')}/${displayMonth.getFullYear()}`}
            </div>
            <div className="calendar-nav">
              <button className="nav-btn" onClick={() => setWeekOffset(w => w - 1)}>&lt;</button>
              <button className="nav-btn" onClick={() => setWeekOffset(w => w + 1)}>&gt;</button>
            </div>
          </div>

          <div className="calendar-days-row">
            {currentWeekDates.map((date) => {
              const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
              const dbDay = days.find(d => {
                const dbD = new Date(d.date);
                return `${dbD.getFullYear()}-${String(dbD.getMonth() + 1).padStart(2, '0')}-${String(dbD.getDate()).padStart(2, '0')}` === dateStr;
              }) || { date: dateStr };
              
              const isSelected = selectedDay?._id 
                                 ? selectedDay._id === dbDay._id 
                                 : new Date(selectedDay?.date).toDateString() === date.toDateString();
                                 
              const isPast = date < todayHelper;

              return (
                <div
                  key={dateStr}
                  className={`cal-day-cell ${isSelected ? 'selected' : ''} ${isPast ? 'past' : ''}`}
                  onClick={() => handleSelectDay(dbDay)}
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
            Lịch dạy cá nhân: <span style={{ color: '#111827' }}>{(() => { const d = new Date(selectedDay.date); return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`; })()}</span>
          </div>
        )}

        <div className="slots-grid">
          {currentDayBookings.length === 0 ? (
            <div style={{ padding: 40, color: '#6B7280', gridColumn: '1 / -1', textAlign: 'center', border: '1px dashed #E5E7EB', borderRadius: 12 }}>
              Bạn không có lịch dạy nào trong ngày này
            </div>
          ) : (
            currentDayBookings.map(booking => {
              const memberName = booking.enrollmentId?.memberId?.fullName || '—';
              const packageName = booking.enrollmentId?.packageId?.name || '—';
              const isCompleted = booking.status === 'Completed';

              return (
                <div key={booking._id} className="pt-slot-card">
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 12 }}>
                    Hội viên: <span style={{ fontWeight: 500, marginLeft: 8 }}>{memberName}</span>
                  </div>

                  <div className="ui-info">
                    <span className="icon">🕒</span>
                    <span style={{ fontWeight: 500 }}>{booking.timeSlotId?.startTime} - {booking.timeSlotId?.endTime}</span>
                  </div>
                  <div className="ui-info" style={{ marginBottom: 16 }}>
                    <span className="icon">👤</span>
                    <span style={{ color: '#4B5563' }}>{packageName}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F3F4F6', paddingTop: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: isCompleted ? '#16A34A' : '#D97706' }}>
                      {isCompleted ? 'Hoàn thành' : 'Đang chờ'}
                    </span>

                    {isCompleted ? (
                       <div style={{ background: '#DCFCE7', borderRadius: '50%', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28 }}>
                         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                           <polyline points="20 6 9 17 4 12"></polyline>
                         </svg>
                       </div>
                    ) : (
                      <button
                        className="btn-hoanthanh"
                        onClick={() => {
                           setConfirmSlot(booking);
                           setConfirmOpen(true);
                        }}
                      >
                        Hoàn thành
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {confirmOpen && confirmSlot && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" style={{ background: 'white', borderRadius: 16, width: 440, maxWidth: '90%', padding: 32, position: 'relative' }}>
            <button 
               style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#9CA3AF' }}
               onClick={() => { setConfirmOpen(false); setConfirmSlot(null); }}
            >
              ✕
            </button>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 24px 0', color: '#111827' }}>
              Xác nhận hoàn thành buổi tập
            </h2>

            <div style={{ background: '#F0FDF4', borderRadius: 8, padding: 16, display: 'flex', gap: 12, marginBottom: 24 }}>
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
               </svg>
               <div style={{ fontSize: 14, color: '#15803D', lineHeight: 1.5 }}>
                 Bạn có chắc chắn muốn cập nhật trạng thái buổi tập này thành <strong style={{ fontWeight: 700 }}>Hoàn thành</strong>?
                 <div style={{ marginTop: 4, fontWeight: 500 }}>Thao tác này không thể hoàn tác.</div>
               </div>
            </div>

            <div style={{ background: '#F9FAFB', borderRadius: 8, padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: 32, fontSize: 14 }}>
               <div style={{ color: '#4B5563' }}>Hội viên: <span style={{ color: '#111827', marginLeft: 8, fontWeight: 500 }}>{confirmSlot.enrollmentId?.memberId?.fullName}</span></div>
               <div style={{ color: '#4B5563' }}>Khoá tập: <span style={{ color: '#111827', marginLeft: 8, fontWeight: 500 }}>{confirmSlot.enrollmentId?.packageId?.name}</span></div>
               <div style={{ color: '#4B5563' }}>Thời gian: <span style={{ color: '#111827', marginLeft: 8, fontWeight: 500 }}>{confirmSlot.timeSlotId?.startTime} - {confirmSlot.timeSlotId?.endTime}</span></div>
               <div style={{ color: '#4B5563' }}>Ngày: <span style={{ color: '#111827', marginLeft: 8, fontWeight: 500 }}>
                 {(() => { const d = new Date(confirmSlot.trainingDateId?.date); return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`})()}
               </span></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
               <button 
                 style={{ background: '#F3F4F6', border: 'none', color: '#111827', padding: '10px 24px', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
                 onClick={() => { setConfirmOpen(false); setConfirmSlot(null); }}
               >
                 Quay lại
               </button>
               <button 
                 style={{ background: '#2563EB', border: 'none', color: 'white', padding: '10px 24px', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
                 onClick={handleCompleteConfirm}
               >
                 Xác nhận
               </button>
            </div>
          </div>
        </div>
      )}

      <ErrorModal 
        isOpen={error.show} 
        onClose={() => setError({ ...error, show: false })} 
        message={error.message} 
      />
      <style>{`
        .calendar-container { border: 1px solid #E5E7EB; border-radius: 12px; overflow: hidden; }
        .calendar-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 24px; border-bottom: 1px solid #E5E7EB; background: #FAFAFA; }
        .calendar-month { font-size: 16px; font-weight: 700; color: #111827; }
        .calendar-nav { display: flex; gap: 12px; }
        .nav-btn { width: 28px; height: 28px; border-radius: 50%; border: none; background: none; font-size: 16px; font-weight: 600; color: #6B7280; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .nav-btn:hover { background: #F3F4F6; color: #111827; }
        .calendar-days-row { display: grid; grid-template-columns: repeat(7, 1fr); background: white; }
        .cal-day-cell { padding: 16px 0; display: flex; flex-direction: column; align-items: center; gap: 8px; border-right: 1px solid #E5E7EB; cursor: pointer; transition: all 0.2s; }
        .cal-day-cell:last-child { border-right: none; }
        .cal-day-cell.selected { background: #EFF6FF; }
        .cal-weekday { font-size: 13px; font-weight: 500; color: #6B7280; }
        .cal-date-circle { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 700; color: #111827; }
        .cal-date-circle.selected { background: #2563EB; color: white; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3); }
        .cal-day-cell.past { opacity: 0.6; background: #f9fafb; }
        .slots-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
        .pt-slot-card { border: 1px solid #E5E7EB; border-radius: 12px; padding: 16px 20px; background: white; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
        .ui-info { display: flex; align-items: center; gap: 10px; color: #6B7280; font-size: 14px; margin-bottom: 8px; }
        .ui-info .icon { font-size: 16px; opacity: 0.8; width: 20px; text-align: center; }
        .btn-hoanthanh { background: #DCFCE7; color: #16A34A; border: none; padding: 6px 16px; border-radius: 100px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .btn-hoanthanh:hover { background: #BBF7D0; }
      `}</style>
    </div>
  );
}

export default SchedulePage;
