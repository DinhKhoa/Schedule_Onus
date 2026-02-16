const router = require('express').Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/login', authController.login);
router.post('/change-password', auth, authController.changePassword);

module.exports = router;
