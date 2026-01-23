const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

// User routes
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.get('/dashboard/stats', userController.getDashboardStats);

module.exports = router;
