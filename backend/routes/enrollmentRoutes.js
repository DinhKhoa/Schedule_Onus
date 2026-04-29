const router = require('express').Router();
const enrollmentController = require('../controllers/enrollmentController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.get('/', auth, role('ADMIN', 'MEMBER', 'TRAINER'), enrollmentController.getAll);
router.post('/', auth, role('ADMIN'), enrollmentController.create);
router.delete('/:id', auth, role('ADMIN'), enrollmentController.remove);

module.exports = router;
