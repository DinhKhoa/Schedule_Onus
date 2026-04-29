const router = require('express').Router();
const ctrl = require('../controllers/slotStatusController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.get('/', auth, ctrl.getByTrainingDate);
router.put('/toggle-slot', auth, role('ADMIN'), ctrl.toggleSlotForDay);
router.put('/toggle-global', auth, role('ADMIN'), ctrl.toggleSlotGlobal);
router.put('/toggle-day', auth, role('ADMIN'), ctrl.toggleDay);

module.exports = router;
