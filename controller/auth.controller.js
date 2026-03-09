const User = require('../models/user');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../services//jwtservice');
const { sendVerifyEmail, sendResetPasswordEmail } = require('../services/jwtservice');
const { logger } = require('../config/logger');

const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();


// POST register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Bu email allaqachon ro\'yxatdan o\'tgan' });
    }

    const code = generateCode();
    const expires = new Date(Date.now() + 10 * 60 * 1000); 

    const user = await User.create({
      name, email, password,
      verifyCode: code,
      verifyCodeExpires: expires,
    });

    await sendVerifyEmail(email, code);
    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      success: true,
      message: 'Ro\'yxatdan o\'tdingiz. Emailingizga tasdiqlash kodi yuborildi',
    });
  } catch (err) {
    next(err);
  }
};



// POST verify
const verifyEmail = async (req, res, next) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });
    if (user.isVerified) return res.status(400).json({ success: false, message: 'Email allaqachon tasdiqlangan' });

    if (user.verifyCode !== code || user.verifyCodeExpires < new Date()) {
      return res.status(400).json({ success: false, message: 'Kod noto\'g\'ri yoki muddati o\'tgan' });
    }

    user.isVerified = true;
    user.verifyCode = null;
    user.verifyCodeExpires = null;
    await user.save();

    logger.info(`Email verified: ${email}`);
    res.json({ success: true, message: 'Email muvaffaqiyatli tasdiqlandi' });
  } catch (err) {
    next(err);
  }
};

// POST login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success: false, message: 'Email yoki parol noto\'g\'ri' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Email yoki parol noto\'g\'ri' });

    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: 'Email tasdiqlanmagan. Emailingizni tekshiring' });
    }

    const payload = { id: user._id, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    user.refreshTokens.push(refreshToken);
    await user.save();

    logger.info(`User logged in: ${email}`);
    res.json({
      success: true,
      message: 'Muvaffaqiyatli kirdingiz',
      data: { accessToken, refreshToken, user },
    });
  } catch (err) {
    next(err);
  }
};

// POST refresh-token
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;

    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch {
      return res.status(401).json({ success: false, message: 'Refresh token noto\'g\'ri yoki muddati o\'tgan' });
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.refreshTokens.includes(token)) {
      return res.status(401).json({ success: false, message: 'Refresh token topilmadi' });
    }

    // Rotate refresh token
    user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
    const payload = { id: user._id, role: user.role };
    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    res.json({
      success: true,
      data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
    });
  } catch (err) {
    next(err);
  }
};

// POST logout
const logout = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    const user = await User.findById(req.user._id);
    if (user) {
      user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
      await user.save();
    }
    logger.info(`User logged out: ${req.user.email}`);
    res.json({ success: true, message: 'Muvaffaqiyatli chiqdingiz' });
  } catch (err) {
    next(err);
  }
};

// POST forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'Bu email bilan foydalanuvchi topilmadi' });

    const code = generateCode();
    user.resetPasswordCode = code;
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendResetPasswordEmail(email, code);
    logger.info(`Password reset code sent to: ${email}`);

    res.json({ success: true, message: 'Parolni tiklash kodi emailingizga yuborildi' });
  } catch (err) {
    next(err);
  }
};

// POST reset-password
const resetPassword = async (req, res, next) => {
  try {
    const { email, code, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });

    if (user.resetPasswordCode !== code || user.resetPasswordExpires < new Date()) {
      return res.status(400).json({ success: false, message: 'Kod noto\'g\'ri yoki muddati o\'tgan' });
    }

    user.password = newPassword;
    user.resetPasswordCode = null;
    user.resetPasswordExpires = null;
    user.refreshTokens = [];
    await user.save();

    logger.info(`Password reset for: ${email}`);
    res.json({ success: true, message: 'Parol muvaffaqiyatli o\'zgartirildi' });
  } catch (err) {
    next(err);
  }
};

// PATCH change-password  
const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Eski parol noto\'g\'ri' });

    user.password = newPassword;
    user.refreshTokens = [];
    await user.save();

    logger.info(`Password changed for: ${user.email}`);
    res.json({ success: true, message: 'Parol muvaffaqiyatli o\'zgartirildi. Qayta kirishingiz kerak' });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, verifyEmail, login, refreshToken, logout, forgotPassword, resetPassword, changePassword };