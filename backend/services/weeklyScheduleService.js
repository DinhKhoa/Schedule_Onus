const TrainingDate = require('../models/TrainingDate');

/**
 * Tự động tạo TrainingDate cho tuần tiếp theo nếu chưa tồn tại.
 */
exports.ensureNextWeekExists = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    const daysUntilNextMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilNextMonday);

    const daysToEnsure = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(nextMonday);
      date.setDate(nextMonday.getDate() + i);
      daysToEnsure.push(date);
    }

    const ops = daysToEnsure.map(date => ({
      updateOne: {
        filter: {
          date: {
            $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0),
            $lte: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59)
          }
        },
        update: { $setOnInsert: { date, status: 'Active' } },
        upsert: true
      }
    }));

    await TrainingDate.bulkWrite(ops);
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

  const dayOfWeek = today.getDay();
  const daysUntilNextMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;

  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + daysUntilNextMonday);
  nextMonday.setHours(0, 0, 0, 0);

  const nextSunday = new Date(nextMonday);
  nextSunday.setDate(nextMonday.getDate() + 6);
  nextSunday.setHours(23, 59, 59, 999);

  return { start: nextMonday, end: nextSunday };
};
