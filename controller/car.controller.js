const Car = require('../models/car');
const Category = require('../models/category');
const { logger } = require('../config/log');
const fs = require('fs');
const path = require('path');

const deleteImageFile = (imagePath) => {
  if (!imagePath) return;
  const fullPath = path.join(__dirname, '../../uploads', path.basename(imagePath));
  if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
};

// GET /cars
const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt', brand, category, minPrice, maxPrice, search } = req.query;
    const filter = { isActive: true };

    if (brand) filter.brand = new RegExp(brand, 'i');
    if (category) filter.category = category;
    if (search) filter.$or = [
      { name: new RegExp(search, 'i') },
      { brand: new RegExp(search, 'i') },
      { model: new RegExp(search, 'i') },
    ];
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [cars, total] = await Promise.all([
      Car.find(filter)
        .populate('category', 'name')
        .populate('createdBy', 'name')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Car.countDocuments(filter),
    ]);

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: cars,
    });
  } catch (err) {
    next(err);
  }
};

// GET id
const getOne = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id)
      .populate('category', 'name description')
      .populate('createdBy', 'name');
    if (!car) return res.status(404).json({ success: false, message: 'Mashina topilmadi' });
    res.json({ success: true, data: car });
  } catch (err) {
    next(err);
  }
};

// POST /cars  (admin only)
const create = async (req, res, next) => {
  try {
    const category = await Category.findById(req.body.category);
    if (!category) {
      if (req.file) deleteImageFile(req.file.filename);
      return res.status(404).json({ success: false, message: 'Kategoriya topilmadi' });
    }

    const carData = { ...req.body, createdBy: req.user._id };
    if (req.file) {
      carData.image = `/uploads/${req.file.filename}`;
    }

    const car = await Car.create(carData);
    await car.populate('category', 'name');
    logger.info(`Car created: ${car.name} by ${req.user.email}`);
    res.status(201).json({ success: true, message: 'Mashina qo\'shildi', data: car });
  } catch (err) {
    if (req.file) deleteImageFile(req.file.filename);
    next(err);
  }
};

// PUT /cars/:id  (admin only)
const update = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      if (req.file) deleteImageFile(req.file.filename);
      return res.status(404).json({ success: false, message: 'Mashina topilmadi' });
    }

    if (req.body.category) {
      const category = await Category.findById(req.body.category);
      if (!category) {
        if (req.file) deleteImageFile(req.file.filename);
        return res.status(404).json({ success: false, message: 'Kategoriya topilmadi' });
      }
    }

    if (req.file) {
      deleteImageFile(car.image);
      req.body.image = `/uploads/${req.file.filename}`;
    }

    const updated = await Car.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('category', 'name');

    logger.info(`Car updated: ${updated.name} by ${req.user.email}`);
    res.json({ success: true, message: 'Mashina yangilandi', data: updated });
  } catch (err) {
    if (req.file) deleteImageFile(req.file.filename);
    next(err);
  }
};

// DELETE /cars/:id  (admin only)
const remove = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ success: false, message: 'Mashina topilmadi' });

    deleteImageFile(car.image);
    await car.deleteOne();

    logger.info(`Car deleted: ${car.name} by ${req.user.email}`);
    res.json({ success: true, message: 'Mashina o\'chirildi' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getOne, create, update, remove };