const router = require('express').Router();
const ctrl = require('../controllers/ngayGioTapController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// GET overrides của 1 ngày
router.get('/', auth, ctrl.getByNgay);

// Toggle khung giờ chỉ cho 1 ngày cụ thể (Admin)
router.put('/toggle-slot', auth, role('ADMIN'), ctrl.toggleSlotForDay);

// Toggle khung giờ cho toàn bộ các ngày (Admin)
router.put('/toggle-global', auth, role('ADMIN'), ctrl.toggleSlotGlobal);

// Toggle trạng thái cả ngày (Admin)
router.put('/toggle-day', auth, role('ADMIN'), ctrl.toggleDay);

module.exports = router;
