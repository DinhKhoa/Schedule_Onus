const router = require('express').Router();
const trainingDateController = require('../controllers/trainingDateController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.get('/', auth, trainingDateController.getAll);
router.post('/', auth, role('ADMIN'), trainingDateController.create);
router.put('/:id', auth, role('ADMIN'), trainingDateController.update);

module.exports = router;
