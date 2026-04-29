const router = require('express').Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const controller = require('../controllers/trainerAvailabilityController');

router.get('/', auth, role('ADMIN', 'TRAINER'), controller.getByDay);
router.put('/toggle-day', auth, role('ADMIN'), controller.toggleDay);
router.put('/toggle-slot', auth, role('ADMIN'), controller.toggleSlot);
router.put('/toggle-slot-global', auth, role('ADMIN'), controller.toggleSlotGlobal);

module.exports = router;
