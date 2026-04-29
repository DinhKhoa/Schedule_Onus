const router = require('express').Router();
const coursePackageController = require('../controllers/coursePackageController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.get('/', auth, coursePackageController.getAll);
router.get('/:id', auth, coursePackageController.getById);
router.post('/', auth, role('ADMIN'), coursePackageController.create);
router.put('/:id', auth, role('ADMIN'), coursePackageController.update);
router.delete('/:id', auth, role('ADMIN'), coursePackageController.remove);

module.exports = router;
