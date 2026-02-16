const router = require('express').Router();
const khoaTapController = require('../controllers/khoaTapController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.get('/', auth, khoaTapController.getAll);
router.get('/:id', auth, khoaTapController.getById);
router.post('/', auth, role('ADMIN'), khoaTapController.create);
router.put('/:id', auth, role('ADMIN'), khoaTapController.update);
router.delete('/:id', auth, role('ADMIN'), khoaTapController.remove);

module.exports = router;
