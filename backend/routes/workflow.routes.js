const express = require('express');
const router = express.Router();
const workflowController = require('../controllers/workflow.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

// Workflow routes
router.post('/files/:fileId/pass', workflowController.passToNextLevel);
router.post('/files/:fileId/pass-same-level', workflowController.passToSameLevel);
router.post('/files/:fileId/complete', workflowController.completeFile);
router.post('/files/:fileId/reject', workflowController.rejectFile);
router.get('/files/:fileId', workflowController.getWorkflow);
router.get('/departments/:departmentId/users', workflowController.getDepartmentUsers);
router.get('/levels/:levelId/users', workflowController.getSameLevelUsers);

module.exports = router;
