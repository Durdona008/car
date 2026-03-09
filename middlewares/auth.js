const { verifyAccessToken } = require('../services/jwtservice');
const User = require('../models/user');
const { logger } = require('../config/logger');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Token topilmadi' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    const user = await User.findById(decoded.id).select('-password -refreshTokens');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Foydalanuvchi topilmadi' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: 'Email tasdiqlanmagan' });
    }

    req.user = user;
    next();
  } catch (err) {
    logger.warn(`Auth middleware error: ${err.message}`);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token muddati tugagan' });
    }
    return res.status(401).json({ success: false, message: 'Token noto\'g\'ri' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ success: false, message: 'Faqat adminlar uchun ruxsat' });
};

module.exports = { authenticate, isAdmin };