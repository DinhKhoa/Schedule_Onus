const NgayTap = require('../models/NgayTap');

/**
 * Tự động tạo NgayTap cho tuần tiếp theo nếu chưa tồn tại.
 * Logic:
 * - Tính ngày thứ 2 của tuần tiếp theo
 * - Tạo 7 ngày (Thứ 2 → Chủ Nhật) của tuần đó nếu chưa có
 * 
 * Gọi hàm này ở mỗi request thay vì dùng cron job.
 */
exports.ensureNextWeekExists = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Tính ngày thứ 2 của tuần sau
    const dayOfWeek = today.getDay(); // 0=CN, 1=T2, ..., 6=T7
    const daysUntilNextMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilNextMonday);

    // Tạo 7 ngày của tuần sau (T2 - CN)
    const daysToEnsure = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(nextMonday);
      date.setDate(nextMonday.getDate() + i);
      daysToEnsure.push(date);
    }

    // Dùng upsert để tránh duplicate
    const ops = daysToEnsure.map(date => ({
      updateOne: {
        filter: {
          ngay: {
            $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0),
            $lte: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59)
          }
        },
        update: { $setOnInsert: { ngay: date, trangThai: 'HoatDong' } },
        upsert: true
      }
    }));

    await NgayTap.bulkWrite(ops);
  } catch (err) {
    console.error('[WeeklySchedule] Error ensuring next week:', err.message);
  }
};

/**
 * Lấy ngày thứ 2 và chủ nhật của tuần sau
 */
exports.getNextWeekRange = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dayOfWeek = today.getDay(); // 0=CN, 1=T2
  const daysUntilNextMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;

  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + daysUntilNextMonday);
  nextMonday.setHours(0, 0, 0, 0);

  const nextSunday = new Date(nextMonday);
  nextSunday.setDate(nextMonday.getDate() + 6);
  nextSunday.setHours(23, 59, 59, 999);

  return { start: nextMonday, end: nextSunday };
};
