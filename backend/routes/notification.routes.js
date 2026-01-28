const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

// Notification routes
router.get('/', notificationController.getNotifications);
router.patch('/:notificationId/read', notificationController.markAsRead);
router.patch('/mark-all-read', notificationController.markAllAsRead);

module.exports = router;
