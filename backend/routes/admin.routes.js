const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate, isAdmin } = require('../middleware/auth.middleware');

// All routes require authentication and admin role
router.use(authenticate);
router.use(isAdmin);

// Department routes
router.post('/departments', adminController.createDepartment);
router.get('/departments', adminController.getDepartments);
router.delete('/departments/:departmentId', adminController.deleteDepartment);

// Level routes
router.post('/levels', adminController.createLevels);
router.get('/levels/:departmentId', adminController.getLevelsByDepartment);
router.post('/levels/add', adminController.addLevel);
router.put('/levels/:levelId', adminController.updateLevel);
router.delete('/levels/:levelId', adminController.deleteLevel);

// User management routes
router.post('/users', adminController.createUser);
router.get('/users', adminController.getUsers);
router.put('/users/:userId', adminController.updateUser);
router.patch('/users/:userId/deactivate', adminController.deactivateUser);
router.delete('/users/:userId', adminController.deleteUser);

// System maintenance routes
router.post('/fix-broken-files', adminController.fixBrokenFiles);

module.exports = router;
