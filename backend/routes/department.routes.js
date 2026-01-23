const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

// Get all departments (accessible to all authenticated users)
router.get('/', adminController.getDepartments);

// Get levels for a department
router.get('/:departmentId/levels', adminController.getLevelsByDepartment);

module.exports = router;
