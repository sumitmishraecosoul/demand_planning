const express = require('express');
const router = express.Router();
const fileController = require('../controllers/file.controller');
const { authenticate } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.use(authenticate);

// File routes
router.post('/upload', upload.single('file'), fileController.uploadFile);
router.get('/', fileController.getFiles);
router.get('/:fileId', fileController.getFile);
router.get('/:fileId/download/:version?', fileController.downloadFile);
router.put('/:fileId/update', upload.single('file'), fileController.updateFile);

module.exports = router;
