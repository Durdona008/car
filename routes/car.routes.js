const router = require('express').Router();
const { getAll, getOne, create, update, remove } = require('../controller/car.controller');
const { authenticate, isAdmin } = require('../middlewares/auth');
const { likeCar } = require('../controller/profile.controller');
const validate = require('../middlewares/validate');
const { carCreateSchema, carUpdateSchema } = require('../validators/car.validator');
const upload = require('../config/multer');

// Public routes
router.get('/',     getAll);
router.get('/:id',  getOne);

// Authenticated routes
router.post('/:id/like', authenticate, likeCar);

// Admin only routes
router.post('/',      authenticate, isAdmin, upload.single('image'), validate(carCreateSchema), create);
router.put('/:id',    authenticate, isAdmin, upload.single('image'), validate(carUpdateSchema), update);
router.delete('/:id', authenticate, isAdmin, remove);
