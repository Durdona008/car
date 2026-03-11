const Joi = require('joi');

// ─── Category
const categoryCreateSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.min': 'Kategoriya nomi kamida 2 ta belgidan iborat bo\'lishi kerak',
    'string.max': 'Kategoriya nomi 100 ta belgidan oshmasligi kerak',
    'any.required': 'Kategoriya nomi majburiy',
  }),
  description: Joi.string().trim().max(500).optional().messages({
    'string.max': 'Tavsif 500 ta belgidan oshmasligi kerak',
  }),
});

const categoryUpdateSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  description: Joi.string().trim().max(500).optional().allow(''),
}).min(1).messages({
  'object.min': 'Kamida bitta maydon o\'zgartirilishi kerak',
});

// ─── Car
const carCreateSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'any.required': 'Mashina nomi majburiy',
  }),
  model: Joi.string().trim().min(1).max(100).required().messages({
    'any.required': 'Model majburiy',
  }),
  brand: Joi.string().trim().min(1).max(100).required().messages({
    'any.required': 'Brend majburiy',
  }),
  year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).required().messages({
    'number.min': 'Yil 1900 dan katta bo\'lishi kerak',
    'any.required': 'Yil majburiy',
  }),
  price: Joi.number().positive().required().messages({
    'number.positive': 'Narx musbat son bo\'lishi kerak',
    'any.required': 'Narx majburiy',
  }),
  color: Joi.string().trim().max(50).optional(),
  description: Joi.string().trim().max(1000).optional(),
  category: Joi.string().hex().length(24).required().messages({
    'any.required': 'Kategoriya majburiy',
    'string.length': 'Kategoriya ID noto\'g\'ri',
  }),
  isActive: Joi.boolean().optional(),
});

const carUpdateSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  model: Joi.string().trim().min(1).max(100).optional(),
  brand: Joi.string().trim().min(1).max(100).optional(),
  year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).optional(),
  price: Joi.number().positive().optional(),
  color: Joi.string().trim().max(50).optional().allow(''),
  description: Joi.string().trim().max(1000).optional().allow(''),
  category: Joi.string().hex().length(24).optional(),
  isActive: Joi.boolean().optional(),
}).min(1).messages({
  'object.min': 'Kamida bitta maydon o\'zgartirilishi kerak',
});

module.exports = {
  categoryCreateSchema,
  categoryUpdateSchema,
  carCreateSchema,
  carUpdateSchema,
};
