const router = require('express').Router();
const controller = require('../../controllers/categories.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');

router.get('/', controller.getCategories);
router.post('/', protect, authorize('admin'), controller.createCategory);
router.put('/:id', protect, authorize('admin'), controller.updateCategory);
router.delete('/:id', protect, authorize('admin'), controller.deleteCategory);
module.exports = router;
