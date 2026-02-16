const router = require('express').Router();
const ngayTapController = require('../controllers/ngayTapController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.get('/', auth, ngayTapController.getAll);
router.post('/', auth, role('ADMIN'), ngayTapController.create);
router.put('/:id', auth, role('ADMIN'), ngayTapController.update);

module.exports = router;
