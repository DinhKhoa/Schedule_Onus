const router = require('express').Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const khoaTapRoutes = require('./khoaTapRoutes');
const dangKyKhoaTapRoutes = require('./dangKyKhoaTapRoutes');
const ngayTapRoutes = require('./ngayTapRoutes');
const gioTapRoutes = require('./gioTapRoutes');
const lichTapRoutes = require('./lichTapRoutes');
const ngayGioTapRoutes = require('./ngayGioTapRoutes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/khoa-tap', khoaTapRoutes);
router.use('/dang-ky-khoa-tap', dangKyKhoaTapRoutes);
router.use('/ngay-tap', ngayTapRoutes);
router.use('/gio-tap', gioTapRoutes);
router.use('/lich-tap', lichTapRoutes);
router.use('/ngay-gio-tap', ngayGioTapRoutes);

module.exports = router;
