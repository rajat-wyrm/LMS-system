const router = require('express').Router();
const controller = require('../../controllers/categories.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate');
const { createCategorySchema, updateCategorySchema } = require('../../validations/category.validation');

router.get('/', controller.getCategories);
router.post('/', protect, authorize('admin'), validate(createCategorySchema), controller.createCategory);
router.put('/:id', protect, authorize('admin'), validate(updateCategorySchema), controller.updateCategory);
router.delete('/:id', protect, authorize('admin'), controller.deleteCategory);
module.exports = router;
