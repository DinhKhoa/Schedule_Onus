import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import packageIcon from '../../icon/package.png';
import calendarIcon from '../../icon/calendar.png';

function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalEnrollments: 0, totalSessions: 0, remainingSessions: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/enrollment');
        const myEnrollments = data.filter(e => (e.memberId?._id || e.memberId) === user.id);
        const total = myEnrollments.reduce((sum, e) => sum + (e.totalSessions || 0), 0);
        const remaining = myEnrollments.reduce((sum, e) => sum + (e.remainingSessions || 0), 0);
        setStats({
          totalEnrollments: myEnrollments.length,
          totalSessions: total,
          remainingSessions: remaining
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user.id]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Đang tải...</div>;

  return (
    <div className="dashboard-container">
      <div className="page-header">
        <h1 className="page-title">Chào mừng, {user?.fullName}!</h1>
        <p className="page-subtitle">Hôm nay bạn muốn tập luyện gì nào?</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#EFF6FF', color: '#2563EB' }}>
            <img src={packageIcon} alt="" style={{ width: 24, height: 24 }} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalEnrollments}</div>
            <div className="stat-label">Khóa tập đã đăng ký</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#F0FDF4', color: '#16A34A' }}>
            <img src={calendarIcon} alt="" style={{ width: 24, height: 24 }} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.remainingSessions}</div>
            <div className="stat-label">Buổi tập còn lại</div>
          </div>
        </div>
      </div>

      <style>{`
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; margin-top: 32px; }
        .stat-card { background: white; padding: 24px; border-radius: 16px; border: 1px solid #E5E7EB; display: flex; align-items: center; gap: 20px; transition: transform 0.2s; }
        .stat-card:hover { transform: translateY(-4px); }
        .stat-icon { width: 56px; height: 56px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .stat-value { font-size: 24px; font-weight: 700; color: #111827; }
        .stat-label { font-size: 14px; color: #6B7280; margin-top: 2px; }
      `}</style>
    </div>
  );
}

export default DashboardPage;
