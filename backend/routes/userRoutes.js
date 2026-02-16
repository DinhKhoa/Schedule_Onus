const router = require('express').Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.get('/', auth, role('ADMIN'), userController.getAll);
router.get('/:id', auth, userController.getById);
router.post('/', auth, role('ADMIN'), userController.create);
router.put('/:id', auth, role('ADMIN'), userController.update);
router.delete('/:id', auth, role('ADMIN'), userController.remove);

module.exports = router;
