import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { socketService } from '../../services/socketService';
import ConfirmModal from '../../components/ConfirmModal';
import SuccessModal from '../../components/SuccessModal';
import clockIcon from '../../icon/clock.png';

function BookingPage() {
  const { user } = useAuth();
  const [days, setDays] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  // Modal states
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmSlot, setConfirmSlot] = useState(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelSlot, setCancelSlot] = useState(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Refs to fix stale closure in socket listeners
  const selectedDayRef = useRef(null);

  const fetchSlots = useCallback(async (day) => {
    if (!day) return;
    try {
      const { data } = await api.get(`/gio-tap?ngayTapId=${day._id}&hoiVienId=${user.id}`);
      const filteredSlots = data.filter(s => s.trangThai !== 'NgungHoatDong');
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

  // Fix socket stale closure: re-bind listeners when selectedDay changes
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
      // Fetch days and enrollment in parallel
      const [daysRes, enrollmentsRes] = await Promise.all([
        api.get('/ngay-tap'),
        api.get('/dang-ky-khoa-tap')
      ]);

      // Tính ngày thứ 2 và chủ nhật của tuần sau
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dayOfWeek = today.getDay(); // 0=CN, 1=T2,...
      const daysUntilNextMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
      const nextMonday = new Date(today);
      nextMonday.setDate(today.getDate() + daysUntilNextMonday);
      nextMonday.setHours(0, 0, 0, 0);
      const nextSunday = new Date(nextMonday);
      nextSunday.setDate(nextMonday.getDate() + 6);
      nextSunday.setHours(23, 59, 59, 999);

      // Hội viên chỉ được đặt lịch cho tuần sau
      const upcomingDays = daysRes.data.filter(d =>
        d.trangThai === 'HoatDong' &&
        new Date(d.ngay) >= nextMonday &&
        new Date(d.ngay) <= nextSunday
      ).sort((a, b) => new Date(a.ngay) - new Date(b.ngay));

      setDays(upcomingDays);

      // Filter enrollment for current user
      const myEnrollments = enrollmentsRes.data
        ?.filter(e => {
          const hvId = e.hoiVienId?._id || e.hoiVienId; // Handle both populated and string ID
          return hvId?.toString() === user.id?.toString() && e.soBuoiConLai > 0;
        })
        ?.sort((a, b) => new Date(a.ngayDangKy) - new Date(b.ngayDangKy) || new Date(a.createdAt) - new Date(b.createdAt));

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
    if (slot.myBookingId && slot.trangThai === 'DaDat') {
      setCancelSlot(slot);
      setCancelOpen(true);
      setErrorMsg('');
      return;
    }

    if (slot.trangThai !== 'HoatDong') return;
    if (!enrollment) return;

    setConfirmSlot(slot);
    setConfirmOpen(true);
    setErrorMsg('');
  };

  const handleBookConfirm = async () => {
    if (!confirmSlot || !selectedDay) return;
    const slotId = confirmSlot._id;
    const originalSlots = [...slots];
    const originalEnrollment = enrollment ? { ...enrollment } : null;

    setConfirmOpen(false);
    setBooking(true);
    setErrorMsg('');

    // 1. Optimistic Update
    setSlots(prev => prev.map(s =>
      s._id === slotId ? { ...s, trangThai: 'DaDat', myBookingId: 'temp-id' } : s
    ));
    if (enrollment) {
      setEnrollment(prev => ({ ...prev, soBuoiConLai: prev.soBuoiConLai - 1 }));
    }

    try {
      await api.post('/lich-tap', {
        hoiVienId: user.id,
        gioTapId: slotId,
        ngayTapId: selectedDay._id
      });
      setSuccessMsg(`Đặt lịch thành công khung giờ ${confirmSlot.gioBatDau} - ${confirmSlot.gioKetThuc}!`);
      setSuccessOpen(true);

      // Refresh real data to get proper IDs and sync enrollment
      fetchSlots(selectedDay);
      const { data } = await api.get('/dang-ky-khoa-tap');
      const myEnrollments = data?.filter(e => {
          const hvId = e.hoiVienId?._id || e.hoiVienId;
          return hvId?.toString() === user.id?.toString() && e.soBuoiConLai > 0;
      })?.sort((a, b) => new Date(a.ngayDangKy) - new Date(b.ngayDangKy) || new Date(a.createdAt) - new Date(b.createdAt));
      if (myEnrollments?.length > 0) setEnrollment(myEnrollments[0]);

    } catch (err) {
      // Rollback on error
      setSlots(originalSlots);
      setEnrollment(originalEnrollment);
      setErrorMsg(err.response?.data?.error || 'Đặt lịch thất bại. Vui lòng thử lại.');
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
    setErrorMsg('');

    // 1. Optimistic Update
    setSlots(prev => prev.map(s =>
      s._id === slotId ? { ...s, trangThai: 'HoatDong', myBookingId: null } : s
    ));
    if (enrollment) {
      setEnrollment(prev => ({ ...prev, soBuoiConLai: prev.soBuoiConLai + 1 }));
    }

    try {
      await api.put(`/lich-tap/${cancelSlot.myBookingId}/cancel`);
      setSuccessMsg(`Đã hủy lịch tập khung giờ ${cancelSlot.gioBatDau} - ${cancelSlot.gioKetThuc} thành công!`);
      setSuccessOpen(true);
      fetchSlots(selectedDay);

      const { data } = await api.get('/dang-ky-khoa-tap');
      const myEnrollments = data?.filter(e => {
          const hvId = e.hoiVienId?._id || e.hoiVienId;
          return hvId?.toString() === user.id?.toString() && e.soBuoiConLai > 0;
      })?.sort((a, b) => new Date(a.ngayDangKy) - new Date(b.ngayDangKy) || new Date(a.createdAt) - new Date(b.createdAt));
      if (myEnrollments?.length > 0) setEnrollment(myEnrollments[0]);
    } catch (err) {

      setSlots(originalSlots);
      setEnrollment(originalEnrollment);
      setErrorMsg(err.response?.data?.error || 'Hủy lịch thất bại.');
    } finally {
      setCancelSlot(null);
    }
  };

  const slotStatusLabels = { HoatDong: 'Trống', DaDat: 'Đã đặt', DaHoanThanh: 'Hoàn thành', NgungHoatDong: 'Đã tắt' };
  const slotStatusColors = { HoatDong: '#16a34a', DaDat: '#3B61F0', DaHoanThanh: '#16a34a', NgungHoatDong: '#ef4444' };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>Đang tải...</div>;

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Màn hình trống hoàn toàn ở nền, card nổi lên */}
      
      {/* Error message */}
      {errorMsg && (
        <div className="card" style={{ textAlign: 'center', padding: 16, color: '#DC2626', marginBottom: 16, background: '#FEF2F2', border: '1px solid #FECACA' }}>
          {errorMsg}
        </div>
      )}

      {/* Enrollment info is hidden by default in this Figma or we can just keep it above as a small banner if needed, but let's hide it to match Figma exactly. If we need it, we'd put it here. Let's just focus on the main card. */}
      {enrollment ? (
        <div className="card" style={{ padding: 32, borderRadius: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, color: '#111827' }}>
            Đăng ký lịch tập mới
          </div>

          <div className="calendar-container">
            <div className="calendar-header">
              <div className="calendar-month">
                Tháng {days.length > 0 ? (() => {
                  const d = new Date(days[0].ngay);
                  return `${String(d.getMonth() + 1).padStart(2,'0')}/${d.getFullYear()}`
                })() : ''}
              </div>
            </div>

            <div className="calendar-days-row">
              {days.map((day, idx) => {
                const date = new Date(day.ngay);
                const isSelected = selectedDay?._id === day._id;
                
                // Giả định ngày quá khứ là ngày có vị trí index < hiện tại hoặc ngày đã đóng.
                // Đối với lịch tập, thường member chỉ thấy các ngày tương lai. 
                // Do đó, ta sẽ đánh dấu ngày quá khứ (disabled) là ngày có trạng thái NgungHoatDong 
                // hoặc ngày nằm trong tuần hiện tại nếu api giới hạn.
                // Tạm thời style the first box as 'past' to match Figma if needed, but let's base it on isBeforeToday.
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
              Khung giờ trống ngày {(() => { const d = new Date(selectedDay.ngay); return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`; })()}
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
                const isAvailable = slot.trangThai === 'HoatDong' && enrollment;
                const isBooked = slot.trangThai === 'DaDat' || slot.trangThai === 'DaHoanThanh';
                const canClick = isAvailable || (isMine && slot.trangThai === 'DaDat');

                return (
                  <div
                    key={slot._id}
                    className={`slot-card ${isBooked ? 'booked' : ''} ${canClick ? 'clickable' : ''} ${isMine ? 'mine' : ''}`}
                    onClick={() => canClick && handleSlotClick(slot)}
                  >
                    <div className="slot-time" style={{ color: isBooked ? '#9CA3AF' : '#111827' }}>
                      {slot.gioBatDau} - {slot.gioKetThuc}
                    </div>
                    {isBooked && (
                      <div className="slot-status" style={{ marginTop: 4, color: '#9CA3AF', fontSize: 13 }}>
                        Đã đặt
                      </div>
                    )}
                    {isMine && slot.trangThai === 'DaDat' && (
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

      {/* Confirm Book Modal */}
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => { setConfirmOpen(false); setConfirmSlot(null); }}
        onConfirm={handleBookConfirm}
        title="Xác nhận đặt lịch"
        message={confirmSlot ? `Bạn có muốn đặt lịch tập khung giờ ${confirmSlot.gioBatDau} - ${confirmSlot.gioKetThuc}?` : ''}
      />

      {/* Confirm Cancel Modal */}
      <ConfirmModal
        isOpen={cancelOpen}
        onClose={() => { setCancelOpen(false); setCancelSlot(null); }}
        onConfirm={handleCancelConfirm}
        title="Xác nhận hủy lịch"
        message={cancelSlot ? `Bạn có chắc muốn hủy lịch tập khung giờ ${cancelSlot.gioBatDau} - ${cancelSlot.gioKetThuc}?` : ''}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={successOpen}
        onClose={() => setSuccessOpen(false)}
        title="Thành công!"
        message={successMsg}
      />

      <style>{`
        .calendar-container {
          border: 1px solid #E5E7EB;
          border-radius: 12px;
          overflow: hidden;
        }
        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          border-bottom: 1px solid #E5E7EB;
          background: #FAFAFA;
        }
        .calendar-month {
          font-size: 16px;
          font-weight: 700;
          color: #111827;
        }
        .calendar-days-row {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          background: white;
          border-bottom: 1px solid #E5E7EB;
        }
        .cal-day-cell {
          padding: 16px 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          border-right: 1px solid #E5E7EB;
          cursor: pointer;
          transition: all 0.2s;
        }
        .cal-day-cell:last-child {
          border-right: none;
        }
        .cal-day-cell.selected {
          background: #EFF6FF;
        }
        .cal-day-cell.past {
          background: #E5E7EB;
          cursor: not-allowed;
          opacity: 0.6;
        }
        .cal-weekday {
          font-size: 13px;
          font-weight: 500;
          color: #6B7280;
        }
        .cal-date-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          font-weight: 700;
          color: #111827;
        }
        .cal-date-circle.selected {
          background: #2563EB;
          color: white;
          box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3);
        }
        .slots-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 16px;
        }
        .slot-card {
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: white;
          transition: all 0.2s;
          position: relative;
        }
        .slot-card.clickable:hover {
          border-color: #3B82F6;
          box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.1);
        }
        .slot-card.booked {
          background: #F9FAFB;
          border-color: transparent;
        }
        .slot-card.mine {
          border-color: #EF4444;
          background: #FEF2F2;
        }
        .slot-time {
          font-size: 15px;
          font-weight: 600;
        }
        .slot-hint.cancel {
          position: absolute;
          top: -10px;
          right: -10px;
          background: #EF4444;
          color: white;
          font-size: 10px;
          padding: 2px 8px;
          border-radius: 10px;
          font-weight: 600;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .slot-card.mine:hover .slot-hint.cancel {
          opacity: 1;
        }

      `}</style>
    </div>
  );
}

export default BookingPage;
