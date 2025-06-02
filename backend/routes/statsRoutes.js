const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

router.get('/', statsController.getAllStats);
router.get('/summary', statsController.getSummary);

module.exports = router;