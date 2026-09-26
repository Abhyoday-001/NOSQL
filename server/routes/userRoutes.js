const express = require('express');
const router = express.Router();
const { register, login, getRecommendations } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/:id/recommendations', protect, getRecommendations);

module.exports = router;