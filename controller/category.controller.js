const Category = require('../models/category');
const Car = require('../models/car');
const { logger } = require('../config/logger');

// GET /categories
const getAll = async (req, res, next) => {
  try {
    const categories = await Category.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: categories.length, data: categories });
  } catch (err) {
    next(err);
  }
};

// GET /categories/:id
const getOne = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id).populate('createdBy', 'name email');
    if (!category) return res.status(404).json({ success: false, message: 'Kategoriya topilmadi' });
    res.json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

// GET /categories/:id/cars  — shu kategoriyaga tegishli mashinalar
const getCarsByCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Kategoriya topilmadi' });

    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [cars, total] = await Promise.all([
      Car.find({ category: req.params.id, isActive: true })
        .populate('createdBy', 'name')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Car.countDocuments({ category: req.params.id, isActive: true }),
    ]);

    res.json({
      success: true,
      category: { id: category._id, name: category.name },
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: cars,
    });
  } catch (err) {
    next(err);
  }
};

// POST /categories  (admin only)
const create = async (req, res, next) => {
  try {
    const category = await Category.create({ ...req.body, createdBy: req.user._id });
    logger.info(`Category created: ${category.name} by ${req.user.email}`);
    res.status(201).json({ success: true, message: 'Kategoriya yaratildi', data: category });
  } catch (err) {
    next(err);
  }
};

// PUT /categories/:id  (admin only)
const update = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) return res.status(404).json({ success: false, message: 'Kategoriya topilmadi' });
    logger.info(`Category updated: ${category.name} by ${req.user.email}`);
    res.json({ success: true, message: 'Kategoriya yangilandi', data: category });
  } catch (err) {
    next(err);
  }
};

// DELETE /categories/:id  (admin only)
const remove = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Kategoriya topilmadi' });

    const carCount = await Car.countDocuments({ category: req.params.id });
    if (carCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Bu kategoriyaga ${carCount} ta mashina biriktirilgan. Avval mashinalarni o'chiring`,
      });
    }

    await category.deleteOne();
    logger.info(`Category deleted: ${category.name} by ${req.user.email}`);
    res.json({ success: true, message: 'Kategoriya o\'chirildi' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getOne, getCarsByCategory, create, update, remove };