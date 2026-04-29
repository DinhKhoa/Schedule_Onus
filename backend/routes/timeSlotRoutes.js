const router = require('express').Router();
const timeSlotController = require('../controllers/timeSlotController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.get('/', auth, timeSlotController.getAll);
router.post('/', auth, role('ADMIN'), timeSlotController.create);
router.put('/:id', auth, role('ADMIN'), timeSlotController.update);
router.put('/:id/toggle', auth, role('ADMIN'), timeSlotController.toggle);
router.delete('/:id', auth, role('ADMIN'), timeSlotController.remove);

module.exports = router;
