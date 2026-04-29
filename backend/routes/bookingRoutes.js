const router = require('express').Router();
const bookingController = require('../controllers/bookingController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.get('/', auth, bookingController.getAll);
router.post('/', auth, role('MEMBER'), bookingController.create);
router.put('/:id/cancel', auth, role('MEMBER'), bookingController.cancel);
router.put('/:id/complete', auth, role('TRAINER'), bookingController.complete);

module.exports = router;
