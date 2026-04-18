const express = require('express');
const router = express.Router();
const { authController } = require('../controllers');
const { protect } = require('../middleware/auth');
const {
  registerValidation,
  loginValidation
} = require('../middleware/validation');

// Rotte pubbliche
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);

// Rotte protette
router.get('/me', protect, authController.getMe);
router.put('/profile', protect, authController.updateProfile);
router.put('/change-password', protect, authController.changePassword);

module.exports = router;
