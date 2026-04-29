const router = require('express').Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const coursePackageRoutes = require('./coursePackageRoutes');
const enrollmentRoutes = require('./enrollmentRoutes');
const trainingDateRoutes = require('./trainingDateRoutes');
const timeSlotRoutes = require('./timeSlotRoutes');
const bookingRoutes = require('./bookingRoutes');
const slotStatusRoutes = require('./slotStatusRoutes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/course-package', coursePackageRoutes);
router.use('/enrollment', enrollmentRoutes);
router.use('/training-date', trainingDateRoutes);
router.use('/time-slot', timeSlotRoutes);
router.use('/booking', bookingRoutes);
router.use('/slot-status', slotStatusRoutes);

module.exports = router;
