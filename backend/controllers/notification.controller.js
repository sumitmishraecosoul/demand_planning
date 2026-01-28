const Notification = require('../models/Notification.model');

// Get user's notifications
exports.getNotifications = async (req, res) => {
  try {
    const { unreadOnly } = req.query;
    
    const filter = { recipient: req.user._id };
    if (unreadOnly === 'true') {
      filter.isRead = false;
    }

    const notifications = await Notification.find(filter)
      .populate('sender', 'name email designation')
      .populate('file', 'title currentLevel status')
      .populate({
        path: 'file',
        populate: {
          path: 'currentLevel',
          select: 'levelName levelNumber'
        }
      })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    });

    res.json({
      success: true,
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications.',
      error: error.message
    });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found.'
      });
    }

    res.json({
      success: true,
      message: 'Notification marked as read.',
      notification
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking notification as read.',
      error: error.message
    });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read.'
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking notifications as read.',
      error: error.message
    });
  }
};

// Helper function to create notification
exports.createNotification = async (recipientId, senderId, fileId, type, title, message, actionUrl = '/files/my-files') => {
  try {
    await Notification.create({
      recipient: recipientId,
      sender: senderId,
      file: fileId,
      type,
      title,
      message,
      actionUrl
    });
  } catch (error) {
    console.error('Create notification error:', error);
  }
};

// Helper function to create notifications for multiple recipients
exports.createBulkNotifications = async (recipientIds, senderId, fileId, type, title, message, actionUrl = '/files/my-files') => {
  try {
    const notifications = recipientIds.map(recipientId => ({
      recipient: recipientId,
      sender: senderId,
      file: fileId,
      type,
      title,
      message,
      actionUrl
    }));

    await Notification.insertMany(notifications);
  } catch (error) {
    console.error('Create bulk notifications error:', error);
  }
};
