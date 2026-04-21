const router = require('express').Router();
const dangKyKhoaTapController = require('../controllers/dangKyKhoaTapController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.get('/', auth, role('ADMIN', 'HOIVIEN', 'PT'), dangKyKhoaTapController.getAll);
router.post('/', auth, role('ADMIN'), dangKyKhoaTapController.create);
router.delete('/:id', auth, role('ADMIN'), dangKyKhoaTapController.remove);

module.exports = router;
