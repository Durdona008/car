const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required().messages({
    'string.min': 'Ism kamida 2 ta belgidan iborat bo\'lishi kerak',
    'string.max': 'Ism 50 ta belgidan oshmasligi kerak',
    'any.required': 'Ism majburiy',
  }),
  email: Joi.string().email().lowercase().required().messages({
    'string.email': 'Email noto\'g\'ri formatda',
    'any.required': 'Email majburiy',
  }),
  password: Joi.string().min(6).max(50).required().messages({
    'string.min': 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak',
    'any.required': 'Parol majburiy',
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().required().messages({
    'string.email': 'Email noto\'g\'ri formatda',
    'any.required': 'Email majburiy',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Parol majburiy',
  }),
});

const verifySchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  code: Joi.string().length(6).required().messages({
    'string.length': 'Tasdiqlash kodi 6 ta raqamdan iborat bo\'lishi kerak',
    'any.required': 'Tasdiqlash kodi majburiy',
  }),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().lowercase().required().messages({
    'any.required': 'Email majburiy',
  }),
});

const resetPasswordSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  code: Joi.string().length(6).required(),
  newPassword: Joi.string().min(6).max(50).required().messages({
    'string.min': 'Yangi parol kamida 6 ta belgidan iborat bo\'lishi kerak',
    'any.required': 'Yangi parol majburiy',
  }),
});

const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required().messages({
    'any.required': 'Eski parol majburiy',
  }),
  newPassword: Joi.string().min(6).max(50).required().messages({
    'string.min': 'Yangi parol kamida 6 ta belgidan iborat bo\'lishi kerak',
    'any.required': 'Yangi parol majburiy',
  }),
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'Refresh token majburiy',
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
  verifySchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  refreshTokenSchema,
};