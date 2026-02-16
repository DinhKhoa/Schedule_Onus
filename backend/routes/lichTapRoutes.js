const router = require('express').Router();
const lichTapController = require('../controllers/lichTapController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.get('/', auth, lichTapController.getAll);
router.post('/', auth, role('HOIVIEN'), lichTapController.create);
router.put('/:id/cancel', auth, role('HOIVIEN'), lichTapController.cancel);
router.put('/:id/complete', auth, role('PT'), lichTapController.complete);

module.exports = router;
