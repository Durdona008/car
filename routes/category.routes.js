const router = require('express').Router();
const {
  getAll, getOne, getCarsByCategory, create, update, remove,
} = require('../controller/category.controller');
const { authenticate, isAdmin } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { categoryCreateSchema, categoryUpdateSchema } = require('../validators/carvalidator');

// Public routes
router.get('/',       getAll);
router.get('/:id',    getOne);
router.get('/:id/cars', getCarsByCategory);

// Admin only routes
router.post('/',      authenticate, isAdmin, validate(categoryCreateSchema), create);
router.put('/:id',    authenticate, isAdmin, validate(categoryUpdateSchema), update);
router.delete('/:id', authenticate, isAdmin, remove);

module.exports = router;