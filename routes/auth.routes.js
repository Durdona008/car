const router = require('express').Router();
const {
  register, verifyEmail, login, refreshToken,
  logout, forgotPassword, resetPassword, changePassword,
} = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const {
  registerSchema, loginSchema, verifySchema,
  forgotPasswordSchema, resetPasswordSchema,
  changePasswordSchema, refreshTokenSchema,
} = require('../validators/authValidator');

router.post('/register',        validate(registerSchema),        register);
router.post('/verify',          validate(verifySchema),          verifyEmail);
router.post('/login',           validate(loginSchema),           login);
router.post('/refresh-token',   validate(refreshTokenSchema),    refreshToken);
router.post('/logout',          authenticate,                    logout);
router.post('/forgot-password', validate(forgotPasswordSchema),  forgotPassword);
router.post('/reset-password',  validate(resetPasswordSchema),   resetPassword);
router.patch('/change-password', authenticate, validate(changePasswordSchema), changePassword);

module.exports = router;