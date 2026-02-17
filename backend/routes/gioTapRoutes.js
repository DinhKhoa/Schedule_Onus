const router = require('express').Router();
const gioTapController = require('../controllers/gioTapController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.get('/', auth, gioTapController.getAll);
router.post('/', auth, role('ADMIN'), gioTapController.create);
router.put('/:id', auth, role('ADMIN'), gioTapController.update);
router.put('/:id/toggle', auth, role('ADMIN'), gioTapController.toggle);
router.delete('/:id', auth, role('ADMIN'), gioTapController.remove);

module.exports = router;
