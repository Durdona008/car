const User = require('../models/user');
const Car = require('../models/car');
const Category = require('../models/category');
const { logger } = require('../config/logger');

// GET /profile
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('likes', 'name model brand price image');

    const response = { success: true, data: { user } };

    if (user.role === 'admin') {
      const [categories, cars] = await Promise.all([
        Category.find({ createdBy: user._id }).sort({ createdAt: -1 }),
        Car.find({ createdBy: user._id }).populate('category', 'name').sort({ createdAt: -1 }),
      ]);
      response.data.categories = categories;
      response.data.cars = cars;
    }

    res.json(response);
  } catch (err) {
    next(err);
  }
};

// POST /cars/:id/like
const likeCar = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ success: false, message: 'Mashina topilmadi' });

    const user = await User.findById(req.user._id);
    const alreadyLiked = user.likes.includes(car._id);

    if (alreadyLiked) {
      user.likes = user.likes.filter((id) => id.toString() !== car._id.toString());
      car.likes = Math.max(0, car.likes - 1);
      await Promise.all([user.save(), car.save()]);
      return res.json({ success: true, message: 'Like olib tashlandi', liked: false, likesCount: car.likes });
    } else {
      user.likes.push(car._id);
      car.likes += 1;
      await Promise.all([user.save(), car.save()]);
      return res.json({ success: true, message: 'Like qo\'shildi', liked: true, likesCount: car.likes });
    }
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, likeCar };