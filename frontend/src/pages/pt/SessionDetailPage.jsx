import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import SuccessModal from '../../components/SuccessModal';
import ErrorModal from '../../components/ErrorModal';

function SessionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState({ show: false, message: '' });

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      const { data } = await api.get(`/booking/${id}`);
      setBooking(data);
    } catch (err) {
      console.error(err);
      navigate('/pt/schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      await api.put(`/booking/${id}/complete`);
      setShowSuccess(true);
      fetchBooking();
    } catch (err) {
      setError({ show: true, message: err.response?.data?.error || 'Lỗi cập nhật' });
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Đang tải...</div>;
  if (!booking) return <div style={{ padding: 40, textAlign: 'center' }}>Không tìm thấy buổi tập</div>;

  const isCompleted = booking.status === 'Completed';

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">Chi tiết buổi tập</h1>
        <button className="btn btn-outline" onClick={() => navigate('/pt/schedule')}>Quay lại</button>
      </div>

      <div className="card" style={{ padding: 32 }}>
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Thông tin hội viên</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, color: '#6B7280' }}>Họ và tên</label>
              <div style={{ fontWeight: 600 }}>{booking.enrollmentId?.memberId?.fullName}</div>
            </div>
            <div>
              <label style={{ fontSize: 13, color: '#6B7280' }}>Số điện thoại</label>
              <div style={{ fontWeight: 600 }}>{booking.enrollmentId?.memberId?.phoneNumber}</div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Thông tin buổi tập</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, color: '#6B7280' }}>Ngày tập</label>
              <div style={{ fontWeight: 600 }}>
                {new Date(booking.trainingDateId?.date).toLocaleDateString('vi-VN')}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 13, color: '#6B7280' }}>Khung giờ</label>
              <div style={{ fontWeight: 600 }}>{booking.timeSlotId?.startTime} - {booking.timeSlotId?.endTime}</div>
            </div>
            <div>
              <label style={{ fontSize: 13, color: '#6B7280' }}>Khóa tập</label>
              <div style={{ fontWeight: 600 }}>{booking.enrollmentId?.packageId?.name}</div>
            </div>
            <div>
              <label style={{ fontSize: 13, color: '#6B7280' }}>Trạng thái</label>
              <div style={{ fontWeight: 700, color: isCompleted ? '#16A34A' : '#D97706' }}>
                {isCompleted ? 'Hoàn thành' : 'Đang chờ'}
              </div>
            </div>
          </div>
        </div>

        {!isCompleted && (
          <button className="btn btn-primary" style={{ width: '100%', padding: 14 }} onClick={handleComplete}>
            Xác nhận hoàn thành buổi tập
          </button>
        )}
      </div>

      <SuccessModal isOpen={showSuccess} onClose={() => setShowSuccess(false)} message="Đã cập nhật trạng thái hoàn thành!" />
      <ErrorModal isOpen={error.show} onClose={() => setError({ ...error, show: false })} message={error.message} />
    </div>
  );
}

export default SessionDetailPage;
