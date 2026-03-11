const router = require('express').Router();
const { getProfile } = require('../controller/profile.controller');
const { authenticate } = require('../middlewares/auth');

router.get('/', authenticate, getProfile);

module.exports = router;