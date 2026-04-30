const router = require('express').Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const authController = require('../controllers/authController');

router.get('/', auth, role('ADMIN'), userController.getAll);
router.get('/profile', auth, userController.getProfile);
router.get('/:id', auth, role('ADMIN'), userController.getById);
router.post('/', auth, role('ADMIN'), userController.create);
router.put('/profile', auth, userController.updateProfile);
router.put('/change-password', auth, authController.changePassword);
router.post('/change-password', auth, authController.changePassword);
router.put('/:id', auth, role('ADMIN'), userController.update);
router.delete('/:id', auth, role('ADMIN'), userController.remove);

module.exports = router;
