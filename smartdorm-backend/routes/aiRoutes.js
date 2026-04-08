const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// POST /api/chat
router.post('/chat', aiController.chat);

module.exports = router;
