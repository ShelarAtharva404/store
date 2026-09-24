const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      return res.status(400).json({ 
        error: 'Validation error', 
        details: errors 
      });
    }
    next();
  };
};

// Common validation schemas
const schemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(120).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  product: Joi.object({
    name: Joi.string().min(2).max(255).required(),
    description: Joi.string().allow('', null),
    price: Joi.number().positive().required(),
    compare_price: Joi.number().positive().allow(null),
    sku: Joi.string().max(100).allow(null),
    stock: Joi.number().integer().min(0).default(0),
    category: Joi.string().max(100).allow(null),
    brand: Joi.string().max(100).allow(null),
    weight: Joi.number().positive().allow(null),
    is_active: Joi.boolean().default(true),
    is_featured: Joi.boolean().default(false),
    tags: Joi.array().items(Joi.string()).allow(null)
  }),

  cartItem: Joi.object({
    product_id: Joi.number().integer().positive().required(),
    variant_id: Joi.number().integer().positive().allow(null),
    quantity: Joi.number().integer().min(1).default(1)
  }),

  review: Joi.object({
    product_id: Joi.number().integer().positive().required(),
    rating: Joi.number().integer().min(1).max(5).required(),
    title: Joi.string().max(255).allow('', null),
    comment: Joi.string().allow('', null)
  }),

  address: Joi.object({
    full_name: Joi.string().min(2).max(120).required(),
    phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).required(),
    address_line1: Joi.string().max(255).required(),
    address_line2: Joi.string().max(255).allow('', null),
    city: Joi.string().max(100).required(),
    state: Joi.string().max(100).required(),
    postal_code: Joi.string().max(20).required(),
    country: Joi.string().max(100).default('USA'),
    is_default: Joi.boolean().default(false)
  }),

  checkout: Joi.object({
    address_id: Joi.number().integer().positive().required(),
    payment_method: Joi.string().valid('credit_card', 'paypal', 'stripe').required(),
    coupon_code: Joi.string().max(50).allow(null)
  })
};

module.exports = { validate, schemas };
